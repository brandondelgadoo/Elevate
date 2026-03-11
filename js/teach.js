// Wait until the page's HTML has loaded before looking for elements
document.addEventListener("DOMContentLoaded", () => {
  // This is the container in teach.html where we inject the content
  const teachContent = document.getElementById("teach-content");

  // Stop the script if the container is missing so we avoid errors
  if (!teachContent) return;

  // Temporary placeholder for auth state which will be replaced with real authentication logic in the future
  // This starts as logged out and only changes when the test button is clicked
  let isLoggedIn = false;

  // Rebuild the teach page content whenever the login state changes
  function renderTeachContent() {
    if (isLoggedIn) {
      // Logged-in version of the section
      teachContent.innerHTML = `
        <h1>Welcome back</h1>
        <p>You're logged in and ready to continue building your teaching profile and upcoming sessions.</p>
        <a href="explore.html" class="cta-button">Continue</a>
        <button type="button" class="cta-button" id="teach-test-toggle">Test Logout</button>
      `;
    } else {
      // Logged-out version of the section
      teachContent.innerHTML = `
        <h1>Teach with Elevate</h1>
        <p>Join our community and share your knowledge with learners around the world. Whether you're an expert in a specific field or passionate about teaching, Elevate provides the platform and tools you need to create engaging sessions and reach a global audience.</p>
        <a href="login.html" class="cta-button">Get Started</a>
        <button type="button" class="cta-button" id="teach-test-toggle">Test Login</button>
      `;
    }

    // After replacing the HTML, we grab the new button so we can attach a click event
    const toggleButton = document.getElementById("teach-test-toggle");

    // If the button is missing, there is nothing else to do
    if (!toggleButton) return;

    // Flip the fake login state and render the section again when the button is clicked
    toggleButton.addEventListener("click", () => {
      isLoggedIn = !isLoggedIn;
      renderTeachContent();
    });
  }

  // Show the default logged-out version when the page first loads
  renderTeachContent();
});
