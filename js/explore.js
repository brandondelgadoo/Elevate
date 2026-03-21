document.addEventListener("DOMContentLoaded", () => {
  const cardGrid = document.getElementById("cardGrid");
  const resultsCount = document.getElementById("exploreResultsCount");
  const categoryFilter = document.getElementById("exploreCategoryFilter");
  const sortSelect = document.getElementById("exploreSort");

  if (!categoryFilter || !sortSelect || !cardGrid || !resultsCount) {
    return;
  }

  function loadSkillPosts() {
    if (window.ElevateSkills && typeof window.ElevateSkills.getSkills === "function") {
      return window.ElevateSkills.getSkills();
    }

    return [];
  }

  function createSkillCard(skillPost) {
    const card = document.createElement("div");
    card.className = "skill-card";

    const title = document.createElement("h4");
    title.className = "skill-post-title";
    title.textContent = skillPost.title || "Untitled Skill";

    const createdBy = document.createElement("p");
    createdBy.className = "skill-post-meta";
    createdBy.textContent = `Created by ${skillPost.createdBy || "Elevate Community"}`;

    const category = document.createElement("span");
    category.className = "skill-post-category";
    category.textContent =
      window.ElevateSkills && typeof window.ElevateSkills.formatCategory === "function"
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
    renderSkillPosts
  };

  // Search, filter, and sort behavior will be connected in later tasks.
});
