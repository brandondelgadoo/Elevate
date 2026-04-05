const USER_PROFILES_STORAGE_KEY = "elevateUserProfiles";

function loadProfilesMap() {
  try {
    const storedProfiles = localStorage.getItem(USER_PROFILES_STORAGE_KEY);

    if (!storedProfiles) {
      return {};
    }

    const parsedProfiles = JSON.parse(storedProfiles);
    return parsedProfiles && typeof parsedProfiles === "object" ? parsedProfiles : {};
  } catch (error) {
    console.error("Unable to load user profiles.", error);
    return {};
  }
}

function persistProfilesMap(profilesMap) {
  localStorage.setItem(USER_PROFILES_STORAGE_KEY, JSON.stringify(profilesMap));
}

export function saveUserProfile(profile) {
  if (!profile || !profile.uid) {
    throw new Error("A user profile must include a uid.");
  }

  const profilesMap = loadProfilesMap();
  const existingProfile = profilesMap[profile.uid] || {};

  profilesMap[profile.uid] = {
    ...existingProfile,
    ...profile,
    updatedAt: new Date().toISOString()
  };

  if (!profilesMap[profile.uid].createdAt) {
    profilesMap[profile.uid].createdAt = profilesMap[profile.uid].updatedAt;
  }

  persistProfilesMap(profilesMap);
  return profilesMap[profile.uid];
}

export function getUserProfile(uid) {
  if (!uid) {
    return null;
  }

  const profilesMap = loadProfilesMap();
  return profilesMap[uid] || null;
}

export function isUserProfileComplete(profile) {
  if (!profile) {
    return false;
  }

  const hasRequiredTextFields = [
    profile.username,
    profile.firstName,
    profile.lastName,
    profile.accountGoal,
    profile.city
  ].every((value) => typeof value === "string" && value.trim() !== "");

  const hasValidInterests =
    Array.isArray(profile.interests) && profile.interests.length > 0;

  return hasRequiredTextFields && hasValidInterests;
}

export function isUsernameTaken(username, excludeUid = "") {
  if (!username) {
    return false;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const profilesMap = loadProfilesMap();

  return Object.values(profilesMap).some((profile) => {
    if (!profile || !profile.username) {
      return false;
    }

    if (excludeUid && profile.uid === excludeUid) {
      return false;
    }

    return profile.username.toLowerCase() === normalizedUsername;
  });
}

export function buildProfileDisplayName(user, profile) {
  if (profile?.username) {
    return profile.username;
  }

  if (profile?.firstName) {
    return profile.firstName;
  }

  if (user?.displayName) {
    return user.displayName;
  }

  if (user?.email) {
    return user.email;
  }

  return "Member";
}
