import { auth, createUserWithEmailAndPassword } from "../firebase/config.js";

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
    const errors = {
      "auth/email-already-in-use": "That email is already registered.",
      "auth/invalid-email": "Invalid email address.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/network-request-failed": "Network error. Try again."
    };

    msgBox.textContent = errors[err.code] || "Something went wrong.";
  }
});
