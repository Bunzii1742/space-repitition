// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjBWWY3ZEEUiApdd_Fo_TuBrZtwZPAp7I",
  authDomain: "spaced-repitition-learn.firebaseapp.com",
  projectId: "spaced-repitition-learn",
  storageBucket: "spaced-repitition-learn.firebasestorage.app",
  messagingSenderId: "761333261442",
  appId: "1:761333261442:web:d2c09bbd14edf78322809b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
