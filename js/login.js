import {
  auth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from "../firebase/config.js";

const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const forgotPasswordDialog = document.getElementById("forgotPasswordDialog");
const resetEmailInput = document.getElementById("resetEmail");
const resetMsgBox = document.getElementById("resetMsgBox");
const sendResetBtn = document.getElementById("sendResetBtn");
const closeResetDialogBtn = document.getElementById("closeResetDialogBtn");
const dismissResetDialogBtn = document.getElementById("dismissResetDialogBtn");

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const msgBox = document.getElementById("msgBox");

  if (!email || !password) {
    msgBox.textContent = "Please fill in both fields.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    msgBox.textContent = "Signed in! Redirecting...";
    window.location.href = "explore.html";
  } catch (err) {
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
