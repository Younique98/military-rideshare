import type { RideLocation } from '@/types/ride'

// ============================================================================
// Placeholder fare estimator
// ============================================================================
// There is no live Google Maps / routing integration yet (see the existing
// "//TODO: (ET) Get routes and directions from google maps api" note in
// MilitaryRideShareApp.tsx and the "Working with Maps" section of
// README.md), so real distance/time-based pricing isn't possible today.
//
// This returns a flat placeholder fare so the real Stripe Connect payment
// path (application fee + transfer to the driver's connected account) has a
// real number to work with end-to-end. Swapping this for real pricing is a
// separate, self-contained follow-up — nothing in the payment code depends
// on *how* the fare number was produced, only that it's a positive integer
// number of cents at ride-creation time.

export const PLACEHOLDER_FLAT_FARE_CENTS = 1500 // $15.00

export function estimateFareCents(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pickup: RideLocation,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dropoff: RideLocation
): number {
    return PLACEHOLDER_FLAT_FARE_CENTS
}
