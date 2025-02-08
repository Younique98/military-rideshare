'use client'

import React, { useState } from 'react'
import {
    Shield,
    MapPin,
    Menu,
    X,
    LogOut,
    Clock,
    ChevronRight,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Image from 'next/image'
import UserAvatar from '../ui/UserAvatar'
import { updateUserProfile } from '@/utils/user'
import { handleImageUpload } from '@/utils/imageUpload'
import { useSnackbar } from '@/contexts/Snackbar'
import { useAuth } from '@/hooks/useAuth'
import { SargeRecommendations } from './Sarge/SargeReccomendations'

const MilitaryRideShareApp = () => {
    const { showSnackbar } = useSnackbar()
    const { user } = useAuth()
    console.log('user in military app', user)
    const [activeView, setActiveView] = useState('main') // main, ride, profile
    const [menuOpen, setMenuOpen] = useState(false)
    const [idMeVerified, setIdMeVerified] = useState(false)
    const [pickup, setPickup] = useState('')
    const [dropoff, setDropoff] = useState('')
    const [step, setStep] = useState(1) // 1: location, 2: confirmation, 3: searching

    const mockIdMeStatus = {
        verified: false,
        message: 'Please verify your military status with ID.me to continue',
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

    const recentRides = [
        {
            id: 1,
            pickup: 'Fort Liberty Main Gate',
            dropoff: 'Cross Creek Mall',
            date: '2024-02-06',
            status: 'Completed',
        },
        {
            id: 2,
            pickup: 'Pope Army Airfield',
            dropoff: 'Downtown Fayetteville',
            date: '2024-02-05',
            status: 'Completed',
        },
    ]

    const handleIdMeVerification = () => {
        // Mock ID.me verification process
        setIdMeVerified(true)
    }

    const handleRideRequest = () => {
        if (step === 1 && pickup && dropoff) {
            setStep(2)
        } else if (step === 2) {
            setStep(3)
            // Mock ride search
            setTimeout(() => {
                setStep(1)
                setPickup('')
                setDropoff('')
                setActiveView('main')
            }, 3000)
        }
    }

    const handleUpload = async (file: File) => {
        try {
            if (!user?.uid) {
                showSnackbar(
                    'You must be logged in to upload an image',
                    'error'
                )
                return
            }

            const imageUrl = await handleImageUpload(file, showSnackbar)
            await updateUserProfile(user.uid, imageUrl)
        } catch (error) {
            //TODO: (ET) handle error
            console.error(error)
        }
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
                            <button
                                onClick={() => setActiveView('profile')}
                                className="rounded-full text-gray-600 hover:text-gray-900"
                            >
                                <div>
                                    <UserAvatar
                                        imageUrl={user?.photoURL}
                                        size="md"
                                        onImageUpload={handleUpload}
                                    />
                                </div>
                            </button>
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
                                <button onClick={() => setMenuOpen(false)}>
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
                                {mockIdMeStatus.message}
                                <button
                                    onClick={handleIdMeVerification}
                                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                                >
                                    Verify with ID.me
                                </button>
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : activeView === 'main' ? (
                    <div className="space-y-8">
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
                                alt="Map"
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
                                onClick={() => setActiveView('ride')}
                            >
                                Request a Ride
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
                                        <p style={{ color: '#687864' }}>
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
                ) : activeView === 'ride' ? (
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
                                <div className="relative w-full p-4 pl-12 border rounded-lg">
                                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                                    <h3> Coffee Beanery</h3>
                                    <p> 1234 Beanery Dr, Anywhere, NC 28310</p>
                                </div>
                                <div className="relative w-full p-4 pl-12 border rounded-lg">
                                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                                    <h3> Turnpike Trails</h3>
                                    <p>
                                        {' '}
                                        5648 Turnpike Way, Anywhere, NC 28310
                                    </p>
                                </div>
                                <div className="relative w-full p-4 pl-12 border rounded-lg">
                                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                                    <h3> River Walk</h3>
                                    <p>
                                        {' '}
                                        9876 WalkItOut Dr, Anywhere, NC 28310
                                    </p>
                                </div>
                                <div className="relative w-full p-4 pl-12 border rounded-lg">
                                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                                    <h3> Cupcakes & Sprinkles </h3>
                                    <p> 9876 Dessert Dr, Anywhere, NC 28310</p>
                                </div>
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

                                <button
                                    onClick={handleRideRequest}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                                >
                                    Confirm Ride
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Alert>
                                    <AlertTitle className="flex items-center justify-center gap-2">
                                        <Clock className="h-4 w-4 animate-spin" />
                                        Finding your ride...
                                    </AlertTitle>
                                    <AlertDescription>
                                        We&apos;re matching you with a verified
                                        military driver. This usually takes 1-3
                                        minutes.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </div>
                ) : activeView === 'profile' ? (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center space-x-4">
                                <UserAvatar
                                    imageUrl={user?.photoURL}
                                    size="md"
                                    editable
                                    onImageUpload={handleUpload}
                                />
                                <div>
                                    {/* //TODO (ET) add a form for user to update their profile */}
                                    <h3 className="font-semibold text-lg">
                                        {user?.displayName || 'John Doe'}
                                    </h3>
                                    {/* //TODO: (ET) user should be able to select what branch they are in */}
                                    <p className="text-gray-600">
                                        U.S. Army - Active Duty
                                    </p>
                                    <div className="mt-1 flex items-center text-sm text-green-600">
                                        <Shield className="h-4 w-4 mr-1" />
                                        ID.me Verified
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Recent Rides
                            </h3>
                            <div className="space-y-3">
                                {recentRides.map((ride) => (
                                    <div
                                        key={ride.id}
                                        className="bg-white p-4 rounded-lg shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">
                                                    {ride.pickup}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    to {ride.dropoff}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {ride.date}
                                                </div>
                                            </div>
                                            <span className="text-sm text-green-600">
                                                {ride.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : null}
            </main>
        </div>
    )
}

export default MilitaryRideShareApp
