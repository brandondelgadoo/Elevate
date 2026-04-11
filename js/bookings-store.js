import { db } from "../firebase/config.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const COLLECTION_NAME = "bookings";

export async function listBookingsForUserFromDb(userId) {
  if (!userId) {
    return [];
  }

  const bookingsQuery = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
  const snapshot = await getDocs(bookingsQuery);

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data()
  }));
}

export async function replaceBookingInDb(existingBookings, booking) {
  const bookingsToDelete = Array.isArray(existingBookings) ? existingBookings : [];
  const countUpdates = {};

  bookingsToDelete.forEach((existingBooking) => {
    if (
      existingBooking?.skillId === booking.skillId &&
      existingBooking?.dateValue
    ) {
      countUpdates[existingBooking.dateValue] =
        (countUpdates[existingBooking.dateValue] || 0) - 1;
    }
  });

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
  countUpdates[booking.dateValue] = (countUpdates[booking.dateValue] || 0) + 1;

  const { updateSkillAvailabilityCounts } = await import("./skill-availability-store.js");
  await updateSkillAvailabilityCounts(booking.skillId, countUpdates);

  return {
    id: docRef.id,
    ...booking,
    bookedAtMs: now,
    updatedAtMs: now,
    bookedAt: new Date(now).toISOString()
  };
}
