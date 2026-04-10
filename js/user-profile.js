let profilesMapCache = {};
let resolveProfilesReady;
const profilesReadyPromise = new Promise((resolve) => {
  resolveProfilesReady = resolve;
});

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

  const { saveUserProfileToDb } = await import("./profiles-store.js");
  const savedProfile = await saveUserProfileToDb(updatedProfile, existingProfile);
  profilesMapCache[profile.uid] = savedProfile;
  return savedProfile;
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
  try {
    const { listUserProfilesFromDb } = await import("./profiles-store.js");
    const profiles = await listUserProfilesFromDb();
    profilesMapCache = normalizeProfilesMap(profiles);
  } catch (error) {
    console.error("Unable to load user profiles from Firestore.", error);
    profilesMapCache = {};
  }

  resolveProfilesReady();
}

initializeProfiles();
