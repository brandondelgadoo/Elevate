document.addEventListener("DOMContentLoaded", () => {
  const cardGrid = document.getElementById("cardGrid");
  const resultsCount = document.getElementById("exploreResultsCount");
  const categoryFilter = document.getElementById("exploreCategoryFilter");
  const sortSelect = document.getElementById("exploreSort");

  const dialog = document.getElementById("skillDialog");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogDescription = document.getElementById("dialogDescription");
  const closeDialog = document.getElementById("closeDialog");

  if (
    !categoryFilter ||
    !sortSelect ||
    !cardGrid ||
    !resultsCount ||
    !dialog ||
    !dialogTitle ||
    !dialogDescription ||
    !closeDialog
  ) {
    return;
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

    card.append(title, createdBy, category, description);
    return card;
  }

  function renderSkillPosts(skillPosts) {
    cardGrid.innerHTML = "";

    if (!skillPosts.length) {
      const emptyState = document.createElement("article");
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
    dialogDescription.textContent = selectedSkill.description;

    dialog.showModal();
  });

  closeDialog.addEventListener("click", () => {
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
      dialog.close();
    }
  });
});
