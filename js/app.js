import { getCurrentUser, waitForAuthReady } from "./auth-state.js";

const getStartedButton = document.getElementById("getStartedButton");
const homeSearchForm = document.getElementById("homeSearchForm");
const homeSearchInput = document.getElementById("homeSearchInput");

if (getStartedButton) {
  getStartedButton.addEventListener("click", async () => {
    await waitForAuthReady();

    if (getCurrentUser()) {
      window.location.href = "explore.html";
      return;
    }

    window.location.href = "login.html";
  });
}

if (homeSearchForm && homeSearchInput) {
  homeSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchTerm = homeSearchInput.value.trim();
    const searchParams = new URLSearchParams();

    if (searchTerm) {
      searchParams.set("q", searchTerm);
    }

    window.location.href = searchParams.toString()
      ? `explore.html?${searchParams.toString()}`
      : "explore.html";
  });
}
