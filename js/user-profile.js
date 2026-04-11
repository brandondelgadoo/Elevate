import { auth, onAuthStateChanged } from "../firebase/config.js";

let profilesMapCache = {};
let hasResolvedInitialProfiles = false;
let resolveInitialProfilesReady;
let currentProfilesLoadPromise = Promise.resolve();
const initialProfilesReadyPromise = new Promise((resolve) => {
  resolveInitialProfilesReady = resolve;
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
  return Promise.all([initialProfilesReadyPromise, currentProfilesLoadPromise]).then(() => {});
}

async function loadProfilesForUser(user) {
  if (!user) {
    profilesMapCache = {};
    return;
  }

  try {
    const { ensureUsernameRecordForProfile, getUserProfileFromDb } = await import("./profiles-store.js");
    const profile = await getUserProfileFromDb(user.uid);

    if (profile) {
      await ensureUsernameRecordForProfile(profile);
    }

    profilesMapCache = profile ? normalizeProfilesMap([profile]) : {};
  } catch (error) {
    console.error("Unable to load user profiles from Firestore.", error);
    profilesMapCache = {};
  }
}

onAuthStateChanged(auth, (user) => {
  currentProfilesLoadPromise = loadProfilesForUser(user).finally(() => {
    if (!hasResolvedInitialProfiles) {
      hasResolvedInitialProfiles = true;
      resolveInitialProfilesReady();
    }
  });
});

export async function isUsernameTaken(username, excludeUid = "") {
  if (!username) {
    return false;
  }

  const normalizedUsername = username.trim().toLowerCase();

  const localMatch = Object.values(profilesMapCache).find((profile) => {
    if (!profile?.username) {
      return false;
    }

    if (excludeUid && profile.uid === excludeUid) {
      return false;
    }

    return profile.username.toLowerCase() === normalizedUsername;
  });

  if (localMatch) {
    return true;
  }

  try {
    const { getUsernameRecordFromDb } = await import("./profiles-store.js");
    const usernameRecord = await getUsernameRecordFromDb(normalizedUsername);

    if (!usernameRecord) {
      return false;
    }

    return !(excludeUid && usernameRecord.uid === excludeUid);
  } catch (error) {
    console.error("Unable to check username availability.", error);
    throw error;
  }
}
