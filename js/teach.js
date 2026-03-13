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
        <p>You're logged in and ready to offer a new skill to the Elevate community.</p>
        <form class="teach-form" id="teach-form">
          <label class="teach-form-field" for="skill-title">
            <span>Title</span>
            <input type="text" id="skill-title" name="title" placeholder="Intro to Public Speaking" required>
          </label>
          <label class="teach-form-field" for="skill-instructor">
            <span>Instructor / Offered By</span>
            <input type="text" id="skill-instructor" name="instructor" placeholder="Brandon Delgado" required>
          </label>
          <label class="teach-form-field" for="skill-category">
            <span>Category</span>
            <input type="text" id="skill-category" name="category" placeholder="Communication" required>
          </label>
          <label class="teach-form-field" for="skill-description">
            <span>Description</span>
            <textarea id="skill-description" name="description" rows="5" placeholder="Write a short summary of what learners will get from this skill." required></textarea>
          </label>
          <div class="teach-form-actions">
            <button type="submit" class="cta-button">Post Skill</button>
            <button type="button" class="cta-button" id="teach-test-toggle">Test Logout</button>
          </div>
        </form>
        <p class="teach-form-message" id="teach-form-message"></p>
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

    // After rendering the section, grab the elements we need for the form and test button
    const toggleButton = document.getElementById("teach-test-toggle");
    const teachForm = document.getElementById("teach-form");
    const formMessage = document.getElementById("teach-form-message");

    // If the button is missing, there is nothing else to do
    if (!toggleButton) return;

    if (teachForm && formMessage) {
      teachForm.addEventListener("submit", (event) => {
        event.preventDefault();
        formMessage.textContent = "Your skill has been posted.";
        teachForm.reset();
      });
    }

    // Flip the fake login state and render the section again when the button is clicked
    toggleButton.addEventListener("click", () => {
      isLoggedIn = !isLoggedIn;
      renderTeachContent();
    });
  }

  // Show the default logged-out version when the page first loads
  renderTeachContent();
});
