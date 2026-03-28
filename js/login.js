import {
    auth,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "../firebase-config.js";

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


