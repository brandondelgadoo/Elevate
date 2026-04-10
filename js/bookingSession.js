function bookSkillSession(id) {
  const selectedSkill = getSkillById(id);

  if (!selectedSkill) {
    return false;
  }

  if (isBooked(id)) {
    return false;
  }

  window.skillsDataStore.currentUser.bookedSkillIds.push(id);
  return true;
}

document.addEventListener("click", (event) => {
  const bookButton = event.target.closest(".book-session-button");

  if (!bookButton) {
    return;
  }

  const skillId = Number(bookButton.dataset.skillId);
  const didBook = bookSkillSession(skillId);

  if (didBook && typeof window.refreshSkillCards === "function") {
    window.refreshSkillCards();
  }
});

window.bookSkillSession = bookSkillSession;
