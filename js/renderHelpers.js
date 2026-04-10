function buildSkillCardHTML(skill) {
  const instructorName = skill.instructor || skill.Createdby || "Unknown";
  const bookButtonLabel = isBooked(skill.id) ? "Booked" : "Book Session";

  return `
    <div class="skill-card" data-id="${skill.id}">
      <h4>${skill.title}</h4>
      <p>${skill.description}</p>
      <p><strong>Instructor:</strong> ${instructorName}</p>
      <span class="category-tag">${skill.category}</span>
      <button
        class="btn-primary book-session-button"
        data-skill-id="${skill.id}"
        ${isBooked(skill.id) ? "disabled" : ""}
      >
        ${bookButtonLabel}
      </button>
    </div>
  `;
}

function renderSkillCards(skills, containers) {
  containers.forEach((container) => {
    container.innerHTML = "";

    skills.forEach((skill) => {
      container.insertAdjacentHTML("beforeend", buildSkillCardHTML(skill));
    });
  });
}

window.buildSkillCardHTML = buildSkillCardHTML;
window.renderSkillCards = renderSkillCards;
