import { getCurrentUser, waitForAuthReady } from "./auth-state.js";
import { buildProfileDisplayName, getUserProfile, ready as waitForProfilesReady } from "./user-profile.js";

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

  return category || "Uncategorized";
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

function buildCardShell(extraClass = "") {
  const card = document.createElement("article");
  card.className = `dashboard-card${extraClass ? ` ${extraClass}` : ""}`;
  return card;
}

function buildEmptyCard(titleText, message) {
  const card = buildCardShell("dashboard-card-empty");
  card.innerHTML = `
    <h4>${titleText}</h4>
    <p>${message}</p>
  `;
  return card;
}

function buildUserInfoCard(user, profile, displayName) {
  const card = buildCardShell();
  card.innerHTML = `
    <p class="dashboard-card-eyebrow">Account</p>
    <h4>${displayName}</h4>
    <p>Email: ${user.email || "Not provided"}</p>
    <p>Username: ${profile?.username || "Not set"}</p>
    <p>Name: ${
      [profile?.firstName, profile?.lastName]
        .filter((value) => typeof value === "string" && value.trim() !== "")
        .join(" ") || user.displayName || "Not provided"
    }</p>
    <p>City: ${profile?.city || "Not set"}</p>
    <p>Goal: ${profile?.accountGoal || "Not set"}</p>
    <p>Interests: ${
      Array.isArray(profile?.interests) && profile.interests.length
        ? profile.interests.join(", ")
        : "Not set"
    }</p>
  `;
  return card;
}

function buildBookingCard(booking, skillPost) {
  const card = buildCardShell();
  card.innerHTML = `
    <p class="dashboard-card-eyebrow">Booked Session</p>
    <h4>${skillPost?.title || "Booked session"}</h4>
    <p>Instructor: ${skillPost?.createdBy || "Elevate Community"}</p>
    <p>Category: ${formatCategory(skillPost?.category)}</p>
    <p>Session date: ${formatAvailableDate(booking.dateValue)}</p>
    <p>Session length: ${formatSessionLength(skillPost?.sessionLengthMinutes)}</p>
    <p>Booked on: ${formatAvailableDate(booking.bookedAt)}</p>
  `;
  return card;
}

function buildSkillPostCard(skillPost) {
  const card = buildCardShell();
  const resolvedImageUrl = getResolvedSkillImage(skillPost);
  card.innerHTML = `
    ${resolvedImageUrl ? `<img class="dashboard-card-image" src="${resolvedImageUrl}" alt="${skillPost?.title || "Skill"} preview">` : ""}
    <p class="dashboard-card-eyebrow">Teach Post</p>
    <h4>${skillPost?.title || "Untitled skill"}</h4>
    <p>Category: ${formatCategory(skillPost?.category)}</p>
    <p>${skillPost?.description || "No description provided yet."}</p>
    <p>Seats per session: ${skillPost?.maxPeoplePerSession || "Open"}</p>
    <p>Session length: ${formatSessionLength(skillPost?.sessionLengthMinutes)}</p>
    <p>${
      skillPost?.availableDates?.length
        ? `Next date: ${formatAvailableDate(skillPost.availableDates[0])}`
        : "Dates coming soon"
    }</p>
  `;
  return card;
}

function buildRequestCard(request) {
  const card = buildCardShell();
  card.innerHTML = `
    <p class="dashboard-card-eyebrow">Request</p>
    <h4>${request?.title || "Untitled request"}</h4>
    <p>Category: ${formatCategory(request?.category)}</p>
    <p>${request?.description || "No description provided yet."}</p>
    <p>Preferred format: ${request?.preferredFormat || "Not specified"}</p>
    <p>Timeline: ${request?.timeline || "Not specified"}</p>
    <p>Requested on: ${formatAvailableDate(request?.createdAtMs || request?.createdAt)}</p>
  `;
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

  await Promise.all([
    waitForAuthReady(),
    waitForProfilesReady(),
    window.ElevateSkills?.ready ? window.ElevateSkills.ready() : Promise.resolve()
  ]);

  const user = getCurrentUser();

  if (!user) {
    heading.textContent = "Your dashboard is waiting.";
    intro.textContent = "Log in to see your profile, bookings, skill posts, and requests in one place.";
    bookingSummary.textContent = "Log in to view your bookings.";
    userPostsSummary.textContent = "Log in to view the skill posts you have created.";
    userRequestsSummary.textContent = "Log in to view the requests you have posted.";

    renderCards(
      pendingContainer,
      [],
      buildBookingCard,
      "No upcoming sessions",
      "You need to log in before we can show your bookings."
    );
    renderCards(
      completedContainer,
      [],
      buildBookingCard,
      "No completed sessions",
      "Completed sessions will appear here after you log in."
    );
    renderCards(
      userInfoContainer,
      [],
      buildUserInfoCard,
      "Profile unavailable",
      "Log in to view your profile details."
    );
    renderCards(
      userPostsContainer,
      [],
      buildSkillPostCard,
      "No skill posts yet",
      "Log in to view the sessions you have shared."
    );
    renderCards(
      userRequestsContainer,
      [],
      buildRequestCard,
      "No requests yet",
      "Log in to view the requests you have posted."
    );
    return;
  }

  const profile = getUserProfile(user.uid);
  const displayName = buildProfileDisplayName(user, profile);

  heading.textContent = `Welcome back, ${displayName}.`;
  intro.textContent = "Here’s a snapshot of the sessions you booked, the sessions you posted, and the requests you’ve shared.";

  let bookings = [];
  let requests = [];
  let bookingsError = "";
  let requestsError = "";

  try {
    const { listBookingsForUserFromDb } = await import("./bookings-store.js");
    bookings = await listBookingsForUserFromDb(user.uid);
  } catch (error) {
    console.error("Unable to load dashboard bookings.", error);
    bookingsError = "We couldn't load your bookings right now.";
  }

  try {
    const { listRequestsFromDb } = await import("./requests-store.js");
    requests = (await listRequestsFromDb()).filter((request) => request.userId === user.uid);
  } catch (error) {
    console.error("Unable to load dashboard requests.", error);
    requestsError = "We couldn't load your requests right now.";
  }

  const skillPosts = getSkillPosts();
  const userPosts = skillPosts
    .filter((skillPost) => skillPost?.creatorUserId === user.uid)
    .sort((firstPost, secondPost) => Number(secondPost.id) - Number(firstPost.id));

  const sortedBookings = bookings.slice().sort((firstBooking, secondBooking) => {
    return new Date(firstBooking.dateValue).getTime() - new Date(secondBooking.dateValue).getTime();
  });

  const now = Date.now();
  const pendingBookings = sortedBookings.filter((booking) => {
    return new Date(booking.dateValue).getTime() >= now;
  });
  const completedBookings = sortedBookings.filter((booking) => {
    return new Date(booking.dateValue).getTime() < now;
  });

  bookingSummary.textContent = bookingsError
    ? bookingsError
    : `${displayName}, you have ${pendingBookings.length} upcoming booking${
        pendingBookings.length === 1 ? "" : "s"
      } and ${completedBookings.length} completed booking${
        completedBookings.length === 1 ? "" : "s"
      }.`;

  userPostsSummary.textContent = `${displayName}, you have created ${userPosts.length} skill post${
    userPosts.length === 1 ? "" : "s"
  }.`;

  userRequestsSummary.textContent = requestsError
    ? requestsError
    : `${displayName}, you have posted ${requests.length} request${
        requests.length === 1 ? "" : "s"
      }.`;

  renderCards(
    userInfoContainer,
    [{ user, profile, displayName }],
    ({ user: currentUser, profile: currentProfile, displayName: currentDisplayName }) =>
      buildUserInfoCard(currentUser, currentProfile, currentDisplayName),
    "Profile unavailable",
    "We couldn't load your profile details."
  );

  if (bookingsError) {
    renderCards(
      pendingContainer,
      [],
      buildBookingCard,
      "Bookings unavailable",
      bookingsError
    );
    renderCards(
      completedContainer,
      [],
      buildBookingCard,
      "Bookings unavailable",
      bookingsError
    );
  } else {
    renderCards(
      pendingContainer,
      pendingBookings.map((booking) => ({
        booking,
        skillPost: skillPosts.find((skill) => String(skill.id) === String(booking.skillId))
      })),
      ({ booking, skillPost }) => buildBookingCard(booking, skillPost),
      "No upcoming sessions",
      "Your upcoming booked sessions will show here."
    );
    renderCards(
      completedContainer,
      completedBookings.map((booking) => ({
        booking,
        skillPost: skillPosts.find((skill) => String(skill.id) === String(booking.skillId))
      })),
      ({ booking, skillPost }) => buildBookingCard(booking, skillPost),
      "No completed sessions",
      "Completed sessions will appear here after you attend them."
    );
  }

  renderCards(
    userPostsContainer,
    userPosts,
    buildSkillPostCard,
    "No skill posts yet",
    "Create a session from the Teach page and it will appear here."
  );

  if (requestsError) {
    renderCards(
      userRequestsContainer,
      [],
      buildRequestCard,
      "Requests unavailable",
      requestsError
    );
  } else {
    renderCards(
      userRequestsContainer,
      requests,
      buildRequestCard,
      "No requests yet",
      "Post a skill request and it will appear here."
    );
  }
});
