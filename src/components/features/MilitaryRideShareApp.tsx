'use client'

import React, { useEffect, useState } from 'react'
import {
    Shield,
    MapPin,
    Menu,
    X,
    LogOut,
    Clock,
    ChevronRight,
    Rocket,
    CheckCircle2,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Image from 'next/image'
import {UserAvatar} from '../ui/UserAvatar'
import { SargeRecommendations } from './Sarge/SargeReccomendations'
import { redirect } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { isPlatformLaunched, PLATFORM_NOT_LAUNCHED_MESSAGE } from '@/lib/launch'
import { createRideRequest, subscribeToRide } from '@/lib/firebase/rides'
import { joinWaitlist } from '@/lib/firebase/waitlist'
import { estimateFareCents } from '@/lib/fare'
import { RidePaymentForm } from './payment/RidePaymentForm'
import type { Ride } from '@/types/ride'

const MilitaryRideShareApp = () => {
    const { user } = useAuth()
    const [activeView, setActiveView] = useState('main') // main, ride, waitlist, profile
    const [menuOpen, setMenuOpen] = useState(false)
    const [idMeVerified, setIdMeVerified] = useState(false)
    const [pickup, setPickup] = useState('')
    const [dropoff, setDropoff] = useState('')
    const [step, setStep] = useState(1) // 1: location, 2: confirmation, 3: searching
    const [ride, setRide] = useState<Ride | null>(null)
    const [rideError, setRideError] = useState<string | null>(null)
    const [waitlistEmail, setWaitlistEmail] = useState('')
    const [waitlistNote, setWaitlistNote] = useState('')
    const [waitlistSubmitted, setWaitlistSubmitted] = useState(false)
    const [waitlistError, setWaitlistError] = useState<string | null>(null)

    // There is no real ID.me OAuth integration wired up yet — no client
    // secret, no server-side token exchange, no verified-status check.
    // `NEXT_PUBLIC_DEMO_MODE` gates a fake, clearly-labeled "simulate
    // verification" button that's useful for portfolio/demo purposes. It is
    // NOT set in production, so by default this flow is disabled rather
    // than silently handing out a real-looking "✓ Verified" badge that
    // isn't backed by anything — see MilitaryRideShareApp docs / audit notes.
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    // Pre-launch gate — see src/lib/launch.ts. Most US states require a TNC
    // license (plus insurance) before ride-matching-for-pay can go live to
    // real, paying users; that isn't in place yet, so the real booking/
    // payment code below (createRideRequest, Stripe Connect) is fully built
    // and reachable in a dev/test environment, but stays off by default and
    // in production until NEXT_PUBLIC_PLATFORM_LAUNCHED is explicitly set to
    // "true". Same pattern as isDemoMode above: a real feature exists, and a
    // narrowly-checked env var — not a guess, not a missing-value default —
    // decides whether the public UI is allowed to reach it.
    const platformLaunched = isPlatformLaunched()

    useEffect(() => {
        if (!ride?.id) return
        const unsubscribe = subscribeToRide(ride.id, (updated) => setRide(updated))
        return unsubscribe
    }, [ride?.id])

    const mockIdMeStatus = {
        verified: false,
        message: isDemoMode
            ? 'Demo mode: click below to simulate ID.me verification. This does not perform a real identity check.'
            : 'ID.me verification is not yet connected. Real-time military status checks are not available in this build, so ride requests are disabled until this is wired up.',
    }

    const popularLocations = [
        {
            name: 'Fort Liberty Main Gate',
            address: '2nd St, Fort Liberty, NC 28310',
        },
        {
            name: 'Pope Army Airfield',
            address: 'Reilly Road, Fort Liberty, NC 28310',
        },
        {
            name: 'Womack Army Medical Center',
            address: '2817 Reilly Rd, Fort Liberty, NC 28310',
        },
    ]


    const handleIdMeVerification = () => {
        // Demo-only mock of the ID.me verification process — gated behind
        // NEXT_PUBLIC_DEMO_MODE. There is no real OAuth exchange or
        // server-side check here, so this must never run outside demo mode.
        if (!isDemoMode) return
        setIdMeVerified(true)
    }

    const handleRideRequest = async () => {
        if (step === 1 && pickup && dropoff) {
            setStep(2)
        } else if (step === 2) {
            setRideError(null)

            if (!platformLaunched) {
                // Defense in depth: createRideRequest() itself refuses to
                // write to Firestore while the platform isn't launched (see
                // src/lib/firebase/rides.ts), so this can't actually create
                // a chargeable ride even if this branch were somehow
                // reached. The UI shouldn't let a user get here at all —
                // see the pre-launch banner/waitlist routing below — but
                // this stays as a second, honest backstop rather than
                // silently doing nothing.
                setRideError(PLATFORM_NOT_LAUNCHED_MESSAGE)
                return
            }

            if (!user) {
                setRideError('You must be signed in to request a ride.')
                return
            }

            setStep(3)
            try {
                const rideId = await createRideRequest({
                    riderId: user.uid,
                    pickup: { address: pickup },
                    dropoff: { address: dropoff },
                    fare: estimateFareCents({ address: pickup }, { address: dropoff }),
                })
                setRide({ id: rideId } as Ride) // full doc arrives via subscribeToRide
            } catch (error) {
                setRideError(
                    error instanceof Error
                        ? error.message
                        : 'Something went wrong requesting your ride.'
                )
                setStep(2)
            }
        }
    }

    const resetRideFlow = () => {
        setStep(1)
        setPickup('')
        setDropoff('')
        setRide(null)
        setRideError(null)
        setActiveView('main')
    }

    const handleWaitlistSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setWaitlistError(null)
        if (!user) {
            setWaitlistError('You must be signed in to join the waitlist.')
            return
        }
        try {
            await joinWaitlist({
                userId: user.uid,
                email: waitlistEmail || user.email || '',
                note: waitlistNote,
            })
            setWaitlistSubmitted(true)
        } catch (error) {
            setWaitlistError(
                error instanceof Error ? error.message : 'Could not join the waitlist.'
            )
        }
    }

    if ( activeView === 'profile' ) { 
        redirect ('/profile')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm py-2">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={menuOpen}
                                className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                {menuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                            <span className="ml-2 font-semibold text-2xl md:text-3xl">
                                Base Link
                            </span>
                        </div>
                        <div className="flex items-center">
                            {/* UserAvatar's own button already navigates to
                                /profile — this used to be wrapped in a second
                                <button>, which put an interactive control
                                inside another interactive control (invalid
                                for assistive tech) and duplicated the
                                navigation. */}
                            <UserAvatar size="md" />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar Menu */}
            {menuOpen && (
                <div className="fixed inset-0 z-40">
                    <div
                        className="fixed inset-0 bg-black/30"
                        onClick={() => setMenuOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-8">
                                <span className="font-semibold text-lg">
                                    Menu
                                </span>
                                <button
                                    onClick={() => setMenuOpen(false)}
                                    aria-label="Close menu"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => {
                                            setActiveView('main')
                                            setMenuOpen(false)
                                        }}
                                        className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100"
                                    >
                                        Home
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            setActiveView('profile')
                                            setMenuOpen(false)
                                        }}
                                        className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100"
                                    >
                                        Profile
                                    </button>
                                </li>
                                <li>
                                    <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 text-red-600">
                                        <span className="flex items-center">
                                            <LogOut className="h-5 w-5 mr-2" />
                                            Sign Out
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {!idMeVerified ? (
                    <div className="text-center py-12">
                        <Alert variant="destructive">
                            <AlertTitle className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Military Verification Required
                            </AlertTitle>
                            <AlertDescription>
                                {isDemoMode && (
                                    <span className="inline-block mb-2 px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-400 text-xs font-bold uppercase tracking-wide">
                                        Demo — not a real verification
                                    </span>
                                )}
                                <p>{mockIdMeStatus.message}</p>
                                <button
                                    onClick={handleIdMeVerification}
                                    disabled={!isDemoMode}
                                    aria-disabled={!isDemoMode}
                                    title={
                                        isDemoMode
                                            ? undefined
                                            : 'Real ID.me verification is not yet integrated'
                                    }
                                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                                >
                                    {isDemoMode
                                        ? 'Simulate ID.me Verification (Demo)'
                                        : 'Verify with ID.me (Not Connected)'}
                                </button>
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : activeView === 'main' ? (
                    <div className="space-y-8">
                        {isDemoMode && (
                            <div
                                role="status"
                                className="flex items-center gap-2 px-3 py-2 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-400 text-sm font-semibold"
                            >
                                <Shield className="h-4 w-4" />
                                DEMO — this account is only mock-verified.
                                No real ID.me check was performed.
                            </div>
                        )}
                        {!platformLaunched && (
                            <div
                                role="status"
                                className="flex items-start gap-3 px-4 py-3 rounded-md bg-amber-50 text-amber-900 border border-amber-400"
                            >
                                <Rocket className="h-5 w-5 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold">
                                        Pre-launch testing
                                    </p>
                                    <p className="text-sm">
                                        {PLATFORM_NOT_LAUNCHED_MESSAGE} Base
                                        Link is not yet licensed to operate as
                                        a paid rideshare in any state, so no
                                        real ride can be booked and no card
                                        will ever be charged here. Request a
                                        ride below to join the waitlist and
                                        we&apos;ll email you the moment that
                                        changes.
                                    </p>
                                </div>
                            </div>
                        )}
                        {/* Map Placeholder */}

                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                            Grab a ride with{' '}
                            <span className="text-brand-accent">Base Link</span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
                            Secure, verified rides exclusively for military
                            personnel and their families
                        </p>
                        <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                            <Image
                                src="/images/map/map_of_vegas.png"
                                alt="Map showing your current location and nearby available rides"
                                width={800}
                                height={400}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Request Ride Button */}
                        <div className="mt-8 space-y-4">
                            <button
                                style={{ backgroundColor: '#2E5C8A' }}
                                className="w-full py-3 text-white rounded-lg hover:opacity-90"
                                onClick={() =>
                                    setActiveView(platformLaunched ? 'ride' : 'waitlist')
                                }
                                title={
                                    platformLaunched
                                        ? undefined
                                        : 'Real rides are not yet available — join the waitlist instead'
                                }
                            >
                                {platformLaunched
                                    ? 'Request a Ride'
                                    : 'Join the Waitlist'}
                            </button>
                            <div
                                style={{
                                    backgroundColor: '#F8F9FA',
                                    borderLeftColor: '#2E5C8A',
                                }}
                                className="p-6 rounded-lg shadow border-l-4"
                            >
                                <div className="flex items-center space-x-4">
                                    <div
                                        style={{ backgroundColor: '#1B4075' }}
                                        className="h-12 w-12 rounded-full flex items-center justify-center"
                                    >
                                        <span style={{ color: '#E5B94E' }}>
                                            ★
                                        </span>
                                    </div>
                                    <div>
                                        <h3
                                            style={{ color: '#2E5C8A' }}
                                            className="font-semibold"
                                        >
                                            Military Verified
                                        </h3>
                                        <p className="text-brand-sage">
                                            All drivers are ID.me verified
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Popular Locations */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Popular Locations
                            </h3>
                            <div className="space-y-2">
                                {popularLocations.map((location, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-white rounded-lg shadow-sm hover:shadow cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <div className="font-medium">
                                                    {location.name}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {location.address}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : activeView === 'waitlist' ? (
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="flex items-start gap-3 px-4 py-3 rounded-md bg-amber-50 text-amber-900 border border-amber-400">
                            <Rocket className="h-5 w-5 mt-0.5 shrink-0" />
                            <p className="text-sm">{PLATFORM_NOT_LAUNCHED_MESSAGE}</p>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 text-center">
                            Join the Waitlist
                        </h1>
                        {waitlistSubmitted ? (
                            <Alert>
                                <AlertTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    You&apos;re on the list
                                </AlertTitle>
                                <AlertDescription>
                                    We&apos;ll email you the moment Base Link
                                    can offer real, paid rides in your state.
                                    <button
                                        onClick={() => setActiveView('main')}
                                        className="mt-4 block w-full py-2 border rounded-lg hover:bg-gray-100"
                                    >
                                        Back to Home
                                    </button>
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                                {waitlistError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{waitlistError}</AlertDescription>
                                    </Alert>
                                )}
                                <div>
                                    <label
                                        htmlFor="waitlist-email"
                                        className="block text-sm text-gray-600 mb-1"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="waitlist-email"
                                        type="email"
                                        required
                                        value={waitlistEmail || user?.email || ''}
                                        onChange={(e) => setWaitlistEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full p-3 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="waitlist-note"
                                        className="block text-sm text-gray-600 mb-1"
                                    >
                                        Where are you stationed? (optional)
                                    </label>
                                    <input
                                        id="waitlist-note"
                                        type="text"
                                        value={waitlistNote}
                                        onChange={(e) => setWaitlistNote(e.target.value)}
                                        placeholder="e.g. Fort Liberty, NC"
                                        className="w-full p-3 border rounded-lg"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                                >
                                    Notify Me at Launch
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveView('main')}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </form>
                        )}
                    </div>
                ) : activeView === 'ride' && platformLaunched ? (
                    <div className="space-y-6">
                        {/* //TODO: (ET) Get routes and directions from google maps api so that suggestions pop up based on their location */}
                        <h1 className="text-xl md:text-5xl font-bold tracking-tight text-gray-900 text-center">
                            Request a Ride
                        </h1>
                        {step === 1 ? (
                            <>
                                <>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            {/* //TODO: (ET) enhance some more. its pretty plain */}
                                            <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Pickup location"
                                                value={pickup}
                                                onChange={(e) =>
                                                    setPickup(e.target.value)
                                                }
                                                className="w-full p-4 pl-12 border rounded-lg"
                                            />
                                        </div>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Dropoff location"
                                                value={dropoff}
                                                onChange={(e) =>
                                                    setDropoff(e.target.value)
                                                }
                                                className="w-full p-4 pl-12 border rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleRideRequest}
                                        disabled={!pickup || !dropoff}
                                        className="w-full py-3 bg-primary text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-300"
                                    >
                                        Continue
                                    </button>
                                </>
                                {/* // TODO: (ET) replace with populated locations or have recommendations from our AI "Sarge" based on user history and ratings of places visited*/}
                                <SargeRecommendations />
                            </>
                        ) : step === 2 ? (
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-4">
                                        Ride Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                            <div>
                                                <div className="text-sm text-gray-600">
                                                    Pickup
                                                </div>
                                                <div className="font-medium">
                                                    {pickup}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-red-600" />
                                            <div>
                                                <div className="text-sm text-gray-600">
                                                    Dropoff
                                                </div>
                                                <div className="font-medium">
                                                    {dropoff}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">
                                                Estimated Time
                                            </div>
                                            <div className="font-medium">
                                                15-20 minutes
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {rideError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{rideError}</AlertDescription>
                                    </Alert>
                                )}
                                <button
                                    onClick={handleRideRequest}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                                >
                                    Confirm Ride
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                {rideError ? (
                                    <Alert variant="destructive">
                                        <AlertTitle>Ride request failed</AlertTitle>
                                        <AlertDescription>
                                            {rideError}
                                            <button
                                                onClick={resetRideFlow}
                                                className="mt-4 block w-full py-2 border rounded-lg hover:bg-gray-100"
                                            >
                                                Back to Home
                                            </button>
                                        </AlertDescription>
                                    </Alert>
                                ) : ride?.status === 'CANCELLED' ? (
                                    <Alert variant="destructive">
                                        <AlertTitle>Ride cancelled</AlertTitle>
                                        <AlertDescription>
                                            This ride was cancelled.
                                            <button
                                                onClick={resetRideFlow}
                                                className="mt-4 block w-full py-2 border rounded-lg hover:bg-gray-100"
                                            >
                                                Back to Home
                                            </button>
                                        </AlertDescription>
                                    </Alert>
                                ) : !ride || ride.status === 'REQUESTED' ? (
                                    <Alert>
                                        <AlertTitle className="flex items-center justify-center gap-2">
                                            <Clock className="h-4 w-4 animate-spin" />
                                            Finding your ride...
                                        </AlertTitle>
                                        <AlertDescription>
                                            We&apos;re matching you with a
                                            verified military driver.
                                        </AlertDescription>
                                    </Alert>
                                ) : ride.status === 'ACCEPTED' || ride.status === 'IN_PROGRESS' ? (
                                    <Alert>
                                        <AlertTitle>
                                            {ride.status === 'ACCEPTED'
                                                ? 'A driver is on the way'
                                                : 'Trip in progress'}
                                        </AlertTitle>
                                        <AlertDescription>
                                            {pickup} → {dropoff}
                                        </AlertDescription>
                                    </Alert>
                                ) : ride.status === 'COMPLETED' ? (
                                    <div className="text-left">
                                        <RidePaymentForm ride={ride} />
                                    </div>
                                ) : ride.status === 'PAID' ? (
                                    <Alert>
                                        <AlertTitle className="flex items-center justify-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Ride complete — paid
                                        </AlertTitle>
                                        <AlertDescription>
                                            Thanks for riding with Base Link.
                                            <button
                                                onClick={resetRideFlow}
                                                className="mt-4 block w-full py-2 border rounded-lg hover:bg-gray-100"
                                            >
                                                Back to Home
                                            </button>
                                        </AlertDescription>
                                    </Alert>
                                ) : null}
                            </div>
                        )}
                    </div>
                        ) : null}
            </main>
        </div>
    )
}

export default MilitaryRideShareApp
