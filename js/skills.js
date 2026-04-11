const skills = [];
let resolveSkillsReady;
const skillsReadyPromise = new Promise((resolve) => {
  resolveSkillsReady = resolve;
});
let skillsLoadError = "";

let nextId = 0;
const DEFAULT_CATEGORY_IMAGES = {
  tech: "assets/default-tech.jpg",
  fitness: "assets/default-fitness.avif",
  music: "assets/default-music.jpg",
  art: "assets/default-art.jpg"
};

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
  this.creatorUserId = options.creatorUserId || "";
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

function getDefaultCategoryImage(category) {
  return DEFAULT_CATEGORY_IMAGES[category] || "";
}

function getResolvedSkillImage(skill) {
  if (skill?.cardImageUrl) {
    return skill.cardImageUrl;
  }

  return getDefaultCategoryImage(skill?.category);
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

function normalizeSkill(rawSkill) {
  return new Skill(
    rawSkill.title,
    rawSkill.description,
    rawSkill.category,
    rawSkill.createdBy || "Elevate Community",
    Number(rawSkill.id),
    {
      creatorUserId: rawSkill.creatorUserId || "",
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

async function addSkill({
  title,
  description,
  category,
  createdBy = "Elevate Community",
  creatorUserId = "",
  maxPeoplePerSession = null,
  sessionLengthMinutes = null,
  availableDates = [],
  cardImageUrl = ""
}) {
  const newSkill = createSkill(title, description, category, createdBy, {
    creatorUserId,
    maxPeoplePerSession,
    sessionLengthMinutes,
    availableDates,
    cardImageUrl
  });

  const { createSkillInDb } = await import("./skills-store.js");
  const savedSkill = await createSkillInDb({
    ...newSkill,
    isCustom: true
  });
  const normalizedSkill = normalizeSkill(savedSkill);
  normalizedSkill.isCustom = true;
  skills.push(normalizedSkill);
  render(categoryFilter?.value || "");
  return normalizedSkill;
}

/* ---------------- DOM REFERENCES ---------------- */
const skillsContainer = document.querySelector("#skillsContainer");
const categoryFilter = document.querySelector("#categoryFilter");
const dialog = document.getElementById("skillDialog");
const dialogImage = document.getElementById("dialogImage");
const dialogTitle = document.getElementById("dialogTitle");
const dialogCreatedBy = document.getElementById("dialogCreatedBy");
const dialogCategory = document.getElementById("dialogCategory");
const dialogSessionDetails = document.getElementById("dialogSessionDetails");
const dialogAvailableDates = document.getElementById("dialogAvailableDates");
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

window.ElevateSkills = {
  ready() {
    return skillsReadyPromise;
  },
  getSkills() {
    return [...skills];
  },
  addSkill,
  formatCategory,
  getDefaultCategoryImage,
  getResolvedSkillImage
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

  if (skillsLoadError && !filteredSkills.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "skill-post-card skill-post-card-empty";
    emptyState.innerHTML = `
      <h4>Featured skills unavailable</h4>
      <p>${skillsLoadError}</p>
    `;
    skillsContainer.appendChild(emptyState);
    return;
  }

  const visibleSkills = [...filteredSkills]
    .sort((firstSkill, secondSkill) => secondSkill.id - firstSkill.id)
    .slice(0, 5);

  if (!visibleSkills.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "skill-post-card skill-post-card-empty";
    emptyState.innerHTML = `
      <h4>No featured skills yet</h4>
      <p>Check back soon for new community sessions.</p>
    `;
    skillsContainer.appendChild(emptyState);
    return;
  }

  visibleSkills.forEach((skill) => {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.dataset.id = skill.id;
    const resolvedImageUrl = getResolvedSkillImage(skill);

    const authorInitials = (skill.createdBy || "EC")
      .split(/\s+/)
      .map((word) => word[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();

    card.innerHTML = `
      ${resolvedImageUrl ? `
        <div class="card-img-wrap">
          <img src="${resolvedImageUrl}" alt="${skill.title || "Skill"} preview">
          <div class="card-img-overlay"></div>
          <span class="card-badge">${formatCategory(skill.category)}</span>
        </div>
      ` : ""}
      <div class="card-body">
        <div class="card-title">${skill.title || "Untitled Skill"}</div>
        <p class="card-desc">${skill.description || "No description provided yet."}</p>
        <div class="card-author">
          <div class="card-avatar">${authorInitials}</div>
          <span class="card-author-name">${skill.createdBy || "Elevate Community"}</span>
        </div>
        <div class="card-footer">
          <div class="card-session">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            ${skill.maxPeoplePerSession ? `${skill.maxPeoplePerSession} per session` : "Open"} &middot; ${formatSessionLength(skill.sessionLengthMinutes)}
          </div>
          <button type="button" class="btn-primary">View</button>
        </div>
      </div>
    `;

    skillsContainer.appendChild(card);
  });
}

if (
  skillsContainer &&
  dialog &&
  dialogImage &&
  dialogTitle &&
  dialogCreatedBy &&
  dialogCategory &&
  dialogSessionDetails &&
  dialogAvailableDates &&
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

    const resolvedImageUrl = getResolvedSkillImage(selectedSkill);

    if (resolvedImageUrl) {
      dialogImage.src = resolvedImageUrl;
      dialogImage.alt = `${selectedSkill.title || "Skill"} preview`;
      dialogImage.hidden = false;
    } else {
      dialogImage.removeAttribute("src");
      dialogImage.alt = "";
      dialogImage.hidden = true;
    }

    dialogTitle.textContent = selectedSkill.title;
    dialogCreatedBy.textContent = `Instructor: ${selectedSkill.createdBy || "Elevate Community"}`;
    dialogCategory.textContent = `Category: ${formatCategory(selectedSkill.category)}`;
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
    dialog.showModal();
  });

  closeDialog.addEventListener("click", () => {
    dialogImage.removeAttribute("src");
    dialogImage.alt = "";
    dialogImage.hidden = true;
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
      dialogImage.removeAttribute("src");
      dialogImage.alt = "";
      dialogImage.hidden = true;
      dialog.close();
    }
  });
}

async function initializeSkills() {
  skillsLoadError = "";

  try {
    const { listSkillsFromDb, createSkillInDb } = await import("./skills-store.js");
    let databaseSkills = await listSkillsFromDb();

    if (!databaseSkills.length) {
      for (const mockSkill of mockSkills) {
        await createSkillInDb({
          ...mockSkill,
          isCustom: false
        });
      }

      databaseSkills = await listSkillsFromDb();
    }

    skills.push(
      ...databaseSkills.map((skill) => {
        const normalizedSkill = normalizeSkill(skill);
        normalizedSkill.isCustom = Boolean(skill.isCustom);
        return normalizedSkill;
      })
    );
  } catch (error) {
    console.error("Unable to load skills from Firestore.", error);
    skillsLoadError = "We couldn't load featured skills right now. Please refresh and try again.";
  }

  nextId =
    skills.reduce((highestId, skill) => Math.max(highestId, Number(skill.id) || 0), -1) + 1;

  if (skillsContainer) {
    render();
  }

  resolveSkillsReady();
}

initializeSkills();
