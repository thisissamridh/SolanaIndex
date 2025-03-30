
import { Pool } from 'pg';
import { db } from '../firebaseAdmin';

interface WebhookData {
    id: string;
    userId: string;
    name: string;
    description?: string;
    databaseId: string;
    databaseName: string;
    webhookType: string;
    tableName: string;
    accountAddresses?: string[]; // Used for token addresses to track
    programIds?: string[]; // Used for program invocation tracking
    status: string;
    dataPoints?: number;
}

// Interface for database connection info
interface DatabaseConnection {
    id: string;
    connectionString: string;
    host?: string;
    port?: string;
    dbName?: string;
    username?: string;
    ssl: boolean;
}

// Global connection pools cache to reuse connections
const connectionPools: Record<string, Pool> = {};

// Function to get or create a connection pool
function getConnectionPool(connectionString: string, ssl: boolean = true): Pool {
    // Use connection string as key
    const key = connectionString;

    if (!connectionPools[key]) {
        console.log('Creating new database connection pool');
        connectionPools[key] = new Pool({
            connectionString,
            ssl: ssl ? { rejectUnauthorized: false } : false,
        });
    } else {
        console.log('Reusing existing database connection pool');
    }

    return connectionPools[key];
}

export async function processTokenPrices(
    webhookId: string,
    transaction: any,
) {
    try {
        console.log(`Processing token price webhook ${webhookId}`);
        console.log('Swap transaction data:', JSON.stringify(transaction).substring(0, 200) + '...');

        // Fetch webhook details
        const webhookDoc = await db.collection('webhooks').doc(webhookId).get();
        if (!webhookDoc.exists) {
            throw new Error(`Webhook ${webhookId} not found`);
        }

        const webhookData = webhookDoc.data() as WebhookData;

        // Only process active webhooks
        if (webhookData.status !== 'active') {
            console.log(`Webhook ${webhookId} is not active, skipping`);
            return;
        }

        // Check if this is a SWAP transaction
        if (transaction.type !== 'SWAP') {
            console.log(`Transaction ${transaction.signature} is not a SWAP transaction, skipping`);
            return;
        }

        // Get the token addresses to track from accountAddresses
        const tokenAddressesToTrack = webhookData.accountAddresses || [];

        if (tokenAddressesToTrack.length === 0) {
            console.log(`No token addresses configured for webhook ${webhookId}, skipping`);
            return;
        }

        // Extract swap information
        const swapInfo = extractSwapInfo(transaction, tokenAddressesToTrack);
        if (!swapInfo) {
            console.log(`No relevant swap information found for tracked tokens in transaction ${transaction.signature}`);
            return;
        }

        console.log(`Swap information extracted for tokens:`, tokenAddressesToTrack);
        console.log(`Swap details:`, swapInfo);

        // Get database connection details
        const dbDoc = await db.collection('databases').doc(webhookData.databaseId).get();
        if (!dbDoc.exists) {
            throw new Error(`Database ${webhookData.databaseId} not found`);
        }

        const dbConnection = dbDoc.data() as DatabaseConnection;

        // Store the token price data in the database
        await storeTokenPriceData(webhookData, dbConnection, transaction, swapInfo);

        // Update metrics
        await db.collection('webhooks').doc(webhookId).update({
            lastTriggered: new Date(),
            dataPoints: (webhookData.dataPoints || 0) + 1
        });

        console.log(`Successfully processed token price data for webhook ${webhookId}`);

    } catch (error) {
        console.error(`Error processing token price webhook ${webhookId}:`, error);
        throw error;
    }
}

// Extract swap information from transaction
function extractSwapInfo(transaction: any, tokenAddresses: string[]) {
    try {
        // Check if this is a swap event with relevant tokens
        if (!transaction.events || !transaction.events.swap) {
            return null;
        }

        const swapEvent = transaction.events.swap;

        // Check if any of our tracked tokens are involved
        const inTokenAddress = swapEvent.nativeInput?.mint || swapEvent.tokenInputs?.[0]?.mint;
        const outTokenAddress = swapEvent.nativeOutput?.mint || swapEvent.tokenOutputs?.[0]?.mint;

        const isTrackedSwap =
            tokenAddresses.includes(inTokenAddress) ||
            tokenAddresses.includes(outTokenAddress);

        if (!isTrackedSwap) {
            return null;
        }

        // Extract swap details
        return {
            timestamp: transaction.blockTime ? new Date(transaction.blockTime * 1000) : new Date(),
            signature: transaction.signature,
            inToken: {
                mint: inTokenAddress,
                amount: swapEvent.nativeInput?.amount || swapEvent.tokenInputs?.[0]?.amount || 0,
                symbol: swapEvent.nativeInput?.symbol || swapEvent.tokenInputs?.[0]?.symbol || 'UNKNOWN',
                decimals: swapEvent.nativeInput?.decimals || swapEvent.tokenInputs?.[0]?.decimals || 0
            },
            outToken: {
                mint: outTokenAddress,
                amount: swapEvent.nativeOutput?.amount || swapEvent.tokenOutputs?.[0]?.amount || 0,
                symbol: swapEvent.nativeOutput?.symbol || swapEvent.tokenOutputs?.[0]?.symbol || 'UNKNOWN',
                decimals: swapEvent.nativeOutput?.decimals || swapEvent.tokenOutputs?.[0]?.decimals || 0
            },
            amm: swapEvent.source || 'unknown',
            price: calculatePrice(
                swapEvent.nativeInput?.amount || swapEvent.tokenInputs?.[0]?.amount || 0,
                swapEvent.nativeOutput?.amount || swapEvent.tokenOutputs?.[0]?.amount || 0,
                swapEvent.nativeInput?.decimals || swapEvent.tokenInputs?.[0]?.decimals || 0,
                swapEvent.nativeOutput?.decimals || swapEvent.tokenOutputs?.[0]?.decimals || 0
            )
        };
    } catch (error) {
        console.error('Error extracting swap information:', error);
        return null;
    }
}

// Calculate price from swap amounts
function calculatePrice(inAmount: number, outAmount: number, inDecimals: number, outDecimals: number) {
    if (inAmount === 0 || outAmount === 0) {
        return 0;
    }

    // Adjust for token decimals
    const adjustedInAmount = inAmount / Math.pow(10, inDecimals);
    const adjustedOutAmount = outAmount / Math.pow(10, outDecimals);

    // Price is out/in ratio
    return adjustedOutAmount / adjustedInAmount;
}

// Store token price data in database
async function storeTokenPriceData(
    webhookData: WebhookData,
    dbConnection: DatabaseConnection,
    transaction: any,
    swapInfo: any
) {
    // Get connection string
    let connectionString = dbConnection.connectionString;

    if (!connectionString && dbConnection.host) {
        connectionString = `postgresql://${dbConnection.username}:password@${dbConnection.host}`;

        if (dbConnection.port) {
            connectionString += `:${dbConnection.port}`;
        }

        if (dbConnection.dbName) {
            connectionString += `/${dbConnection.dbName}`;
        }

        if (dbConnection.ssl) {
            connectionString += '?sslmode=require';
        }
    }

    // Check if connection string has a valid format
    if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
        console.log('Connection string does not have correct prefix, fixing...');
        // Fix connection string by adding proper prefix if needed
        if (connectionString.startsWith('postgresql:')) {
            connectionString = connectionString.replace('postgresql:', 'postgresql://neondb_owner:npg_3UJGqSfm1QYn');
        } else {
            // If completely malformed, use a proper connection string
            connectionString = `postgresql://neondb_owner:npg_3UJGqSfm1QYn@ep-muddy-cherry-a8gqkn0k-pooler.eastus2.azure.neon.tech/neondb?sslmode=require`;
        }
    }

    // Handle both postgresql:// and postgres:// protocols
    if (connectionString.startsWith('postgresql://')) {
        console.log('Converting postgresql:// to postgres:// for compatibility');
        connectionString = connectionString.replace('postgresql://', 'postgres://');
    }

    // Default table name if not provided
    const tableName = webhookData.tableName || 'token_prices';

    // Get or create a connection pool
    const pool = getConnectionPool(connectionString, dbConnection.ssl);

    let client;
    try {
        client = await pool.connect();
        console.log(`Connected to database successfully`);

        // Check if table exists
        const tableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM pg_tables
                WHERE schemaname = 'public'
                AND tablename = $1
            )
        `, [tableName.toLowerCase()]);

        // If table doesn't exist, create it
        if (!tableExists.rows[0].exists) {
            console.log(`Table ${tableName} doesn't exist, creating it...`);

            // Create the table
            await client.query(`
                CREATE TABLE ${tableName} (
                    id SERIAL PRIMARY KEY,
                    timestamp TIMESTAMP NOT NULL,
                    signature TEXT,
                    in_token_mint TEXT NOT NULL,
                    in_token_amount NUMERIC NOT NULL,
                    in_token_symbol TEXT,
                    out_token_mint TEXT NOT NULL,
                    out_token_amount NUMERIC NOT NULL,
                    out_token_symbol TEXT,
                    price NUMERIC NOT NULL,
                    amm TEXT,
                    raw_data JSONB NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);

            // Create indexes
            console.log(`Creating indexes for table ${tableName}`);
            await client.query(`
                CREATE INDEX ${tableName}_timestamp_idx 
                ON ${tableName}(timestamp)
            `);

            await client.query(`
                CREATE INDEX ${tableName}_in_token_idx 
                ON ${tableName}(in_token_mint)
            `);

            await client.query(`
                CREATE INDEX ${tableName}_out_token_idx 
                ON ${tableName}(out_token_mint)
            `);

            console.log(`Successfully created table ${tableName}`);
        }

        // Check if this transaction's signature already exists in the database
        const signatureExists = await client.query(`
            SELECT EXISTS (
                SELECT 1 FROM ${tableName}
                WHERE signature = $1
            )
        `, [swapInfo.signature]);

        if (signatureExists.rows[0].exists) {
            console.log(`Transaction ${swapInfo.signature} already exists in the database, skipping`);
            return;
        }

        // Insert data
        console.log(`Inserting token price data into ${tableName}`);
        await client.query(`
            INSERT INTO ${tableName} (
                timestamp,
                signature,
                in_token_mint,
                in_token_amount,
                in_token_symbol,
                out_token_mint,
                out_token_amount,
                out_token_symbol,
                price,
                amm,
                raw_data
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
            swapInfo.timestamp,
            swapInfo.signature,
            swapInfo.inToken.mint,
            swapInfo.inToken.amount,
            swapInfo.inToken.symbol,
            swapInfo.outToken.mint,
            swapInfo.outToken.amount,
            swapInfo.outToken.symbol,
            swapInfo.price,
            swapInfo.amm,
            JSON.stringify({
                transaction: transaction,
                swapInfo: swapInfo
            })
        ]);

        console.log(`Successfully stored token price data in ${tableName}`);

    } catch (error) {
        console.error('Error storing token price data in database:', error);
        throw error;
    } finally {
        if (client) {
            client.release();
            console.log('Database client released (back to pool)');
        }
    }
}