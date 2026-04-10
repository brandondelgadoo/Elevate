import { db } from "../firebase/config.js";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const COLLECTION_NAME = "skills";

export async function listSkillsFromDb() {
  const skillsQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAtMs", "desc")
  );
  const snapshot = await getDocs(skillsQuery);

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data()
  }));
}

export async function createSkillInDb(skill) {
  const now = Date.now();
  const payload = {
    ...skill,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAtMs: now,
    updatedAtMs: now
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

  return {
    id: docRef.id,
    ...skill,
    createdAtMs: now,
    updatedAtMs: now
  };
}
