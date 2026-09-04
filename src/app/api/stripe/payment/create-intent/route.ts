import { NextRequest, NextResponse } from 'next/server'
import { requireAuthenticatedUid, UnauthorizedError } from '@/lib/api/auth'
import { getAdminDb } from '@/lib/firebase/admin'
import { calculatePlatformFeeAmount, getStripeClient } from '@/lib/stripe/server'
import { isPlatformLaunched, PLATFORM_NOT_LAUNCHED_MESSAGE } from '@/lib/launch'

// ============================================================================
// POST /api/stripe/payment/create-intent
// ============================================================================
// Body: { rideId: string }
//
// Creates the Stripe PaymentIntent that actually charges a rider once their
// ride reaches COMPLETED, using Stripe Connect's destination-charge shape:
// `application_fee_amount` (Base Link's cut, see PLATFORM_FEE_PERCENT) and
// `transfer_data.destination` (the driver's connected account) are both set
// on the one PaymentIntent, so Stripe splits and transfers the money
// automatically — this route never moves money itself.
//
// The `clientSecret` this returns is what the rider-facing Payment Element
// (src/components/features/payment/RidePaymentForm.tsx) mounts against to
// actually collect and confirm a card — this route creates the charge
// server-side, the Payment Element is what lets the rider enter and submit
// a real payment method against it. Idempotent by ride: a ride with a
// still-confirmable PaymentIntent (not yet succeeded/canceled) gets that
// same PaymentIntent's client secret back instead of a new one, so mounting
// the Payment Element more than once (a remount, or retrying after a
// decline) doesn't fork off duplicate PaymentIntents for the same ride.
//
// GATE: this refuses to create a real PaymentIntent unless
// NEXT_PUBLIC_PLATFORM_LAUNCHED is exactly "true" (fails closed — see
// src/lib/launch.ts). The UI already keeps riders from reaching a COMPLETED
// ride at all pre-launch (no ride can be created in the first place — see
// createRideRequest in src/lib/firebase/rides.ts), but this check exists so
// this specific route can never create a real charge on its own, regardless
// of what any client sends it. This is what "testable, but not live" means
// for the payment code: set the flag to "true" in a local/dev environment
// with real Stripe test keys to exercise this route; it stays off by
// default and in production until Erica's TNC license/insurance is in
// place.
export async function POST(request: NextRequest) {
    if (!isPlatformLaunched()) {
        return NextResponse.json({ error: PLATFORM_NOT_LAUNCHED_MESSAGE }, { status: 403 })
    }

    let uid: string
    try {
        uid = await requireAuthenticatedUid(request)
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        throw error
    }

    let body: { rideId?: unknown }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const rideId = body.rideId
    if (typeof rideId !== 'string' || !rideId) {
        return NextResponse.json({ error: 'rideId is required' }, { status: 400 })
    }

    const db = getAdminDb()
    const rideRef = db.collection('rides').doc(rideId)
    const rideSnap = await rideRef.get()
    if (!rideSnap.exists) {
        return NextResponse.json({ error: 'Ride not found' }, { status: 404 })
    }
    const ride = rideSnap.data()!

    // Only the rider on this specific ride may pay for it.
    if (ride.riderId !== uid) {
        return NextResponse.json({ error: 'Not authorized for this ride' }, { status: 403 })
    }

    if (ride.status !== 'COMPLETED') {
        return NextResponse.json(
            { error: `Ride must be COMPLETED before payment; current status is ${ride.status}` },
            { status: 409 }
        )
    }

    if (!ride.driverId) {
        return NextResponse.json({ error: 'Ride has no assigned driver' }, { status: 409 })
    }

    const driverSnap = await db.collection('users').doc(ride.driverId).get()
    const driverAccountId = driverSnap.exists
        ? (driverSnap.data()?.stripeConnectedAccountId as string | undefined)
        : undefined
    const driverOnboardingComplete = driverSnap.exists
        ? Boolean(driverSnap.data()?.stripeOnboardingComplete)
        : false

    if (!driverAccountId || !driverOnboardingComplete) {
        return NextResponse.json(
            { error: 'Driver has not completed Stripe Connect onboarding yet' },
            { status: 409 }
        )
    }

    const fareAmount = ride.fare as number
    const platformFeeAmount = calculatePlatformFeeAmount(fareAmount)
    const currency = (ride.currency as string | undefined) ?? 'usd'

    const stripe = getStripeClient()

    // Reuse an existing, still-confirmable PaymentIntent for this ride
    // rather than creating a new one on every call — see the route comment
    // above. A PaymentIntent left in requires_payment_method (e.g. after a
    // declined card) can simply be confirmed again with a different payment
    // method; there's no need to abandon it.
    const existingIntentId = ride.payment?.stripePaymentIntentId as string | undefined
    if (existingIntentId) {
        const existingIntent = await stripe.paymentIntents.retrieve(existingIntentId)
        if (existingIntent.status !== 'succeeded' && existingIntent.status !== 'canceled') {
            return NextResponse.json({
                clientSecret: existingIntent.client_secret,
                paymentIntentId: existingIntent.id,
            })
        }
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: fareAmount,
        currency,
        application_fee_amount: platformFeeAmount,
        transfer_data: {
            destination: driverAccountId,
        },
        metadata: {
            rideId,
            riderId: uid,
            driverId: ride.driverId,
        },
    })

    await rideRef.update({
        payment: {
            stripePaymentIntentId: paymentIntent.id,
            status: 'processing',
            amount: fareAmount,
            platformFeeAmount,
            driverPayoutAmount: fareAmount - platformFeeAmount,
            currency,
        },
    })

    return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
    })
}
