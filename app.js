/* ═══════════════════════════════════════════════════════════
   Elevated — Community Skill Sharing
   Migrated from React/TypeScript to vanilla JavaScript
   ═══════════════════════════════════════════════════════════ */

// ─── Default Skills Data ───
var SKILLS_DEFAULT = [
  {
    id: "1",
    title: "UI/UX Design Mentorship",
    description: "1 hour session · Available Mon–Fri · Portfolio review included",
    category: "Design",
    imageUrl: "https://images.unsplash.com/photo-1629494893504-d41e26a02631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVSSUyMFVYJTIwZGVzaWduJTIwc2NyZWVufGVufDF8fHx8MTc3MzI2NzY4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    author: "Alice Smith",
    price: "$50/hr"
  },
  {
    id: "2",
    title: "Full-Stack Web Dev Tutoring",
    description: "1 hour class · Available Mon–Sat · Hands-on coding projects",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBzY3JlZW58ZW58MXx8fHwxNzczMjUwMzI1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    author: "John Doe",
    price: "$80/hr"
  },
  {
    id: "3",
    title: "Beginner Guitar Lessons",
    description: "1 hour class · Available Mon–Fri · All skill levels welcome",
    category: "Music",
    imageUrl: "https://images.unsplash.com/photo-1536594527669-2f555de54e95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5aW5nJTIwYWNvdXN0aWMlMjBndWl0YXJ8ZW58MXx8fHwxNzczMjY3Njg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    author: "Elena Rossi",
    price: "$30/hr"
  },
  {
    id: "4",
    title: "Conversational Spanish",
    description: "45 min session · Available Mon–Thu · Native speaker practice",
    category: "Language",
    imageUrl: "https://images.unsplash.com/photo-1505489501961-3f42fecbe65a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWFybmluZyUyMHNwYW5pc2glMjBib29rc3xlbnwxfHx8fDE3NzMyNjc2ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    author: "Carlos Gomez",
    price: "$25/hr"
  },
  {
    id: "5",
    title: "Personalized HIIT Workouts",
    description: "1 hour class · Available Mon–Fri · Custom fitness plans",
    category: "Fitness",
    imageUrl: "https://images.unsplash.com/photo-1584827386916-b5351d3ba34b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dCUyMGd5bXxlbnwxfHx8fDE3NzMyMTY1NjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    author: "Mike Johnson",
    price: "$40/hr"
  },
  {
    id: "6",
    title: "Logo & Branding Design",
    description: "1.5 hour session · Available Tue–Sat · Includes revision rounds",
    category: "Design",
    imageUrl: "https://images.unsplash.com/photo-1690228254548-31ef53e40cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGluZyUyMGRlc2lnbiUyMG1vb2Rib2FyZHxlbnwxfHx8fDE3NzMyNjc2ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    author: "Sarah Jenkins",
    price: "$60/hr"
  }
];

var PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWFybmluZ3xlbnwxfHx8fDE3NzMyNTAyMDB8MA&ixlib=rb-4.1.0&q=80&w=1080";

var CATEGORIES = ["All", "Design", "Technology", "Music", "Language", "Fitness", "Art"];

// ─── State ───
var currentPage = "home";
var currentCategory = "All";
var skills = [];

// ─── Load skills from localStorage or defaults ───
function loadSkills() {
  try {
    var stored = localStorage.getItem("elevated_skills_data");
    if (stored) {
      skills = JSON.parse(stored);
      return;
    }
  } catch (e) { /* ignore */ }
  skills = SKILLS_DEFAULT.slice();
}

function saveSkills() {
  localStorage.setItem("elevated_skills_data", JSON.stringify(skills));
}

// ─── DOM References ───
var searchInput;
var skillsContainer;
var skillsCount;
var emptyState;
var categoryPills;
var createSkillForm;

// ─── Initialize ───
document.addEventListener("DOMContentLoaded", function () {
  searchInput = document.getElementById("searchInput");
  skillsContainer = document.getElementById("skillsContainer");
  skillsCount = document.getElementById("skillsCount");
  emptyState = document.getElementById("emptyState");
  categoryPills = document.getElementById("categoryPills");
  createSkillForm = document.getElementById("createSkillForm");

  loadSkills();
  renderCategoryPills();
  renderSkills();

  // Live search
  searchInput.addEventListener("input", renderSkills);

  // Form submit
  createSkillForm.addEventListener("submit", handleFormSubmit);

  // "/" keyboard shortcut to focus search
  window.addEventListener("keydown", function (e) {
    if (e.key === "/" && currentPage === "home" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });
});

// ─── Render category pills ───
function renderCategoryPills() {
  categoryPills.innerHTML = "";
  CATEGORIES.forEach(function (cat) {
    var btn = document.createElement("button");
    btn.className = "cat-pill" + (currentCategory === cat ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", function () {
      currentCategory = cat;
      renderCategoryPills();
      renderSkills();
    });
    categoryPills.appendChild(btn);
  });
}

// ─── Render skill cards ───
function renderSkills() {
  var query = (searchInput.value || "").toLowerCase();
  var filtered = skills.filter(function (s) {
    var matchText = s.title.toLowerCase().indexOf(query) !== -1 ||
                    s.author.toLowerCase().indexOf(query) !== -1;
    var matchCat = currentCategory === "All" || s.category === currentCategory;
    return matchText && matchCat;
  });

  // Update count
  skillsCount.textContent = filtered.length + (filtered.length === 1 ? " Skill" : " Skills") + " found";

  if (filtered.length === 0) {
    skillsContainer.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  skillsContainer.style.display = "";
  emptyState.style.display = "none";
  skillsContainer.innerHTML = "";

  filtered.forEach(function (skill) {
    var article = document.createElement("article");
    article.className = "skill-card";

    var initial = skill.author ? skill.author.charAt(0) : "?";
    var imgSrc = skill.imageUrl || PLACEHOLDER_IMG;
    var categoryText = skill.category || "Uncategorized";
    var titleText = skill.title || "Untitled Skill";
    var descText = skill.description || "No description provided";
    var authorText = skill.author || "Anonymous";
    var priceText = skill.price || "Free";

    article.innerHTML =
      '<div class="card-img-wrap">' +
        '<img src="' + escapeAttr(imgSrc) + '" alt="' + escapeAttr(titleText) + '" loading="lazy">' +
        '<div class="card-img-overlay"></div>' +
        '<span class="card-badge">' + escapeHtml(categoryText) + '</span>' +
        '<span class="card-star">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>' +
        '</span>' +
      '</div>' +
      '<div class="card-body">' +
        '<h4 class="card-title">' + escapeHtml(titleText) + '</h4>' +
        '<p class="card-desc">' + escapeHtml(descText) + '</p>' +
        '<p class="card-author">' +
          '<span class="card-avatar">' + escapeHtml(initial) + '</span>' +
          'By <span class="card-author-name">' + escapeHtml(authorText) + '</span>' +
        '</p>' +
        '<div class="card-footer">' +
          '<span class="card-session">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>' +
            '1hr Session' +
          '</span>' +
          '<span class="card-price">' + escapeHtml(priceText) + '</span>' +
        '</div>' +
      '</div>';

    skillsContainer.appendChild(article);
  });
}

// ─── Handle form submit ───
function handleFormSubmit(e) {
  e.preventDefault();

  var newSkill = {
    id: Date.now().toString(),
    title: document.getElementById("skillTitle").value.trim() || "",
    category: document.getElementById("skillCategory").value || "Uncategorized",
    author: document.getElementById("skillAuthor").value.trim() || "",
    price: document.getElementById("skillPrice").value.trim() || "",
    imageUrl: document.getElementById("skillImage").value.trim() || PLACEHOLDER_IMG,
    description: document.getElementById("skillDesc").value.trim() || ""
  };

  skills.unshift(newSkill);
  saveSkills();

  // Clear form
  document.getElementById("skillTitle").value = "";
  document.getElementById("skillCategory").value = "Technology";
  document.getElementById("skillAuthor").value = "";
  document.getElementById("skillPrice").value = "";
  document.getElementById("skillImage").value = "";
  document.getElementById("skillDesc").value = "";

  // Show success page
  navigateTo("success");

  // Animate progress bar then redirect
  setTimeout(function () {
    var fill = document.getElementById("progressFill");
    if (fill) fill.style.width = "100%";
  }, 50);

  setTimeout(function () {
    navigateTo("home");
  }, 2200);
}

// ─── Page navigation ───
function navigateTo(page) {
  currentPage = page;

  document.getElementById("page-home").style.display = page === "home" ? "" : "none";
  document.getElementById("page-post").style.display = page === "post" ? "" : "none";
  document.getElementById("page-success").style.display = page === "success" ? "" : "none";

  // Show/hide hero section (only on home)
  var hero = document.querySelector(".hero");
  if (hero) hero.style.display = page === "home" ? "" : "none";

  // Update active nav link
  var navLinks = document.querySelectorAll(".navbar-link[data-page]");
  navLinks.forEach(function (link) {
    if (link.getAttribute("data-page") === page) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Re-render skills when returning to home
  if (page === "home") {
    renderSkills();
  }

  // Reset progress bar for success page
  if (page === "success") {
    var fill = document.getElementById("progressFill");
    if (fill) fill.style.width = "0";
  }

  // Close mobile menu
  var mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu) mobileMenu.classList.remove("open");

  // Scroll to top
  window.scrollTo(0, 0);
}

// ─── Mobile menu toggle ───
function toggleMobileMenu() {
  var menu = document.getElementById("mobileMenu");
  menu.classList.toggle("open");
}

// ─── Clear filters ───
function clearFilters() {
  searchInput.value = "";
  currentCategory = "All";
  renderCategoryPills();
  renderSkills();
}

// ─── Utility: escape HTML to prevent XSS ───
function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
