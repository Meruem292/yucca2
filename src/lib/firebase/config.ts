
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// IMPORTANT: REPLACE THE PLACEHOLDER VALUES BELOW WITH YOUR ACTUAL FIREBASE PROJECT CREDENTIALS.
// You can find these in your Firebase project settings:
// Project Overview > (Gear Icon) > Project settings > General tab > Your apps > Web app > Config
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY_HERE", // <--- REPLACE THIS!
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // <--- REPLACE THIS! (Ensure YOUR_PROJECT_ID is your actual project ID)
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com", // <--- REPLACE THIS or REMOVE if not using Realtime Database
  projectId: "YOUR_PROJECT_ID", // <--- REPLACE THIS!
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // <--- REPLACE THIS!
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- REPLACE THIS!
  appId: "YOUR_APP_ID", // <--- REPLACE THIS!
  measurementId: "YOUR_MEASUREMENT_ID" // <--- REPLACE THIS (Optional, or remove)
};

// --- Configuration Verification & Logging ---
console.log("--- Firebase Hardcoded Configuration ---");
console.log("Attempting to initialize Firebase with the following hardcoded config from src/lib/firebase/config.ts:");
let isPlaceholderDetected = false;

if (firebaseConfig.apiKey === "YOUR_ACTUAL_API_KEY_HERE") {
  console.error("CRITICAL: 'apiKey' in firebaseConfig is still the placeholder value. Please replace it with your actual Firebase API Key.");
  isPlaceholderDetected = true;
}
if (firebaseConfig.projectId === "YOUR_PROJECT_ID" || (firebaseConfig.authDomain && firebaseConfig.authDomain.includes("YOUR_PROJECT_ID.firebaseapp.com"))) {
  console.error("CRITICAL: 'projectId' or 'authDomain' in firebaseConfig appears to use the placeholder 'YOUR_PROJECT_ID'. Please replace it with your actual Firebase Project ID.");
  isPlaceholderDetected = true;
}
// Add similar checks for other essential fields if desired

console.log("Project ID:", `"${firebaseConfig.projectId}"`);
console.log("API Key:", `"${firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 6) + '...' : 'MISSING'}"`);
console.log("Auth Domain:", `"${firebaseConfig.authDomain}"`);
console.log("Storage Bucket:", `"${firebaseConfig.storageBucket}"`);
console.log("Messaging Sender ID:", `"${firebaseConfig.messagingSenderId}"`);
console.log("App ID:", `"${firebaseConfig.appId}"`);
console.log("--------------------------------------");

if (isPlaceholderDetected) {
  console.error(
    "Firebase will likely fail to initialize due to placeholder credentials. " +
    "Please edit src/lib/firebase/config.ts and replace all 'YOUR_...' placeholders with your project's actual Firebase credentials."
  );
}
// --- End Configuration Verification & Logging ---

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  try {
    console.log("Attempting: initializeApp(firebaseConfig)");
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully.");
  } catch (error: any) {
    console.error("Firebase initialization error (initializeApp call failed):", error.message);
    console.error("The firebaseConfig object that was used during this attempt:", firebaseConfig);
    // @ts-ignore - app will be undefined here
    app = undefined;
  }
} else {
  app = getApp();
  console.log("Firebase app already initialized. Getting existing app.");
}

if (app) {
  try {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebase Auth, Firestore, and Storage services initialized (or retrieved).");
  } catch (serviceError: any) {
    console.error("Error initializing Firebase services (Auth, Firestore, or Storage) after app initialization:", serviceError.message);
    // @ts-ignore
    auth = undefined;
    // @ts-ignore
    db = undefined;
    // @ts-ignore
    storage = undefined;
  }
} else {
  console.error("Firebase app object is NOT available. Firebase services (Auth, Firestore, Storage) will NOT be initialized.");
   // @ts-ignore
  auth = undefined;
   // @ts-ignore
  db = undefined;
   // @ts-ignore
  storage = undefined;
}

export { app, auth, db, storage };

