import type { Timestamp } from 'firebase/firestore'

// ============================================================================
// Ride data model — Base Link (military-rideshare)
// ============================================================================
// Matches the access rules in firestore.rules — see that file's header for
// which fields the client is and isn't trusted to set/change, and
// docs/status-transitions in README.md for the lifecycle diagram.

export type RideStatus =
    | 'REQUESTED' // rider created it, no driver yet
    | 'ACCEPTED' // an onboarded driver claimed it
    | 'IN_PROGRESS' // driver has started the trip
    | 'COMPLETED' // driver marked the trip finished; payment not yet settled
    | 'PAID' // Stripe PaymentIntent succeeded (server-only transition)
    | 'CANCELLED' // rider or driver cancelled before/while in progress

export interface RideLocation {
    address: string
    lat?: number
    lng?: number
}

export type PaymentStatus =
    | 'pending' // COMPLETED but no PaymentIntent created yet
    | 'processing' // PaymentIntent created, awaiting confirmation
    | 'succeeded'
    | 'failed'
    | 'refunded'

export interface RidePayment {
    stripePaymentIntentId?: string
    status: PaymentStatus
    // All amounts are in the smallest currency unit (cents for USD), same
    // convention Stripe uses, so no float/rounding mismatch between what
    // Firestore stores and what Stripe actually charged.
    amount?: number
    platformFeeAmount?: number
    driverPayoutAmount?: number
    currency?: string
}

export interface Ride {
    id: string
    riderId: string
    driverId: string | null
    status: RideStatus
    pickup: RideLocation
    dropoff: RideLocation
    // Estimated fare in cents, set once at request time by the client-side
    // placeholder calculator (src/lib/fare.ts) and immutable after create —
    // firestore.rules blocks any client update that changes it. This is a
    // flat placeholder, not real distance/time-based pricing (see the
    // existing "TODO: get routes from Google Maps API" note in
    // MilitaryRideShareApp.tsx) — replacing it is separate follow-up work,
    // not part of the payment plumbing this file supports.
    fare: number
    currency: string
    requestedAt: Timestamp
    acceptedAt?: Timestamp
    startedAt?: Timestamp
    completedAt?: Timestamp
    cancelledAt?: Timestamp
    cancelledBy?: 'rider' | 'driver'
    payment?: RidePayment
}

// Fields a rider is allowed to submit when creating a ride. Everything else
// (status, driverId, timestamps, payment) is set by createRideRequest()
// itself so a caller can't hand-craft a doc that skips the REQUESTED state
// or pre-fills payment/status fields — firestore.rules re-checks this
// server-side (rules-side) regardless.
export interface CreateRideInput {
    riderId: string
    pickup: RideLocation
    dropoff: RideLocation
    fare: number
    currency?: string
}
