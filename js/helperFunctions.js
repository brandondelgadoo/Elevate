function getSkillById(id) {
  return window.skillsDataStore.skills.find((skill) => skill.id === id);
}

function generateSkillId() {
  if (window.skillsDataStore.skills.length === 0) {
    return 1;
  }

  const ids = window.skillsDataStore.skills.map((skill) => skill.id);
  return Math.max(...ids) + 1;
}

function isBooked(id) {
  return window.skillsDataStore.currentUser.bookedSkillIds.includes(id);
}

window.getSkillById = getSkillById;
window.generateSkillId = generateSkillId;
window.isBooked = isBooked;
