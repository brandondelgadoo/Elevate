import { db } from "../firebase/config.js";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const COLLECTION_NAME = "skillRequests";

export async function listRequestsFromDb() {
  const requestsQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAtMs", "desc")
  );
  const snapshot = await getDocs(requestsQuery);

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data()
  }));
}

export async function getRequestByIdFromDb(requestId) {
  if (!requestId) {
    return null;
  }

  const requestRef = doc(db, COLLECTION_NAME, requestId);
  const snapshot = await getDoc(requestRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}

export async function createRequestInDb(request) {
  const now = Date.now();
  const payload = {
    ...request,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAtMs: now,
    updatedAtMs: now
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

  return {
    id: docRef.id,
    ...request,
    createdAtMs: now,
    updatedAtMs: now
  };
}
