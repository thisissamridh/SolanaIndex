import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import morgan from 'morgan';
import webhookRoutes from './routes/webhook';

import admin from './firebaseAdmin';


dotenv.config();

const app = express();


app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});


app.use(cors({
    origin: ['http://localhost:3000', process.env.CLIENT_URL || '*'],
    credentials: true,
}));


app.use(morgan('dev'));


app.use(bodyParser.json({ limit: '10mb' }));

app.get('/ping', (req, res) => {
    console.log('Ping endpoint called');
    res.json({ message: 'pong' });
});

app.use('/webhook', webhookRoutes);

app.post('/test-connection', async (req, res) => {
    console.log("Test connection endpoint called with body:", JSON.stringify(req.body, null, 2));
    const { connectionString, tableName } = req.body;
    console.log("Received request to test connection. Table name:", tableName);

    if (!connectionString || !tableName) {
        return res.status(400).json({ error: 'Missing connectionString or tableName' });
    }

    let client;
    try {
        // only handle the connection string for now
        // Handle both postgresql:// and postgres:// protocols
        let dbUrl = connectionString;
        if (dbUrl.startsWith('postgresql://')) {
            console.log('Converting postgresql:// to postgres:// for compatibility');
            dbUrl = dbUrl.replace('postgresql://', 'postgres://');
        }

        const pool = new Pool({
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false },
        });

        console.log("Attempting to connect to database...");
        client = await pool.connect();
        console.log("Database connection established successfully");

        console.log("Creating test table:", tableName);
        await client.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
          id SERIAL PRIMARY KEY,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log("Inserting test row...");
        await client.query(`INSERT INTO ${tableName} (message) VALUES ($1)`, [
            'Hello from blockchain indexer!'
        ]);

        console.log("Querying test table...");
        const result = await client.query(`
      SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT 1
    `);

        console.log("Query result:", result.rows[0]);
        return res.json({ success: true, result: result.rows[0] });
    } catch (err) {
        const errorMessage = (err as { message?: string }).message || 'Unknown error';
        console.error('Error testing connection:', errorMessage);

        let userFriendlyError = `Failed to connect to the database: ${errorMessage}`;
        if (errorMessage.includes('password authentication failed')) {
            userFriendlyError = 'Invalid username or password. Please check your credentials.';
        } else if (errorMessage.includes('does not exist')) {
            userFriendlyError = 'Database or table does not exist. Please check your database name.';
        } else if (errorMessage.includes('Connection terminated')) {
            userFriendlyError = 'Connection was terminated. This might be due to network issues or firewall restrictions.';
        } else if (errorMessage.includes('SSL')) {
            userFriendlyError = 'SSL connection issue. Make sure SSL is properly configured for your database.';
        } else if (errorMessage.includes('permission denied')) {
            userFriendlyError = 'Permission denied. Your database user may not have sufficient privileges.';
        }

        return res.status(500).json({
            error: userFriendlyError,
            details: errorMessage
        });
    } finally {
        if (client) {
            client.release();
            console.log("Database client released");
        }
    }
});


app.post('/register-helius-webhook', async (req, res) => {
    const { webhookId, programIds, accountAddresses } = req.body;

    if (!webhookId) {
        return res.status(400).json({ error: 'Missing webhookId' });
    }

    try {
        // Fetch the webhook document to get database details
        const db = admin.firestore();
        const webhookDoc = await db.collection('webhooks').doc(webhookId).get();

        if (!webhookDoc.exists) {
            return res.status(404).json({ error: `Webhook ${webhookId} not found` });
        }

        const webhookData = webhookDoc.data();
        if (!webhookData) {
            return res.status(500).json({ error: `Webhook ${webhookId} data is empty` });
        }

        const tableName = webhookData.tableName || 'solana_program_invocations';
        const databaseId = webhookData.databaseId;

        if (!databaseId) {
            return res.status(400).json({ error: 'Webhook is missing database reference' });
        }

        const heliusApiKey = process.env.HELIUS_API_KEY;
        if (!heliusApiKey) {
            return res.status(500).json({ error: 'Helius API key not configured' });
        }

        const webhookUrl = `${process.env.SERVER_URL || 'http://localhost:3001'}/webhook/helius/${webhookId}`;

        const registrationData = {
            webhookURL: webhookUrl,
            transactionTypes: ["ANY"],
            accountAddresses: accountAddresses || [],
            webhookType: "enhanced",
            txnStatus: "success",
            authHeader: process.env.WEBHOOK_AUTH_HEADER || "x-helius-token"
        };

        if (programIds && programIds.length > 0) {
            registrationData.accountAddresses = [
                ...registrationData.accountAddresses,
                ...programIds
            ];
        }

        console.log("Registering Helius webhook with data:", {
            ...registrationData,
            webhookURL: registrationData.webhookURL,
            authHeader: "****" // Mask auth header in logs
        });

        const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${heliusApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData)
        });

        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse Helius response:", responseText);
            throw new Error(`Invalid response from Helius: ${responseText}`);
        }

        if (!response.ok) {
            throw new Error(`Helius webhook registration failed: ${JSON.stringify(responseData)}`);
        }

        console.log("Helius webhook registered successfully:", responseData);

        // Update the webhook document in Firestore with the Helius webhook ID
        await db.collection('webhooks').doc(webhookId).update({
            heliusWebhookId: responseData.webhookID,
            status: 'active',
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        // Create the table in the database
        console.log(`Preparing to create table ${tableName} for webhook ${webhookId}`);

        try {
            // Get database connection info
            const dbDoc = await db.collection('databases').doc(databaseId).get();
            if (!dbDoc.exists) {
                console.error(`Database ${databaseId} not found`);
                throw new Error(`Database ${databaseId} not found`);
            }

            const dbConnection = dbDoc.data();
            if (!dbConnection) {
                console.error(`Database ${databaseId} data is empty`);
                throw new Error(`Database ${databaseId} data is empty`);
            }

            // Get the actual connection string from the database document
            let connectionString = dbConnection.connectionString;
            console.log(`Retrieved connection string from database document: ${connectionString ? 'YES' : 'NO'}`);

            if (!connectionString) {
                console.error('No database connection string available in database document');
                throw new Error('No database connection string available');
            }

            // Check if connection string has a valid format
            if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
                console.log('Connection string does not have correct prefix, fixing...');
                // Fix connection string by adding proper prefix if needed
                if (connectionString.startsWith('postgresql:')) {
                    connectionString = connectionString.replace('postgresql:', 'postgresql://neondb_owner:npg_3UJGqSfm1QYn');
                } else {
                    // // If completely malformed, use a proper connection string
                    // connectionString = `postgresql://neondb_owner:npg_3UJGqSfm1QYn@ep-muddy-cherry-a8gqkn0k-pooler.eastus2.azure.neon.tech/neondb?sslmode=require`;

                    throw new Error('Invalid database connection string format');
                }
            }

            // Handle both postgresql:// and postgres:// protocols
            if (connectionString.startsWith('postgresql://')) {
                console.log('Converting postgresql:// to postgres:// for compatibility');
                connectionString = connectionString.replace('postgresql://', 'postgres://');
            }

            console.log(`Using connection string: ${connectionString.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')}`);

            // Connect to database with SSL enabled for Neon
            const pool = new Pool({
                connectionString,
                ssl: { rejectUnauthorized: false },
            });

            console.log(`Attempting to connect to database to create table ${tableName}`);
            const client = await pool.connect();
            console.log(`Successfully connected to database`);

            try {
                // Create the table for program invocations
                console.log(`Creating table ${tableName} if not exists`);
                await client.query(`
                    CREATE TABLE IF NOT EXISTS ${tableName} (
                        id SERIAL PRIMARY KEY,
                        program_id TEXT NOT NULL,
                        signature TEXT NOT NULL,
                        slot BIGINT NOT NULL,
                        timestamp TIMESTAMP NOT NULL,
                        accounts TEXT[] NOT NULL,
                        data TEXT,
                        is_inner_instruction BOOLEAN DEFAULT FALSE,
                        inner_instruction_index INTEGER,
                        transaction_json JSONB,
                        created_at TIMESTAMP DEFAULT NOW()
                    );
                `);

                // Create index on program_id for faster queries
                console.log(`Creating index ${tableName}_program_id_idx`);
                await client.query(`
                    CREATE INDEX IF NOT EXISTS ${tableName}_program_id_idx 
                    ON ${tableName}(program_id);
                `);

                // Create index on signature for faster queries
                console.log(`Creating index ${tableName}_signature_idx`);
                await client.query(`
                    CREATE INDEX IF NOT EXISTS ${tableName}_signature_idx 
                    ON ${tableName}(signature);
                `);

                console.log(`Successfully created table ${tableName} for webhook ${webhookId}`);
            } catch (queryError) {
                console.error('Error executing database query:', queryError);
                throw queryError;
            } finally {
                client.release();
                console.log(`Database client released`);
            }
        } catch (dbError) {
            console.error('Error creating database table:', dbError);
            // We don't want to fail the whole webhook registration if table creation fails
            // The table will be created on first webhook trigger if needed
        }

        return res.status(200).json({
            success: true,
            message: 'Helius webhook registered successfully',
            webhookId: responseData.webhookID,
            webhookUrl
        });

    } catch (error: any) {
        console.error('Error registering Helius webhook:', error);
        return res.status(500).json({
            error: 'Failed to register Helius webhook',
            details: error.message
        });
    }
});


app.delete('/webhook/:webhookId', async (req, res) => {
    const { webhookId } = req.params;

    if (!webhookId) {
        return res.status(400).json({ error: 'Missing webhookId' });
    }

    try {

        const firestore = admin.firestore();
        const webhookDoc = await firestore.collection('webhooks').doc(webhookId).get();

        if (!webhookDoc.exists) {
            return res.status(404).json({ error: `Webhook ${webhookId} not found` });
        }

        const webhookData = webhookDoc.data();
        const heliusWebhookId = webhookData?.heliusWebhookId;

        if (heliusWebhookId) {

            const heliusApiKey = process.env.HELIUS_API_KEY;
            if (!heliusApiKey) {
                return res.status(500).json({ error: 'Helius API key not configured' });
            }

            console.log(`Deleting Helius webhook ${heliusWebhookId}`);

            const response = await fetch(`https://api.helius.xyz/v0/webhooks/${heliusWebhookId}?api-key=${heliusApiKey}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const responseText = await response.text();
                console.error(`Error deleting Helius webhook: ${responseText}`);

            } else {
                console.log(`Successfully deleted Helius webhook ${heliusWebhookId}`);
            }
        } else {
            console.log(`No Helius webhook ID found for webhook ${webhookId}`);
        }

        // Delete from Firestore
        await firestore.collection('webhooks').doc(webhookId).delete();
        console.log(`Deleted webhook ${webhookId} from Firestore`);

        return res.status(200).json({
            success: true,
            message: 'Webhook deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting webhook:', error);
        return res.status(500).json({
            error: 'Failed to delete webhook',
            details: error.message
        });
    }
});

// Global error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});