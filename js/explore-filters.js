document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("exploreSearchButton");
  const searchInput = document.getElementById("exploreSearchInput");
  const categoryFilter = document.getElementById("exploreCategoryFilter");
  const sortSelect = document.getElementById("exploreSort");
  const clearFiltersButton = document.getElementById("clearExploreFiltersButton");

  if (!searchButton || !searchInput || !categoryFilter || !sortSelect || !clearFiltersButton) {
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

  function sortSkillPosts(skillPosts, sortValue) {
    const sortedSkillPosts = [...skillPosts];

    if (sortValue === "title-asc") {
      return sortedSkillPosts.sort((firstSkill, secondSkill) => {
        return firstSkill.title.localeCompare(secondSkill.title);
      });
    }

    if (sortValue === "title-desc") {
      return sortedSkillPosts.sort((firstSkill, secondSkill) => {
        return secondSkill.title.localeCompare(firstSkill.title);
      });
    }

    if (sortValue === "id-asc") {
      return sortedSkillPosts.sort((firstSkill, secondSkill) => {
        return firstSkill.id - secondSkill.id;
      });
    }

    if (sortValue === "creator-asc") {
      return sortedSkillPosts.sort((firstSkill, secondSkill) => {
        return (firstSkill.createdBy || "").localeCompare(secondSkill.createdBy || "");
      });
    }

    if (sortValue === "creator-desc") {
      return sortedSkillPosts.sort((firstSkill, secondSkill) => {
        return (secondSkill.createdBy || "").localeCompare(firstSkill.createdBy || "");
      });
    }

    return sortedSkillPosts.sort((firstSkill, secondSkill) => {
      return secondSkill.id - firstSkill.id;
    });
  }

  function applyExploreFilters() {
    if (!window.ExploreSkills) {
      return;
    }

    const allSkillPosts = window.ExploreSkills.getSkillPosts();
    const searchFilteredSkillPosts = filterSkillPostsBySearch(
      allSkillPosts,
      searchInput.value,
    );
    const fullyFilteredSkillPosts = filterSkillPostsByCategories(
      searchFilteredSkillPosts,
      getSelectedCategories()
    );
    const sortedSkillPosts = sortSkillPosts(
      fullyFilteredSkillPosts,
      sortSelect.value
    );

    window.ExploreSkills.renderSkillPosts(sortedSkillPosts);
  }

  function clearExploreFilters() {
    searchInput.value = "";
    sortSelect.value = "id-desc";

    categoryFilter
      .querySelectorAll('input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = false;
      });

    applyExploreFilters();
  }

  searchButton.addEventListener("click", applyExploreFilters);
  categoryFilter.addEventListener("change", applyExploreFilters);
  sortSelect.addEventListener("change", applyExploreFilters);
  clearFiltersButton.addEventListener("click", clearExploreFilters);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyExploreFilters();
    }
  });
});
