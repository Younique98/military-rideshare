import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { isPlatformLaunched, PlatformNotLaunchedError } from '@/lib/launch'
import type { CreateRideInput, Ride } from '@/types/ride'

const ridesCollection = collection(db, 'rides')

/**
 * Creates a real ride request document in Firestore.
 *
 * Fails closed: this refuses to write anything when
 * `NEXT_PUBLIC_PLATFORM_LAUNCHED` is not exactly "true", independent of
 * whatever UI called it — see src/lib/launch.ts. This means the gate holds
 * even if a future UI path calls this function directly without going
 * through the pre-launch banner/waitlist branch in MilitaryRideShareApp.
 *
 * firestore.rules independently re-validates every field on create (riderId
 * must match the caller, status must be REQUESTED, driverId must be null,
 * no payment fields) — this function's job is just to shape a valid
 * request; it is not the security boundary.
 */
export async function createRideRequest(
    input: CreateRideInput
): Promise<string> {
    if (!isPlatformLaunched()) {
        throw new PlatformNotLaunchedError()
    }

    const docRef = await addDoc(ridesCollection, {
        riderId: input.riderId,
        driverId: null,
        status: 'REQUESTED',
        pickup: input.pickup,
        dropoff: input.dropoff,
        fare: input.fare,
        currency: input.currency ?? 'usd',
        requestedAt: serverTimestamp(),
    })

    return docRef.id
}

/** Live-subscribes to a single ride document (rider or assigned driver view). */
export function subscribeToRide(
    rideId: string,
    onChange: (ride: Ride | null) => void
): Unsubscribe {
    return onSnapshot(doc(db, 'rides', rideId), (snap) => {
        onChange(snap.exists() ? ({ id: snap.id, ...snap.data() } as Ride) : null)
    })
}

/**
 * Live-subscribes to the queue of REQUESTED rides with no driver yet.
 *
 * Only visible to a driver whose Firestore user profile has
 * `stripeOnboardingComplete: true` — a fact the Stripe Connect webhook sets
 * server-side once the driver has actually completed hosted onboarding, not
 * something the client can self-declare. firestore.rules enforces this
 * independently; this function only shapes the query.
 */
export function subscribeToRequestedRides(
    onChange: (rides: Ride[]) => void
): Unsubscribe {
    const q = query(
        ridesCollection,
        where('status', '==', 'REQUESTED'),
        orderBy('requestedAt', 'asc')
    )
    return onSnapshot(q, (snap) => {
        onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ride))
    })
}

/** Live-subscribes to a driver's currently active (accepted/in-progress) ride, if any. */
export function subscribeToDriverActiveRide(
    driverUid: string,
    onChange: (ride: Ride | null) => void
): Unsubscribe {
    const q = query(
        ridesCollection,
        where('driverId', '==', driverUid),
        where('status', 'in', ['ACCEPTED', 'IN_PROGRESS'])
    )
    return onSnapshot(q, (snap) => {
        const first = snap.docs[0]
        onChange(first ? ({ id: first.id, ...first.data() } as Ride) : null)
    })
}

/** Driver accepts a still-unclaimed REQUESTED ride. */
export async function acceptRide(rideId: string, driverUid: string): Promise<void> {
    await updateDoc(doc(db, 'rides', rideId), {
        status: 'ACCEPTED',
        driverId: driverUid,
        acceptedAt: serverTimestamp(),
    })
}

/** Assigned driver starts the trip. */
export async function startRide(rideId: string): Promise<void> {
    await updateDoc(doc(db, 'rides', rideId), {
        status: 'IN_PROGRESS',
        startedAt: serverTimestamp(),
    })
}

/**
 * Assigned driver marks the trip finished. This does NOT charge the rider —
 * it only flips the ride to COMPLETED so the rider's client can start the
 * Stripe payment step (POST /api/stripe/payment/create-intent). Moving the
 * ride to PAID happens only via the Stripe webhook, after the charge
 * actually succeeds.
 */
export async function completeRide(rideId: string): Promise<void> {
    await updateDoc(doc(db, 'rides', rideId), {
        status: 'COMPLETED',
        completedAt: serverTimestamp(),
    })
}

/** Rider or the assigned driver cancels before the trip is underway. */
export async function cancelRide(
    rideId: string,
    cancelledBy: 'rider' | 'driver'
): Promise<void> {
    await updateDoc(doc(db, 'rides', rideId), {
        status: 'CANCELLED',
        cancelledAt: serverTimestamp(),
        cancelledBy,
    })
}

export async function getRide(rideId: string): Promise<Ride | null> {
    const snap = await getDoc(doc(db, 'rides', rideId))
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Ride) : null
}
