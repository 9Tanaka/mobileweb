// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIL7K5GgX6RAFZdCqWqEC040-XYTX4yg8",
  authDomain: "lab08-4639c.firebaseapp.com",
  projectId: "lab08-4639c",
  storageBucket: "lab08-4639c.firebasestorage.app",
  messagingSenderId: "21902154340",
  appId: "1:21902154340:web:93b64c6e4e8c35cb3c1d71",
  measurementId: "G-S635J3KH0E"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);