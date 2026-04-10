import { db } from "../firebase/config.js";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const COLLECTION_NAME = "userProfiles";

export async function listUserProfilesFromDb() {
  const profilesQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("updatedAtMs", "desc")
  );
  const snapshot = await getDocs(profilesQuery);

  return snapshot.docs.map((docSnapshot) => ({
    uid: docSnapshot.id,
    ...docSnapshot.data()
  }));
}

export async function saveUserProfileToDb(profile, existingProfile = null) {
  if (!profile?.uid) {
    throw new Error("A user profile must include a uid.");
  }

  const now = Date.now();
  const profileRef = doc(db, COLLECTION_NAME, profile.uid);
  const createdAtMs = Number(existingProfile?.createdAtMs) || now;

  const payload = {
    ...existingProfile,
    ...profile,
    createdAt: existingProfile?.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAtMs,
    updatedAtMs: now
  };

  await setDoc(profileRef, payload, { merge: true });

  return {
    ...payload,
    createdAt:
      typeof existingProfile?.createdAt === "string"
        ? existingProfile.createdAt
        : new Date(createdAtMs).toISOString(),
    updatedAt: new Date(now).toISOString()
  };
}
