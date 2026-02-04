import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';
import { getAuth, Auth } from 'firebase-admin/auth';

// Firebase Admin configuration
const getAdminApp = (): App => {
  const existingApps = getApps();

  if (existingApps.length > 0) {
    return existingApps[0];
  }

  // Check for service account credentials
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccount) {
    try {
      console.log('Initializing Firebase Admin with Service Account...');
      const parsedServiceAccount = JSON.parse(serviceAccount);
      return initializeApp({
        credential: cert(parsedServiceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY not found in environment variables.');
  }

  // Fallback: Initialize without credentials (for local development with emulator)
  console.warn('Initializing Firebase Admin WITHOUT credentials (fallback).');
  return initializeApp({
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
};

let adminApp: App;
let adminDatabase: Database;
let adminAuth: Auth;

export function getAdminDatabase(): Database {
  if (!adminApp) {
    adminApp = getAdminApp();
  }
  if (!adminDatabase) {
    adminDatabase = getDatabase(adminApp);
  }
  return adminDatabase;
}

export function getAdminAuth(): Auth {
  if (!adminApp) {
    adminApp = getAdminApp();
  }
  if (!adminAuth) {
    adminAuth = getAuth(adminApp);
  }
  return adminAuth;
}

// Helper to check if admin is properly configured
export const isAdminConfigured = (): boolean => {
  return (
    !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY || !!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  );
};
