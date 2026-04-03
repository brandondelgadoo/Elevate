const STORAGE_KEY = "elevateCustomSkills";
const skills = [];

let nextId = 0;

function Skill(title, description, category, createdBy = "Elevate Community", id = null) {
  this.id = id ?? nextId++;
  this.createdBy = createdBy;
  this.title = title;
  this.description = description;
  this.category = category;
}

function createSkill(title, description, category, createdBy = "Elevate Community") {
  return new Skill(title, description, category, createdBy);
}

function formatCategory(category) {
  if (category === "tech") return "Technology";
  if (category === "fitness") return "Fitness";
  if (category === "music") return "Music";
  if (category === "art") return "Art";
  return category;
}

function normalizeSkill(rawSkill) {
  return new Skill(
    rawSkill.title,
    rawSkill.description,
    rawSkill.category,
    rawSkill.createdBy || "Elevate Community",
    Number(rawSkill.id)
  );
}

function loadCustomSkills() {
  try {
    const storedSkills = localStorage.getItem(STORAGE_KEY);

    if (!storedSkills) {
      return [];
    }

    const parsedSkills = JSON.parse(storedSkills);

    if (!Array.isArray(parsedSkills)) {
      return [];
    }

    return parsedSkills
      .filter((skill) => {
        return skill && skill.title && skill.description && skill.category;
      })
      .map(normalizeSkill);
  } catch (error) {
    console.error("Unable to load custom skills.", error);
    return [];
  }
}

function persistCustomSkills() {
  const customSkills = skills.filter((skill) => skill.isCustom);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customSkills));
}

function addSkill({ title, description, category, createdBy = "Elevate Community" }) {
  const newSkill = createSkill(title, description, category, createdBy);
  newSkill.isCustom = true;
  skills.push(newSkill);
  persistCustomSkills();
  return newSkill;
}

/* ---------------- DOM REFERENCES ---------------- */
const skillsContainer = document.querySelector("#skillsContainer");
const categoryFilter = document.querySelector("#categoryFilter");
const dialog = document.getElementById("skillDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogDescription = document.getElementById("dialogDescription");
const closeDialog = document.getElementById("closeDialog");

/* ---------------- MOCK DATA ---------------- */
const mockSkills = [
  createSkill(
    "Golf Coach",
    "Improve your swing, putting, and course strategy with personalized golf instruction.",
    "fitness",
    "Maya Thompson"
  ),
  createSkill(
    "Rocket League Coach",
    "Learn rotations, mechanics, and decision-making to rank up in Rocket League.",
    "tech",
    "Jordan Lee"
  ),
  createSkill(
    "Driving Teacher",
    "Practice safe driving, parking, highway skills, and road confidence.",
    "fitness"
  ),
  createSkill(
    "Beginner Guitar Lessons",
    "Learn chords, rhythm, and simple songs on acoustic or electric guitar.",
    "music",
    "Sofia Ramirez"
  ),
  createSkill(
    "Piano Lessons",
    "Understand basic piano technique, scales, and beginner-friendly songs.",
    "music",
    "Noah Bennett"
  ),
  createSkill(
    "Intro to Python Programming",
    "Learn variables, loops, functions, and problem-solving with Python.",
    "tech",
    "Avery Chen"
  ),
  createSkill(
    "JavaScript Tutor",
    "Get help understanding JavaScript fundamentals and building small projects.",
    "tech"
  ),
  createSkill(
    "Photography Basics",
    "Learn composition, lighting, and camera settings for better photos.",
    "art",
    "Isabella Cruz"
  ),
  createSkill(
    "Digital Art Mentor",
    "Explore sketching, coloring, and digital illustration techniques.",
    "art",
    "Kai Morgan"
  ),
  createSkill(
    "Painting Instructor",
    "Practice painting techniques with acrylics and improve color blending skills.",
    "art",
    "Lila Patel"
  ),
  createSkill(
    "Yoga Instructor",
    "Build flexibility, balance, and mindfulness through beginner yoga sessions.",
    "fitness",
    "Zoe Carter"
  ),
  createSkill(
    "Personal Fitness Trainer",
    "Get help with beginner workouts, exercise form, and consistency.",
    "fitness",
    "Marcus Hill"
  ),
  createSkill(
    "Singing Coach",
    "Work on breath control, pitch, and confidence for singing.",
    "music"
  ),
  createSkill(
    "Music Production Basics",
    "Learn how to create beats, layer sounds, and use beginner DAW tools.",
    "music",
    "Ethan Brooks"
  ),
  createSkill(
    "Graphic Design Basics",
    "Understand layout, color, and typography for strong visual design.",
    "art",
    "Priya Shah"
  ),
];

mockSkills.forEach((skill) => {
  skill.isCustom = false;
});

const customSkills = loadCustomSkills();
customSkills.forEach((skill) => {
  skill.isCustom = true;
});

skills.push(...mockSkills, ...customSkills);

nextId =
  skills.reduce((highestId, skill) => Math.max(highestId, Number(skill.id) || 0), -1) + 1;

window.ElevateSkills = {
  getSkills() {
    return [...skills];
  },
  addSkill,
  formatCategory
};

/* ---------------- CATEGORY FILTER ---------------- */
if (categoryFilter) {
  categoryFilter.addEventListener("change", () => {
    render(categoryFilter.value);
  });
}

/* ---------------- RENDER ---------------- */
function render(selectedCategory = "") {
  if (!skillsContainer) {
    return;
  }

  skillsContainer.innerHTML = "";

  const filteredSkills = skills.filter((skill) => {
    if (selectedCategory === "") return true;
    return skill.category === selectedCategory;
  });

  const visibleSkills = filteredSkills.slice(0, 5);

  visibleSkills.forEach((skill) => {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.dataset.id = skill.id;

    card.innerHTML = `
      <h4>${skill.title}</h4>
      <p>${skill.description}</p>
      <span class="category-tag">${formatCategory(skill.category)}</span>
    `;

    skillsContainer.appendChild(card);
  });
}

/* ---------------- INITIAL RENDER ---------------- */
if (skillsContainer) {
  render();
}

if (
  skillsContainer &&
  dialog &&
  dialogTitle &&
  dialogDescription &&
  closeDialog
) {
  skillsContainer.addEventListener("click", (event) => {
    const card = event.target.closest(".skill-card");
    if (!card) {
      return;
    }

    const selectedSkill = skills.find((skill) => skill.id === Number(card.dataset.id));
    if (!selectedSkill) {
      return;
    }

    dialogTitle.textContent = selectedSkill.title;
    dialogDescription.textContent = selectedSkill.description;
    dialog.showModal();
  });

  closeDialog.addEventListener("click", () => {
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
      dialog.close();
    }
  });
}
