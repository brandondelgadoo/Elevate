document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("exploreSearchButton");
  const searchInput = document.getElementById("exploreSearchInput");

  if (!searchButton || !searchInput) {
    return;
  }

  function filterSkillPostsBySearch(skillPosts, searchTerm) {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return skillPosts;
    }

    return skillPosts.filter((skillPost) => {
      const title = (skillPost.title || "").toLowerCase();
      const createdBy = (skillPost.createdBy || "").toLowerCase();

      return (
        title.includes(normalizedSearchTerm) ||
        createdBy.includes(normalizedSearchTerm)
      );
    });
  }

  function applySearchFilter() {
    if (!window.ExploreSkills) {
      return;
    }

    const allSkillPosts = window.ExploreSkills.getSkillPosts();
    const filteredSkillPosts = filterSkillPostsBySearch(
      allSkillPosts,
      searchInput.value,
    );

    window.ExploreSkills.renderSkillPosts(filteredSkillPosts);
  }

  searchButton.addEventListener("click", applySearchFilter);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applySearchFilter();
    }
  });
});
