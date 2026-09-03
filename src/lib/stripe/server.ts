import 'server-only'
import Stripe from 'stripe'

// ============================================================================
// Stripe Connect (marketplace) server client — Base Link
// ============================================================================
// This is NOT a simple "customer pays the platform" integration. A rider
// pays for a ride and the driver needs to actually receive that money minus
// Base Link's cut, so this uses Stripe Connect (Express accounts) with
// destination charges: one PaymentIntent, created with
// `application_fee_amount` and `transfer_data.destination`, and Stripe
// splits the money automatically. Nobody at Base Link ever touches or
// manually moves driver payouts.

// Platform's cut of every completed ride, as a percentage of the fare.
// Named and centralized here on purpose — this is the one number Erica
// needs to change to adjust pricing, and every call site imports it rather
// than hardcoding a percentage inline.
export const PLATFORM_FEE_PERCENT = 15

/** Rounds to the nearest cent — application_fee_amount must be an integer. */
export function calculatePlatformFeeAmount(fareAmountCents: number): number {
    return Math.round((fareAmountCents * PLATFORM_FEE_PERCENT) / 100)
}

let stripeClient: Stripe | null = null

/**
 * Lazily-constructed Stripe client. Lazy (rather than constructed at module
 * load) so importing this file doesn't itself throw in an environment where
 * STRIPE_SECRET_KEY isn't configured yet (e.g. `next build` / typecheck) —
 * the error only surfaces when a route actually tries to call Stripe.
 */
export function getStripeClient(): Stripe {
    if (stripeClient) {
        return stripeClient
    }

    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
        throw new Error(
            'STRIPE_SECRET_KEY is not set. Stripe Connect onboarding and ' +
                'payments are unavailable until this is configured — see .env.example.'
        )
    }

    stripeClient = new Stripe(secretKey, {
        apiVersion: '2025-02-24.acacia',
    })
    return stripeClient
}
