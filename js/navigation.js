import { auth, signOut } from "../firebase/config.js";
import {
  enforceProfileCompletion,
  getCurrentUser,
  shouldCompleteProfile,
  waitForAuthReady
} from "./auth-state.js";
import { buildProfileDisplayName, getUserProfile, ready as waitForProfilesReady } from "./user-profile.js";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderNavbar(user) {
  const navbarMount = document.getElementById("site-navbar");
  if (!navbarMount) return;
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const userProfile = user ? getUserProfile(user.uid) : null;
  const navDisplayName = buildProfileDisplayName(user, userProfile);
  const safeNavDisplayName = escapeHtml(navDisplayName);
  const needsProfileCompletion = shouldCompleteProfile(user);

  const authLink = user && !needsProfileCompletion
    ? `
      <li><span class="nav-user">Hi, ${safeNavDisplayName}</span></li>
      <li><button id="logoutBtn" type="button" class="btn-primary">Logout</button></li>
    `
    : user
      ? `<li><button id="logoutBtn" type="button" class="btn-primary">Logout</button></li>`
      : `<li><a href="login.html" class="btn-primary">Login</a></li>`;

  const exploreLink = needsProfileCompletion
    ? '<li><span class="nav-link-disabled" aria-disabled="true">Explore</span></li>'
    : '<li><a href="explore.html" class="navbar-link">Explore</a></li>';

  const teachLink = needsProfileCompletion
    ? '<li><span class="nav-link-disabled" aria-disabled="true">Teach</span></li>'
    : '<li><a href="teach.html" class="navbar-link">Teach</a></li>';

  const requestLink = needsProfileCompletion
    ? '<li><span class="nav-link-disabled" aria-disabled="true">Request</span></li>'
    : '<li><a href="request.html" class="navbar-link">Request</a></li>';

  const dashboardLink = needsProfileCompletion
    ? '<li><span class="nav-link-disabled" aria-disabled="true">Dashboard</span></li>'
    : user
      ? '<li><a href="dashboard.html" class="navbar-link">Dashboard</a></li>'
      : "";

  const aboutLink = needsProfileCompletion
    ? '<li><span class="nav-link-disabled" aria-disabled="true">About</span></li>'
    : '<li><a href="about.html" class="navbar-link">About</a></li>';

  const withActiveClass = (markup, path) => {
    if (!markup || currentPage !== path) {
      return markup;
    }

    return markup.replace('class="navbar-link"', 'class="navbar-link active"');
  };

  const navAboutLink = withActiveClass(aboutLink, "about.html");
  const navExploreLink = withActiveClass(exploreLink, "explore.html");
  const navTeachLink = withActiveClass(teachLink, "teach.html");
  const navRequestLink = withActiveClass(requestLink, "request.html");
  const navDashboardLink = withActiveClass(dashboardLink, "dashboard.html");

  navbarMount.innerHTML = `
    <div class="navbar">
      <div class="container">
        <div class="navbar-inner">
          <a href="index.html" class="navbar-logo">
            <h1 class="logo">Elevate 🌎</h1>
          </a>
          <nav>
            <ul class="nav-links">
              ${navAboutLink}
              ${navExploreLink}
              ${navTeachLink}
              ${navRequestLink}
              ${navDashboardLink}
              ${authLink}
            </ul>
          </nav>
          <button class="mobile-menu-btn" id="navMobileMenuBtn" type="button" aria-label="Toggle menu">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="mobile-menu" id="navMobileMenu">
      <ul class="nav-links">
        ${navAboutLink}
        ${navExploreLink}
        ${navTeachLink}
        ${navRequestLink}
        ${navDashboardLink}
        ${authLink}
      </ul>
    </div>
  `;

  const mobileMenuBtn = navbarMount.querySelector("#navMobileMenuBtn");
  const mobileMenu = navbarMount.querySelector("#navMobileMenu");
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }

  navbarMount.querySelectorAll("#logoutBtn").forEach((logoutButton) => {
    logoutButton.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "login.html";
      } catch (error) {
        console.error("Unable to sign out.", error);
      }
    });
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
