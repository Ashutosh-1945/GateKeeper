const admin = require('firebase-admin');
require('dotenv').config();

// ============================================
// Firebase Admin SDK Initialization
// ============================================
// Supports multiple initialization methods:
// 1. Local file path (development)
// 2. Base64 encoded JSON (cloud deployments)
// 3. Application Default Credentials (GCP)

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  // Option 1: Base64 encoded service account (for Vercel, Railway, etc.)
  const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(decoded);
  console.log('🔥 Firebase: Using Base64 encoded credentials');
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  // Option 2: Local file path
  serviceAccount = require(`../${process.env.FIREBASE_SERVICE_ACCOUNT_PATH.replace('./', '')}`);
  console.log('🔥 Firebase: Using local service account file');
} else {
  // Option 3: Default path fallback
  try {
    serviceAccount = require('../serviceAccountKey.json');
    console.log('🔥 Firebase: Using default serviceAccountKey.json');
  } catch (err) {
    console.error('❌ Firebase: No service account found. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_BASE64');
    process.exit(1);
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };

