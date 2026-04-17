import { getCurrentUser, waitForAuthReady } from "./auth-state.js";
import { buildProfileDisplayName, getUserProfile } from "./user-profile.js";

document.addEventListener("DOMContentLoaded", () => {
  const cardGrid = document.getElementById("cardGrid");
  const resultsCount = document.getElementById("exploreResultsCount");
  const categoryFilter = document.getElementById("exploreCategoryFilter");
  const sortSelect = document.getElementById("exploreSort");

  const dialog = document.getElementById("skillDialog");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogCreatedBy = document.getElementById("dialogCreatedBy");
  const dialogCategory = document.getElementById("dialogCategory");
  const dialogSessionDetails = document.getElementById("dialogSessionDetails");
  const dialogAvailableDates = document.getElementById("dialogAvailableDates");
  const dialogDescription = document.getElementById("dialogDescription");
  const dialogImage = document.getElementById("dialogImage");
  const bookingDateSelect = document.getElementById("bookingDateSelect");
  const bookingStatusMessage = document.getElementById("bookingStatusMessage");
  const bookSessionButton = document.getElementById("bookSessionButton");
  const closeDialog = document.getElementById("closeDialog");

  let activeSkill = null;
  let skillPosts = [];
  let bookings = [];
  let skillAvailabilityMap = {};
  let exploreLoadError = "";
  let bookingsLoadError = "";

  if (
    !categoryFilter ||
    !sortSelect ||
    !cardGrid ||
    !resultsCount ||
    !dialog ||
    !dialogTitle ||
    !dialogCreatedBy ||
    !dialogCategory ||
    !dialogSessionDetails ||
    !dialogAvailableDates ||
    !dialogDescription ||
    !dialogImage ||
    !bookingDateSelect ||
    !bookingStatusMessage ||
    !bookSessionButton ||
    !closeDialog
  ) {
    return;
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

  function formatAvailableDate(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function loadSkillPosts() {
    if (
      window.ElevateSkills &&
      typeof window.ElevateSkills.getSkills === "function"
    ) {
      return window.ElevateSkills.getSkills();
    }

    return [];
  }

  function getSkillImageUrl(skillPost) {
    if (
      window.ElevateSkills &&
      typeof window.ElevateSkills.getResolvedSkillImage === "function"
    ) {
      return window.ElevateSkills.getResolvedSkillImage(skillPost);
    }

    return skillPost?.cardImageUrl || "";
  }

  function getBookingsForSkillDate(skillId, dateValue) {
    return bookings.filter((booking) => {
      return booking.skillId === skillId && booking.dateValue === dateValue;
    });
  }

  function getSeatLimit(skillPost) {
    const seatLimit = Number(skillPost.maxPeoplePerSession);
    return Number.isInteger(seatLimit) && seatLimit > 0 ? seatLimit : null;
  }

  function getRemainingSeats(skillPost, dateValue) {
    const seatLimit = getSeatLimit(skillPost);

    if (!seatLimit) {
      return null;
    }

    const reservedSeats =
      Number(skillAvailabilityMap[String(skillPost.id)]?.bookingCounts?.[dateValue]) || 0;

    return Math.max(seatLimit - reservedSeats, 0);
  }

  function getCurrentBookingForUser(skillId, userId) {
    if (!userId) {
      return null;
    }

    return bookings.find((booking) => {
      return booking.skillId === skillId && booking.userId === userId;
    }) || null;
  }

  function isOwnSkillPost(skillPost, user) {
    return Boolean(user?.uid && skillPost?.creatorUserId === user.uid);
  }

  function buildBookingOptionLabel(skillPost, dateValue) {
    const remainingSeats = getRemainingSeats(skillPost, dateValue);

    if (remainingSeats === null) {
      return `${formatAvailableDate(dateValue)} - Open session`;
    }

    const seatLabel = remainingSeats === 1 ? "1 seat left" : `${remainingSeats} seats left`;
    return `${formatAvailableDate(dateValue)} - ${seatLabel}`;
  }

  function updateBookingStatus(message, tone = "") {
    bookingStatusMessage.textContent = message;
    bookingStatusMessage.dataset.tone = tone;
  }

  function resetDialogState() {
    activeSkill = null;
    bookingDateSelect.innerHTML = "";
    bookingDateSelect.disabled = true;
    bookSessionButton.disabled = true;
    updateBookingStatus("");
    dialogImage.removeAttribute("src");
    dialogImage.alt = "";
    dialogImage.hidden = true;
  }

  function syncBookingControls(skillPost) {
    const currentUser = getCurrentUser();
    const existingBooking = currentUser
      ? getCurrentBookingForUser(skillPost.id, currentUser.uid)
      : null;

    bookingDateSelect.innerHTML = "";

    if (isOwnSkillPost(skillPost, currentUser)) {
      bookingDateSelect.disabled = true;
      bookSessionButton.disabled = true;
      bookSessionButton.textContent = "Own Session";
      updateBookingStatus("You can't book your own session.", "info");
      return;
    }

    if (!skillPost.availableDates?.length) {
      bookingDateSelect.disabled = true;
      bookSessionButton.disabled = true;
      bookSessionButton.textContent = currentUser ? "Book Session" : "Log In to Book";
      updateBookingStatus("This instructor has not shared booking dates yet.", "info");
      return;
    }

    skillPost.availableDates.forEach((dateValue) => {
      const option = document.createElement("option");
      option.value = dateValue;
      option.textContent = buildBookingOptionLabel(skillPost, dateValue);
      bookingDateSelect.appendChild(option);
    });

    if (existingBooking && skillPost.availableDates.includes(existingBooking.dateValue)) {
      bookingDateSelect.value = existingBooking.dateValue;
    }

    bookingDateSelect.disabled = false;
    bookSessionButton.textContent = currentUser ? "Book Session" : "Log In to Book";
    updateBookingAvailabilityMessage(skillPost);
  }

  function updateBookingAvailabilityMessage(skillPost) {
    const selectedDate = bookingDateSelect.value;
    const currentUser = getCurrentUser();

    if (!selectedDate) {
      bookSessionButton.disabled = true;
      updateBookingStatus("Choose a date to continue.", "info");
      return;
    }

    const existingBooking = currentUser
      ? getCurrentBookingForUser(skillPost.id, currentUser.uid)
      : null;

    if (!currentUser) {
      bookSessionButton.disabled = false;
      updateBookingStatus("Choose a date, then continue to login or signup to book.", "info");
      return;
    }

    if (bookingsLoadError) {
      bookSessionButton.disabled = true;
      updateBookingStatus(bookingsLoadError, "error");
      return;
    }

    if (isOwnSkillPost(skillPost, currentUser)) {
      bookSessionButton.disabled = true;
      updateBookingStatus("You can't book your own session.", "info");
      return;
    }

    if (existingBooking) {
      bookSessionButton.disabled = true;
      updateBookingStatus(
        `You're already booked for ${formatAvailableDate(existingBooking.dateValue)}.`,
        "success"
      );
      return;
    }

    const remainingSeats = getRemainingSeats(skillPost, selectedDate);

    if (remainingSeats === 0) {
      bookSessionButton.disabled = true;
      updateBookingStatus("That session is full. Please choose another date.", "error");
      return;
    }

    bookSessionButton.disabled = false;

    if (remainingSeats === null) {
      updateBookingStatus("This session is open for booking.", "info");
      return;
    }

    updateBookingStatus(
      remainingSeats === 1 ? "1 seat is still available." : `${remainingSeats} seats are still available.`,
      "info"
    );
  }

  function createSkillCard(skillPost) {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.dataset.id = skillPost.id;
    const resolvedImageUrl = getSkillImageUrl(skillPost);

    if (resolvedImageUrl) {
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "skill-card-media";

      const image = document.createElement("img");
      image.className = "skill-card-image";
      image.src = resolvedImageUrl;
      image.alt = `${skillPost.title || "Skill"} preview`;

      imageWrapper.appendChild(image);
      card.appendChild(imageWrapper);
    }

    const content = document.createElement("div");
    content.className = "skill-card-content";

    const title = document.createElement("h4");
    title.className = "skill-post-title";
    title.textContent = skillPost.title || "Untitled Skill";

    const createdBy = document.createElement("p");
    createdBy.className = "skill-post-meta";
    createdBy.textContent = `Created by ${skillPost.createdBy || "Elevate Community"}`;

    const category = document.createElement("span");
    category.className = "skill-post-category";
    category.textContent =
      window.ElevateSkills &&
      typeof window.ElevateSkills.formatCategory === "function"
        ? window.ElevateSkills.formatCategory(skillPost.category)
        : skillPost.category || "Uncategorized";

    const description = document.createElement("p");
    description.className = "skill-post-description";
    description.textContent =
      skillPost.description || "No description provided yet.";

    const sessionMeta = document.createElement("p");
    sessionMeta.className = "skill-post-meta";
    sessionMeta.textContent = `${skillPost.maxPeoplePerSession || "Open"} people per session - ${formatSessionLength(skillPost.sessionLengthMinutes)}`;

    const nextAvailableDate = document.createElement("p");
    nextAvailableDate.className = "skill-post-meta";
    nextAvailableDate.textContent = skillPost.availableDates?.length
      ? `Next date: ${formatAvailableDate(skillPost.availableDates[0])}`
      : "Dates coming soon";

    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "skill-card-button";
    viewButton.textContent = "View Session";

    content.append(
      title,
      createdBy,
      category,
      description,
      sessionMeta,
      nextAvailableDate,
      viewButton
    );
    card.appendChild(content);
    return card;
  }

  function renderSkillPosts(skillPosts) {
    cardGrid.innerHTML = "";

    if (exploreLoadError && !skillPosts.length) {
      const emptyState = document.createElement("div");
      emptyState.className = "skill-post-card skill-post-card-empty";
      emptyState.innerHTML = `
        <h4>Skills unavailable</h4>
        <p>${exploreLoadError}</p>
      `;

      cardGrid.appendChild(emptyState);
      resultsCount.textContent = "Unable to load skills";
      return;
    }

    if (!skillPosts.length) {
      const emptyState = document.createElement("div");
      emptyState.className = "skill-post-card skill-post-card-empty";
      emptyState.innerHTML = `
        <h4>No sessions available</h4>
        <p>No skills are ready to display right now.</p>
      `;

      cardGrid.appendChild(emptyState);
      resultsCount.textContent = "No sessions available";
      return;
    }

    skillPosts.forEach((skillPost) => {
      cardGrid.appendChild(createSkillCard(skillPost));
    });

    resultsCount.textContent = `${skillPosts.length} skill post${
      skillPosts.length === 1 ? "" : "s"
    } available`;
  }

  window.ExploreSkills = {
    getSkillPosts() {
      return [...skillPosts];
    },
    renderSkillPosts
  };

  document.addEventListener("click", (event) => {
    const card = event.target.closest(".skill-card");
    if (!card) return;

    const id = card.dataset.id;
    const selectedSkill = skillPosts.find((skillPost) => String(skillPost.id) === id);

    if (!selectedSkill) return;

    activeSkill = selectedSkill;

    dialogTitle.textContent = selectedSkill.title;
    dialogCreatedBy.textContent = `Instructor: ${selectedSkill.createdBy || "Elevate Community"}`;
    dialogCategory.textContent = `Category: ${
      window.ElevateSkills &&
      typeof window.ElevateSkills.formatCategory === "function"
        ? window.ElevateSkills.formatCategory(selectedSkill.category)
        : selectedSkill.category || "Uncategorized"
    }`;
    dialogSessionDetails.textContent = `Session details: ${
      selectedSkill.maxPeoplePerSession || "Open"
    } people per session - ${formatSessionLength(selectedSkill.sessionLengthMinutes)}`;
    dialogAvailableDates.replaceChildren();

    const datesHeading = document.createElement("strong");
    datesHeading.textContent = "Available Dates";
    dialogAvailableDates.appendChild(datesHeading);

    if (selectedSkill.availableDates?.length) {
      const datesList = document.createElement("ul");

      selectedSkill.availableDates.forEach((dateValue) => {
        const item = document.createElement("li");
        item.textContent = buildBookingOptionLabel(selectedSkill, dateValue);
        datesList.appendChild(item);
      });

      dialogAvailableDates.appendChild(datesList);
    } else {
      const emptyDatesMessage = document.createElement("p");
      emptyDatesMessage.textContent = "Dates will be shared later.";
      dialogAvailableDates.appendChild(emptyDatesMessage);
    }

    dialogDescription.textContent = selectedSkill.description;

    const resolvedImageUrl = getSkillImageUrl(selectedSkill);

    if (resolvedImageUrl) {
      dialogImage.src = resolvedImageUrl;
      dialogImage.alt = `${selectedSkill.title || "Skill"} preview`;
      dialogImage.hidden = false;
    } else {
      dialogImage.removeAttribute("src");
      dialogImage.alt = "";
      dialogImage.hidden = true;
    }

    syncBookingControls(selectedSkill);
    dialog.showModal();
  });

  bookingDateSelect.addEventListener("change", () => {
    if (!activeSkill) {
      return;
    }

    updateBookingAvailabilityMessage(activeSkill);
  });

  bookSessionButton.addEventListener("click", async () => {
    if (!activeSkill) {
      return;
    }

    await waitForAuthReady();

    const user = getCurrentUser();

    if (!user) {
      updateBookingStatus("Redirecting you to login so you can finish booking.", "info");
      window.location.href = "login.html";
      return;
    }

    if (isOwnSkillPost(activeSkill, user)) {
      updateBookingStatus("You can't book your own session.", "error");
      syncBookingControls(activeSkill);
      return;
    }

    const selectedDate = bookingDateSelect.value;

    if (!selectedDate) {
      updateBookingStatus("Choose a session date before booking.", "error");
      return;
    }

    const remainingSeats = getRemainingSeats(activeSkill, selectedDate);

    if (remainingSeats === 0) {
      updateBookingStatus("That session is already full.", "error");
      syncBookingControls(activeSkill);
      return;
    }

    const profile = getUserProfile(user.uid);
    const learnerName = buildProfileDisplayName(user, profile);
    const existingUserBookings = bookings.filter((booking) => {
      return booking.skillId === activeSkill.id && booking.userId === user.uid;
    });

    if (existingUserBookings.length) {
      updateBookingStatus(
        `You're already booked for ${formatAvailableDate(existingUserBookings[0].dateValue)}.`,
        "success"
      );
      syncBookingControls(activeSkill);
      return;
    }

    const newBooking = {
      skillId: activeSkill.id,
      userId: user.uid,
      learnerName,
      dateValue: selectedDate,
      maxPeoplePerSession: getSeatLimit(activeSkill),
      creatorUserId: activeSkill.creatorUserId || ""
    };

    try {
      bookSessionButton.disabled = true;
      updateBookingStatus("Saving your booking...", "info");

      const { replaceBookingInDb } = await import("./bookings-store.js");
      const savedBooking = await replaceBookingInDb(existingUserBookings, newBooking);
      bookings = [
        savedBooking,
        ...bookings.filter((booking) => {
          return !(booking.skillId === activeSkill.id && booking.userId === user.uid);
        })
      ];

      const { listSkillAvailabilityFromDb } = await import("./skill-availability-store.js");
      const availabilityEntries = await listSkillAvailabilityFromDb();
      skillAvailabilityMap = availabilityEntries.reduce((availabilityMap, entry) => {
        availabilityMap[String(entry.skillId ?? entry.id)] = entry;
        return availabilityMap;
      }, {});

      syncBookingControls(activeSkill);
      updateBookingStatus(
        `Booked for ${formatAvailableDate(selectedDate)}. You're all set.`,
        "success"
      );
    } catch (error) {
      console.error("Unable to save booking.", error);
      syncBookingControls(activeSkill);
      updateBookingStatus(
        error?.message || "We couldn't save your booking right now. Please try again.",
        "error"
      );
    }
  });

  closeDialog.addEventListener("click", () => {
    resetDialogState();
    dialog.close();
  });

  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const clickedInsideDialog =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!clickedInsideDialog) {
      resetDialogState();
      dialog.close();
    }
  });

  async function initializeBookings() {
    bookingsLoadError = "";
    const currentUser = getCurrentUser();

    try {
      const { listSkillAvailabilityFromDb } = await import("./skill-availability-store.js");
      const availabilityEntries = await listSkillAvailabilityFromDb();
      skillAvailabilityMap = availabilityEntries.reduce((availabilityMap, entry) => {
        availabilityMap[String(entry.skillId ?? entry.id)] = entry;
        return availabilityMap;
      }, {});

      if (!currentUser) {
        bookings = [];
        return;
      }

      const { listBookingsForUserFromDb } = await import("./bookings-store.js");
      bookings = await listBookingsForUserFromDb(currentUser.uid);
    } catch (error) {
      console.error("Unable to load bookings from Firestore.", error);
      bookings = [];
      skillAvailabilityMap = {};
      bookingsLoadError = "We couldn't load booking availability right now.";
    }
  }

  Promise.all([
    window.ElevateSkills?.ready ? window.ElevateSkills.ready() : Promise.resolve(),
    initializeBookings()
  ]).then(() => {
    skillPosts = loadSkillPosts();
    exploreLoadError =
      window.ElevateSkills &&
      typeof window.ElevateSkills.getLoadError === "function"
        ? window.ElevateSkills.getLoadError()
        : "";
    renderSkillPosts(skillPosts);
    window.dispatchEvent(new CustomEvent("explore-skills-ready"));

    window.addEventListener("auth-state-changed", () => {
      initializeBookings().then(() => {
        skillPosts = loadSkillPosts();
        renderSkillPosts(skillPosts);
        window.dispatchEvent(new CustomEvent("explore-skills-ready"));

        if (activeSkill && dialog.open) {
          syncBookingControls(activeSkill);
        }
      });
    });
  });
});
