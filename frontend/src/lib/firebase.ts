import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/** Apply persistence mode. Call BEFORE login/signup. */
export async function applyPersistence(remember: boolean) {
  try {
    // Prefer IndexedDB for long-lived sessions
    await setPersistence(auth, remember ? indexedDBLocalPersistence : browserSessionPersistence);
  } catch {
    // Fallback to localStorage if IndexedDB is unavailable
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  }
  localStorage.setItem("rememberMe", remember ? "1" : "0");
}

/** Initialize persistence from stored preference (default: remember = true). */
export async function initPersistence() {
  const stored = localStorage.getItem("rememberMe");
  const remember = stored === null ? true : stored === "1";
  await applyPersistence(remember);
}
