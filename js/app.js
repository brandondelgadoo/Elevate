import { getCurrentUser, waitForAuthReady } from "./auth-state.js";

const getStartedButton = document.getElementById("getStartedButton");

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
