// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtVVYr6HQIl2AvMFMt061f5FW3ULBVQ8k",
  authDomain: "lab7-cdae9.firebaseapp.com",
  projectId: "lab7-cdae9",
  storageBucket: "lab7-cdae9.firebasestorage.app",
  messagingSenderId: "462173262699",
  appId: "1:462173262699:web:86c1f912fd83a7242ef22e",
  measurementId: "G-14S2KEBG2Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);