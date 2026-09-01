import { getStorage } from 'firebase/storage'
import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// These are the public Firebase Web SDK config values (API key, project id,
// etc.) — Firebase's own docs confirm they are safe to ship to the client
// and are not secrets; the actual access control lives in Firestore/Storage
// security rules, not in keeping this object private. Values are still read
// from env vars (rather than hardcoded) so per-environment (dev/staging/
// prod) Firebase projects can be swapped without a code change.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
let analytics
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app)
        }
    })
}
// Initialize Storage
const storage = getStorage(app)
// Initialize Auth
const auth = getAuth(app);
// Initialize Firestore
const db = getFirestore(app)



export { app, analytics, storage, auth, db}
