document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("exploreSearchButton");
  const searchInput = document.getElementById("exploreSearchInput");
  const categoryFilter = document.getElementById("exploreCategoryFilter");

  if (!searchButton || !searchInput || !categoryFilter) {
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

  function filterSkillPostsByCategories(skillPosts, selectedCategories) {
    if (!selectedCategories.length) {
      return skillPosts;
    }

    return skillPosts.filter((skillPost) => {
      return selectedCategories.includes(skillPost.category);
    });
  }

  function getSelectedCategories() {
    return Array.from(
      categoryFilter.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);
  }

  function applyExploreFilters() {
    if (!window.ExploreSkills) {
      return;
    }

    const allSkillPosts = window.ExploreSkills.getSkillPosts();
    const searchFilteredSkillPosts = filterSkillPostsBySearch(
      allSkillPosts,
      searchInput.value
    );
    const fullyFilteredSkillPosts = filterSkillPostsByCategories(
      searchFilteredSkillPosts,
      getSelectedCategories()
    );

    window.ExploreSkills.renderSkillPosts(fullyFilteredSkillPosts);
  }

  searchButton.addEventListener("click", applyExploreFilters);
  categoryFilter.addEventListener("change", applyExploreFilters);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyExploreFilters();
    }
  });
});
