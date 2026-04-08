const STORAGE_KEY = "elevateCustomSkills";
const skills = [];

let nextId = 0;

function Skill(
  title,
  description,
  category,
  createdBy = "Elevate Community",
  id = null,
  options = {}
) {
  this.id = id ?? nextId++;
  this.createdBy = createdBy;
  this.title = title;
  this.description = description;
  this.category = category;
  this.maxPeoplePerSession = options.maxPeoplePerSession ?? null;
  this.sessionLengthMinutes = options.sessionLengthMinutes ?? null;
  this.availableDates = Array.isArray(options.availableDates)
    ? options.availableDates
    : [];
  this.cardImageUrl = options.cardImageUrl || "";
}

function createSkill(
  title,
  description,
  category,
  createdBy = "Elevate Community",
  options = {}
) {
  return new Skill(title, description, category, createdBy, null, options);
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
    Number(rawSkill.id),
    {
      maxPeoplePerSession:
        rawSkill.maxPeoplePerSession === null ||
        rawSkill.maxPeoplePerSession === undefined
          ? null
          : Number(rawSkill.maxPeoplePerSession),
      sessionLengthMinutes:
        rawSkill.sessionLengthMinutes === null ||
        rawSkill.sessionLengthMinutes === undefined
          ? null
          : Number(rawSkill.sessionLengthMinutes),
      availableDates: Array.isArray(rawSkill.availableDates)
        ? rawSkill.availableDates
        : [],
      cardImageUrl: rawSkill.cardImageUrl || rawSkill.backgroundImageUrl || ""
    }
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

function addSkill({
  title,
  description,
  category,
  createdBy = "Elevate Community",
  maxPeoplePerSession = null,
  sessionLengthMinutes = null,
  availableDates = [],
  cardImageUrl = ""
}) {
  const newSkill = createSkill(title, description, category, createdBy, {
    maxPeoplePerSession,
    sessionLengthMinutes,
    availableDates,
    cardImageUrl
  });
  newSkill.isCustom = true;
  skills.push(newSkill);
  persistCustomSkills();
  return newSkill;
}

/* ---------------- DOM REFERENCES ---------------- */
const skillsContainer = document.querySelector("#skillsContainer");
const categoryFilter = document.querySelector("#categoryFilter");

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
