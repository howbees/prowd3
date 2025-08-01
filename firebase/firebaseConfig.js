// firebase/firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBDQ5kkh1SuPpERsroGZREfa9AhLp3Q_YA",
  AuthDomain: "prowd-database.firebaseapp.com",
  projectId: "prowd-database",
  storageBucket: "prowd-database.firebasestorage.app",
  messagingSenderId: "524865999590",
  appId: "1:524865999590:web:32ff23802063b9954fe127",
  measurementId: "G-Y6S9GR5J59"
};

// Prevent duplicate initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
