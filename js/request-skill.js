import { getCurrentUser, waitForAuthReady } from "./auth-state.js";
import { buildProfileDisplayName, getUserProfile } from "./user-profile.js";

const STORAGE_KEY = "elevateSkillRequests";

document.addEventListener("DOMContentLoaded", () => {
  const requestContent = document.getElementById("request-content");

  if (!requestContent) {
    return;
  }

  const categoryOptions = [
    { value: "tech", label: "Technology" },
    { value: "fitness", label: "Fitness" },
    { value: "music", label: "Music" },
    { value: "art", label: "Art" }
  ];

  let isLoggedIn = Boolean(getCurrentUser());
  let requestDraft = {
    title: "",
    category: "",
    description: "",
    preferredFormat: "",
    timeline: ""
  };

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function loadRequests() {
    try {
      const storedRequests = localStorage.getItem(STORAGE_KEY);

      if (!storedRequests) {
        return [];
      }

      const parsedRequests = JSON.parse(storedRequests);
      return Array.isArray(parsedRequests) ? parsedRequests : [];
    } catch (error) {
      console.error("Unable to load skill requests.", error);
      return [];
    }
  }

  function persistRequests(requests) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }

  function getCurrentDisplayName() {
    const user = getCurrentUser();

    if (!user) {
      return "Member";
    }

    const profile = getUserProfile(user.uid);
    return buildProfileDisplayName(user, profile);
  }

  function formatCategory(category) {
    return categoryOptions.find((option) => option.value === category)?.label || category || "Uncategorized";
  }

  function formatTimeline(timeline) {
    if (timeline === "asap") return "ASAP";
    if (timeline === "week") return "Within a week";
    if (timeline === "month") return "Within a month";
    if (timeline === "flexible") return "Flexible";
    return timeline || "Not specified";
  }

  function formatPreferredFormat(preferredFormat) {
    if (preferredFormat === "one-on-one") return "One-on-one";
    if (preferredFormat === "small-group") return "Small group";
    if (preferredFormat === "either") return "Either format";
    return preferredFormat || "Not specified";
  }

  function buildRequestCards(requests) {
    if (!requests.length) {
      return `
        <div class="request-empty-state">
          <h3>No requests yet</h3>
          <p>Be the first learner to request a skill from the community.</p>
        </div>
      `;
    }

    return requests
      .slice()
      .reverse()
      .map((request) => {
        return `
          <article class="request-card">
            <div class="request-card-header">
              <span class="request-category-tag">${escapeHtml(formatCategory(request.category))}</span>
              <span class="request-meta">Requested by ${escapeHtml(request.requestedBy)}</span>
            </div>
            <h3>${escapeHtml(request.title)}</h3>
            <p>${escapeHtml(request.description)}</p>
            <div class="request-card-details">
              <span>Format: ${escapeHtml(formatPreferredFormat(request.preferredFormat))}</span>
              <span>Timeline: ${escapeHtml(formatTimeline(request.timeline))}</span>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function syncDraft() {
    const titleInput = document.getElementById("request-title");
    const categoryInput = document.getElementById("request-category");
    const descriptionInput = document.getElementById("request-description");
    const preferredFormatInput = document.getElementById("request-format");
    const timelineInput = document.getElementById("request-timeline");

    requestDraft = {
      title: titleInput?.value || "",
      category: categoryInput?.value || "",
      description: descriptionInput?.value || "",
      preferredFormat: preferredFormatInput?.value || "",
      timeline: timelineInput?.value || ""
    };
  }

  function renderRequestContent() {
    const requests = loadRequests();

    if (isLoggedIn) {
      requestContent.innerHTML = `
        <section class="request-hero">
          <p class="request-eyebrow">Request a Skill</p>
          <h1>Ask the Elevate community for the skill you want to learn next.</h1>
          <p>Describe what you want help with and give potential instructors enough context to respond.</p>
        </section>

        <section class="request-layout">
          <div class="request-panel">
            <h2>New Request</h2>
            <p class="request-panel-subtitle">Posting as @${escapeHtml(getCurrentDisplayName())}</p>
            <form id="request-form" class="request-form">
              <label class="request-form-field" for="request-title">
                <span>Skill You Want to Learn</span>
                <input type="text" id="request-title" name="title" placeholder="Intro to budgeting and personal finance" value="${escapeHtml(requestDraft.title)}">
                <span class="request-form-message" id="request-title-error"></span>
              </label>

              <label class="request-form-field" for="request-category">
                <span>Category</span>
                <select id="request-category" name="category">
                  <option value="" ${requestDraft.category === "" ? "selected" : ""}>Select a category</option>
                  ${categoryOptions
                    .map(({ value, label }) => {
                      const isSelected = requestDraft.category === value ? "selected" : "";
                      return `<option value="${value}" ${isSelected}>${label}</option>`;
                    })
                    .join("")}
                </select>
                <span class="request-form-message" id="request-category-error"></span>
              </label>

              <label class="request-form-field" for="request-description">
                <span>What Help Are You Looking For?</span>
                <textarea id="request-description" name="description" rows="6" placeholder="Explain what you want to learn, your current level, and what a helpful session would look like.">${escapeHtml(requestDraft.description)}</textarea>
                <span class="request-form-message" id="request-description-error"></span>
              </label>

              <div class="request-form-grid">
                <label class="request-form-field" for="request-format">
                  <span>Preferred Format</span>
                  <select id="request-format" name="preferredFormat">
                    <option value="" ${requestDraft.preferredFormat === "" ? "selected" : ""}>Select a format</option>
                    <option value="one-on-one" ${requestDraft.preferredFormat === "one-on-one" ? "selected" : ""}>One-on-one</option>
                    <option value="small-group" ${requestDraft.preferredFormat === "small-group" ? "selected" : ""}>Small group</option>
                    <option value="either" ${requestDraft.preferredFormat === "either" ? "selected" : ""}>Either</option>
                  </select>
                  <span class="request-form-message" id="request-format-error"></span>
                </label>

                <label class="request-form-field" for="request-timeline">
                  <span>When Do You Need It?</span>
                  <select id="request-timeline" name="timeline">
                    <option value="" ${requestDraft.timeline === "" ? "selected" : ""}>Select a timeline</option>
                    <option value="asap" ${requestDraft.timeline === "asap" ? "selected" : ""}>ASAP</option>
                    <option value="week" ${requestDraft.timeline === "week" ? "selected" : ""}>Within a week</option>
                    <option value="month" ${requestDraft.timeline === "month" ? "selected" : ""}>Within a month</option>
                    <option value="flexible" ${requestDraft.timeline === "flexible" ? "selected" : ""}>Flexible</option>
                  </select>
                  <span class="request-form-message" id="request-timeline-error"></span>
                </label>
              </div>

              <div class="request-form-actions">
                <button type="submit" class="btn-primary">Post Request</button>
              </div>
              <p class="request-form-message" id="request-form-error"></p>
            </form>
          </div>

          <aside class="request-panel">
            <div class="request-feed-header">
              <h2>Recent Requests</h2>
              <p>${requests.length} request${requests.length === 1 ? "" : "s"} posted</p>
            </div>
            <div class="request-feed">
              ${buildRequestCards(requests)}
            </div>
          </aside>
        </section>
      `;
    } else {
      requestContent.innerHTML = `
        <section class="request-hero request-hero-guest">
          <p class="request-eyebrow">Request a Skill</p>
          <h1>Need help learning something specific?</h1>
          <p>Sign in to post a learning request and let the Elevate community know what skill you want help with.</p>
          <button type="button" class="btn-primary" id="requestGetStartedButton">Get Started</button>
        </section>

        <section class="request-panel request-preview-panel">
          <h2>What You Can Request</h2>
          <div class="request-preview-grid">
            <article class="request-preview-card">
              <h3>Technical Coaching</h3>
              <p>Ask for help with coding, software tools, or building your first project.</p>
            </article>
            <article class="request-preview-card">
              <h3>Creative Skills</h3>
              <p>Request support for drawing, music production, design, or content creation.</p>
            </article>
            <article class="request-preview-card">
              <h3>Life and Fitness Skills</h3>
              <p>Find mentors for wellness, routines, beginner workouts, or everyday practical skills.</p>
            </article>
          </div>
        </section>
      `;
    }

    attachRequestListeners();
  }

  function attachRequestListeners() {
    const requestForm = document.getElementById("request-form");
    const requestGetStartedButton = document.getElementById("requestGetStartedButton");
    const postAnotherButton = document.getElementById("post-another-request");

    if (requestForm) {
      requestForm.addEventListener("input", syncDraft);
      requestForm.addEventListener("change", syncDraft);

      requestForm.addEventListener("submit", (event) => {
        event.preventDefault();
        syncDraft();

        const submitButton = requestForm.querySelector('button[type="submit"]');
        const title = requestDraft.title.trim();
        const category = requestDraft.category;
        const description = requestDraft.description.trim();
        const preferredFormat = requestDraft.preferredFormat;
        const timeline = requestDraft.timeline;
        const allowedCategories = categoryOptions.map(({ value }) => value);

        const titleError = document.getElementById("request-title-error");
        const categoryError = document.getElementById("request-category-error");
        const descriptionError = document.getElementById("request-description-error");
        const formatError = document.getElementById("request-format-error");
        const timelineError = document.getElementById("request-timeline-error");
        const formError = document.getElementById("request-form-error");

        titleError.textContent = "";
        categoryError.textContent = "";
        descriptionError.textContent = "";
        formatError.textContent = "";
        timelineError.textContent = "";
        formError.textContent = "";

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Posting...";
        }

        let hasErrors = false;

        if (!title) {
          titleError.textContent = "Please enter the skill you want to learn.";
          hasErrors = true;
        } else if (title.length < 5) {
          titleError.textContent = "Request title must be at least 5 characters long.";
          hasErrors = true;
        } else if (title.length > 80) {
          titleError.textContent = "Request title must be 80 characters or fewer.";
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
          descriptionError.textContent = "Please describe what help you are looking for.";
          hasErrors = true;
        } else if (description.length < 25) {
          descriptionError.textContent = "Please give a little more detail so instructors know how to help.";
          hasErrors = true;
        } else if (description.length > 600) {
          descriptionError.textContent = "Description must be 600 characters or fewer.";
          hasErrors = true;
        }

        if (!preferredFormat) {
          formatError.textContent = "Please choose a preferred format.";
          hasErrors = true;
        }

        if (!timeline) {
          timelineError.textContent = "Please choose a timeline.";
          hasErrors = true;
        }

        if (hasErrors) {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Post Request";
          }
          return;
        }

        try {
          const user = getCurrentUser();

          if (!user) {
            throw new Error("You must be logged in to post a request.");
          }

          const requests = loadRequests();
          const newRequest = {
            id: `request-${Date.now()}`,
            userId: user.uid,
            requestedBy: getCurrentDisplayName(),
            title,
            category,
            description,
            preferredFormat,
            timeline,
            createdAt: new Date().toISOString()
          };

          requests.push(newRequest);
          persistRequests(requests);

          requestDraft = {
            title: "",
            category: "",
            description: "",
            preferredFormat: "",
            timeline: ""
          };

          requestContent.innerHTML = `
            <section class="request-success-panel">
              <p class="request-eyebrow">Request Posted</p>
              <h1>Your request is live.</h1>
              <p>The community can now see what you want help learning next.</p>
              <div class="request-form-actions">
                <button type="button" class="btn-primary" id="post-another-request">Post Another Request</button>
                <a href="explore.html" class="btn-primary">Browse Skills</a>
              </div>
              <article class="request-card request-card-highlight">
                <div class="request-card-header">
                  <span class="request-category-tag">${escapeHtml(formatCategory(category))}</span>
                  <span class="request-meta">Requested by ${escapeHtml(getCurrentDisplayName())}</span>
                </div>
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(description)}</p>
                <div class="request-card-details">
                  <span>Format: ${escapeHtml(formatPreferredFormat(preferredFormat))}</span>
                  <span>Timeline: ${escapeHtml(formatTimeline(timeline))}</span>
                </div>
              </article>
            </section>
          `;

          attachRequestListeners();
        } catch (error) {
          console.error("Unable to post skill request.", error);
          formError.textContent = "We couldn't post your request right now. Please try again.";

          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Post Request";
          }
        }
      });
    }

    if (requestGetStartedButton) {
      requestGetStartedButton.addEventListener("click", async () => {
        await waitForAuthReady();

        if (getCurrentUser()) {
          isLoggedIn = true;
          renderRequestContent();
          return;
        }

        window.location.href = "login.html";
      });
    }

    if (postAnotherButton) {
      postAnotherButton.addEventListener("click", () => {
        renderRequestContent();
      });
    }
  }

  renderRequestContent();

  waitForAuthReady().then(() => {
    isLoggedIn = Boolean(getCurrentUser());
    renderRequestContent();
  });
});
