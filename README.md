# Elevate - Community Skill-Sharing Platform

Elevate is a Firebase-backed community skill-sharing app. Users can sign up,
complete a profile, browse skill posts, create teach posts, request skills,
book sessions, and view their activity from the dashboard.

## Main Flows To Verify

Use this checklist before presenting or deploying the app:

1. Sign up with email/password and complete the profile.
2. Log out, log back in, and confirm incomplete profiles are redirected to signup.
3. Create a teach post with at least one available date.
4. Confirm the teach post appears on the home page and Explore page.
5. Search from the home page and confirm Explore opens with the query applied.
6. Search, filter, sort, and clear filters on Explore.
7. Book a session from Explore and confirm the booking success message.
8. Create a skill request from the Request page.
9. Open Dashboard and confirm profile info, upcoming bookings, skill posts, and requests appear.
10. Confirm another logged-in user cannot see bookings that belong to the first user.

## Firebase Deployment Notes

The suggested Firestore rules live in `firebase/firestore.rules`. Deploy them
with the Firebase CLI after confirming the collection names match the active
project:

```bash
firebase deploy --only firestore:rules
```

If you are starting with an empty Firestore database, seed the starter skills
before locking the project to these rules, or create the initial skill posts
from an authenticated account.

The browser app should be served from an authorized Firebase Auth domain. Add
the deployed host in Firebase Authentication settings before testing Google
sign-in.
