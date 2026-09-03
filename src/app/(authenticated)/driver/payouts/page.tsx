'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuth } from '@/hooks/useAuth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, CreditCard } from 'lucide-react'

// Driver payout setup — starts Stripe Connect Express hosted onboarding
// (POST /api/stripe/connect/onboarding-link). This is deliberately reachable
// regardless of NEXT_PUBLIC_PLATFORM_LAUNCHED: getting paid set up ahead of
// launch doesn't move any money or create a ride — see the comment in that
// route for why only the payment-creation route itself is gated.
export default function DriverPayoutsPage() {
    return (
        <RequireAuth>
            <Suspense fallback={null}>
                <DriverPayoutsContent />
            </Suspense>
        </RequireAuth>
    )
}

function DriverPayoutsContent() {
    const { user } = useAuth()
    const searchParams = useSearchParams()
    const onboardingReturn = searchParams.get('onboarding')
    const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            setOnboardingComplete(Boolean(snap.data()?.stripeOnboardingComplete))
        })
        return unsubscribe
    }, [user])

    const startOnboarding = async () => {
        if (!user) return
        setLoading(true)
        setError(null)
        try {
            const idToken = await user.getIdToken()
            const response = await fetch('/api/stripe/connect/onboarding-link', {
                method: 'POST',
                headers: { Authorization: `Bearer ${idToken}` },
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Could not start onboarding')
            }
            window.location.href = data.url
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not start onboarding')
            setLoading(false)
        }
    }

    return (
        <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Driver Payouts</h1>
            <p className="text-gray-600">
                Base Link pays drivers through Stripe Connect. Complete
                Stripe&apos;s hosted onboarding (identity + bank account) once
                to start receiving payouts for completed, paid rides.
            </p>

            {onboardingReturn === 'refresh' && (
                <Alert variant="destructive">
                    <AlertDescription>
                        Your onboarding link expired before you finished.
                        Start again below.
                    </AlertDescription>
                </Alert>
            )}

            {onboardingComplete ? (
                <Alert>
                    <AlertTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Onboarding complete
                    </AlertTitle>
                    <AlertDescription>
                        Your Stripe Connect account is ready to receive
                        payouts. You can now accept ride requests from the{' '}
                        <a href="/driver" className="underline">
                            driver dashboard
                        </a>
                        .
                    </AlertDescription>
                </Alert>
            ) : (
                <Alert>
                    <AlertTitle className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Onboarding not complete
                    </AlertTitle>
                    <AlertDescription>
                        {error && <p className="text-red-600 mb-2">{error}</p>}
                        <p className="mb-4">
                            You won&apos;t see ride requests or be able to
                            accept one until this is done — see
                            firestore.rules for why ride-matching eligibility
                            is tied to completed Stripe onboarding.
                        </p>
                        <button
                            onClick={startOnboarding}
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-300"
                        >
                            {loading ? 'Redirecting to Stripe…' : 'Start Stripe Onboarding'}
                        </button>
                    </AlertDescription>
                </Alert>
            )}
        </main>
    )
}
