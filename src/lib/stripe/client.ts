import { loadStripe, type Stripe } from '@stripe/stripe-js'

// ============================================================================
// Stripe.js client-side loader — Base Link
// ============================================================================
// Counterpart to src/lib/stripe/server.ts's getStripeClient(), for the
// browser. loadStripe() fetches Stripe.js and resolves once, so this module
// caches the resulting promise the same way the server client is
// lazily-constructed-once — importing this file must not itself throw in an
// environment where the publishable key isn't configured yet; the rejection
// only happens when a component actually tries to mount the Payment
// Element.
let stripePromise: Promise<Stripe | null> | null = null

/**
 * Lazily-loaded Stripe.js instance for the rider-facing Payment Element
 * (src/components/features/payment/RidePaymentForm.tsx). Only reads the
 * publishable key — NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is safe to ship to
 * the client by design (that's what a Stripe *publishable* key is for), the
 * same way the Firebase web config is (see src/lib/firebase/config.ts).
 *
 * This performs no gating of its own. The pre-launch gate
 * (src/lib/launch.ts) is enforced independently by the caller (the ride
 * never reaches COMPLETED pre-launch, and RidePaymentForm re-checks
 * isPlatformLaunched() before ever calling this) and, regardless, by the
 * server: /api/stripe/payment/create-intent refuses to create a real
 * PaymentIntent while NEXT_PUBLIC_PLATFORM_LAUNCHED isn't "true", so even a
 * fully-loaded Payment Element has no client secret to confirm against.
 */
export function getStripeJsPromise(): Promise<Stripe | null> {
    if (stripePromise) {
        return stripePromise
    }

    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
        throw new Error(
            'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. The rider payment ' +
                'UI is unavailable until this is configured — see .env.example.'
        )
    }

    stripePromise = loadStripe(publishableKey)
    return stripePromise
}
