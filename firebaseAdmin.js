import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import serviceAccount from "./ai4impact-serviceAcc.json" assert { type: "json" };

const storageBucket =
  process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!storageBucket) {
  throw new Error("Missing Firebase Storage Bucket in environment variables.");
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket,
  });
}

const adminAuth = getAuth();
const adminDb = getFirestore();
const adminStorage = getStorage().bucket(storageBucket);

export { adminAuth, adminDb, adminStorage };