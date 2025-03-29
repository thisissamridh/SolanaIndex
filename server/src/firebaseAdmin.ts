
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';


if (!admin.apps.length) {

    const serviceAccountPath = path.join(__dirname, "./service.json");

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),

        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}

export const db = admin.firestore();
export default admin;