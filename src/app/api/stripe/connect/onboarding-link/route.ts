import { NextRequest, NextResponse } from 'next/server'
import { requireAuthenticatedUid, UnauthorizedError } from '@/lib/api/auth'
import { getAdminDb } from '@/lib/firebase/admin'
import { getStripeClient } from '@/lib/stripe/server'

// ============================================================================
// POST /api/stripe/connect/onboarding-link
// ============================================================================
// Creates (or reuses) a Stripe Connect Express account for the calling
// driver and returns a fresh, single-use hosted-onboarding URL
// (`accountLinks.create`) for the client to redirect the browser to.
//
// This route is intentionally NOT gated behind NEXT_PUBLIC_PLATFORM_LAUNCHED
// — a driver completing Stripe's identity/bank-account onboarding ahead of
// launch is exactly the kind of setup Erica needs to be able to test and
// prepare before flipping that flag, and it does not move any money or
// create any ride. Actually paying a driver (the create-intent route) is
// what's gated, not getting them able to receive a payout in the first
// place.
//
// `stripeConnectedAccountId` is written to users/{uid} using the Admin SDK,
// which bypasses firestore.rules — this is deliberate: firestore.rules
// blocks the client itself from ever setting stripeConnectedAccountId or
// stripeOnboardingComplete (see that file), specifically so this value can
// only ever come from a real Stripe account created through this
// server-side flow.
export async function POST(request: NextRequest) {
    let uid: string
    try {
        uid = await requireAuthenticatedUid(request)
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        throw error
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    let stripe
    try {
        stripe = getStripeClient()
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Stripe is not configured' },
            { status: 503 }
        )
    }

    const db = getAdminDb()
    const userRef = db.collection('users').doc(uid)
    const userSnap = await userRef.get()
    const existingAccountId = userSnap.exists
        ? (userSnap.data()?.stripeConnectedAccountId as string | undefined)
        : undefined

    let accountId = existingAccountId
    if (!accountId) {
        const account = await stripe.accounts.create({
            type: 'express',
            capabilities: {
                transfers: { requested: true },
                card_payments: { requested: true },
            },
            metadata: { firebaseUid: uid },
        })
        accountId = account.id

        await userRef.set(
            {
                stripeConnectedAccountId: accountId,
                // Not onboarding-complete just because the account was
                // created — that only becomes true once Stripe confirms it
                // via the account.updated webhook event (see
                // src/app/api/stripe/webhook/route.ts).
                stripeOnboardingComplete: false,
            },
            { merge: true }
        )
    }

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${appUrl}/driver/payouts?onboarding=refresh`,
        return_url: `${appUrl}/driver/payouts?onboarding=return`,
        type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
}
