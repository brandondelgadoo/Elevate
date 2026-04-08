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
  const closeDialog = document.getElementById("closeDialog");

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

  function createSkillCard(skillPost) {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.dataset.id = skillPost.id;
    if (skillPost.backgroundImageUrl) {
      card.classList.add("skill-card-with-image");
      card.style.backgroundImage = `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.85)), url("${skillPost.backgroundImageUrl}")`;
    }

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

    card.append(title, createdBy, category, description, sessionMeta, nextAvailableDate);
    return card;
  }

  function renderSkillPosts(skillPosts) {
    cardGrid.innerHTML = "";

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

  const skillPosts = loadSkillPosts();
  renderSkillPosts(skillPosts);

  window.ExploreSkills = {
    getSkillPosts() {
      return [...skillPosts];
    },
    renderSkillPosts,
  };

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".skill-card");
    if (!card) return;

    const id = Number(card.dataset.id);
    const selectedSkill = skillPosts.find((s) => s.id === id);

    if (!selectedSkill) return;

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
        item.textContent = formatAvailableDate(dateValue);
        datesList.appendChild(item);
      });

      dialogAvailableDates.appendChild(datesList);
    } else {
      const emptyDatesMessage = document.createElement("p");
      emptyDatesMessage.textContent = "Dates will be shared later.";
      dialogAvailableDates.appendChild(emptyDatesMessage);
    }
    dialogDescription.textContent = selectedSkill.description;
    if (selectedSkill.backgroundImageUrl) {
      dialog.style.backgroundImage = `linear-gradient(rgba(248, 250, 252, 0.94), rgba(248, 250, 252, 0.97)), url("${selectedSkill.backgroundImageUrl}")`;
      dialog.classList.add("skill-dialog-with-image");
    } else {
      dialog.style.backgroundImage = "";
      dialog.classList.remove("skill-dialog-with-image");
    }

    dialog.showModal();
  });

  closeDialog.addEventListener("click", () => {
    dialog.style.backgroundImage = "";
    dialog.classList.remove("skill-dialog-with-image");
    dialog.close();
  });

  dialog.addEventListener("click", (e) => {
    const rect = dialog.getBoundingClientRect();
    const clickedInsideDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!clickedInsideDialog) {
      dialog.style.backgroundImage = "";
      dialog.classList.remove("skill-dialog-with-image");
      dialog.close();
    }
  });
});
