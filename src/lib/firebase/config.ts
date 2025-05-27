
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Log the environment variables to help with debugging
console.log("Attempting to load Firebase config from environment variables:");
console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_APP_ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (Optional):", process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? "Loaded" : "MISSING or UNDEFINED");


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPEswJbXXgr_B3hUvfHpFkR9QMKuUQJn8",
  authDomain: "yucca-a3092.firebaseapp.com",
  databaseURL: "https://yucca-a3092-default-rtdb.firebaseio.com",
  projectId: "yucca-a3092",
  storageBucket: "yucca-a3092.firebasestorage.app",
  messagingSenderId: "1010415262149",
  appId: "1:1010415262149:web:24f3e54fbc388ca0f353ac",
  measurementId: "G-2TGL03F4CW"
};

// Explicitly check if the API key is loaded.
if (!firebaseConfig.apiKey) {
  console.error(
    "CRITICAL: Firebase API Key is MISSING from environment variables. " +
    "Firebase will not initialize correctly. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is correctly set in your .env.local file " +
    "AND that you have RESTARTED your Next.js development server."
  );
} else if (
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    !firebaseConfig.storageBucket ||
    !firebaseConfig.messagingSenderId ||
    !firebaseConfig.appId
) {
    console.warn(
      "WARNING: One or more Firebase configuration values (authDomain, projectId, etc.) are missing or undefined. " +
      "This may lead to Firebase initialization errors or runtime issues. " +
      "Please ensure all required NEXT_PUBLIC_FIREBASE_ environment variables are set in your .env.local file and the server has been restarted."
    );
}


// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  try {
    console.log("Initializing Firebase app with config:", firebaseConfig);
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error (initializeApp call failed):", error);
    console.error("Firebase config used:", firebaseConfig); // Log the config that caused the error
    // @ts-ignore
    app = undefined;
  }
} else {
  app = getApp();
  console.log("Firebase app already initialized. Getting existing app.");
}

// Only initialize auth, db, storage if app was successfully initialized
if (app) {
  try {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebase services (Auth, Firestore, Storage) initialized.");
  } catch (serviceError) {
    console.error("Error initializing Firebase services (getAuth, getFirestore, or getStorage):", serviceError);
    console.error("This usually happens if the firebaseConfig used to initialize the app was invalid (e.g., invalid API key).");
     // @ts-ignore
    auth = undefined;
    // @ts-ignore
    db = undefined;
    // @ts-ignore
    storage = undefined;
  }
} else {
  console.error("Firebase app was not initialized. Firebase services (Auth, Firestore, Storage) will not be available.");
  // @ts-ignore
  auth = undefined;
  // @ts-ignore
  db = undefined;
  // @ts-ignore
  storage = undefined;
}


export { app, auth, db, storage };
