document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("exploreSearchButton");
  const searchInput = document.getElementById("exploreSearchInput");
  const categoryFilter = document.getElementById("exploreCategoryFilter");
  const sortSelect = document.getElementById("exploreSort");
  const skillsGrid = document.getElementById("skillsGrid");
  const resultsCount = document.getElementById("exploreResultsCount");

  if (
    !searchButton ||
    !searchInput ||
    !categoryFilter ||
    !sortSelect ||
    !skillsGrid ||
    !resultsCount
  ) {
    return;
  }

  // Example postings just to simulate and test that the rendering of skills works fine

  const localSkillPosts = [
    {
      title: "Intro to Public Speaking",
      instructor: "Brandon Delgado",
      category: "Communication",
      description:
        "Build confidence, structure your message, and practice speaking clearly in front of a group."
    },
    {
      title: "Design Basics for Beginners",
      instructor: "Ariana Flores",
      category: "Design",
      description:
        "Learn core design principles like hierarchy, spacing, and color so your work feels intentional."
    },
    {
      title: "Personal Budgeting 101",
      instructor: "Marcus Reed",
      category: "Business",
      description:
        "Create a simple monthly budget, track spending, and make smarter decisions with your money."
    }
  ];

  function loadSkillPosts() {
    return localSkillPosts;
  }

  function createSkillCard(skillPost) {
    const card = document.createElement("article");
    card.className = "skill-post-card";

    const title = document.createElement("h4");
    title.className = "skill-post-title";
    title.textContent = skillPost.title || "Untitled Skill";

    const instructor = document.createElement("p");
    instructor.className = "skill-post-meta";
    instructor.textContent = `Taught by ${skillPost.instructor || "Unknown instructor"}`;

    const category = document.createElement("span");
    category.className = "skill-post-category";
    category.textContent = skillPost.category || "Uncategorized";

    card.append(title, instructor, category);
    return card;
  }

  function renderSkillPosts(skillPosts) {
    skillsGrid.innerHTML = "";

    if (!skillPosts.length) {
      const emptyState = document.createElement("article");
      emptyState.className = "skill-post-card skill-post-card-empty";
      emptyState.innerHTML = `
        <h4>No sessions available</h4>
        <p>No skills are ready to display right now.</p>
      `;

      skillsGrid.appendChild(emptyState);
      resultsCount.textContent = "There are no posts available 🫠";
      return;
    }

    skillPosts.forEach((skillPost) => {
      skillsGrid.appendChild(createSkillCard(skillPost));
    });

    resultsCount.textContent = `${skillPosts.length} skill post${
      skillPosts.length === 1 ? "" : "s"
    } available`;
  }

  const skillPosts = loadSkillPosts();
  renderSkillPosts(skillPosts);

  // Search, filter, and sort behavior will be connected in later tasks.
});
