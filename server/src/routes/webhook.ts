// server/src/routes/webhook.ts

import express from 'express';
import admin, { db } from '../firebaseAdmin';
import { processProgramInvocation } from '../webhooks/program-invocation';
import { processTokenPrices } from '../webhooks/token-prices';

const router = express.Router();


// Webhook receiver endpoint
router.post('/helius/:webhookId', async (req, res) => {
    try {
        const { webhookId } = req.params;
        const transactions = req.body;

        console.log(`Received webhook for ${webhookId} with ${transactions.length} transactions`);

        if (!webhookId) {
            return res.status(400).json({ error: 'Missing webhookId parameter' });
        }

        if (!Array.isArray(transactions)) {
            return res.status(400).json({ error: 'Expected transactions array in request body' });
        }

        // Fetch the webhook to determine its type
        const webhookDoc = await db.collection('webhooks').doc(webhookId).get();

        if (!webhookDoc.exists) {
            return res.status(404).json({ error: `Webhook ${webhookId} not found` });
        }

        const webhookData = webhookDoc.data();

        // Return 200 immediately to Helius, then process transactions asynchronously
        res.status(200).json({ received: true, transactionCount: transactions.length });

        // Process transactions based on webhook type
        for (const transaction of transactions) {
            try {
                if (webhookData?.webhookType === 'program_invocation') {
                    await processProgramInvocation(webhookId, transaction);
                } else if (webhookData?.webhookType === 'token_prices') {
                    await processTokenPrices(webhookId, transaction)
                } else {
                    console.log(`Unsupported webhook type: ${webhookData?.webhookType}`);
                }
            } catch (txError) {
                console.error(`Error processing transaction ${transaction.signature}:`, txError);
                // Continue processing other transactions
            }
        }

    } catch (error) {
        console.error('Error processing webhook:', error);
        // If we haven't already sent a response
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process webhook' });
        }
    }
});

// Endpoint to manually trigger a webhook for testing with a specific transaction
router.post('/test/:webhookId', async (req, res) => {
    try {
        const { webhookId } = req.params;
        const { transaction } = req.body;

        if (!webhookId) {
            return res.status(400).json({ error: 'Missing webhookId parameter' });
        }

        if (!transaction) {
            return res.status(400).json({ error: 'Missing transaction in request body' });
        }

        // Fetch the webhook to determine its type
        const webhookDoc = await db.collection('webhooks').doc(webhookId).get();

        if (!webhookDoc.exists) {
            return res.status(404).json({ error: `Webhook ${webhookId} not found` });
        }

        const webhookData = webhookDoc.data();

        // Process transaction based on webhook type
        if (webhookData?.webhookType === 'program_invocation') {
            await processProgramInvocation(webhookId, transaction);
            res.status(200).json({ success: true, message: 'Test transaction processed successfully' });
        } else {
            res.status(400).json({ error: `Unsupported webhook type: ${webhookData?.webhookType}` });
        }

    } catch (error) {
        console.error('Error processing test webhook:', error);
        res.status(500).json({ error: 'Failed to process test webhook' });
    }
});

// Endpoint to get all webhooks for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId parameter' });
        }

        const webhooksSnapshot = await db.collection('webhooks')
            .where('userId', '==', userId)
            .get();

        const webhooks = webhooksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(webhooks);

    } catch (error) {
        console.error('Error fetching user webhooks:', error);
        res.status(500).json({ error: 'Failed to fetch webhooks' });
    }
});

// Endpoint to get a specific webhook
router.get('/:webhookId', async (req, res) => {
    try {
        const { webhookId } = req.params;

        if (!webhookId) {
            return res.status(400).json({ error: 'Missing webhookId parameter' });
        }

        const webhookDoc = await db.collection('webhooks').doc(webhookId).get();

        if (!webhookDoc.exists) {
            return res.status(404).json({ error: `Webhook ${webhookId} not found` });
        }

        res.status(200).json({
            id: webhookDoc.id,
            ...webhookDoc.data()
        });

    } catch (error) {
        console.error('Error fetching webhook:', error);
        res.status(500).json({ error: 'Failed to fetch webhook' });
    }
});

export default router;