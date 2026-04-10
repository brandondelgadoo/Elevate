import {
  auth,
  googleProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup
} from "../firebase/config.js";
import { getUserProfile, isUserProfileComplete, ready as waitForProfilesReady } from "./user-profile.js";

const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const forgotPasswordDialog = document.getElementById("forgotPasswordDialog");
const resetEmailInput = document.getElementById("resetEmail");
const resetMsgBox = document.getElementById("resetMsgBox");
const sendResetBtn = document.getElementById("sendResetBtn");
const closeResetDialogBtn = document.getElementById("closeResetDialogBtn");
const dismissResetDialogBtn = document.getElementById("dismissResetDialogBtn");

async function getPostLoginRedirectPath(user) {
  await waitForProfilesReady();
  const profile = getUserProfile(user?.uid);
  return isUserProfileComplete(profile) ? "explore.html" : "signup.html";
}

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const msgBox = document.getElementById("msgBox");

  if (!email || !password) {
    msgBox.textContent = "Please fill in both fields.";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    msgBox.textContent = "Signed in! Redirecting...";
    window.location.href = await getPostLoginRedirectPath(userCredential.user);
  } catch (err) {
    console.error("Email/password login failed:", err.code, err.message);

    const errors = {
      "auth/user-not-found": "No account found with that email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/invalid-email": "Invalid email address.",
      "auth/invalid-credential": "Invalid email or password.",
      "auth/too-many-requests": "Too many attempts. Try again later."
    };

    msgBox.textContent = errors[err.code] || "Something went wrong.";
  }
});

document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  const msgBox = document.getElementById("msgBox");

  try {
    msgBox.textContent = "Connecting to Google...";
    const userCredential = await signInWithPopup(auth, googleProvider);
    msgBox.textContent = "Signed in with Google! Redirecting...";
    window.location.href = await getPostLoginRedirectPath(userCredential.user);
  } catch (err) {
    console.error("Google login failed:", err.code, err.message);

    const errors = {
      "auth/popup-closed-by-user": "Google sign-in was closed before finishing.",
      "auth/cancelled-popup-request": "Google sign-in was cancelled.",
      "auth/popup-blocked": "Your browser blocked the Google sign-in popup.",
      "auth/operation-not-allowed": "Google sign-in is not enabled in Firebase Authentication.",
      "auth/unauthorized-domain": "This domain is not authorized in your Firebase Authentication settings.",
      "auth/network-request-failed": "Network error. Try again."
    };

    msgBox.textContent = errors[err.code] || "Unable to sign in with Google right now.";
  }
});

forgotPasswordLink.addEventListener("click", (event) => {
  event.preventDefault();

  resetEmailInput.value = document.getElementById("email").value.trim();
  resetMsgBox.textContent = "";
  forgotPasswordDialog.showModal();
  resetEmailInput.focus();
});

sendResetBtn.addEventListener("click", async () => {
  const email = resetEmailInput.value.trim();

  if (!email) {
    resetMsgBox.textContent = "Enter your email so we can send a reset link.";
    resetEmailInput.focus();
    return;
  }

  sendResetBtn.disabled = true;
  resetMsgBox.textContent = "Sending reset email...";

  try {
    await sendPasswordResetEmail(auth, email);
    resetMsgBox.textContent =
      "If an account exists for that email, a reset link has been sent. Check your inbox or spam folder if it is not there, then close this window when you're ready.";
  } catch (err) {
    const errors = {
      "auth/invalid-email": "Invalid email address.",
      "auth/user-not-found": "No account found with that email.",
      "auth/too-many-requests": "Too many reset attempts. Try again later."
    };

    resetMsgBox.textContent =
      errors[err.code] || "Unable to send reset email right now.";
  } finally {
    sendResetBtn.disabled = false;
  }
});

closeResetDialogBtn.addEventListener("click", () => {
  forgotPasswordDialog.close();
});

dismissResetDialogBtn.addEventListener("click", () => {
  forgotPasswordDialog.close();
});
