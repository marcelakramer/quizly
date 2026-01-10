import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

function getFirebaseConfig() {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized on the client side");
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId =
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    throw new Error("Missing required Firebase environment variables");
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized on the client side");
  }

  if (!app) {
    const config = getFirebaseConfig();
    app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
  }

  return app;
}

export function getAuthInstance(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth can only be used on the client side");
  }

  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }

  return authInstance;
}
