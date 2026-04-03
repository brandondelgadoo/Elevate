import {
  auth,
  createUserWithEmailAndPassword,
  googleProvider,
  signInWithPopup
} from "../firebase/config.js";

document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const msgBox = document.getElementById("msgBox");

  if (!email || !password || !confirmPassword) {
    msgBox.textContent = "Please fill in all fields.";
    return;
  }

  if (password !== confirmPassword) {
    msgBox.textContent = "Passwords do not match.";
    return;
  }

  if (password.length < 6) {
    msgBox.textContent = "Password must be at least 6 characters.";
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    msgBox.textContent = "Account created! Redirecting...";
    window.location.href = "explore.html";
  } catch (err) {
    console.error("Email/password signup failed:", err.code, err.message);

    const errors = {
      "auth/email-already-in-use": "That email is already registered.",
      "auth/invalid-email": "Invalid email address.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/network-request-failed": "Network error. Try again."
    };

    msgBox.textContent = errors[err.code] || "Something went wrong.";
  }
});

document.getElementById("googleSignupBtn").addEventListener("click", async () => {
  const msgBox = document.getElementById("msgBox");

  try {
    msgBox.textContent = "Connecting to Google...";
    await signInWithPopup(auth, googleProvider);
    msgBox.textContent = "Signed up with Google! Redirecting...";
    window.location.href = "explore.html";
  } catch (err) {
    console.error("Google signup failed:", err.code, err.message);

    const errors = {
      "auth/popup-closed-by-user": "Google sign-up was closed before finishing.",
      "auth/cancelled-popup-request": "Google sign-up was cancelled.",
      "auth/popup-blocked": "Your browser blocked the Google sign-up popup.",
      "auth/operation-not-allowed": "Google sign-up is not enabled in Firebase Authentication.",
      "auth/unauthorized-domain": "This domain is not authorized in your Firebase Authentication settings.",
      "auth/network-request-failed": "Network error. Try again."
    };

    msgBox.textContent = errors[err.code] || "Unable to sign up with Google right now.";
  }
});
