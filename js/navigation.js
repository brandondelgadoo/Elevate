import { auth, signOut } from "../firebase/config.js";
import { getCurrentUser, waitForAuthReady } from "./auth-state.js";
import { buildProfileDisplayName, getUserProfile } from "./user-profile.js";

function renderNavbar(user) {
  const navbarMount = document.getElementById("site-navbar");
  if (!navbarMount) return;
  const userProfile = user ? getUserProfile(user.uid) : null;
  const navDisplayName = buildProfileDisplayName(user, userProfile);

  const authLink = user
    ? `
      <li><span class="nav-user">Hi, ${navDisplayName}</span></li>
      <li><button id="logoutBtn" type="button" class="btn-primary">Logout</button></li>
    `
    : `<li><a href="login.html" class="btn-primary">Login</a></li>`;

  navbarMount.innerHTML = `
    <div class="navbar">
      <h1 class="logo"><a href="index.html">Elevate</a></h1>
      <nav>
        <ul class="nav-links">
          <li><a href="about.html">About</a></li>
          <li><a href="explore.html">Explore</a></li>
          <li><a href="teach.html">Teach</a></li>
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
  await waitForAuthReady();
  renderNavbar(getCurrentUser());
});

window.addEventListener("auth-state-changed", (event) => {
  renderNavbar(event.detail.user);
});
