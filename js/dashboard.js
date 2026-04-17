import { getCurrentUser, waitForAuthReady } from "./auth-state.js";
import {
  buildProfileDisplayName,
  getUserProfile,
  isUsernameTaken,
  ready as waitForProfilesReady,
  saveUserProfile
} from "./user-profile.js";

const CATEGORY_OPTIONS = [
  { value: "tech", label: "Technology" },
  { value: "fitness", label: "Fitness" },
  { value: "music", label: "Music" },
  { value: "art", label: "Art" }
];

const GOAL_OPTIONS = [
  { value: "learn", label: "Learn" },
  { value: "teach", label: "Teach" },
  { value: "both", label: "Both" }
];

const REQUEST_FORMAT_OPTIONS = [
  { value: "one-on-one", label: "One-on-one" },
  { value: "small-group", label: "Small group" },
  { value: "either", label: "Either format" }
];

const REQUEST_TIMELINE_OPTIONS = [
  { value: "asap", label: "ASAP" },
  { value: "week", label: "Within a week" },
  { value: "month", label: "Within a month" },
  { value: "flexible", label: "Flexible" }
];

function getSkillPosts() {
  if (
    window.ElevateSkills &&
    typeof window.ElevateSkills.getSkills === "function"
  ) {
    return window.ElevateSkills.getSkills();
  }

  return [];
}

function getResolvedSkillImage(skillPost) {
  if (
    window.ElevateSkills &&
    typeof window.ElevateSkills.getResolvedSkillImage === "function"
  ) {
    return window.ElevateSkills.getResolvedSkillImage(skillPost);
  }

  return skillPost?.cardImageUrl || "";
}

function formatCategory(category) {
  if (
    window.ElevateSkills &&
    typeof window.ElevateSkills.formatCategory === "function"
  ) {
    return window.ElevateSkills.formatCategory(category);
  }

  return CATEGORY_OPTIONS.find((option) => option.value === category)?.label || category || "Uncategorized";
}

function formatAvailableDate(dateValue) {
  const normalizedDateValue =
    dateValue && typeof dateValue.toDate === "function"
      ? dateValue.toDate()
      : dateValue;
  const date = new Date(normalizedDateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue || "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatSessionLength(minutes) {
  const safeMinutes = Number(minutes);

  if (!safeMinutes) {
    return "Length not provided";
  }

  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (!hours) {
    return `${safeMinutes} minutes`;
  }

  if (!remainingMinutes) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatPreferredFormat(preferredFormat) {
  return REQUEST_FORMAT_OPTIONS.find((option) => option.value === preferredFormat)?.label || preferredFormat || "Not specified";
}

function formatTimeline(timeline) {
  return REQUEST_TIMELINE_OPTIONS.find((option) => option.value === timeline)?.label || timeline || "Not specified";
}

function appendText(parent, tagName, textContent, className = "") {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = textContent;
  parent.appendChild(element);
  return element;
}

function appendActionButton(parent, label, action, identifier = "", extraClass = "btn-secondary") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = extraClass;
  button.dataset.action = action;
  if (identifier) {
    button.dataset.id = String(identifier);
  }
  button.textContent = label;
  parent.appendChild(button);
  return button;
}

function buildCardShell(extraClass = "") {
  const card = document.createElement("article");
  card.className = `dashboard-card${extraClass ? ` ${extraClass}` : ""}`;
  return card;
}

function buildEmptyCard(titleText, message) {
  const card = buildCardShell("dashboard-card-empty");
  appendText(card, "h4", titleText);
  appendText(card, "p", message);
  return card;
}

function buildActions() {
  const actions = document.createElement("div");
  actions.className = "dashboard-card-actions";
  return actions;
}

function createField(labelText, input) {
  const label = document.createElement("label");
  label.className = "dashboard-edit-field";
  appendText(label, "span", labelText);
  label.appendChild(input);
  return label;
}

function createInput(type, value = "", attributes = {}) {
  const input = document.createElement("input");
  input.type = type;
  input.value = value ?? "";

  Object.entries(attributes).forEach(([key, attributeValue]) => {
    input.setAttribute(key, attributeValue);
  });

  return input;
}

function createTextarea(value = "", attributes = {}) {
  const textarea = document.createElement("textarea");
  textarea.value = value ?? "";

  Object.entries(attributes).forEach(([key, attributeValue]) => {
    textarea.setAttribute(key, attributeValue);
  });

  return textarea;
}

function createSelect(options, selectedValue = "") {
  const select = document.createElement("select");

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "Select one";
  select.appendChild(emptyOption);

  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    optionElement.selected = option.value === selectedValue;
    select.appendChild(optionElement);
  });

  return select;
}

function getSkillIdentifier(skillPost) {
  return skillPost?.docId || skillPost?.id || "";
}

function getAvailabilityCounts(skillPost, availabilityMap) {
  return availabilityMap[String(skillPost?.id)]?.bookingCounts || {};
}

function getActiveBookingCount(skillPost, availabilityMap) {
  return Object.values(getAvailabilityCounts(skillPost, availabilityMap))
    .reduce((total, count) => total + (Number(count) || 0), 0);
}

function validateImageUrl(url) {
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

function escapeAttributeSelector(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(String(value));
  }

  return String(value).replace(/["\\]/g, "\\$&");
}

function buildUserInfoCard(user, profile, displayName) {
  const fullName =
    [profile?.firstName, profile?.lastName]
      .filter((value) => typeof value === "string" && value.trim() !== "")
      .join(" ") || user.displayName || "Not provided";
  const interests =
    Array.isArray(profile?.interests) && profile.interests.length
      ? profile.interests.map(formatCategory).join(", ")
      : "Not set";

  const card = buildCardShell();
  appendText(card, "p", "Account", "dashboard-card-eyebrow");
  appendText(card, "h4", displayName);
  appendText(card, "p", `Email: ${user.email || "Not provided"}`);
  appendText(card, "p", `Username: ${profile?.username || "Not set"}`);
  appendText(card, "p", `Name: ${fullName}`);
  appendText(card, "p", `City: ${profile?.city || "Not set"}`);
  appendText(card, "p", `Goal: ${profile?.accountGoal || "Not set"}`);
  appendText(card, "p", `Interests: ${interests}`);

  const actions = buildActions();
  appendActionButton(actions, "Edit Profile", "edit-profile");
  card.appendChild(actions);
  return card;
}

function buildBookingCard(booking, skillPost, canCancel = false) {
  const card = buildCardShell();
  appendText(card, "p", "Booked Session", "dashboard-card-eyebrow");
  appendText(card, "h4", skillPost?.title || "Booked session");
  appendText(card, "p", `Instructor: ${skillPost?.createdBy || "Elevate Community"}`);
  appendText(card, "p", `Category: ${formatCategory(skillPost?.category)}`);
  appendText(card, "p", `Session date: ${formatAvailableDate(booking.dateValue)}`);
  appendText(card, "p", `Session length: ${formatSessionLength(skillPost?.sessionLengthMinutes)}`);
  appendText(card, "p", `Booked on: ${formatAvailableDate(booking.bookedAtMs || booking.bookedAt)}`);

  if (canCancel) {
    const actions = buildActions();
    appendActionButton(actions, "Cancel Booking", "cancel-booking", booking.id);
    card.appendChild(actions);
  }

  return card;
}

function buildSkillPostCard(skillPost, availabilityMap) {
  const card = buildCardShell();
  const resolvedImageUrl = getResolvedSkillImage(skillPost);

  if (resolvedImageUrl) {
    const image = document.createElement("img");
    image.className = "dashboard-card-image";
    image.src = resolvedImageUrl;
    image.alt = `${skillPost?.title || "Skill"} preview`;
    card.appendChild(image);
  }

  appendText(card, "p", "Teach Post", "dashboard-card-eyebrow");
  appendText(card, "h4", skillPost?.title || "Untitled skill");
  appendText(card, "p", `Category: ${formatCategory(skillPost?.category)}`);
  appendText(card, "p", skillPost?.description || "No description provided yet.");
  appendText(card, "p", `Seats per session: ${skillPost?.maxPeoplePerSession || "Open"}`);
  appendText(card, "p", `Session length: ${formatSessionLength(skillPost?.sessionLengthMinutes)}`);
  appendText(
    card,
    "p",
    skillPost?.availableDates?.length
      ? `Next date: ${formatAvailableDate(skillPost.availableDates[0])}`
      : "Dates coming soon"
  );
  appendText(card, "p", `Active bookings: ${getActiveBookingCount(skillPost, availabilityMap)}`);

  const actions = buildActions();
  appendActionButton(actions, "Edit Skill", "edit-skill", getSkillIdentifier(skillPost));
  appendActionButton(actions, "Delete Skill", "delete-skill", getSkillIdentifier(skillPost), "btn-secondary dashboard-danger-button");
  card.appendChild(actions);
  return card;
}

function buildRequestCard(request) {
  const card = buildCardShell();
  appendText(card, "p", "Request", "dashboard-card-eyebrow");
  appendText(card, "h4", request?.title || "Untitled request");
  appendText(card, "p", `Category: ${formatCategory(request?.category)}`);
  appendText(card, "p", request?.description || "No description provided yet.");
  appendText(card, "p", `Preferred format: ${formatPreferredFormat(request?.preferredFormat)}`);
  appendText(card, "p", `Timeline: ${formatTimeline(request?.timeline)}`);
  appendText(card, "p", `Requested on: ${formatAvailableDate(request?.createdAtMs || request?.createdAt)}`);

  const actions = buildActions();
  appendActionButton(actions, "Edit Request", "edit-request", request.id);
  appendActionButton(actions, "Delete Request", "delete-request", request.id, "btn-secondary dashboard-danger-button");
  card.appendChild(actions);
  return card;
}

function renderCards(container, items, buildCard, emptyTitle, emptyMessage) {
  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!items.length) {
    container.appendChild(buildEmptyCard(emptyTitle, emptyMessage));
    return;
  }

  items.forEach((item) => {
    container.appendChild(buildCard(item));
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const heading = document.getElementById("dashboardHeading");
  const intro = document.getElementById("dashboardIntro");
  const bookingSummary = document.getElementById("dashboardBookingSummary");
  const pendingContainer = document.getElementById("pendingBookingsContainer");
  const completedContainer = document.getElementById("completedBookingsContainer");
  const userInfoContainer = document.getElementById("dashboardUserInfoContainer");
  const userPostsContainer = document.getElementById("userPostsContainer");
  const userRequestsContainer = document.getElementById("userRequestsContainer");
  const userPostsSummary = document.getElementById("dashboardUserPostsSummary");
  const userRequestsSummary = document.getElementById("dashboardUserRequestsSummary");

  if (
    !heading ||
    !intro ||
    !bookingSummary ||
    !pendingContainer ||
    !completedContainer ||
    !userInfoContainer ||
    !userPostsContainer ||
    !userRequestsContainer ||
    !userPostsSummary ||
    !userRequestsSummary
  ) {
    return;
  }

  const state = {
    user: null,
    profile: null,
    displayName: "Member",
    bookings: [],
    requests: [],
    skillPosts: [],
    userPosts: [],
    pendingBookings: [],
    completedBookings: [],
    availabilityMap: {},
    bookingsError: "",
    requestsError: ""
  };

  function getSkillById(skillId) {
    return state.skillPosts.find((skill) => String(skill.id) === String(skillId));
  }

  function refreshDerivedState() {
    state.displayName = buildProfileDisplayName(state.user, state.profile);
    state.skillPosts = getSkillPosts();
    state.userPosts = state.skillPosts
      .filter((skillPost) => skillPost?.creatorUserId === state.user?.uid)
      .sort((firstPost, secondPost) => Number(secondPost.id) - Number(firstPost.id));

    const sortedBookings = state.bookings.slice().sort((firstBooking, secondBooking) => {
      return new Date(firstBooking.dateValue).getTime() - new Date(secondBooking.dateValue).getTime();
    });

    const now = Date.now();
    state.pendingBookings = sortedBookings.filter((booking) => {
      return new Date(booking.dateValue).getTime() >= now;
    });
    state.completedBookings = sortedBookings.filter((booking) => {
      return new Date(booking.dateValue).getTime() < now;
    });
  }

  function renderProfileSection() {
    renderCards(
      userInfoContainer,
      [{ user: state.user, profile: state.profile, displayName: state.displayName }],
      ({ user, profile, displayName }) => buildUserInfoCard(user, profile, displayName),
      "Profile unavailable",
      "We couldn't load your profile details."
    );
  }

  function renderBookingSections() {
    bookingSummary.textContent = state.bookingsError
      ? state.bookingsError
      : `${state.displayName}, you have ${state.pendingBookings.length} upcoming booking${
          state.pendingBookings.length === 1 ? "" : "s"
        } and ${state.completedBookings.length} completed booking${
          state.completedBookings.length === 1 ? "" : "s"
        }.`;

    if (state.bookingsError) {
      renderCards(
        pendingContainer,
        [],
        buildBookingCard,
        "Bookings unavailable",
        state.bookingsError
      );
      renderCards(
        completedContainer,
        [],
        buildBookingCard,
        "Bookings unavailable",
        state.bookingsError
      );
      return;
    }

    renderCards(
      pendingContainer,
      state.pendingBookings.map((booking) => ({
        booking,
        skillPost: getSkillById(booking.skillId)
      })),
      ({ booking, skillPost }) => buildBookingCard(booking, skillPost, true),
      "No upcoming sessions",
      "Your upcoming booked sessions will show here."
    );
    renderCards(
      completedContainer,
      state.completedBookings.map((booking) => ({
        booking,
        skillPost: getSkillById(booking.skillId)
      })),
      ({ booking, skillPost }) => buildBookingCard(booking, skillPost, false),
      "No completed sessions",
      "Completed sessions will appear here after you attend them."
    );
  }

  function renderSkillPostsSection() {
    userPostsSummary.textContent = `${state.displayName}, you have created ${state.userPosts.length} skill post${
      state.userPosts.length === 1 ? "" : "s"
    }.`;
    renderCards(
      userPostsContainer,
      state.userPosts,
      (skillPost) => buildSkillPostCard(skillPost, state.availabilityMap),
      "No skill posts yet",
      "Create a session from the Teach page and it will appear here."
    );
  }

  function renderRequestsSection() {
    userRequestsSummary.textContent = state.requestsError
      ? state.requestsError
      : `${state.displayName}, you have posted ${state.requests.length} request${
          state.requests.length === 1 ? "" : "s"
        }.`;

    if (state.requestsError) {
      renderCards(
        userRequestsContainer,
        [],
        buildRequestCard,
        "Requests unavailable",
        state.requestsError
      );
      return;
    }

    renderCards(
      userRequestsContainer,
      state.requests,
      buildRequestCard,
      "No requests yet",
      "Post a skill request and it will appear here."
    );
  }

  function renderDashboard() {
    refreshDerivedState();
    heading.textContent = `Welcome back, ${state.displayName}.`;
    intro.textContent = "Here is a snapshot of the sessions you booked, the sessions you posted, and the requests you have shared.";
    renderProfileSection();
    renderBookingSections();
    renderSkillPostsSection();
    renderRequestsSection();
  }

  function renderGuestDashboard() {
    heading.textContent = "Your dashboard is waiting.";
    intro.textContent = "Log in to see your profile, bookings, skill posts, and requests in one place.";
    bookingSummary.textContent = "Log in to view your bookings.";
    userPostsSummary.textContent = "Log in to view the skill posts you have created.";
    userRequestsSummary.textContent = "Log in to view the requests you have posted.";

    renderCards(pendingContainer, [], buildBookingCard, "No upcoming sessions", "You need to log in before we can show your bookings.");
    renderCards(completedContainer, [], buildBookingCard, "No completed sessions", "Completed sessions will appear here after you log in.");
    renderCards(userInfoContainer, [], buildUserInfoCard, "Profile unavailable", "Log in to view your profile details.");
    renderCards(userPostsContainer, [], buildSkillPostCard, "No skill posts yet", "Log in to view the sessions you have shared.");
    renderCards(userRequestsContainer, [], buildRequestCard, "No requests yet", "Log in to view the requests you have posted.");
  }

  function buildProfileEditForm() {
    const form = buildCardShell("dashboard-edit-card");
    appendText(form, "p", "Edit Profile", "dashboard-card-eyebrow");
    appendText(form, "h4", "Update your info");

    const usernameInput = createInput("text", state.profile?.username || "", { name: "username", maxlength: "20" });
    const firstNameInput = createInput("text", state.profile?.firstName || "", { name: "firstName" });
    const lastNameInput = createInput("text", state.profile?.lastName || "", { name: "lastName" });
    const cityInput = createInput("text", state.profile?.city || "", { name: "city" });
    const bioInput = createTextarea(state.profile?.bio || "", { name: "bio", rows: "4", maxlength: "240" });
    const accountGoalInput = createSelect(GOAL_OPTIONS, state.profile?.accountGoal || "");
    accountGoalInput.name = "accountGoal";

    form.append(
      createField("Username", usernameInput),
      createField("First name", firstNameInput),
      createField("Last name", lastNameInput),
      createField("How do you plan to use Elevate?", accountGoalInput),
      createField("City", cityInput),
      createField("Bio", bioInput)
    );

    const interestsGroup = document.createElement("fieldset");
    interestsGroup.className = "dashboard-edit-field dashboard-checkbox-group";
    const legend = document.createElement("legend");
    legend.textContent = "Interests";
    interestsGroup.appendChild(legend);

    const selectedInterests = new Set(state.profile?.interests || []);
    CATEGORY_OPTIONS.forEach((option) => {
      const label = document.createElement("label");
      const checkbox = createInput("checkbox", option.value, { name: "interests" });
      checkbox.checked = selectedInterests.has(option.value);
      label.append(checkbox, document.createTextNode(option.label));
      interestsGroup.appendChild(label);
    });
    form.appendChild(interestsGroup);

    const message = appendText(form, "p", "", "dashboard-form-message");
    const actions = buildActions();
    appendActionButton(actions, "Save Profile", "save-profile", "", "btn-primary");
    appendActionButton(actions, "Cancel", "cancel-edit");
    form.append(actions, message);
    return form;
  }

  function buildSkillEditForm(skillPost) {
    const form = buildCardShell("dashboard-edit-card");
    form.dataset.id = getSkillIdentifier(skillPost);
    appendText(form, "p", "Edit Skill", "dashboard-card-eyebrow");
    appendText(form, "h4", skillPost?.title || "Untitled skill");

    const titleInput = createInput("text", skillPost?.title || "", { name: "title", maxlength: "80" });
    const categoryInput = createSelect(CATEGORY_OPTIONS, skillPost?.category || "");
    categoryInput.name = "category";
    const descriptionInput = createTextarea(skillPost?.description || "", { name: "description", rows: "5", maxlength: "500" });
    const peopleInput = createInput("number", skillPost?.maxPeoplePerSession || "", { name: "maxPeoplePerSession", min: "1", max: "100" });
    const lengthInput = createInput("number", skillPost?.sessionLengthMinutes || "", { name: "sessionLengthMinutes", min: "15", max: "480", step: "15" });
    const datesInput = createTextarea((skillPost?.availableDates || []).join("\n"), { name: "availableDates", rows: "4" });
    const imageInput = createInput("url", skillPost?.cardImageUrl || "", { name: "cardImageUrl" });

    form.append(
      createField("Title", titleInput),
      createField("Category", categoryInput),
      createField("Description", descriptionInput),
      createField("People per session", peopleInput),
      createField("Session length in minutes", lengthInput),
      createField("Available dates, one per line", datesInput),
      createField("Card image URL", imageInput)
    );

    const message = appendText(form, "p", "", "dashboard-form-message");
    const actions = buildActions();
    appendActionButton(actions, "Save Skill", "save-skill", getSkillIdentifier(skillPost), "btn-primary");
    appendActionButton(actions, "Cancel", "cancel-edit");
    form.append(actions, message);
    return form;
  }

  function buildRequestEditForm(request) {
    const form = buildCardShell("dashboard-edit-card");
    form.dataset.id = request.id;
    appendText(form, "p", "Edit Request", "dashboard-card-eyebrow");
    appendText(form, "h4", request?.title || "Untitled request");

    const titleInput = createInput("text", request?.title || "", { name: "title", maxlength: "80" });
    const categoryInput = createSelect(CATEGORY_OPTIONS, request?.category || "");
    categoryInput.name = "category";
    const descriptionInput = createTextarea(request?.description || "", { name: "description", rows: "5", maxlength: "600" });
    const formatInput = createSelect(REQUEST_FORMAT_OPTIONS, request?.preferredFormat || "");
    formatInput.name = "preferredFormat";
    const timelineInput = createSelect(REQUEST_TIMELINE_OPTIONS, request?.timeline || "");
    timelineInput.name = "timeline";
    const lengthInput = createInput("number", request?.sessionLengthMinutes || "", { name: "sessionLengthMinutes", min: "15", max: "480", step: "15" });
    const imageInput = createInput("url", request?.cardImageUrl || "", { name: "cardImageUrl" });

    form.append(
      createField("Title", titleInput),
      createField("Category", categoryInput),
      createField("Description", descriptionInput),
      createField("Preferred format", formatInput),
      createField("Timeline", timelineInput),
      createField("Session length in minutes", lengthInput),
      createField("Card image URL", imageInput)
    );

    const message = appendText(form, "p", "", "dashboard-form-message");
    const actions = buildActions();
    appendActionButton(actions, "Save Request", "save-request", request.id, "btn-primary");
    appendActionButton(actions, "Cancel", "cancel-edit");
    form.append(actions, message);
    return form;
  }

  function replaceCardWithForm(container, identifier, form) {
    const card = identifier
      ? container.querySelector(`[data-id="${escapeAttributeSelector(identifier)}"]`)?.closest(".dashboard-card")
      : container.querySelector(".dashboard-card");

    if (card) {
      card.replaceWith(form);
    }
  }

  function getFormMessage(button) {
    return button.closest(".dashboard-card")?.querySelector(".dashboard-form-message");
  }

  function setButtonBusy(button, label) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = label;
  }

  function resetButton(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }

  function getFormValue(form, name) {
    return form.querySelector(`[name="${name}"]`)?.value.trim() || "";
  }

  function parseDates(value) {
    return value
      .split(/\r?\n/)
      .map((dateValue) => dateValue.trim())
      .filter(Boolean);
  }

  function findSkill(identifier) {
    return state.userPosts.find((skillPost) => String(getSkillIdentifier(skillPost)) === String(identifier));
  }

  function findRequest(identifier) {
    return state.requests.find((request) => String(request.id) === String(identifier));
  }

  function findBooking(identifier) {
    return state.bookings.find((booking) => String(booking.id) === String(identifier));
  }

  userInfoContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;

    if (action === "edit-profile") {
      userInfoContainer.replaceChildren(buildProfileEditForm());
      return;
    }

    if (action === "cancel-edit") {
      renderProfileSection();
      return;
    }

    if (action !== "save-profile") {
      return;
    }

    const form = button.closest(".dashboard-card");
    const message = getFormMessage(button);
    const username = getFormValue(form, "username");
    const firstName = getFormValue(form, "firstName");
    const lastName = getFormValue(form, "lastName");
    const accountGoal = getFormValue(form, "accountGoal");
    const city = getFormValue(form, "city");
    const bio = getFormValue(form, "bio");
    const interests = Array.from(form.querySelectorAll('[name="interests"]:checked')).map((input) => input.value);

    message.textContent = "";

    if (!username || !firstName || !lastName || !accountGoal || !city) {
      message.textContent = "Please fill in all required profile fields.";
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      message.textContent = "Username must be 3-20 characters and only use letters, numbers, or underscores.";
      return;
    }

    if (!interests.length) {
      message.textContent = "Choose at least one interest.";
      return;
    }

    setButtonBusy(button, "Saving...");

    try {
      if (await isUsernameTaken(username, state.user.uid)) {
        message.textContent = "That username is already taken.";
        return;
      }

      state.profile = await saveUserProfile({
        uid: state.user.uid,
        email: state.user.email || "",
        username,
        firstName,
        lastName,
        accountGoal,
        city,
        bio,
        interests,
        authProvider: state.user.providerData?.[0]?.providerId || state.profile?.authProvider || "password"
      });
      renderDashboard();
    } catch (error) {
      console.error("Unable to save profile from dashboard.", error);
      message.textContent = error?.message || "We couldn't save your profile right now.";
    } finally {
      resetButton(button);
    }
  });

  pendingContainer.addEventListener("click", async (event) => {
    const button = event.target.closest('[data-action="cancel-booking"]');
    if (!button) return;

    const booking = findBooking(button.dataset.id);
    if (!booking) return;

    const confirmed = window.confirm("Cancel this booking?");
    if (!confirmed) return;

    setButtonBusy(button, "Canceling...");

    try {
      const { cancelBookingInDb } = await import("./bookings-store.js");
      await cancelBookingInDb(booking, state.user.uid);
      state.bookings = state.bookings.filter((item) => item.id !== booking.id);

      const { listSkillAvailabilityFromDb } = await import("./skill-availability-store.js");
      const availabilityEntries = await listSkillAvailabilityFromDb();
      state.availabilityMap = availabilityEntries.reduce((availabilityMap, entry) => {
        availabilityMap[String(entry.skillId ?? entry.id)] = entry;
        return availabilityMap;
      }, {});

      renderDashboard();
    } catch (error) {
      console.error("Unable to cancel booking.", error);
      resetButton(button);
      const status = appendText(button.closest(".dashboard-card"), "p", error?.message || "We couldn't cancel that booking right now.", "dashboard-form-message");
      status.dataset.tone = "error";
    }
  });

  userPostsContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const skillPost = findSkill(button.dataset.id);

    if (action === "edit-skill" && skillPost) {
      replaceCardWithForm(userPostsContainer, button.dataset.id, buildSkillEditForm(skillPost));
      return;
    }

    if (action === "cancel-edit") {
      renderSkillPostsSection();
      return;
    }

    if (action === "delete-skill" && skillPost) {
      const activeBookingCount = getActiveBookingCount(skillPost, state.availabilityMap);

      if (activeBookingCount > 0) {
        window.alert("This skill has active bookings. Cancel or complete those sessions before deleting it.");
        return;
      }

      if (!window.confirm("Delete this skill post?")) {
        return;
      }

      setButtonBusy(button, "Deleting...");

      try {
        const { deleteSkillFromDb } = await import("./skills-store.js");
        await deleteSkillFromDb(getSkillIdentifier(skillPost), state.user.uid);

        if (window.ElevateSkills?.removeLocalSkill) {
          window.ElevateSkills.removeLocalSkill(getSkillIdentifier(skillPost));
        }

        renderDashboard();
      } catch (error) {
        console.error("Unable to delete skill.", error);
        window.alert(error?.message || "We couldn't delete that skill right now.");
        resetButton(button);
      }
      return;
    }

    if (action !== "save-skill" || !skillPost) {
      return;
    }

    const form = button.closest(".dashboard-card");
    const message = getFormMessage(button);
    const title = getFormValue(form, "title");
    const category = getFormValue(form, "category");
    const description = getFormValue(form, "description");
    const maxPeoplePerSession = Number(getFormValue(form, "maxPeoplePerSession"));
    const sessionLengthMinutes = Number(getFormValue(form, "sessionLengthMinutes"));
    const availableDates = parseDates(getFormValue(form, "availableDates"));
    const cardImageUrl = getFormValue(form, "cardImageUrl");
    const removedBookedDates = (skillPost.availableDates || []).filter((dateValue) => {
      return !availableDates.includes(dateValue) && Number(getAvailabilityCounts(skillPost, state.availabilityMap)[dateValue]) > 0;
    });

    message.textContent = "";

    if (!title || title.length < 5 || title.length > 80) {
      message.textContent = "Title must be between 5 and 80 characters.";
      return;
    }

    if (!CATEGORY_OPTIONS.some((option) => option.value === category)) {
      message.textContent = "Choose a category.";
      return;
    }

    if (!description || description.length < 20 || description.length > 500) {
      message.textContent = "Description must be between 20 and 500 characters.";
      return;
    }

    if (!Number.isInteger(maxPeoplePerSession) || maxPeoplePerSession < 1 || maxPeoplePerSession > 100) {
      message.textContent = "People per session must be between 1 and 100.";
      return;
    }

    if (!Number.isInteger(sessionLengthMinutes) || sessionLengthMinutes < 15 || sessionLengthMinutes > 480) {
      message.textContent = "Session length must be between 15 and 480 minutes.";
      return;
    }

    if (!availableDates.length || availableDates.some((dateValue) => Number.isNaN(new Date(dateValue).getTime()))) {
      message.textContent = "Add at least one valid available date.";
      return;
    }

    if (removedBookedDates.length) {
      message.textContent = "You cannot remove dates that already have bookings.";
      return;
    }

    const imageValidationMessage = validateImageUrl(cardImageUrl);
    if (imageValidationMessage) {
      message.textContent = imageValidationMessage;
      return;
    }

    setButtonBusy(button, "Saving...");

    try {
      const { updateSkillInDb } = await import("./skills-store.js");
      const updatedSkill = await updateSkillInDb(getSkillIdentifier(skillPost), {
        title,
        category,
        description,
        maxPeoplePerSession,
        sessionLengthMinutes,
        availableDates,
        cardImageUrl
      }, state.user.uid);

      if (window.ElevateSkills?.updateLocalSkill) {
        window.ElevateSkills.updateLocalSkill(updatedSkill);
      }

      renderDashboard();
    } catch (error) {
      console.error("Unable to save skill.", error);
      message.textContent = error?.message || "We couldn't save that skill right now.";
    } finally {
      resetButton(button);
    }
  });

  userRequestsContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const request = findRequest(button.dataset.id);

    if (action === "edit-request" && request) {
      replaceCardWithForm(userRequestsContainer, request.id, buildRequestEditForm(request));
      return;
    }

    if (action === "cancel-edit") {
      renderRequestsSection();
      return;
    }

    if (action === "delete-request" && request) {
      if (!window.confirm("Delete this request?")) {
        return;
      }

      setButtonBusy(button, "Deleting...");

      try {
        const { deleteRequestFromDb } = await import("./requests-store.js");
        await deleteRequestFromDb(request.id, state.user.uid);
        state.requests = state.requests.filter((item) => item.id !== request.id);
        renderDashboard();
      } catch (error) {
        console.error("Unable to delete request.", error);
        window.alert(error?.message || "We couldn't delete that request right now.");
        resetButton(button);
      }
      return;
    }

    if (action !== "save-request" || !request) {
      return;
    }

    const form = button.closest(".dashboard-card");
    const message = getFormMessage(button);
    const title = getFormValue(form, "title");
    const category = getFormValue(form, "category");
    const description = getFormValue(form, "description");
    const preferredFormat = getFormValue(form, "preferredFormat");
    const timeline = getFormValue(form, "timeline");
    const sessionLengthMinutes = Number(getFormValue(form, "sessionLengthMinutes"));
    const cardImageUrl = getFormValue(form, "cardImageUrl");

    message.textContent = "";

    if (!title || title.length < 5 || title.length > 80) {
      message.textContent = "Title must be between 5 and 80 characters.";
      return;
    }

    if (!CATEGORY_OPTIONS.some((option) => option.value === category)) {
      message.textContent = "Choose a category.";
      return;
    }

    if (!description || description.length < 25 || description.length > 600) {
      message.textContent = "Description must be between 25 and 600 characters.";
      return;
    }

    if (!REQUEST_FORMAT_OPTIONS.some((option) => option.value === preferredFormat)) {
      message.textContent = "Choose a preferred format.";
      return;
    }

    if (!REQUEST_TIMELINE_OPTIONS.some((option) => option.value === timeline)) {
      message.textContent = "Choose a timeline.";
      return;
    }

    if (!Number.isInteger(sessionLengthMinutes) || sessionLengthMinutes < 15 || sessionLengthMinutes > 480) {
      message.textContent = "Session length must be between 15 and 480 minutes.";
      return;
    }

    const imageValidationMessage = validateImageUrl(cardImageUrl);
    if (imageValidationMessage) {
      message.textContent = imageValidationMessage;
      return;
    }

    setButtonBusy(button, "Saving...");

    try {
      const { updateRequestInDb } = await import("./requests-store.js");
      const updatedRequest = await updateRequestInDb(request.id, {
        title,
        category,
        description,
        preferredFormat,
        timeline,
        sessionLengthMinutes,
        cardImageUrl
      }, state.user.uid);
      state.requests = state.requests.map((item) => item.id === request.id ? updatedRequest : item);
      renderDashboard();
    } catch (error) {
      console.error("Unable to save request.", error);
      message.textContent = error?.message || "We couldn't save that request right now.";
    } finally {
      resetButton(button);
    }
  });

  await Promise.all([
    waitForAuthReady(),
    waitForProfilesReady(),
    window.ElevateSkills?.ready ? window.ElevateSkills.ready() : Promise.resolve()
  ]);

  state.user = getCurrentUser();

  if (!state.user) {
    renderGuestDashboard();
    return;
  }

  state.profile = getUserProfile(state.user.uid);

  try {
    const { listBookingsForUserFromDb } = await import("./bookings-store.js");
    state.bookings = await listBookingsForUserFromDb(state.user.uid);
  } catch (error) {
    console.error("Unable to load dashboard bookings.", error);
    state.bookingsError = "We couldn't load your bookings right now.";
  }

  try {
    const { listRequestsFromDb } = await import("./requests-store.js");
    state.requests = (await listRequestsFromDb()).filter((request) => request.userId === state.user.uid);
  } catch (error) {
    console.error("Unable to load dashboard requests.", error);
    state.requestsError = "We couldn't load your requests right now.";
  }

  try {
    const { listSkillAvailabilityFromDb } = await import("./skill-availability-store.js");
    const availabilityEntries = await listSkillAvailabilityFromDb();
    state.availabilityMap = availabilityEntries.reduce((availabilityMap, entry) => {
      availabilityMap[String(entry.skillId ?? entry.id)] = entry;
      return availabilityMap;
    }, {});
  } catch (error) {
    console.error("Unable to load skill availability for dashboard.", error);
    state.availabilityMap = {};
  }

  renderDashboard();
});
