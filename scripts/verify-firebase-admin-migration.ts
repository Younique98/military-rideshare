/**
 * One-off verification script for the firebase-admin 13 -> 14 major version
 * bump (see PR description / launch.ts / lib/firebase/admin.ts).
 *
 * This does NOT mock firebase-admin. It runs the app's real
 * src/lib/firebase/admin.ts and src/lib/api/auth.ts against a real, local
 * Firebase Auth + Firestore emulator pair, and drives every admin-SDK-backed
 * code path the Stripe routes depend on:
 *
 *   1. getAdminAuth().verifyIdToken()   — via requireAuthenticatedUid(), the
 *      exact function every Stripe route calls to authenticate a caller.
 *      Exercises both the success path (a real, emulator-issued ID token)
 *      and the failure path (a garbage token must still be rejected).
 *   2. getAdminDb() Firestore reads/writes — .get(), .set(merge), .update()
 *      — the same calls used in the create-intent, onboarding-link, and
 *      webhook routes.
 *
 * Requires the Firebase emulators running locally first:
 *   npx firebase-tools@13 emulators:start --only auth,firestore --project demo-baselink
 *
 * Usage:
 *   FIRESTORE_EMULATOR_HOST=localhost:8085 \
 *   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
 *   npx tsx scripts/verify-firebase-admin-migration.ts
 */
import assert from 'node:assert/strict'
import { THROWAWAY_TEST_SERVICE_ACCOUNT_KEY } from './testServiceAccount'

process.env.FIREBASE_SERVICE_ACCOUNT_KEY = THROWAWAY_TEST_SERVICE_ACCOUNT_KEY

async function main() {
    const { getAdminAuth, getAdminDb } = await import('../src/lib/firebase/admin')
    const { requireAuthenticatedUid, UnauthorizedError } = await import('../src/lib/api/auth')

    const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST
    const apiKey = 'fake-api-key' // any string works against the Auth emulator

    console.log('== firebase-admin migration verification (13 -> 14) ==')
    const { readFileSync } = await import('node:fs')
    const { fileURLToPath } = await import('node:url')
    const path = await import('node:path')
    const repoRoot = path.dirname(fileURLToPath(import.meta.url)) + '/..'
    const adminPkgPath = path.join(repoRoot, 'node_modules/firebase-admin/package.json')
    console.log('firebase-admin version:', JSON.parse(readFileSync(adminPkgPath, 'utf8')).version)

    // ------------------------------------------------------------------
    // 1a. Admin Auth: create a real user via the Admin SDK against the
    //     emulator (exercises getAdminAuth()).
    // ------------------------------------------------------------------
    const uid = `test-uid-${Date.now()}`
    const adminAuth = getAdminAuth()
    await adminAuth.createUser({ uid, email: `${uid}@example.com` })
    console.log('[ok] getAdminAuth().createUser() created', uid)

    // ------------------------------------------------------------------
    // 1b. Mint a custom token via the Admin SDK, then exchange it for a
    //     real ID token via the Auth emulator's REST endpoint — exactly
    //     the shape of ID token a real signed-in client would send in the
    //     Authorization header of a Stripe route request.
    // ------------------------------------------------------------------
    const customToken = await adminAuth.createCustomToken(uid)
    console.log('[ok] getAdminAuth().createCustomToken() minted a custom token')

    const exchangeRes = await fetch(
        `http://${authEmulatorHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: customToken, returnSecureToken: true }),
        }
    )
    if (!exchangeRes.ok) {
        throw new Error(`custom token exchange failed: ${await exchangeRes.text()}`)
    }
    const { idToken } = (await exchangeRes.json()) as { idToken: string }
    console.log('[ok] exchanged custom token for a real ID token via the Auth emulator')

    // ------------------------------------------------------------------
    // 2. requireAuthenticatedUid() — the exact function every Stripe route
    //    calls. Build a fake NextRequest-shaped object with the real
    //    Authorization header a client would send.
    // ------------------------------------------------------------------
    const fakeRequest = {
        headers: new Headers({ Authorization: `Bearer ${idToken}` }),
    } as unknown as import('next/server').NextRequest

    const verifiedUid = await requireAuthenticatedUid(fakeRequest)
    assert.equal(verifiedUid, uid)
    console.log('[ok] requireAuthenticatedUid() verified a real ID token and returned the correct uid')

    // ------------------------------------------------------------------
    // 3. requireAuthenticatedUid() must still reject garbage / missing
    //    tokens (the fail-closed path every route relies on).
    // ------------------------------------------------------------------
    const badRequest = {
        headers: new Headers({ Authorization: 'Bearer not-a-real-token' }),
    } as unknown as import('next/server').NextRequest
    let rejected = false
    try {
        await requireAuthenticatedUid(badRequest)
    } catch (err) {
        rejected = err instanceof UnauthorizedError
    }
    assert.ok(rejected, 'requireAuthenticatedUid() must reject an invalid ID token')
    console.log('[ok] requireAuthenticatedUid() correctly rejected an invalid token')

    const noHeaderRequest = { headers: new Headers() } as unknown as import('next/server').NextRequest
    let rejectedNoHeader = false
    try {
        await requireAuthenticatedUid(noHeaderRequest)
    } catch (err) {
        rejectedNoHeader = err instanceof UnauthorizedError
    }
    assert.ok(rejectedNoHeader, 'requireAuthenticatedUid() must reject a missing Authorization header')
    console.log('[ok] requireAuthenticatedUid() correctly rejected a missing Authorization header')

    // ------------------------------------------------------------------
    // 4. Admin Firestore — the same .get() / .set(merge) / .update() calls
    //    used in create-intent, onboarding-link, and webhook routes.
    // ------------------------------------------------------------------
    const db = getAdminDb()
    const userRef = db.collection('users').doc(uid)

    // onboarding-link route pattern: set(..., { merge: true })
    await userRef.set(
        { stripeConnectedAccountId: 'acct_test123', stripeOnboardingComplete: false },
        { merge: true }
    )
    let snap = await userRef.get()
    assert.equal(snap.data()?.stripeConnectedAccountId, 'acct_test123')
    console.log('[ok] getAdminDb() set(merge) + get() round-tripped a document (onboarding-link pattern)')

    // webhook route pattern: update() flipping a nested/top-level field
    await userRef.update({ stripeOnboardingComplete: true })
    snap = await userRef.get()
    assert.equal(snap.data()?.stripeOnboardingComplete, true)
    console.log('[ok] getAdminDb() update() applied a partial write (webhook pattern)')

    // create-intent route pattern: create a ride doc, read it, update nested
    // payment.* fields, matching src/app/api/stripe/payment/create-intent.
    const rideRef = db.collection('rides').doc('test-ride-1')
    await rideRef.set({
        riderId: uid,
        driverId: 'driver-1',
        status: 'COMPLETED',
        fare: 2500,
        currency: 'usd',
    })
    await rideRef.update({
        payment: {
            stripePaymentIntentId: 'pi_test123',
            status: 'processing',
            amount: 2500,
            platformFeeAmount: 375,
            driverPayoutAmount: 2125,
            currency: 'usd',
        },
    })
    const rideSnap = await rideRef.get()
    assert.equal(rideSnap.data()?.payment?.stripePaymentIntentId, 'pi_test123')
    console.log('[ok] getAdminDb() nested-field update() round-tripped a ride.payment write (create-intent pattern)')

    // webhook route pattern: dot-path update on a nested field
    await rideRef.update({ status: 'PAID', 'payment.status': 'succeeded' })
    const paidSnap = await rideRef.get()
    assert.equal(paidSnap.data()?.status, 'PAID')
    assert.equal(paidSnap.data()?.payment?.status, 'succeeded')
    console.log('[ok] getAdminDb() dot-path update() applied correctly (webhook payment_intent.succeeded pattern)')

    console.log('\nAll firebase-admin v14 auth-verification and Firestore Admin code paths PASSED against the emulator.')
}

main().catch((err) => {
    console.error('\n[FAIL]', err)
    process.exit(1)
})
