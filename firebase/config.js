import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAuth,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdVd-Lv1435V7S6cDkaECsoviNl44fIpU",
  authDomain: "elevate-100705.firebaseapp.com",
  projectId: "elevate-100705",
  storageBucket: "elevate-100705.firebasestorage.app",
  messagingSenderId: "873754010089",
  appId: "1:873754010089:web:22034dddf000d4d985eb78",
  measurementId: "G-NVPLDYY7YG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
};
