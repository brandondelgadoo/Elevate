import { db } from "../firebase/config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const COLLECTION_NAME = "skillAvailability";

export async function listSkillAvailabilityFromDb() {
  const availabilityQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("updatedAtMs", "desc")
  );
  const snapshot = await getDocs(availabilityQuery);

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data()
  }));
}

export async function updateSkillAvailabilityCounts(skillId, countUpdates = {}) {
  if (skillId === undefined || skillId === null) {
    throw new Error("A skill id is required to update availability.");
  }

  const availabilityRef = doc(db, COLLECTION_NAME, String(skillId));
  const availabilitySnapshot = await getDoc(availabilityRef);
  const currentCounts = availabilitySnapshot.exists()
    ? { ...(availabilitySnapshot.data().bookingCounts || {}) }
    : {};

  Object.entries(countUpdates).forEach(([dateValue, delta]) => {
    const normalizedDelta = Number(delta) || 0;

    if (!dateValue || !normalizedDelta) {
      return;
    }

    const nextValue = Math.max((Number(currentCounts[dateValue]) || 0) + normalizedDelta, 0);

    if (nextValue > 0) {
      currentCounts[dateValue] = nextValue;
      return;
    }

    delete currentCounts[dateValue];
  });

  const now = Date.now();

  await setDoc(
    availabilityRef,
    {
      skillId,
      bookingCounts: currentCounts,
      updatedAt: serverTimestamp(),
      updatedAtMs: now
    },
    { merge: true }
  );

  return {
    skillId,
    bookingCounts: currentCounts,
    updatedAtMs: now
  };
}
