import { db } from "../firebase/config.js";
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
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
  const seatLimit = Number(booking.maxPeoplePerSession);

  bookingsToDelete.forEach((existingBooking) => {
    if (
      existingBooking?.skillId === booking.skillId &&
      existingBooking?.dateValue
    ) {
      countUpdates[existingBooking.dateValue] =
        (countUpdates[existingBooking.dateValue] || 0) - 1;
    }
  });

  const now = Date.now();
  const payload = {
    skillId: booking.skillId,
    userId: booking.userId,
    learnerName: booking.learnerName || "Member",
    dateValue: booking.dateValue,
    bookedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    bookedAtMs: now,
    updatedAtMs: now
  };

  const docRef = doc(collection(db, COLLECTION_NAME));
  countUpdates[booking.dateValue] = (countUpdates[booking.dateValue] || 0) + 1;
  const availabilityRef = doc(db, "skillAvailability", String(booking.skillId));

  await runTransaction(db, async (transaction) => {
    const availabilitySnapshot = await transaction.get(availabilityRef);
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

    if (
      Number.isInteger(seatLimit) &&
      seatLimit > 0 &&
      Number(currentCounts[booking.dateValue]) > seatLimit
    ) {
      throw new Error("That session is already full. Please choose another date.");
    }

    bookingsToDelete.forEach((existingBooking) => {
      if (existingBooking?.id) {
        transaction.delete(doc(db, COLLECTION_NAME, existingBooking.id));
      }
    });

    transaction.set(docRef, payload);
    transaction.set(
      availabilityRef,
      {
        skillId: booking.skillId,
        bookingCounts: currentCounts,
        updatedAt: serverTimestamp(),
        updatedAtMs: now
      },
      { merge: true }
    );
  });

  return {
    id: docRef.id,
    skillId: booking.skillId,
    userId: booking.userId,
    learnerName: booking.learnerName || "Member",
    dateValue: booking.dateValue,
    bookedAtMs: now,
    updatedAtMs: now,
    bookedAt: new Date(now).toISOString()
  };
}

export async function cancelBookingInDb(booking, currentUserId = "") {
  if (!booking?.id) {
    throw new Error("A booking id is required.");
  }

  if (currentUserId && booking.userId !== currentUserId) {
    throw new Error("You can only cancel your own bookings.");
  }

  const bookingRef = doc(db, COLLECTION_NAME, booking.id);
  const availabilityRef = doc(db, "skillAvailability", String(booking.skillId));
  const now = Date.now();

  await runTransaction(db, async (transaction) => {
    const bookingSnapshot = await transaction.get(bookingRef);

    if (!bookingSnapshot.exists()) {
      return;
    }

    const existingBooking = bookingSnapshot.data();

    if (currentUserId && existingBooking.userId !== currentUserId) {
      throw new Error("You can only cancel your own bookings.");
    }

    const availabilitySnapshot = await transaction.get(availabilityRef);
    const currentCounts = availabilitySnapshot.exists()
      ? { ...(availabilitySnapshot.data().bookingCounts || {}) }
      : {};
    const dateValue = existingBooking.dateValue;
    const nextValue = Math.max((Number(currentCounts[dateValue]) || 0) - 1, 0);

    if (nextValue > 0) {
      currentCounts[dateValue] = nextValue;
    } else {
      delete currentCounts[dateValue];
    }

    transaction.delete(bookingRef);
    transaction.set(
      availabilityRef,
      {
        skillId: existingBooking.skillId,
        bookingCounts: currentCounts,
        updatedAt: serverTimestamp(),
        updatedAtMs: now
      },
      { merge: true }
    );
  });
}
