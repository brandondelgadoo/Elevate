import {
  auth,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence
} from "../firebase/config.js";

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

  if (user) {
    window.location.href = path;
  }
}
