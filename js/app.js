import { getCurrentUser, waitForAuthReady } from "./auth-state.js";

const getStartedButton = document.getElementById("getStartedButton");
const homeSearchInput = document.getElementById("searchInput");
const homeSearchSubmit = document.querySelector(".search-submit");

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

function goToExploreSearch() {
  if (homeSearchInput) {
    const searchTerm = homeSearchInput.value.trim();
    const searchParams = new URLSearchParams();

    if (searchTerm) {
      searchParams.set("q", searchTerm);
    }

    window.location.href = searchParams.toString()
      ? `explore.html?${searchParams.toString()}`
      : "explore.html";
  }
}

if (homeSearchSubmit && homeSearchInput) {
  homeSearchSubmit.addEventListener("click", (event) => {
    event.preventDefault();
    goToExploreSearch();
  });

  homeSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      goToExploreSearch();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (
    event.key === "/" &&
    homeSearchInput &&
    document.activeElement !== homeSearchInput &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)
  ) {
    event.preventDefault();
    homeSearchInput.focus();
  }
});
