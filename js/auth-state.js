import {
  auth,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence
} from "../firebase/config.js";
import { getUserProfile, isUserProfileComplete, ready as waitForProfilesReady } from "./user-profile.js";

let currentUser = auth.currentUser;
let authReadyPromise;

function updateAuthState(user) {
  currentUser = user;
  document.body.dataset.authState = user ? "authenticated" : "guest";

  window.dispatchEvent(
    new CustomEvent("auth-state-changed", {
      detail: { user }
    })
  );
}

authReadyPromise = setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Unable to enable auth persistence.", error);
  })
  .then(
    () =>
      new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          updateAuthState(user);
          unsubscribe();
          resolve(user);
        });
      })
  );

onAuthStateChanged(auth, updateAuthState);

export function getCurrentUser() {
  return currentUser;
}

export function waitForAuthReady() {
  return authReadyPromise;
}

export async function redirectIfAuthenticated(path = "index.html") {
  const user = await waitForAuthReady();
  await waitForProfilesReady();

  if (user) {
    window.location.href = path;
  }
}

export function shouldCompleteProfile(user = currentUser) {
  if (!user) {
    return false;
  }

  const profile = getUserProfile(user.uid);
  return !isUserProfileComplete(profile);
}

export async function enforceProfileCompletion() {
  const user = await waitForAuthReady();
  await waitForProfilesReady();

  if (!user || !shouldCompleteProfile(user)) {
    return;
  }

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const allowedPaths = new Set(["signup.html"]);

  if (!allowedPaths.has(currentPath)) {
    window.location.href = "signup.html";
  }
}
