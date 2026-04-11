import { db } from "../firebase/config.js";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc
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
