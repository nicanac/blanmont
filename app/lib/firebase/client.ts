import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  Database,
  ref,
  get,
  set,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Helper to check if we are in mock mode (Firebase not configured)
export const isMockMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// Helper to check if we should use Notion fallback
export const useNotionFallback = isMockMode && !!process.env.NOTION_TOKEN;

// Initialize Firebase App (singleton pattern)
let app: FirebaseApp;
let database: Database;
let auth: Auth;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const existingApps = getApps();
    app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseDatabase(): Database {
  if (!database) {
    database = getDatabase(getFirebaseApp());
  }
  return database;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

// Re-export Firebase utilities for convenience
export {
  ref,
  get,
  set,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
};

// Helper to generate a clean ID (removes dashes from UUID-style IDs)
export const cleanId = (id: string | undefined): string => {
  if (!id) return '';
  return id.replace(/-/g, '');
};

// Helper to convert Firebase snapshot to array
export const snapshotToArray = <T>(snapshot: any): T[] => {
  const result: T[] = [];
  if (snapshot.exists()) {
    snapshot.forEach((child: any) => {
      result.push({ id: child.key, ...child.val() } as T);
    });
  }
  return result;
};

// Helper to convert Firebase snapshot to object with ID
export const snapshotToObject = <T>(snapshot: any, id: string): T | null => {
  if (snapshot.exists()) {
    return { id, ...snapshot.val() } as T;
  }
  return null;
};
