'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js'
import type { Appearance } from '@stripe/stripe-js'
import { AlertCircle, CheckCircle2, Loader2, Rocket } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { isPlatformLaunched, PLATFORM_NOT_LAUNCHED_MESSAGE } from '@/lib/launch'
import { getStripeJsPromise } from '@/lib/stripe/client'
import type { Ride } from '@/types/ride'

// ============================================================================
// Rider-side card collection — Base Link
// ============================================================================
// This is the piece the original Stripe Connect payment build (server.ts,
// the create-intent route, the webhook, the pre-launch gate) stopped short
// of on purpose: an actual Stripe Elements Payment Element a rider can type
// a real card into. See create-intent/route.ts for where the client secret
// this mounts against comes from, and src/app/api/stripe/webhook/route.ts
// for how a successful charge eventually flips ride.status to 'PAID'.

// Stripe's Payment Element `appearance` API, themed to Base Link's brand
// tokens (Steel Blue / Marine Blue / Soft Gold / destructive red — see the
// --primary/--secondary/--accent/--destructive custom properties in
// src/app/globals.css) instead of left as Stripe's default styling. The
// Payment Element renders inside an iframe, so it can't read this app's CSS
// custom properties — these are the same colors as literal hex, which is
// what the appearance API needs.
const PAYMENT_ELEMENT_APPEARANCE: Appearance = {
    theme: 'stripe',
    variables: {
        colorPrimary: '#2E5C8A', // Steel Blue — brand-primary
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorTextSecondary: '#4b5563',
        colorDanger: '#d3241f', // matches --destructive
        fontFamily: 'Arial, Helvetica, sans-serif',
        borderRadius: '8px',
        spacingUnit: '4px',
    },
    rules: {
        '.Tab': { borderColor: '#d1d5db' },
        '.Tab:hover': { color: '#2E5C8A' },
        '.Tab--selected': {
            borderColor: '#2E5C8A',
            backgroundColor: '#f0f4f8',
        },
        '.Input:focus': { borderColor: '#2E5C8A' },
        '.Label': { color: '#1B4075' }, // Marine Blue — brand-secondary
    },
}

interface RidePaymentFormProps {
    ride: Ride
    /** Called once Stripe confirms the payment succeeded client-side. The
     *  ride document's own status only becomes 'PAID' once the webhook
     *  processes payment_intent.succeeded (server-side, from Stripe's own
     *  signed event — see src/app/api/stripe/webhook/route.ts), which the
     *  caller's subscribeToRide() live subscription already reacts to on
     *  its own; this callback exists purely for an immediate UI cue in the
     *  moment before that arrives. */
    onPaid?: () => void
}

/**
 * Rider-facing card collection UI for a COMPLETED ride.
 *
 * GATE: independently re-checks isPlatformLaunched() before rendering
 * anything Stripe-related — the same "checked independently in more than
 * one place" pattern the rest of the payment code follows (UI, client
 * write path, and this server route are each checked on their own; see the
 * header comment in src/lib/launch.ts). In practice a ride can't reach
 * COMPLETED before launch at all (createRideRequest() refuses to write a
 * ride document pre-launch — src/lib/firebase/rides.ts), so this component
 * should never even mount pre-launch. This check exists anyway, as a
 * backstop: if it were ever reached pre-launch, it shows the exact same
 * honest "not live yet" message the rest of the app shows, rather than a
 * card form that mounts and quietly can't charge anything (the
 * create-intent route independently refuses to create a real PaymentIntent
 * pre-launch regardless of what this component does).
 */
export function RidePaymentForm({ ride, onPaid }: RidePaymentFormProps) {
    const platformLaunched = isPlatformLaunched()

    if (!platformLaunched) {
        return (
            <Alert>
                <AlertTitle className="flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    Pre-launch testing
                </AlertTitle>
                <AlertDescription>{PLATFORM_NOT_LAUNCHED_MESSAGE}</AlertDescription>
            </Alert>
        )
    }

    return <LaunchedRidePaymentForm ride={ride} onPaid={onPaid} />
}

/** Everything below only ever runs once isPlatformLaunched() is true. */
function LaunchedRidePaymentForm({ ride, onPaid }: RidePaymentFormProps) {
    const { user } = useAuth()
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [intentError, setIntentError] = useState<string | null>(null)
    const [configError, setConfigError] = useState<string | null>(null)

    // loadStripe() throws synchronously if NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    // isn't configured — caught here so a missing key shows an honest
    // "payment unavailable" state instead of crashing the page.
    const stripePromise = useMemo(() => {
        try {
            return getStripeJsPromise()
        } catch (error) {
            setConfigError(error instanceof Error ? error.message : 'Stripe is not configured')
            return null
        }
    }, [])

    useEffect(() => {
        if (!user || configError) return
        let cancelled = false

        async function fetchClientSecret() {
            try {
                const idToken = await user!.getIdToken()
                const response = await fetch('/api/stripe/payment/create-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({ rideId: ride.id }),
                })
                const data: { clientSecret?: string; error?: string } = await response.json()
                if (!response.ok || !data.clientSecret) {
                    throw new Error(data.error || 'Could not start payment')
                }
                if (!cancelled) setClientSecret(data.clientSecret)
            } catch (error) {
                if (!cancelled) {
                    setIntentError(error instanceof Error ? error.message : 'Could not start payment')
                }
            }
        }

        fetchClientSecret()
        return () => {
            cancelled = true
        }
    }, [user, ride.id, configError])

    if (configError) {
        return (
            <Alert variant="destructive">
                <AlertTitle className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Payment unavailable
                </AlertTitle>
                <AlertDescription>{configError}</AlertDescription>
            </Alert>
        )
    }

    if (intentError) {
        return (
            <Alert variant="destructive">
                <AlertTitle className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Could not start payment
                </AlertTitle>
                <AlertDescription>{intentError}</AlertDescription>
            </Alert>
        )
    }

    if (!clientSecret || !stripePromise) {
        return (
            <Alert>
                <AlertTitle className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing payment…
                </AlertTitle>
                <AlertDescription>
                    Setting up a secure checkout for this ride.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: PAYMENT_ELEMENT_APPEARANCE }}
        >
            <PaymentElementCheckout ride={ride} onPaid={onPaid} />
        </Elements>
    )
}

function PaymentElementCheckout({ ride, onPaid }: RidePaymentFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [submitting, setSubmitting] = useState(false)
    const [status, setStatus] = useState<'idle' | 'succeeded' | 'processing'>('idle')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        if (!stripe || !elements) return

        setSubmitting(true)
        setError(null)

        // redirect: 'if_required' — most cards confirm without ever leaving
        // this page; Stripe only redirects the browser away when a payment
        // method (e.g. certain bank redirects) requires it.
        const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        })

        if (confirmError) {
            // Real Stripe decline/network-error state, surfaced honestly.
            // confirmError.message is Stripe's own user-facing copy (e.g.
            // "Your card was declined."); confirmError.type distinguishes a
            // card error from a connection/API error, but the message alone
            // is accurate either way — nothing here pretends the charge
            // went through.
            setError(confirmError.message || 'Your payment could not be processed. Please try again.')
            setSubmitting(false)
            return
        }

        if (paymentIntent?.status === 'succeeded') {
            setStatus('succeeded')
            onPaid?.()
        } else {
            // Any other resolved state (processing, or requires_action that
            // confirmPayment already handled) is still in flight — the
            // webhook flips ride.status to 'PAID' once Stripe itself
            // confirms the charge, and the caller's live ride subscription
            // (subscribeToRide in src/lib/firebase/rides.ts) picks that up
            // on its own; this component doesn't need to poll for it.
            setStatus('processing')
        }
        setSubmitting(false)
    }

    if (status === 'succeeded' || status === 'processing') {
        return (
            <Alert>
                <AlertTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {status === 'succeeded' ? 'Payment successful' : 'Payment processing'}
                </AlertTitle>
                <AlertDescription>
                    {status === 'succeeded'
                        ? 'Your card was charged. Updating your ride…'
                        : "We're confirming your payment with your bank — this ride will show as Paid shortly."}
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
                <PaymentElement />
            </div>
            {error && (
                <Alert variant="destructive">
                    <AlertTitle className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Payment failed
                    </AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Button type="submit" disabled={!stripe || !elements || submitting} className="w-full" size="lg">
                {submitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing…
                    </>
                ) : (
                    `Pay $${(ride.fare / 100).toFixed(2)}`
                )}
            </Button>
        </form>
    )
}
