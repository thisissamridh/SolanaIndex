import {
    doc,
    setDoc,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// User Functions
export async function getUserData(userId: string) {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
    }

    return null;
}


export async function getDatabaseById(databaseId: string) {
    const databaseDocRef = doc(db, "databases", databaseId);
    const docSnap = await getDoc(databaseDocRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
}


export async function updateUserData(userId: string, userData: any) {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
        ...userData,
        updatedAt: serverTimestamp()
    });
}
export async function addDatabase(userId: string, databaseData: any) {
    const databasesCollectionRef = collection(db, 'databases');
    const docRef = await addDoc(databasesCollectionRef, {
        ...databaseData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return docRef.id;
}

export async function getUserDatabases(userId: string) {
    const databasesCollectionRef = collection(db, 'databases');
    const userDatabasesQuery = query(databasesCollectionRef, where('userId', '==', userId));
    const databasesSnapshot = await getDocs(userDatabasesQuery);

    return databasesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

export async function updateDatabase(databaseId: string, databaseData: any) {
    const databaseDocRef = doc(db, 'databases', databaseId);
    await updateDoc(databaseDocRef, {
        ...databaseData,
        updatedAt: serverTimestamp()
    });
}

export async function deleteDatabase(databaseId: string) {
    const databaseDocRef = doc(db, 'databases', databaseId);
    await deleteDoc(databaseDocRef);
}


export async function addWebhook(userId: string, webhookData: any) {
    const webhooksCollectionRef = collection(db, 'webhooks');
    const docRef = await addDoc(webhooksCollectionRef, {
        ...webhookData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        dataPoints: 0, // Initial data points count
        status: 'active' // Initial status
    });
    return docRef.id;
}

export async function getUserWebhooks(userId: string) {
    const webhooksCollectionRef = collection(db, 'webhooks');
    const userWebhooksQuery = query(webhooksCollectionRef, where('userId', '==', userId));
    const webhooksSnapshot = await getDocs(userWebhooksQuery);

    return webhooksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

export async function updateWebhook(webhookId: string, webhookData: any) {
    const webhookDocRef = doc(db, 'webhooks', webhookId);
    await updateDoc(webhookDocRef, {
        ...webhookData,
        updatedAt: serverTimestamp()
    });
}

export async function deleteWebhook(webhookId: string) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/webhook/${webhookId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete webhook');
        }

        return true;
    } catch (error) {
        console.error('Error deleting webhook:', error);
        throw error;
    }
}


export const databaseSchema = {
    name: '', // Name of the database
    connectionString: '', // Connection string (masked for security)
    host: '', // Database host
    port: '', // Database port
    username: '', // Database username
    password: '', // Database password (masked for security)
    dbName: '', // Database name
    ssl: false, // Whether SSL is enabled
    description: '', // Description of the database
    tables: [] // Tables in the database
};

// Sample webhook schema
export const webhookSchema = {
    name: '', // Name of the webhook
    description: '', // Description of the webhook
    databaseId: '', // ID of the connected database
    endpoint: '', // Webhook endpoint URL
    accountAddresses: [], // Array of account addresses to track
    transactionTypes: [], // Array of transaction types to track
    dataTable: '', // Table to store the data in
    status: '', // Status of the webhook (active, inactive)
    dataPoints: 0, // Number of data points indexed
    lastTriggered: null // When the webhook was last triggered
};