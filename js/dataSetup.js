(function () {
  const startingSkills = typeof mockSkills !== "undefined" ? mockSkills : [];
  const startingCurrentUser =
    typeof currentUser !== "undefined"
      ? currentUser
      : {
          name: "Guest User",
          bio: "",
          bookedSkillIds: [],
          myPostedSkillIds: [],
        };

  const skillsCopy = startingSkills.map((skill) => ({ ...skill }));
  const currentUserCopy = {
    ...startingCurrentUser,
    bookedSkillIds: [...startingCurrentUser.bookedSkillIds],
    myPostedSkillIds: [...startingCurrentUser.myPostedSkillIds],
  };

  window.skillsDataStore = {
    skills: skillsCopy,
    currentUser: currentUserCopy,
  };
})();
