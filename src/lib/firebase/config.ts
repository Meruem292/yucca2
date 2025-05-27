
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// IMPORTANT:
// You have mentioned you are hardcoding your Firebase credentials.
// Please replace the placeholder values below with your *ACTUAL* Firebase project configuration.
// Double-check every character, especially for apiKey, projectId, and authDomain.
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY_HERE", // Replace with your real API Key
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Replace
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com", // Replace or remove if not using Realtime Database
  projectId: "YOUR_PROJECT_ID", // Replace
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Replace
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace
  appId: "YOUR_APP_ID", // Replace
  measurementId: "YOUR_MEASUREMENT_ID" // Optional, replace or remove
};

// Log the hardcoded config being used for Firebase initialization
console.log("--- Firebase Hardcoded Configuration ---");
console.log("Attempting to initialize Firebase with the following hardcoded config:");
console.log("Project ID:", firebaseConfig.projectId ? `"${firebaseConfig.projectId}"` : "MISSING or UNDEFINED");
console.log("API Key:", firebaseConfig.apiKey ? `"${firebaseConfig.apiKey.substring(0, 6)}... (check Firebase Console for full key)"` : "MISSING or UNDEFINED");
console.log("Auth Domain:", firebaseConfig.authDomain ? `"${firebaseConfig.authDomain}"` : "MISSING or UNDEFINED");
console.log("Storage Bucket:", firebaseConfig.storageBucket ? `"${firebaseConfig.storageBucket}"` : "MISSING or UNDEFINED");
console.log("Messaging Sender ID:", firebaseConfig.messagingSenderId ? `"${firebaseConfig.messagingSenderId}"` : "MISSING or UNDEFINED");
console.log("App ID:", firebaseConfig.appId ? `"${firebaseConfig.appId}"` : "MISSING or UNDEFINED");
console.log("Measurement ID (Optional):", firebaseConfig.measurementId ? `"${firebaseConfig.measurementId}"` : "Not provided");
console.log("--------------------------------------");


if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.authDomain) {
  console.error(
    "CRITICAL: Firebase API Key, Project ID, or Auth Domain is MISSING from the hardcoded firebaseConfig object. " +
    "Firebase will not initialize correctly. " +
    "Please ensure these values are correctly set in src/lib/firebase/config.ts and are accurate for your project."
  );
}

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
    console.error("Firebase config that was used:", firebaseConfig);
    // @ts-ignore
    app = undefined; // Explicitly set to undefined on failure
  }
} else {
  app = getApp();
  console.log("Firebase app already initialized. Getting existing app.");
}

// Only initialize auth, db, storage if app was successfully initialized
if (app) {
  try {
    console.log("Attempting: getAuth(app)");
    auth = getAuth(app);
    console.log("Firebase Auth service initialized successfully.");

    console.log("Attempting: getFirestore(app)");
    db = getFirestore(app);
    console.log("Firebase Firestore service initialized successfully.");

    console.log("Attempting: getStorage(app)");
    storage = getStorage(app);
    console.log("Firebase Storage service initialized successfully.");
  } catch (serviceError: any) {
    console.error("Error initializing Firebase services (Auth, Firestore, or Storage):", serviceError.message);
    console.error("This usually happens if the firebaseConfig used to initialize the app was invalid (e.g., invalid API key). Review the config above.");
    // @ts-ignore
    auth = undefined;
    // @ts-ignore
    db = undefined;
    // @ts-ignore
    storage = undefined;
  }
} else {
  console.error("Firebase app object is not available. Firebase services (Auth, Firestore, Storage) will not be initialized.");
  // @ts-ignore
  auth = undefined;
  // @ts-ignore
  db = undefined;
  // @ts-ignore
  storage = undefined;
}

export { app, auth, db, storage };
