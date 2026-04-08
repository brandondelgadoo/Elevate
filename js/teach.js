import { getCurrentUser, waitForAuthReady } from "./auth-state.js";
import { buildProfileDisplayName, getUserProfile } from "./user-profile.js";

document.addEventListener("DOMContentLoaded", () => {
  const teachContent = document.getElementById("teach-content");
  const categoryOptions = [
    { value: "tech", label: "Technology" },
    { value: "fitness", label: "Fitness" },
    { value: "music", label: "Music" },
    { value: "art", label: "Art" }
  ];

  if (!teachContent) return;

  let isLoggedIn = Boolean(getCurrentUser());

  let skillDraft = {
    title: "",
    category: "",
    description: "",
    maxPeoplePerSession: "",
    sessionLengthMinutes: "",
    availableDates: [""],
    backgroundImageUrl: ""
  };

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getCurrentProfile() {
    const user = getCurrentUser();

    if (!user) {
      return null;
    }

    return getUserProfile(user.uid);
  }

  function getDefaultInstructorName() {
    const user = getCurrentUser();
    const profile = getCurrentProfile();

    return buildProfileDisplayName(user, profile);
  }

  function getDateFieldValues() {
    const dateInputs = document.querySelectorAll(".teach-availability-input");

    return Array.from(dateInputs, (input) => input.value);
  }

  function ensureInstructorDraft() {
    if (!isLoggedIn) {
      return;
    }
  }

  function ensureDateDraft() {
    if (!Array.isArray(skillDraft.availableDates) || !skillDraft.availableDates.length) {
      skillDraft.availableDates = [""];
    }
  }

  function renderDateFields() {
    ensureDateDraft();

    return skillDraft.availableDates
      .map((dateValue, index) => {
        return `
          <div class="teach-availability-row">
            <input
              type="datetime-local"
              class="teach-availability-input"
              data-index="${index}"
              value="${escapeHtml(dateValue)}"
            >
            <button
              type="button"
              class="teach-secondary-button teach-remove-date-button"
              data-index="${index}"
              ${skillDraft.availableDates.length === 1 ? "disabled" : ""}
            >
              Remove
            </button>
          </div>
        `;
      })
      .join("");
  }

  function syncDraft() {
    const titleInput = document.getElementById("skill-title");
    const categoryInput = document.getElementById("skill-category");
    const descriptionInput = document.getElementById("skill-description");
    const peopleInput = document.getElementById("skill-max-people");
    const sessionLengthInput = document.getElementById("skill-session-length");
    const backgroundImageInput = document.getElementById("skill-background-image");

    skillDraft = {
      title: titleInput?.value || "",
      category: categoryInput?.value || "",
      description: descriptionInput?.value || "",
      maxPeoplePerSession: peopleInput?.value || "",
      sessionLengthMinutes: sessionLengthInput?.value || "",
      availableDates: getDateFieldValues(),
      backgroundImageUrl: backgroundImageInput?.value || ""
    };
  }

  function renderTeachContent() {
    ensureInstructorDraft();
    ensureDateDraft();

    if (isLoggedIn) {
      const accountLabel = escapeHtml(getDefaultInstructorName());

      teachContent.innerHTML = `
        <h1>Share a session</h1>
        <p>Create a teach post with the details learners need before they reach out.</p>
        <form class="teach-form" id="teach-form">
          <label class="teach-form-field" for="skill-title">
            <span>Title</span>
            <input type="text" id="skill-title" name="title" placeholder="Intro to Public Speaking" value="${escapeHtml(skillDraft.title)}">
            <span class="teach-form-message" id="title-error"></span>
          </label>
          <div class="teach-form-field">
            <span>Offered By</span>
            <div class="teach-account-name">@${accountLabel}</div>
            <small class="teach-form-hint">This is pulled from the username saved on your account.</small>
          </div>
          <label class="teach-form-field" for="skill-category">
            <span>Category</span>
            <select id="skill-category" name="category">
              <option value="" ${skillDraft.category === "" ? "selected" : ""}>Select a category</option>
              ${categoryOptions
                .map(({ value, label }) => {
                  const isSelected = skillDraft.category === value ? "selected" : "";
                  return `<option value="${value}" ${isSelected}>${label}</option>`;
                })
                .join("")}
            </select>
            <span class="teach-form-message" id="category-error"></span>
          </label>
          <label class="teach-form-field" for="skill-description">
            <span>Description</span>
            <textarea id="skill-description" name="description" rows="5" placeholder="Write a short summary of what learners will get from this skill.">${escapeHtml(skillDraft.description)}</textarea>
            <span class="teach-form-message" id="description-error"></span>
          </label>
          <div class="teach-form-grid">
            <label class="teach-form-field" for="skill-max-people">
              <span>People Per Session</span>
              <input type="number" id="skill-max-people" name="maxPeoplePerSession" min="1" max="100" placeholder="6" value="${escapeHtml(skillDraft.maxPeoplePerSession)}">
              <span class="teach-form-message" id="people-error"></span>
            </label>
            <label class="teach-form-field" for="skill-session-length">
              <span>Session Length (minutes)</span>
              <input type="number" id="skill-session-length" name="sessionLengthMinutes" min="15" max="480" step="15" placeholder="60" value="${escapeHtml(skillDraft.sessionLengthMinutes)}">
              <span class="teach-form-message" id="session-length-error"></span>
            </label>
          </div>
          <div class="teach-form-field">
            <span>Available Dates</span>
            <div class="teach-availability-list" id="teach-availability-list">
              ${renderDateFields()}
            </div>
            <button type="button" class="teach-secondary-button" id="add-available-date">Add Another Date</button>
            <span class="teach-form-message" id="dates-error"></span>
          </div>
          <label class="teach-form-field" for="skill-background-image">
            <span>Optional Background Image URL</span>
            <input type="url" id="skill-background-image" name="backgroundImageUrl" placeholder="https://example.com/session-cover.jpg" value="${escapeHtml(skillDraft.backgroundImageUrl)}">
            <small class="teach-form-hint">Add an image link if you want your skill card to have a custom background.</small>
            <span class="teach-form-message" id="background-image-error"></span>
          </label>
          <div class="teach-form-actions">
            <button type="submit" class="cta-button">Post Skill</button>
          </div>
          <p class="teach-form-message" id="teach-form-error"></p>
        </form>
      `;
    } else {
      teachContent.innerHTML = `
        <h1>Teach with Elevate</h1>
        <p>Join our community and share your knowledge with learners around the world. Whether you're an expert in a specific field or passionate about teaching, Elevate provides the platform and tools you need to create engaging sessions and reach a global audience.</p>
        <button type="button" class="cta-button" id="teachGetStartedButton">Get Started</button>
      `;
    }

    attachTeachContentListeners();
  }

  function validateBackgroundImageUrl(url) {
    if (!url) {
      return "";
    }

    try {
      const parsedUrl = new URL(url);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return "Please use an http or https image URL.";
      }
    } catch (error) {
      return "Please enter a valid image URL.";
    }

    return "";
  }

  function formatSessionLength(minutes) {
    if (!minutes) {
      return "";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (!hours) {
      return `${minutes} minutes`;
    }

    if (!remainingMinutes) {
      return hours === 1 ? "1 hour" : `${hours} hours`;
    }

    return `${hours}h ${remainingMinutes}m`;
  }

  function formatAvailableDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function attachTeachContentListeners() {
    const teachForm = document.getElementById("teach-form");
    const postAnotherButton = document.getElementById("post-another-skill");
    const teachGetStartedButton = document.getElementById("teachGetStartedButton");
    const addAvailableDateButton = document.getElementById("add-available-date");

    if (teachForm) {
      teachForm.addEventListener("input", syncDraft);
      teachForm.addEventListener("change", syncDraft);

      teachForm.addEventListener("click", (event) => {
        const removeButton = event.target.closest(".teach-remove-date-button");

        if (!removeButton) {
          return;
        }

        syncDraft();
        const indexToRemove = Number(removeButton.dataset.index);

        skillDraft.availableDates = skillDraft.availableDates.filter((_, index) => {
          return index !== indexToRemove;
        });

        if (!skillDraft.availableDates.length) {
          skillDraft.availableDates = [""];
        }

        renderTeachContent();
      });

      if (addAvailableDateButton) {
        addAvailableDateButton.addEventListener("click", () => {
          syncDraft();
          skillDraft.availableDates.push("");
          renderTeachContent();
        });
      }

      teachForm.addEventListener("submit", (event) => {
        event.preventDefault();

        syncDraft();

        const submitButton = teachForm.querySelector('button[type="submit"]');
        const title = skillDraft.title.trim();
        const instructor = getDefaultInstructorName().trim();
        const category = skillDraft.category;
        const description = skillDraft.description.trim();
        const maxPeoplePerSession = Number(skillDraft.maxPeoplePerSession);
        const sessionLengthMinutes = Number(skillDraft.sessionLengthMinutes);
        const availableDates = skillDraft.availableDates
          .map((dateValue) => dateValue.trim())
          .filter(Boolean);
        const backgroundImageUrl = skillDraft.backgroundImageUrl.trim();

        const titleError = document.getElementById("title-error");
        const categoryError = document.getElementById("category-error");
        const descriptionError = document.getElementById("description-error");
        const peopleError = document.getElementById("people-error");
        const sessionLengthError = document.getElementById("session-length-error");
        const datesError = document.getElementById("dates-error");
        const backgroundImageError = document.getElementById("background-image-error");
        const formError = document.getElementById("teach-form-error");
        const allowedCategories = categoryOptions.map(({ value }) => value);

        skillDraft = {
          ...skillDraft,
          title,
          category,
          description,
          maxPeoplePerSession: skillDraft.maxPeoplePerSession,
          sessionLengthMinutes: skillDraft.sessionLengthMinutes,
          availableDates,
          backgroundImageUrl
        };

        titleError.textContent = "";
        categoryError.textContent = "";
        descriptionError.textContent = "";
        peopleError.textContent = "";
        sessionLengthError.textContent = "";
        datesError.textContent = "";
        backgroundImageError.textContent = "";
        formError.textContent = "";

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Posting...";
        }

        let hasErrors = false;

        if (!title) {
          titleError.textContent = "Please enter a title.";
          hasErrors = true;
        } else if (title.length < 5) {
          titleError.textContent = "Title must be at least 5 characters long.";
          hasErrors = true;
        } else if (title.length > 80) {
          titleError.textContent = "Title must be 80 characters or fewer.";
          hasErrors = true;
        }

        if (!category) {
          categoryError.textContent = "Please select a category.";
          hasErrors = true;
        } else if (!allowedCategories.includes(category)) {
          categoryError.textContent = "Please choose one of the available categories.";
          hasErrors = true;
        }

        if (!description) {
          descriptionError.textContent = "Please enter a description.";
          hasErrors = true;
        } else if (description.length < 20) {
          descriptionError.textContent = "Description must be at least 20 characters long.";
          hasErrors = true;
        } else if (description.length > 500) {
          descriptionError.textContent = "Description must be 500 characters or fewer.";
          hasErrors = true;
        }

        if (!Number.isInteger(maxPeoplePerSession) || maxPeoplePerSession < 1 || maxPeoplePerSession > 100) {
          peopleError.textContent = "Enter how many learners can join each session (1-100).";
          hasErrors = true;
        }

        if (
          !Number.isInteger(sessionLengthMinutes) ||
          sessionLengthMinutes < 15 ||
          sessionLengthMinutes > 480
        ) {
          sessionLengthError.textContent = "Enter a session length between 15 and 480 minutes.";
          hasErrors = true;
        }

        if (!availableDates.length) {
          datesError.textContent = "Add at least one available date.";
          hasErrors = true;
        } else {
          const hasInvalidDate = availableDates.some((dateValue) => {
            return Number.isNaN(new Date(dateValue).getTime());
          });

          if (hasInvalidDate) {
            datesError.textContent = "Each available date must be a valid date and time.";
            hasErrors = true;
          }
        }

        const backgroundImageValidationMessage = validateBackgroundImageUrl(backgroundImageUrl);

        if (backgroundImageValidationMessage) {
          backgroundImageError.textContent = backgroundImageValidationMessage;
          hasErrors = true;
        }

        if (hasErrors) {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Post Skill";
          }
          return;
        }

        try {
          if (
            !window.ElevateSkills ||
            typeof window.ElevateSkills.addSkill !== "function"
          ) {
            throw new Error("Shared skills store is unavailable.");
          }

          window.ElevateSkills.addSkill({
            title,
            description,
            category,
            createdBy: instructor,
            maxPeoplePerSession,
            sessionLengthMinutes,
            availableDates,
            backgroundImageUrl
          });

          const formattedDates = availableDates.map(formatAvailableDate);

          skillDraft = {
            title: "",
            category: "",
            description: "",
            maxPeoplePerSession: "",
            sessionLengthMinutes: "",
            availableDates: [""],
            backgroundImageUrl: ""
          };

          teachContent.innerHTML = `
            <h1>Thank you for sharing your skill!</h1>
            <p>Your skill has been posted successfully. We appreciate your contribution to the Elevate community.</p>
            <div class="teach-form-actions">
              <button type="button" class="cta-button" id="post-another-skill">Post Another Skill</button>
              <a href="explore.html" class="cta-button">Explore Skills</a>
            </div>

            <div class="teach-posted-skill${backgroundImageUrl ? " teach-posted-skill-with-image" : ""}" ${backgroundImageUrl ? `style="background-image: linear-gradient(rgba(15, 23, 42, 0.68), rgba(15, 23, 42, 0.82)), url('${escapeHtml(backgroundImageUrl)}');"` : ""}>
              <div id="posted-skill-title">
                Title: ${escapeHtml(title)}
              </div>
              <div id="posted-skill-instructor">
                Instructor: ${escapeHtml(instructor)}
              </div>
              <div id="posted-skill-category">
                Category: ${window.ElevateSkills.formatCategory(category)}
              </div>
              <div id="posted-skill-session-size">
                People Per Session: ${maxPeoplePerSession}
              </div>
              <div id="posted-skill-session-length">
                Session Length: ${formatSessionLength(sessionLengthMinutes)}
              </div>
              <div id="posted-skill-description">
                Description: ${escapeHtml(description)}
              </div>
              <div id="posted-skill-dates">
                Available Dates: ${formattedDates.map(escapeHtml).join(", ")}
              </div>
            </div>
          `;

          attachTeachContentListeners();
        } catch (error) {
          console.error("There was a problem posting the skill.", error);
          formError.textContent = "We couldn't post your skill right now. Please try again.";

          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Post Skill";
          }
        }
      });
    }

    if (postAnotherButton) {
      postAnotherButton.addEventListener("click", () => {
        renderTeachContent();
      });
    }

    if (teachGetStartedButton) {
      teachGetStartedButton.addEventListener("click", async () => {
        await waitForAuthReady();

        if (getCurrentUser()) {
          renderTeachContent();
          return;
        }

        window.location.href = "login.html";
      });
    }
  }

  renderTeachContent();

  waitForAuthReady().then(() => {
    isLoggedIn = Boolean(getCurrentUser());
    ensureInstructorDraft();
    renderTeachContent();
  });
});
