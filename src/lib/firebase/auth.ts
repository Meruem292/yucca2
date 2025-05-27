
import {
  auth,
  db // If you plan to store user profiles in Firestore
} from '@/lib/firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type UserCredential,
  type AuthError
} from 'firebase/auth';
// import { doc, setDoc, getDoc } from "firebase/firestore"; // Uncomment if storing user profiles

// Helper to handle Firebase Auth errors
const getFirebaseAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No user found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'This email address is already in use.';
    case 'auth/weak-password':
      return 'The password is too weak.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/popup-closed-by-user':
      return 'Google Sign-In popup closed by user.';
    case 'auth/cancelled-popup-request':
      return 'Google Sign-In cancelled.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};


export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Optional: Create a user document in Firestore
    // const user = userCredential.user;
    // await setDoc(doc(db, "users", user.uid), {
    //   uid: user.uid,
    //   email: user.email,
    //   displayName: user.email?.split('@')[0], // Basic display name
    //   createdAt: new Date(),
    // });
    return userCredential;
  } catch (error) {
    throw new Error(getFirebaseAuthErrorMessage(error as AuthError));
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    throw new Error(getFirebaseAuthErrorMessage(error as AuthError));
  }
};

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    // Optional: Check if user exists in Firestore and create if not (upsert)
    // const user = userCredential.user;
    // const userDocRef = doc(db, "users", user.uid);
    // const userDocSnap = await getDoc(userDocRef);
    // if (!userDocSnap.exists()) {
    //   await setDoc(userDocRef, {
    //     uid: user.uid,
    //     email: user.email,
    //     displayName: user.displayName || user.email?.split('@')[0],
    //     photoURL: user.photoURL,
    //     createdAt: new Date(),
    //   });
    // }
    return userCredential;
  } catch (error) {
    throw new Error(getFirebaseAuthErrorMessage(error as AuthError));
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw new Error(getFirebaseAuthErrorMessage(error as AuthError));
  }
};
