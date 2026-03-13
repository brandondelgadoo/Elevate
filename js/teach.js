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
            <span class="teach-form-message" id="title-error"></span>
          </label>
          <label class="teach-form-field" for="skill-instructor">
            <span>Instructor / Offered By</span>
            <input type="text" id="skill-instructor" name="instructor" placeholder="Brandon Delgado" required>
            <span class="teach-form-message" id="instructor-error"></span>
          </label>
          <label class="teach-form-field" for="skill-category">
            <span>Category</span>
            <input type="text" id="skill-category" name="category" placeholder="Communication" required>
            <span class="teach-form-message" id="category-error"></span>
          </label>
          <label class="teach-form-field" for="skill-description">
            <span>Description</span>
            <textarea id="skill-description" name="description" rows="5" placeholder="Write a short summary of what learners will get from this skill." required></textarea>
            <span class="teach-form-message" id="description-error"></span>
          </label>
          <div class="teach-form-actions">
            <button type="submit" class="cta-button">Post Skill</button>
            <button type="button" class="cta-button" id="teach-test-toggle">Test Logout</button>
          </div>
        </form>
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
    const postAnotherButton = document.getElementById("post-another-skill");

    if (teachForm) {
      teachForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = document.getElementById("skill-title").value.trim();
        const instructor = document.getElementById("skill-instructor").value.trim();
        const category = document.getElementById("skill-category").value.trim();
        const description = document.getElementById("skill-description").value.trim();
        const titleError = document.getElementById("title-error");
        const instructorError = document.getElementById("instructor-error");
        const categoryError = document.getElementById("category-error");
        const descriptionError = document.getElementById("description-error");

        titleError.textContent = "";
        instructorError.textContent = "";
        categoryError.textContent = "";
        descriptionError.textContent = "";

        let hasErrors = false;

        // Basic validation checks for title field with error messages
        if (!title) {
          titleError.textContent = "Please enter a title.";
          hasErrors = true;
        } else if (title.length < 5) {
          titleError.textContent = "Title must be at least 5 characters long.";
          hasErrors = true;
        }

        // Basic validation checks for instructor field with error messages
        if (!instructor) {
          instructorError.textContent = "Please enter the instructor name.";
          hasErrors = true;
        }

        // Basic validation checks for category field with error messages
        if (!category) {
          categoryError.textContent = "Please enter a category.";
          hasErrors = true;
        }

        // Basic validation checks for description field with error messages
        if (!description) {
          descriptionError.textContent = "Please enter a description.";
          hasErrors = true;
        } else if (description.length < 20) {
          descriptionError.textContent = "Description must be at least 20 characters long.";
          hasErrors = true;
        }

        // If there are any validation errors, we stop here and show the messages. Otherwise, we proceed to "post" the skill.
        if (hasErrors) {
          return;
        }

        // For this demo, we just log the new skill to the console and show a success message. In a real app, this is where you'd send the data to your backend server.
        console.log("New skill posted:", { title, instructor, category, description });

        teachContent.innerHTML = `
          <h1>Thank you for sharing your skill!</h1>
          <p>Your skill has been posted successfully. We appreciate your contribution to the Elevate community.</p>
          <div class="teach-form-actions">
            <button type="button" class="cta-button" id="post-another-skill">Post Another Skill</button>
            <a href="explore.html" class="cta-button">Explore Skills</a>
            <button type="button" class="cta-button" id="teach-test-toggle">Test Logout</button>
          </div>

          <div class="teach-posted-skill">
            <div id="posted-skill-title">
              Title: ${title}
            </div>
            <div id="posted-skill-instructor">
              Instructor: ${instructor}
            </div>
            <div id="posted-skill-category">
              Category: ${category}
            </div>
            <div id="posted-skill-description">
              Description: ${description}
            </div>
          </div>
        `;

        renderTeachContentListeners();
      });
    }

    if (postAnotherButton) {
      postAnotherButton.addEventListener("click", () => {
        renderTeachContent();
      });
    }

    if (toggleButton) {
      // Flip the fake login state and render the section again when the button is clicked
      toggleButton.addEventListener("click", () => {
        isLoggedIn = !isLoggedIn;
        renderTeachContent();
      });
    }
  }

  function renderTeachContentListeners() {
    const toggleButton = document.getElementById("teach-test-toggle");
    const postAnotherButton = document.getElementById("post-another-skill");

    if (postAnotherButton) {
      postAnotherButton.addEventListener("click", () => {
        renderTeachContent();
      });
    }

    if (toggleButton) {
      toggleButton.addEventListener("click", () => {
        isLoggedIn = !isLoggedIn;
        renderTeachContent();
      });
    }
  }

  // Show the default logged-out version when the page first loads
  renderTeachContent();
});
