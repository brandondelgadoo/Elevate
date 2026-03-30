const skills = [];
let nextId = 0;

function Skill(title, description, category, createdBy = "Elevate Community") {
  this.id = nextId++;
  this.createdBy = createdBy;
  this.title = title;
  this.description = description;
  this.category = category;
}

const skillsContainer = document.querySelector("#skillsContainer");
// const createSkillForm = document.querySelector("#createSkillForm");
const categoryFilter = document.querySelector("#categoryFilter");
const dialog = document.getElementById("skillDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogDescription = document.getElementById("dialogDescription");
const closeDialog = document.getElementById("closeDialog");

/* ---------------- MOCK DATA ---------------- */
const mockSkills = [
  new Skill(
    "Golf Coach",
    "Improve your swing, putting, and course strategy with personalized golf instruction.",
    "fitness",
    "Maya Thompson"
  ),
  new Skill(
    "Rocket League Coach",
    "Learn rotations, mechanics, and decision-making to rank up in Rocket League.",
    "tech",
    "Jordan Lee"
  ),
  new Skill(
    "Driving Teacher",
    "Practice safe driving, parking, highway skills, and road confidence.",
    "fitness"
  ),
  new Skill(
    "Beginner Guitar Lessons",
    "Learn chords, rhythm, and simple songs on acoustic or electric guitar.",
    "music",
    "Sofia Ramirez"
  ),
  new Skill(
    "Piano Lessons",
    "Understand basic piano technique, scales, and beginner-friendly songs.",
    "music",
    "Noah Bennett"
  ),
  new Skill(
    "Intro to Python Programming",
    "Learn variables, loops, functions, and problem-solving with Python.",
    "tech",
    "Avery Chen"
  ),
  new Skill(
    "JavaScript Tutor",
    "Get help understanding JavaScript fundamentals and building small projects.",
    "tech"
  ),
  new Skill(
    "Photography Basics",
    "Learn composition, lighting, and camera settings for better photos.",
    "art",
    "Isabella Cruz"
  ),
  new Skill(
    "Digital Art Mentor",
    "Explore sketching, coloring, and digital illustration techniques.",
    "art",
    "Kai Morgan"
  ),
  new Skill(
    "Painting Instructor",
    "Practice painting techniques with acrylics and improve color blending skills.",
    "art",
    "Lila Patel"
  ),
  new Skill(
    "Yoga Instructor",
    "Build flexibility, balance, and mindfulness through beginner yoga sessions.",
    "fitness",
    "Zoe Carter"
  ),
  new Skill(
    "Personal Fitness Trainer",
    "Get help with beginner workouts, exercise form, and consistency.",
    "fitness",
    "Marcus Hill"
  ),
  new Skill(
    "Singing Coach",
    "Work on breath control, pitch, and confidence for singing.",
    "music"
  ),
  new Skill(
    "Music Production Basics",
    "Learn how to create beats, layer sounds, and use beginner DAW tools.",
    "music",
    "Ethan Brooks"
  ),
  new Skill(
    "Graphic Design Basics",
    "Understand layout, color, and typography for strong visual design.",
    "art",
    "Priya Shah"
  ),
];

skills.push(...mockSkills);

window.ElevateSkills = {
  getSkills() {
    return [...skills];
  },
  formatCategory
};

// /* ---------------- FORM SUBMIT ---------------- */
// if (createSkillForm) {
//   createSkillForm.addEventListener("submit", (e) => {
//     e.preventDefault();

//     const title = createSkillForm.title.value.trim();
//     const description = createSkillForm.description.value.trim();
//     const category = createSkillForm.category.value;

//     const skill = new Skill(title, description, category);
//     skills.push(skill);

//     render(categoryFilter ? categoryFilter.value : "");
//     createSkillForm.reset();
//   });
// }

/* ---------------- CATEGORY FILTER ---------------- */
if (categoryFilter) {
  categoryFilter.addEventListener("change", () => {
    render(categoryFilter.value);
  });
}

/* ---------------- HELPER ---------------- */
function formatCategory(category) {
  if (category === "tech") return "Technology";
  if (category === "fitness") return "Fitness";
  if (category === "music") return "Music";
  if (category === "art") return "Art";
  return category;
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
