// ============================================================================
// Pre-launch gate — Base Link (military-rideshare)
// ============================================================================
//
// Most US states require a Transportation Network Company (TNC) license
// (plus insurance) before a ride-matching-for-pay service can operate for
// real, paying members of the public. Base Link's ride-request and Stripe
// Connect payment code is built and real (see src/lib/firebase/rides.ts and
// src/app/api/stripe/**), but it must not be reachable by real users until
// that licensing/insurance is in place in whatever state the app launches
// in — that is a legal precondition, not a feature flag decision made
// lightly.
//
// `NEXT_PUBLIC_PLATFORM_LAUNCHED` is the single on/off switch for that. It
// follows the same pattern already established for `NEXT_PUBLIC_DEMO_MODE`
// in MilitaryRideShareApp.tsx: a real feature exists in the codebase, and an
// explicit, narrowly-checked env var decides whether the public-facing UI
// (and, here, the actual write path) is allowed to use it.
//
// FAIL CLOSED: isPlatformLaunched() only ever returns true for the exact
// string "true". Unset, empty, "false", "1", "TRUE", a typo, or any other
// value all resolve to false (not launched). This is deliberate — a missing
// or misconfigured env var in a new deployment must never accidentally open
// real ride creation and real Stripe charges to the public.
//
// This same check is used in three places, so a misconfiguration in one
// can't quietly leave another one live:
//   1. UI      — MilitaryRideShareApp.tsx shows the pre-launch banner and
//                routes "Request a Ride" to the waitlist instead of the
//                real booking flow.
//   2. Client  — createRideRequest(), acceptRide(), startRide(), and
//                completeRide() in src/lib/firebase/rides.ts each
//                independently refuse to write when not launched, so the
//                gate holds on every ride-status transition even if some
//                other UI path called one of them directly.
//   3. Server  — the Stripe PaymentIntent route
//                (src/app/api/stripe/payment/create-intent/route.ts) refuses
//                to create a real charge when not launched, independent of
//                whatever the client sent.
export function isPlatformLaunched(): boolean {
    return process.env.NEXT_PUBLIC_PLATFORM_LAUNCHED === 'true'
}

export const PLATFORM_NOT_LAUNCHED_MESSAGE =
    'Base Link is in pre-launch testing. Real rides and payments are not yet available in your state.'

export class PlatformNotLaunchedError extends Error {
    constructor(message: string = PLATFORM_NOT_LAUNCHED_MESSAGE) {
        super(message)
        this.name = 'PlatformNotLaunchedError'
    }
}
