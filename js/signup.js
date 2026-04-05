import {
  auth,
  createUserWithEmailAndPassword,
  googleProvider,
  signInWithPopup
} from "../firebase/config.js";
import { isUsernameTaken, saveUserProfile } from "./user-profile.js";

const allowedInterests = ["tech", "fitness", "music", "art"];
const credentialsStep = document.getElementById("signupCredentialsStep");
const profileStep = document.getElementById("signupProfileStep");
const signupProfileHeading = document.getElementById("signupProfileHeading");
const continueSignupBtn = document.getElementById("continueSignupBtn");
const backToCredentialsBtn = document.getElementById("backToCredentialsBtn");
const signupBtn = document.getElementById("signupBtn");
const googleSignupBtn = document.getElementById("googleSignupBtn");
const msgBox = document.getElementById("msgBox");
let pendingGoogleUser = null;

function showCredentialsStep() {
  credentialsStep.hidden = false;
  profileStep.hidden = true;
  msgBox.textContent = "";
  pendingGoogleUser = null;
}

function showProfileStep(mode = "email") {
  credentialsStep.hidden = mode === "google";
  profileStep.hidden = false;
  signupProfileHeading.textContent =
    mode === "google" ? "Complete your profile" : "Tell us about yourself";
  backToCredentialsBtn.hidden = mode === "google";
  signupBtn.textContent = mode === "google" ? "Finish Sign Up" : "Create Account";
  googleSignupBtn.disabled = mode === "google";
  msgBox.textContent = "";
}

function getSelectedInterests() {
  return Array.from(document.querySelectorAll('input[name="interests"]:checked'))
    .map((input) => input.value)
    .filter((value) => allowedInterests.includes(value));
}

function getSignupFormValues() {
  return {
    username: document.getElementById("username").value.trim(),
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    accountGoal: document.getElementById("accountGoal").value,
    city: document.getElementById("city").value.trim(),
    bio: document.getElementById("bio").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    confirmPassword: document.getElementById("confirmPassword").value,
    interests: getSelectedInterests()
  };
}

function validateCredentialsStep(values, { emailRequired = true } = {}) {
  if (!values.password || !values.confirmPassword) {
    return "Please fill in all required fields.";
  }

  if (emailRequired && !values.email) {
    return "Please fill in all required fields.";
  }

  if (emailRequired && !/\S+@\S+\.\S+/.test(values.email)) {
    return "Please enter a valid email address.";
  }

  if (values.password !== values.confirmPassword) {
    return "Passwords do not match.";
  }

  if (values.password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return "";
}

function validateProfileStep(values) {
  if (
    !values.username ||
    !values.firstName ||
    !values.lastName ||
    !values.accountGoal ||
    !values.city
  ) {
    return "Please fill in all required fields.";
  }

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(values.username)) {
    return "Username must be 3-20 characters and only use letters, numbers, or underscores.";
  }

  if (isUsernameTaken(values.username)) {
    return "That username is already taken.";
  }

  if (!values.interests.length) {
    return "Choose at least one category you're interested in.";
  }

  if (!["learn", "teach", "both"].includes(values.accountGoal)) {
    return "Choose how you plan to use Elevate.";
  }

  if (values.city.length < 2 || values.city.length > 80) {
    return "Please enter a valid city.";
  }

  if (values.bio.length > 240) {
    return "Your bio must be 240 characters or fewer.";
  }

  return "";
}

function buildProfileFromValues(user, values) {
  return {
    uid: user.uid,
    email: user.email || values.email,
    username: values.username.toLowerCase(),
    firstName: values.firstName,
    lastName: values.lastName,
    accountGoal: values.accountGoal,
    city: values.city,
    bio: values.bio,
    interests: values.interests,
    authProvider: user.providerData?.[0]?.providerId || "password"
  };
}

continueSignupBtn.addEventListener("click", () => {
  const formValues = getSignupFormValues();
  const validationMessage = validateCredentialsStep(formValues);

  if (validationMessage) {
    msgBox.textContent = validationMessage;
    return;
  }

  showProfileStep();
});

backToCredentialsBtn.addEventListener("click", () => {
  showCredentialsStep();
  googleSignupBtn.disabled = false;
});

signupBtn.addEventListener("click", async () => {
  const formValues = getSignupFormValues();
  const profileValidationMessage = validateProfileStep(formValues);

  if (pendingGoogleUser) {
    if (profileValidationMessage) {
      msgBox.textContent = profileValidationMessage;
      return;
    }

    try {
      saveUserProfile(buildProfileFromValues(pendingGoogleUser, formValues));
      msgBox.textContent = "Profile saved! Redirecting...";
      window.location.href = "explore.html";
    } catch (error) {
      console.error("Unable to save Google signup profile.", error);
      msgBox.textContent = "We couldn't finish setting up your profile right now.";
    }
    return;
  }

  const credentialsValidationMessage = validateCredentialsStep(formValues);

  if (credentialsValidationMessage) {
    msgBox.textContent = credentialsValidationMessage;
    showCredentialsStep();
    return;
  }

  if (profileValidationMessage) {
    msgBox.textContent = profileValidationMessage;
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formValues.email,
      formValues.password
    );

    saveUserProfile(buildProfileFromValues(userCredential.user, formValues));
    msgBox.textContent = "Account created and profile saved! Redirecting...";
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

googleSignupBtn.addEventListener("click", async () => {
  try {
    msgBox.textContent = "Connecting to Google...";
    const userCredential = await signInWithPopup(auth, googleProvider);
    pendingGoogleUser = userCredential.user;

    const [firstName = "", ...restOfName] = (userCredential.user.displayName || "").trim().split(/\s+/);
    const lastName = restOfName.join(" ");

    document.getElementById("firstName").value ||= firstName;
    document.getElementById("lastName").value ||= lastName;

    showProfileStep("google");
    msgBox.textContent = "One more step: finish setting up your profile.";
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

    pendingGoogleUser = null;
    googleSignupBtn.disabled = false;
    msgBox.textContent = errors[err.code] || "Unable to sign up with Google right now.";
  }
});

showCredentialsStep();
