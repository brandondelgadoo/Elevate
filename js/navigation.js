import { auth, signOut } from "../firebase/config.js";
import {
  enforceProfileCompletion,
  getCurrentUser,
  shouldCompleteProfile,
  waitForAuthReady
} from "./auth-state.js";
import { buildProfileDisplayName, getUserProfile, ready as waitForProfilesReady } from "./user-profile.js";

function renderNavbar(user) {
  const navbarMount = document.getElementById("site-navbar");
  if (!navbarMount) return;
  const userProfile = user ? getUserProfile(user.uid) : null;
  const navDisplayName = buildProfileDisplayName(user, userProfile);
  const needsProfileCompletion = shouldCompleteProfile(user);

  const authLink = user && !needsProfileCompletion
    ? `
      <li><span class="nav-user">Hi, ${navDisplayName}</span></li>
      <li><button id="logoutBtn" type="button" class="btn-primary">Logout</button></li>
    `
    : user
      ? `<li><button id="logoutBtn" type="button" class="btn-primary">Logout</button></li>`
      : `<li><a href="login.html" class="btn-primary">Login</a></li>`;

  const exploreLink = needsProfileCompletion
    ? '<li><span class="nav-link-disabled" aria-disabled="true">Explore</span></li>'
    : '<li><a href="explore.html">Explore</a></li>';

  const teachLink = needsProfileCompletion
    ? '<li><span class="nav-link-disabled" aria-disabled="true">Teach</span></li>'
    : '<li><a href="teach.html">Teach</a></li>';

  const requestLink = needsProfileCompletion
    ? '<li><span class="nav-link-disabled" aria-disabled="true">Request</span></li>'
    : '<li><a href="request.html">Request</a></li>';

  const aboutLink = needsProfileCompletion
    ? '<li><span class="nav-link-disabled" aria-disabled="true">About</span></li>'
    : '<li><a href="about.html">About</a></li>';

  navbarMount.innerHTML = `
    <div class="navbar">
      <h1 class="logo"><a href="index.html">Elevate 🌎</a></h1>
      <nav>
        <ul class="nav-links">
          ${aboutLink}
          ${exploreLink}
          ${teachLink}
          ${requestLink}
          ${authLink}
        </ul>
      </nav>
    </div>
  `;

  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (error) {
      console.error("Unable to sign out.", error);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  renderNavbar(getCurrentUser());
  await enforceProfileCompletion();
  await waitForAuthReady();
  await waitForProfilesReady();
  renderNavbar(getCurrentUser());
});

window.addEventListener("auth-state-changed", (event) => {
  waitForProfilesReady().then(() => {
    renderNavbar(event.detail.user);
  });
});
