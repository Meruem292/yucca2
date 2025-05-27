
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getDatabase, type Database as RealtimeDatabaseType } from "firebase/database"; // Added for RTDB

// IMPORTANT: REPLACE THE PLACEHOLDER VALUES BELOW WITH YOUR ACTUAL FIREBASE PROJECT CREDENTIALS.
// You can find these in your Firebase project settings:
// Project Overview > (Gear Icon) > Project settings > General tab > Your apps > Web app > Config

// Using hardcoded values as per user confirmation.
// Ensure these are your ACTUAL credentials.
const firebaseConfig = {
  apiKey: "AIzaSyBPEswJbXXgr_B3hUvfHpFkR9QMKuUQJn8", // Replace with your actual API key
  authDomain: "yucca-a3092.firebaseapp.com",       // Replace with your actual auth domain
  databaseURL: "https://yucca-a3092-default-rtdb.firebaseio.com", // Ensure this is correct for RTDB
  projectId: "yucca-a3092",                         // Replace with your actual project ID
  storageBucket: "yucca-a3092.firebasestorage.app", // Replace with your actual storage bucket
  messagingSenderId: "1010415262149",               // Replace with your actual sender ID
  appId: "1:1010415262149:web:e07c2a5a1057d360f353ac",             // Replace with your actual app ID
  measurementId: "G-8VY4PL4E4W"                   // Optional: Replace with your actual measurement ID
};


// --- Configuration Verification & Logging ---
console.log("--- Firebase Hardcoded Configuration ---");
console.log("Attempting to initialize Firebase with the following hardcoded config from src/lib/firebase/config.ts:");

let isPlaceholderDetected = false;
// Check if any placeholder values are still present
if (firebaseConfig.apiKey.startsWith("YOUR_") || firebaseConfig.apiKey.startsWith("AIzaSyYOUR")) {
  console.error("CRITICAL: 'apiKey' in firebaseConfig appears to be a placeholder. Please replace it with your actual Firebase API Key.");
  isPlaceholderDetected = true;
}
if (firebaseConfig.projectId.startsWith("YOUR_")) {
  console.error("CRITICAL: 'projectId' in firebaseConfig appears to be a placeholder. Please replace it with your actual Firebase Project ID.");
  isPlaceholderDetected = true;
}
// Add similar checks for other essential fields if desired for thoroughness

console.log("Project ID:", `"${firebaseConfig.projectId}"`);
console.log("API Key:", `"${firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 6) + '...' : 'MISSING'}" (check Firebase Console for full key)`);
console.log("Auth Domain:", `"${firebaseConfig.authDomain}"`);
console.log("Database URL (RTDB):", `"${firebaseConfig.databaseURL}"`);
console.log("Storage Bucket:", `"${firebaseConfig.storageBucket}"`);
console.log("Messaging Sender ID:", `"${firebaseConfig.messagingSenderId}"`);
console.log("App ID:", `"${firebaseConfig.appId}"`);
console.log("Measurement ID (Optional):", `"${firebaseConfig.measurementId || 'Not provided'}"`);
console.log("--------------------------------------");

if (isPlaceholderDetected) {
  console.error(
    "Firebase will likely fail to initialize due to placeholder credentials. " +
    "Please edit src/lib/firebase/config.ts and replace ALL placeholder values (like 'YOUR_PROJECT_ID', 'AIzaSyYOUR_...') with your project's actual Firebase credentials."
  );
}
// --- End Configuration Verification & Logging ---

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestoreDB: Firestore; // Renamed for clarity
let rtdb: RealtimeDatabaseType; // For Realtime Database
let storage: FirebaseStorage;

if (!getApps().length) {
  try {
    console.log("Attempting: initializeApp(firebaseConfig)");
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully.");
  } catch (error: any) {
    console.error("Firebase initialization error (initializeApp call failed):", error.message);
    // @ts-ignore - app will be undefined here
    app = undefined;
  }
} else {
  app = getApp();
  console.log("Firebase app already initialized. Getting existing app.");
}

if (app) {
  try {
    console.log("Attempting: getAuth(app)");
    auth = getAuth(app);
    console.log("Firebase Auth service initialized successfully.");
  } catch (e) {
    console.error("Error initializing Firebase Auth:", e);
    // @ts-ignore
    auth = undefined;
  }

  try {
    console.log("Attempting: getFirestore(app)");
    firestoreDB = getFirestore(app);
    console.log("Firebase Firestore service initialized successfully.");
  } catch (e) {
    console.error("Error initializing Firebase Firestore:", e);
    // @ts-ignore
    firestoreDB = undefined;
  }
  
  try {
    console.log("Attempting: getDatabase(app) for Realtime Database");
    rtdb = getDatabase(app); // Initialize Realtime Database
    console.log("Firebase Realtime Database service initialized successfully.");
  } catch(e) {
    console.error("Error initializing Firebase Realtime Database:", e);
    // @ts-ignore
    rtdb = undefined;
  }

  try {
    console.log("Attempting: getStorage(app)");
    storage = getStorage(app);
    console.log("Firebase Storage service initialized successfully.");
  } catch (e) {
    console.error("Error initializing Firebase Storage:", e);
    // @ts-ignore
    storage = undefined;
  }

} else {
  console.error("Firebase app object is NOT available. Firebase services will NOT be initialized.");
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
