const admin = require('firebase-admin');

/**
 * Initialize Firebase Admin SDK
 * In production, use environment variables or secret manager for credentials
 */
const initializeFirebase = () => {
  // For local development, use service account credentials from a JSON file
  // In production, use environment variables or Google Cloud secret manager
  if (process.env.NODE_ENV === 'production') {
    // In production on Google Cloud, use default credentials
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    // For local development, use service account key file
    // You would need to create this file with Firebase service account credentials
    try {
      const serviceAccount = require('../../service-account-key.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } catch (error) {
      console.error('Firebase initialization error:', error);
      // Fallback to application default credentials if service account file is not available
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
  }

  console.log('Firebase Admin SDK initialized');
};

module.exports = {
  initializeFirebase,
  admin,
};