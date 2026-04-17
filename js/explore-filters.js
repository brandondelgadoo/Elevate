document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("exploreSearchButton");
  const searchInput = document.getElementById("exploreSearchInput");
  const categoryFilter = document.getElementById("exploreCategoryFilter");
  const sortSelect = document.getElementById("exploreSort");
  const clearFiltersButton = document.getElementById("clearExploreFiltersButton");

  if (!searchButton || !searchInput || !categoryFilter || !sortSelect || !clearFiltersButton) {
    return;
  }

  const initialSearchTerm = new URLSearchParams(window.location.search).get("q") || "";

  if (initialSearchTerm) {
    searchInput.value = initialSearchTerm;
  }

  function normalizeSearchValue(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenizeSearchValue(value) {
    const normalizedValue = normalizeSearchValue(value);

    return normalizedValue ? normalizedValue.split(" ") : [];
  }

  function getEditDistance(firstValue, secondValue) {
    const firstLength = firstValue.length;
    const secondLength = secondValue.length;
    const distances = Array.from({ length: firstLength + 1 }, () =>
      Array(secondLength + 1).fill(0)
    );

    for (let firstIndex = 0; firstIndex <= firstLength; firstIndex += 1) {
      distances[firstIndex][0] = firstIndex;
    }

    for (let secondIndex = 0; secondIndex <= secondLength; secondIndex += 1) {
      distances[0][secondIndex] = secondIndex;
    }

    for (let firstIndex = 1; firstIndex <= firstLength; firstIndex += 1) {
      for (let secondIndex = 1; secondIndex <= secondLength; secondIndex += 1) {
        const substitutionCost =
          firstValue[firstIndex - 1] === secondValue[secondIndex - 1] ? 0 : 1;

        distances[firstIndex][secondIndex] = Math.min(
          distances[firstIndex - 1][secondIndex] + 1,
          distances[firstIndex][secondIndex - 1] + 1,
          distances[firstIndex - 1][secondIndex - 1] + substitutionCost
        );
      }
    }

    return distances[firstLength][secondLength];
  }

  function isFuzzyTokenMatch(searchToken, candidateToken) {
    if (!searchToken || !candidateToken) {
      return false;
    }

    if (candidateToken.includes(searchToken) || searchToken.includes(candidateToken)) {
      return true;
    }

    if (Math.abs(searchToken.length - candidateToken.length) > 2) {
      return false;
    }

    const allowedDistance = searchToken.length <= 4 ? 1 : 2;

    return getEditDistance(searchToken, candidateToken) <= allowedDistance;
  }

  function matchesSearchTerm(searchTerm, searchFields) {
    const normalizedSearchTerm = normalizeSearchValue(searchTerm);

    if (!normalizedSearchTerm) {
      return true;
    }

    const normalizedFields = searchFields
      .map((field) => normalizeSearchValue(field))
      .filter(Boolean);

    if (
      normalizedFields.some((fieldValue) => fieldValue.includes(normalizedSearchTerm))
    ) {
      return true;
    }

    const searchTokens = tokenizeSearchValue(normalizedSearchTerm);
    const candidateTokens = normalizedFields.flatMap((fieldValue) =>
      tokenizeSearchValue(fieldValue)
    );

    return searchTokens.every((searchToken) => {
      return candidateTokens.some((candidateToken) =>
        isFuzzyTokenMatch(searchToken, candidateToken)
      );
    });
  }

  function filterSkillPostsBySearch(skillPosts, searchTerm) {
    const normalizedSearchTerm = normalizeSearchValue(searchTerm);

    if (!normalizedSearchTerm) {
      return skillPosts;
    }

    return skillPosts.filter((skillPost) => {
      const formattedCategory =
        window.ElevateSkills &&
        typeof window.ElevateSkills.formatCategory === "function"
          ? window.ElevateSkills.formatCategory(skillPost.category)
          : skillPost.category;

      return matchesSearchTerm(normalizedSearchTerm, [
        skillPost.title,
        skillPost.createdBy,
        skillPost.description,
        skillPost.category,
        formattedCategory,
      ]);
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
  window.addEventListener("explore-skills-ready", applyExploreFilters);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyExploreFilters();
    }
  });

  applyExploreFilters();
});
