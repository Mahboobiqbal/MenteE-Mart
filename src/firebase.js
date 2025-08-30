// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDwj7A-Q1_7qc5XB8GS3d7keR12Ucy4Axg",
  authDomain: "mentee-mart.firebaseapp.com",
  projectId: "mentee-mart",
  storageBucket: "mentee-mart.firebasestorage.app",
  messagingSenderId: "942834947456",
  appId: "1:942834947456:web:5fba4acde76d1999669d65",
  measurementId: "G-EKYWJ849CR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };