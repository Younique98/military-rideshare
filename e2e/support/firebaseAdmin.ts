/**
 * Admin-SDK helpers for seeding/advancing state directly in the Firebase
 * emulators during e2e tests — the same role the Stripe Connect webhook and
 * (for ride-status transitions we don't drive through a second real browser
 * session) a driver's own actions play in production. Talks to the same
 * local emulators the app's dev servers are pointed at (see
 * playwright.config.ts) via firebase-admin, not through the app's own
 * src/lib/firebase/admin.ts (that file is `server-only` and meant to run
 * inside Next.js's server bundle, not plain Node test code).
 */
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import {
    THROWAWAY_TEST_SERVICE_ACCOUNT_KEY,
    TEST_FIREBASE_PROJECT_ID,
} from '../../scripts/testServiceAccount'

function getTestAdminApp(): App {
    const existing = getApps().find((a) => a.name === 'e2e-admin')
    if (existing) return existing
    return initializeApp(
        { credential: cert(JSON.parse(THROWAWAY_TEST_SERVICE_ACCOUNT_KEY)) },
        'e2e-admin'
    )
}

export function adminAuth() {
    return getAuth(getTestAdminApp())
}

export function adminDb() {
    return getFirestore(getTestAdminApp())
}

/** Creates a fresh emulator Auth user with a password credential, ready to
 *  sign in through the real /login UI (fetchSignInMethodsForEmail will
 *  report a 'password' provider for it, same as a real registered user). */
export async function createTestUser(namePrefix: string) {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const email = `${namePrefix}-${suffix}@example.com`
    const password = 'Test-Passw0rd!'
    const userRecord = await adminAuth().createUser({
        uid: `${namePrefix}-${suffix}`,
        email,
        password,
        emailVerified: true,
    })
    return { uid: userRecord.uid, email, password }
}

/** Marks a driver as having completed Stripe Connect onboarding — in
 *  production this field is only ever set by the real webhook (Admin SDK,
 *  bypassing firestore.rules); this seeds the same end state so a test
 *  driver account can see the open-ride queue and accept rides, exactly as
 *  firestore.rules' isOnboardedDriver() expects. */
export async function markDriverOnboarded(uid: string) {
    await adminDb().collection('users').doc(uid).set(
        {
            stripeOnboardingComplete: true,
            stripeConnectedAccountId: `acct_test_${uid}`,
        },
        { merge: true }
    )
}

/** Polls Firestore for the most recent REQUESTED ride created by this
 *  rider (created by the real client-side createRideRequest() call through
 *  the UI) and returns its id. */
export async function waitForRequestedRide(riderId: string, timeoutMs = 15000) {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
        const snap = await adminDb()
            .collection('rides')
            .where('riderId', '==', riderId)
            .orderBy('requestedAt', 'desc')
            .limit(1)
            .get()
        if (!snap.empty) return snap.docs[0].id
        await new Promise((r) => setTimeout(r, 250))
    }
    throw new Error(`No ride found for rider ${riderId} within ${timeoutMs}ms`)
}

export async function waitForRideStatus(rideId: string, status: string, timeoutMs = 15000) {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
        const snap = await adminDb().collection('rides').doc(rideId).get()
        if (snap.exists && snap.data()?.status === status) return
        await new Promise((r) => setTimeout(r, 250))
    }
    throw new Error(`Ride ${rideId} did not reach status ${status} within ${timeoutMs}ms`)
}

export { TEST_FIREBASE_PROJECT_ID }
