import { db } from "../firebase/config.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const COLLECTION_NAME = "userProfiles";
const USERNAMES_COLLECTION_NAME = "usernames";

function normalizeUsername(username = "") {
  return username.trim().toLowerCase();
}

export async function getUserProfileFromDb(uid) {
  if (!uid) {
    return null;
  }

  const profileSnapshot = await getDoc(doc(db, COLLECTION_NAME, uid));

  if (!profileSnapshot.exists()) {
    return null;
  }

  return {
    uid: profileSnapshot.id,
    ...profileSnapshot.data()
  };
}

export async function getUsernameRecordFromDb(username) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return null;
  }

  const usernameSnapshot = await getDoc(
    doc(db, USERNAMES_COLLECTION_NAME, normalizedUsername)
  );

  if (!usernameSnapshot.exists()) {
    return null;
  }

  return {
    id: usernameSnapshot.id,
    ...usernameSnapshot.data()
  };
}

export async function ensureUsernameRecordForProfile(profile) {
  if (!profile?.uid || !profile?.username) {
    return;
  }

  const normalizedUsername = normalizeUsername(profile.username);

  if (!normalizedUsername) {
    return;
  }

  await setDoc(
    doc(db, USERNAMES_COLLECTION_NAME, normalizedUsername),
    {
      uid: profile.uid,
      username: profile.username,
      normalizedUsername,
      updatedAt: serverTimestamp(),
      updatedAtMs: Date.now()
    },
    { merge: true }
  );
}

export async function saveUserProfileToDb(profile, existingProfile = null) {
  if (!profile?.uid) {
    throw new Error("A user profile must include a uid.");
  }

  const now = Date.now();
  const profileRef = doc(db, COLLECTION_NAME, profile.uid);
  const normalizedUsername = normalizeUsername(profile.username);
  const previousNormalizedUsername = normalizeUsername(existingProfile?.username);
  const createdAtMs = Number(existingProfile?.createdAtMs) || now;

  const payload = {
    ...existingProfile,
    ...profile,
    createdAt: existingProfile?.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAtMs,
    updatedAtMs: now
  };

  const batch = writeBatch(db);

  batch.set(profileRef, payload, { merge: true });

  if (previousNormalizedUsername && previousNormalizedUsername !== normalizedUsername) {
    batch.delete(doc(db, USERNAMES_COLLECTION_NAME, previousNormalizedUsername));
  }

  if (normalizedUsername) {
    batch.set(doc(db, USERNAMES_COLLECTION_NAME, normalizedUsername), {
      uid: profile.uid,
      username: profile.username,
      normalizedUsername,
      updatedAt: serverTimestamp(),
      updatedAtMs: now
    });
  }

  await batch.commit();

  return {
    ...payload,
    createdAt:
      typeof existingProfile?.createdAt === "string"
        ? existingProfile.createdAt
        : new Date(createdAtMs).toISOString(),
    updatedAt: new Date(now).toISOString()
  };
}
