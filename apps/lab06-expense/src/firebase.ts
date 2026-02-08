import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "lab7-cdae9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
