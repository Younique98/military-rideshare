import 'server-only'
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// ============================================================================
// Firebase Admin SDK — SERVER ONLY
// ============================================================================
// Used exclusively by the Stripe API routes (src/app/api/stripe/**) to:
//   1. verify the Firebase ID token a client sends in the Authorization
//      header (so a Stripe route knows which real, signed-in user is
//      calling it), and
//   2. write server-trusted fields (stripeConnectedAccountId,
//      stripeOnboardingComplete, ride.payment, ride.status = 'PAID') that
//      firestore.rules deliberately does not let the client set — see the
//      rules file's comments on each of those fields for why.
//
// The `server-only` import makes any accidental client-bundle import of
// this file a build-time error rather than a leaked service-account key.
//
// Configuration: FIREBASE_SERVICE_ACCOUNT_KEY must hold the full service
// account JSON (as a single-line string) for the same Firebase project
// named by NEXT_PUBLIC_FIREBASE_PROJECT_ID — see .env.example. This is a
// secret and must never be prefixed NEXT_PUBLIC_ or committed.
function getAdminApp(): App {
    const existing = getApps()
    if (existing.length > 0) {
        return existing[0]
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!serviceAccountKey) {
        throw new Error(
            'FIREBASE_SERVICE_ACCOUNT_KEY is not set. Server-side Firebase ' +
                'Admin access (required by the Stripe API routes) is unavailable ' +
                'until this is configured — see .env.example.'
        )
    }

    let serviceAccount: Record<string, unknown>
    try {
        serviceAccount = JSON.parse(serviceAccountKey)
    } catch {
        throw new Error(
            'FIREBASE_SERVICE_ACCOUNT_KEY is set but is not valid JSON. It must ' +
                'be the full Firebase service account key file contents, minified ' +
                'to a single line.'
        )
    }

    return initializeApp({
        credential: cert(serviceAccount as never),
    })
}

export function getAdminAuth() {
    return getAuth(getAdminApp())
}

export function getAdminDb() {
    return getFirestore(getAdminApp())
}
