import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import config from './firebase-applet-config.json';

dotenv.config();

// Attempt to parse the service account key
let serviceAccount: any = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch (e: any) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
  }
}

let app;
if (serviceAccount) {
  try {
    app = initializeApp({
      credential: cert(serviceAccount)
    });
  } catch(e) {}
}

async function run() {
  if (!app) return console.log('no app');
  const db = getFirestore(app, config.firestoreDatabaseId);
  const logs = await db.collection('webhook_logs').orderBy('createdAt', 'desc').limit(5).get();
  logs.forEach(doc => {
    console.log(doc.id, '=>', JSON.stringify(doc.data(), null, 2));
  });
}
run();
