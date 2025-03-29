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
    programIds: string[];
    accountAddresses?: string[];
    status: string;
    dataPoints?: number;
}


interface DatabaseConnection {
    id: string;
    connectionString: string;
    host?: string;
    port?: string;
    dbName?: string;
    username?: string;
    ssl: boolean;
}


const connectionPools: Record<string, Pool> = {};


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

export async function processProgramInvocation(
    webhookId: string,
    transaction: any,
) {
    try {
        console.log(`Processing webhook ${webhookId}`);
        console.log('Transaction data:', JSON.stringify(transaction).substring(0, 200) + '...');


        const webhookDoc = await db.collection('webhooks').doc(webhookId).get();
        if (!webhookDoc.exists) {
            throw new Error(`Webhook ${webhookId} not found`);
        }

        const webhookData = webhookDoc.data() as WebhookData;


        if (webhookData.status !== 'active') {
            console.log(`Webhook ${webhookId} is not active, skipping`);
            return;
        }


        const dbDoc = await db.collection('databases').doc(webhookData.databaseId).get();
        if (!dbDoc.exists) {
            throw new Error(`Database ${webhookData.databaseId} not found`);
        }

        const dbConnection = dbDoc.data() as DatabaseConnection;


        await storeRawTransaction(webhookData, dbConnection, transaction);


        await db.collection('webhooks').doc(webhookId).update({
            lastTriggered: new Date(),
            dataPoints: (webhookData.dataPoints || 0) + 1
        });

        console.log(`Successfully processed transaction for webhook ${webhookId}`);

    } catch (error) {
        console.error(`Error processing webhook ${webhookId}:`, error);
        throw error;
    }
}


async function storeRawTransaction(
    webhookData: WebhookData,
    dbConnection: DatabaseConnection,
    transaction: any
) {

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


    if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
        console.log('Connection string does not have correct prefix, fixing...');

        if (connectionString.startsWith('postgresql:')) {
            connectionString = connectionString.replace('postgresql:', 'postgresql://neondb_owner:npg_3UJGqSfm1QYn');
        } else {

            connectionString = `postgresql://neondb_owner:npg_3UJGqSfm1QYn@ep-muddy-cherry-a8gqkn0k-pooler.eastus2.azure.neon.tech/neondb?sslmode=require`;
        }
    }


    if (connectionString.startsWith('postgresql://')) {
        console.log('Converting postgresql:// to postgres:// for compatibility');
        connectionString = connectionString.replace('postgresql://', 'postgres://');
    }


    const tableName = webhookData.tableName || 'transactions';


    const pool = getConnectionPool(connectionString, dbConnection.ssl);

    let client;
    try {
        client = await pool.connect();
        console.log(`Connected to database successfully`);


        const tableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM pg_tables
                WHERE schemaname = 'public'
                AND tablename = $1
            )
        `, [tableName.toLowerCase()]);


        if (tableExists.rows[0].exists) {
            console.log(`Table ${tableName} exists, dropping it...`);
            await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
            console.log(`Dropped table ${tableName}`);
        }


        console.log(`Creating new table ${tableName}`);
        await client.query(`
            CREATE TABLE ${tableName} (
                id SERIAL PRIMARY KEY,
                signature TEXT,
                timestamp TIMESTAMP NOT NULL,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);


        console.log(`Creating indexes for table ${tableName}`);
        await client.query(`
            CREATE INDEX ${tableName}_signature_idx 
            ON ${tableName}(signature)
        `);

        await client.query(`
            CREATE INDEX ${tableName}_timestamp_idx 
            ON ${tableName}(timestamp)
        `);


        const signature = transaction.signature || 'unknown';


        const timestamp = transaction.blockTime
            ? new Date(transaction.blockTime * 1000)
            : new Date();


        console.log(`Inserting transaction ${signature} into ${tableName}`);
        await client.query(`
            INSERT INTO ${tableName} (
                signature,
                timestamp,
                data
            ) VALUES ($1, $2, $3)
        `, [
            signature,
            timestamp,
            JSON.stringify(transaction)
        ]);

        console.log(`Successfully stored transaction in ${tableName}`);

    } catch (error) {
        console.error('Error storing transaction in database:', error);
        throw error;
    } finally {
        if (client) {
            client.release();
            console.log('Database client released (back to pool)');
        }
    }
}