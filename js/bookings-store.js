import { db } from "../firebase/config.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const COLLECTION_NAME = "bookings";

export async function listBookingsFromDb() {
  const bookingsQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("bookedAtMs", "desc")
  );
  const snapshot = await getDocs(bookingsQuery);

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data()
  }));
}

export async function replaceBookingInDb(existingBookings, booking) {
  const bookingsToDelete = Array.isArray(existingBookings) ? existingBookings : [];

  for (const existingBooking of bookingsToDelete) {
    if (existingBooking?.id) {
      await deleteDoc(doc(db, COLLECTION_NAME, existingBooking.id));
    }
  }

  const now = Date.now();
  const payload = {
    ...booking,
    bookedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    bookedAtMs: now,
    updatedAtMs: now
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

  return {
    id: docRef.id,
    ...booking,
    bookedAtMs: now,
    updatedAtMs: now,
    bookedAt: new Date(now).toISOString()
  };
}
