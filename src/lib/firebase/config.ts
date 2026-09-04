import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

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

// ============================================================================
// Firebase Local Emulator Suite — TEST/DEV ONLY
// ============================================================================
// Same fail-closed, explicit-flag pattern as NEXT_PUBLIC_DEMO_MODE and
// NEXT_PUBLIC_PLATFORM_LAUNCHED (see src/lib/launch.ts): unset/anything but
// the exact string "true" leaves this app talking to the real Firebase
// project named by NEXT_PUBLIC_FIREBASE_* above. Only the Playwright e2e
// suite (see playwright.config.ts, which starts `next dev` with this env
// var set) turns it on, so real rides, real users, and real Stripe-adjacent
// data are never reachable from a test run.
const useFirebaseEmulator =
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'

if (useFirebaseEmulator) {
    // Idempotent guards: React Strict Mode / Fast Refresh can re-run this
    // module, and connect*Emulator() throws if called more than once on the
    // same instance.
    const g = globalThis as unknown as { __firebaseEmulatorsConnected?: boolean }
    if (!g.__firebaseEmulatorsConnected) {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
        connectFirestoreEmulator(db, '127.0.0.1', 8085)
        connectStorageEmulator(storage, '127.0.0.1', 9199)
        g.__firebaseEmulatorsConnected = true
    }
}

export { app, analytics, storage, auth, db}
