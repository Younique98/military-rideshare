'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuth } from '@/hooks/useAuth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { MapPin, Rocket } from 'lucide-react'
import {
    acceptRide,
    completeRide,
    startRide,
    subscribeToDriverActiveRide,
    subscribeToRequestedRides,
} from '@/lib/firebase/rides'
import { isPlatformLaunched, PLATFORM_NOT_LAUNCHED_MESSAGE } from '@/lib/launch'
import type { Ride } from '@/types/ride'

// Driver-side ride matching: browse the open REQUESTED queue and accept one.
// firestore.rules only lets this query return results for a driver whose
// Stripe Connect onboarding has actually completed (see that file) — an
// onboarding-incomplete driver sees an empty, permission-denied queue here,
// not a client-side filtered one.
export default function DriverPage() {
    return (
        <RequireAuth>
            <DriverContent />
        </RequireAuth>
    )
}

function DriverContent() {
    const { user } = useAuth()
    const platformLaunched = isPlatformLaunched()
    const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)
    const [openRides, setOpenRides] = useState<Ride[]>([])
    const [activeRide, setActiveRide] = useState<Ride | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
        const unsubUser = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            setOnboardingComplete(Boolean(snap.data()?.stripeOnboardingComplete))
        })
        const unsubActive = subscribeToDriverActiveRide(user.uid, setActiveRide)
        return () => {
            unsubUser()
            unsubActive()
        }
    }, [user])

    useEffect(() => {
        if (!user || !onboardingComplete || activeRide) {
            setOpenRides([])
            return
        }
        const unsubscribe = subscribeToRequestedRides(setOpenRides)
        return unsubscribe
    }, [user, onboardingComplete, activeRide])

    const handleAccept = async (rideId: string) => {
        if (!user) return
        setError(null)
        try {
            await acceptRide(rideId, user.uid)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not accept ride')
        }
    }

    const handleStart = async (rideId: string) => {
        setError(null)
        try {
            await startRide(rideId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not start trip')
        }
    }

    const handleComplete = async (rideId: string) => {
        setError(null)
        try {
            await completeRide(rideId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not complete trip')
        }
    }

    return (
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>

            {!platformLaunched && (
                <Alert variant="destructive">
                    <AlertTitle className="flex items-center gap-2">
                        <Rocket className="h-4 w-4" />
                        Pre-launch testing
                    </AlertTitle>
                    <AlertDescription>{PLATFORM_NOT_LAUNCHED_MESSAGE}</AlertDescription>
                </Alert>
            )}

            {onboardingComplete === false && (
                <Alert>
                    <AlertDescription>
                        Complete{' '}
                        <Link href="/driver/payouts" className="underline">
                            Stripe payout onboarding
                        </Link>{' '}
                        to see and accept ride requests.
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {activeRide ? (
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h3 className="text-lg font-semibold">Your active ride</h3>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span>{activeRide.pickup.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span>{activeRide.dropoff.address}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        Status: {activeRide.status}
                    </div>
                    {activeRide.status === 'ACCEPTED' && (
                        <button
                            onClick={() => handleStart(activeRide.id)}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                        >
                            Start Trip
                        </button>
                    )}
                    {activeRide.status === 'IN_PROGRESS' && (
                        <button
                            onClick={() => handleComplete(activeRide.id)}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                        >
                            Complete Trip
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Open ride requests</h3>
                    {onboardingComplete && openRides.length === 0 && (
                        <p className="text-gray-600 text-sm">
                            No open ride requests right now.
                        </p>
                    )}
                    {openRides.map((ride) => (
                        <div
                            key={ride.id}
                            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
                        >
                            <div>
                                <div className="font-medium">
                                    {ride.pickup.address}
                                </div>
                                <div className="text-sm text-gray-600">
                                    to {ride.dropoff.address}
                                </div>
                            </div>
                            <button
                                onClick={() => handleAccept(ride.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                            >
                                Accept
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}
