import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

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
const auth = getAuth(app);

// ── Sign in ──
document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const msgBox = document.getElementById('msgBox');

    if (!email || !password) {
        msgBox.textContent = 'Please fill in both fields.';
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        msgBox.textContent = 'Signed in! Redirecting...';
        window.location.href = 'index.html';
    } catch (err) {
        const errors = {
            'auth/user-not-found': 'No account found with that email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/invalid-credential': 'Invalid email or password.',
            'auth/too-many-requests': 'Too many attempts. Try again later.',
        };
        msgBox.textContent = errors[err.code] || 'Something went wrong.';
    }
});

// sign up


