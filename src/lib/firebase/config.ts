
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getDatabase, type Database as RealtimeDatabase } from "firebase/database";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// IMPORTANT: REPLACE THE PLACEHOLDER VALUES BELOW WITH YOUR ACTUAL FIREBASE PROJECT CREDENTIALS.
// You can find these in your Firebase project settings:
// Project Overview > (Gear Icon) > Project settings > General tab > Your apps > Web app > Config
// Ensure these are your ACTUAL credentials.
const firebaseConfig = {
  apiKey: "AIzaSyBPEswJbXXgr_B3hUvfHpFkR9QMKuUQJn8", // Replace with your actual API key
  authDomain: "yucca-a3092.firebaseapp.com",       // Replace with your actual auth domain
  databaseURL: "https://yucca-a3092-default-rtdb.firebaseio.com", // Ensure this is correct for RTDB
  projectId: "yucca-a3092",                         // Replace with your actual project ID
  storageBucket: "yucca-a3092.appspot.com", // Replace with your actual storage bucket
  messagingSenderId: "1010415262149",               // Replace with your actual sender ID
  appId: "1:1010415262149:web:e07c2a5a1057d360f353ac",             // Replace with your actual app ID
  measurementId: "G-8VY4PL4E4W"                   // Optional: Replace with your actual measurement ID
};

// --- Configuration Verification & Reduced Logging ---
console.log("--- Firebase Configuration Check ---");
let isPlaceholderDetected = false;

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("YOUR_") || firebaseConfig.apiKey.startsWith("AIzaSyYOUR")) {
  console.error(
    "CRITICAL Firebase Error: 'apiKey' in firebaseConfig (src/lib/firebase/config.ts) appears to be a placeholder or is missing. Please replace it with your actual Firebase API Key."
  );
  isPlaceholderDetected = true;
}
if (!firebaseConfig.projectId || firebaseConfig.projectId.startsWith("YOUR_")) {
  console.error(
    "CRITICAL Firebase Error: 'projectId' in firebaseConfig (src/lib/firebase/config.ts) appears to be a placeholder or is missing. Please replace it with your actual Firebase Project ID."
  );
  isPlaceholderDetected = true;
}

if (isPlaceholderDetected) {
  console.error(
    "Firebase will likely FAIL to initialize due to placeholder credentials in src/lib/firebase/config.ts. " +
    "Please edit the firebaseConfig object in that file and replace ALL placeholder values (like 'YOUR_PROJECT_ID', 'AIzaSyYOUR_...') with your project's actual Firebase credentials, then restart your server."
  );
} else {
  console.log("Firebase config values seem to be populated (not placeholders).");
  console.log("Project ID being used:", `"${firebaseConfig.projectId}"`);
  console.log("API Key starts with:", `"${firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 8) + '...' : 'MISSING'}"`);
}
console.log("--------------------------------------");
// --- End Configuration Verification & Reduced Logging ---

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestoreDB: Firestore;
let rtdb: RealtimeDatabase;
let storage: FirebaseStorage;

if (!getApps().length) {
  try {
    console.log("Attempting: initializeApp(firebaseConfig)");
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully using Project ID:", firebaseConfig.projectId);
  } catch (error: any) {
    console.error("Firebase initialization error (initializeApp call failed):", error.message);
    console.error("This usually means the hardcoded `firebaseConfig` object in src/lib/firebase/config.ts contains incorrect values or placeholders for your project. Please double-check them against your Firebase project settings in the Firebase Console.");
    // @ts-ignore - app will be undefined here
    app = undefined;
  }
} else {
  app = getApp();
  console.log("Firebase app already initialized. Getting existing app for Project ID:", firebaseConfig.projectId);
}

if (app) {
  try {
    auth = getAuth(app);
  } catch (e) {
    console.error("Error initializing Firebase Auth:", e);
    // @ts-ignore
    auth = undefined;
  }

  try {
    firestoreDB = getFirestore(app);
  } catch (e) {
    console.error("Error initializing Firebase Firestore:", e);
    // @ts-ignore
    firestoreDB = undefined;
  }
  
  try {
    rtdb = getDatabase(app);
  } catch(e) {
    console.error("Error initializing Firebase Realtime Database:", e);
    // @ts-ignore
    rtdb = undefined;
  }

  try {
    storage = getStorage(app);
  } catch (e) {
    console.error("Error initializing Firebase Storage:", e);
    // @ts-ignore
    storage = undefined;
  }

} else {
  console.error("Firebase app object is NOT available. Firebase services will NOT be initialized. This is likely due to an issue with the `firebaseConfig` values.");
  // @ts-ignore
  auth = undefined;
  // @ts-ignore
  firestoreDB = undefined;
  // @ts-ignore
  rtdb = undefined;
  // @ts-ignore
  storage = undefined;
}

export { app, auth, firestoreDB, rtdb, storage };
