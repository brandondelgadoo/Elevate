const USER_PROFILES_STORAGE_KEY = "elevateUserProfiles";
let profilesMapCache = {};
let resolveProfilesReady;
const profilesReadyPromise = new Promise((resolve) => {
  resolveProfilesReady = resolve;
});

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

function normalizeProfilesMap(profiles) {
  return profiles.reduce((profilesMap, profile) => {
    if (profile?.uid) {
      profilesMap[profile.uid] = profile;
    }
    return profilesMap;
  }, {});
}

export async function saveUserProfile(profile) {
  if (!profile || !profile.uid) {
    throw new Error("A user profile must include a uid.");
  }

  const existingProfile = profilesMapCache[profile.uid] || {};
  const updatedProfile = {
    ...existingProfile,
    ...profile,
    updatedAt: new Date().toISOString()
  };

  if (!updatedProfile.createdAt) {
    updatedProfile.createdAt = updatedProfile.updatedAt;
  }

  try {
    const { saveUserProfileToDb } = await import("./profiles-store.js");
    const savedProfile = await saveUserProfileToDb(updatedProfile, existingProfile);
    profilesMapCache[profile.uid] = savedProfile;
    persistProfilesMap(profilesMapCache);
    return savedProfile;
  } catch (error) {
    console.error("Unable to save user profile to Firestore. Falling back to local storage.", error);
    profilesMapCache[profile.uid] = updatedProfile;
    persistProfilesMap(profilesMapCache);
    return updatedProfile;
  }
}

export function getUserProfile(uid) {
  if (!uid) {
    return null;
  }

  return profilesMapCache[uid] || null;
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

  return Object.values(profilesMapCache).some((profile) => {
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

export function ready() {
  return profilesReadyPromise;
}

async function initializeProfiles() {
  const storedProfilesMap = loadProfilesMap();
  profilesMapCache = storedProfilesMap;

  try {
    const { listUserProfilesFromDb } = await import("./profiles-store.js");
    const profiles = await listUserProfilesFromDb();
    profilesMapCache = normalizeProfilesMap(profiles);
    persistProfilesMap(profilesMapCache);
  } catch (error) {
    console.error("Unable to load user profiles from Firestore. Falling back to local data.", error);
  }

  resolveProfilesReady();
}

initializeProfiles();
