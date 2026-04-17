import { db } from "../firebase/config.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const COLLECTION_NAME = "skills";
const AVAILABILITY_COLLECTION_NAME = "skillAvailability";

export async function listSkillsFromDb() {
  const skillsQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAtMs", "desc")
  );
  const snapshot = await getDocs(skillsQuery);

  return snapshot.docs.map((docSnapshot) => ({
    docId: docSnapshot.id,
    id: docSnapshot.id,
    ...docSnapshot.data()
  }));
}

export async function createSkillInDb(skill) {
  const now = Date.now();
  const payload = {
    creatorUserId: skill.creatorUserId || "",
    ...skill,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAtMs: now,
    updatedAtMs: now
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

  await setDoc(
    doc(db, AVAILABILITY_COLLECTION_NAME, String(skill.id)),
    {
      skillId: skill.id,
      bookingCounts: {},
      updatedAt: serverTimestamp(),
      updatedAtMs: now
    },
    { merge: true }
  );

  return {
    id: docRef.id,
    docId: docRef.id,
    ...skill,
    createdAtMs: now,
    updatedAtMs: now
  };
}

export async function updateSkillInDb(skillDocId, updates, currentUserId = "") {
  if (!skillDocId) {
    throw new Error("A skill document id is required.");
  }

  const skillRef = doc(db, COLLECTION_NAME, String(skillDocId));
  const skillSnapshot = await getDoc(skillRef);

  if (!skillSnapshot.exists()) {
    throw new Error("That skill post could not be found.");
  }

  const existingSkill = skillSnapshot.data();

  if (currentUserId && existingSkill.creatorUserId !== currentUserId) {
    throw new Error("You can only edit your own skill posts.");
  }

  const now = Date.now();
  const payload = {
    ...updates,
    updatedAt: serverTimestamp(),
    updatedAtMs: now
  };

  await updateDoc(skillRef, payload);

  return {
    id: existingSkill.id ?? skillSnapshot.id,
    docId: skillSnapshot.id,
    ...existingSkill,
    ...updates,
    updatedAtMs: now
  };
}

export async function deleteSkillFromDb(skillDocId, currentUserId = "") {
  if (!skillDocId) {
    throw new Error("A skill document id is required.");
  }

  const skillRef = doc(db, COLLECTION_NAME, String(skillDocId));
  const skillSnapshot = await getDoc(skillRef);

  if (!skillSnapshot.exists()) {
    return;
  }

  const existingSkill = skillSnapshot.data();

  if (currentUserId && existingSkill.creatorUserId !== currentUserId) {
    throw new Error("You can only delete your own skill posts.");
  }

  await deleteDoc(skillRef);
  await deleteDoc(doc(db, AVAILABILITY_COLLECTION_NAME, String(existingSkill.id ?? skillDocId)));
}
