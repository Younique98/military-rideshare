import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getAdminDb } from '@/lib/firebase/admin'
import { getStripeClient } from '@/lib/stripe/server'

// ============================================================================
// POST /api/stripe/webhook
// ============================================================================
// Handles the Connect + payment lifecycle events this app cares about.
// Configure this URL (https://<your-domain>/api/stripe/webhook) in the
// Stripe Dashboard (or `stripe listen` for local testing) and set
// STRIPE_WEBHOOK_SECRET to the signing secret Stripe gives you for it — see
// .env.example.
//
// Every write this handler makes uses the Admin SDK, which bypasses
// firestore.rules. That is intentional and is the *only* legitimate way
// ride.status becomes 'PAID' or a user's stripeOnboardingComplete becomes
// true — firestore.rules explicitly blocks the client from setting either
// of those itself (see that file's comments), specifically so this webhook,
// driven only by Stripe's own signed events, is the sole path to them.
export async function POST(request: NextRequest) {
    const signature = request.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
        return NextResponse.json(
            { error: 'STRIPE_WEBHOOK_SECRET is not configured' },
            { status: 503 }
        )
    }
    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    // Signature verification needs the exact raw request body — do not
    // JSON.parse before this, or verification will fail.
    const rawBody = await request.text()

    let event: Stripe.Event
    try {
        event = getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (error) {
        return NextResponse.json(
            { error: `Webhook signature verification failed: ${(error as Error).message}` },
            { status: 400 }
        )
    }

    const db = getAdminDb()

    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            const rideId = paymentIntent.metadata?.rideId
            if (rideId) {
                await db.collection('rides').doc(rideId).update({
                    status: 'PAID',
                    'payment.status': 'succeeded',
                    'payment.stripePaymentIntentId': paymentIntent.id,
                })
            }
            break
        }

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            const rideId = paymentIntent.metadata?.rideId
            if (rideId) {
                // Leave ride.status at COMPLETED (not PAID) so the rider can
                // retry payment — only the nested payment.status reflects
                // the failure.
                await db.collection('rides').doc(rideId).update({
                    'payment.status': 'failed',
                    'payment.stripePaymentIntentId': paymentIntent.id,
                })
            }
            break
        }

        case 'charge.refunded': {
            const charge = event.data.object as Stripe.Charge
            const paymentIntentId =
                typeof charge.payment_intent === 'string' ? charge.payment_intent : undefined
            if (paymentIntentId) {
                const matches = await db
                    .collection('rides')
                    .where('payment.stripePaymentIntentId', '==', paymentIntentId)
                    .limit(1)
                    .get()
                if (!matches.empty) {
                    await matches.docs[0].ref.update({ 'payment.status': 'refunded' })
                }
            }
            break
        }

        case 'account.updated': {
            const account = event.data.object as Stripe.Account
            const uid = account.metadata?.firebaseUid
            const onboardingComplete = Boolean(account.charges_enabled && account.details_submitted)

            if (uid) {
                await db
                    .collection('users')
                    .doc(uid)
                    .set(
                        {
                            stripeConnectedAccountId: account.id,
                            stripeOnboardingComplete: onboardingComplete,
                        },
                        { merge: true }
                    )
            } else {
                // Fallback for accounts created without the metadata tag
                // (shouldn't happen via our onboarding route, but keeps this
                // handler correct if an account is ever created another way).
                const matches = await db
                    .collection('users')
                    .where('stripeConnectedAccountId', '==', account.id)
                    .limit(1)
                    .get()
                if (!matches.empty) {
                    await matches.docs[0].ref.update({
                        stripeOnboardingComplete: onboardingComplete,
                    })
                }
            }
            break
        }

        default:
            // Unhandled event types are acknowledged (200) and ignored —
            // Stripe retries on non-2xx responses, and there's nothing to
            // retry for events this app doesn't act on.
            break
    }

    return NextResponse.json({ received: true })
}
