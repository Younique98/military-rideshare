'use client'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, Menu, Shield, X } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useState } from 'react'

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

export default function ProfilePage() {
    return (
        <RequireAuth>
            <ProfilePageContent />
        </RequireAuth>
    )
}

function ProfilePageContent() {
    const [menuOpen, setMenuOpen] = useState(false)

    const { user } = useAuth()
    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
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
                            <div>
                                <UserAvatar size="md" />
                            </div>
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
                                            redirect('/rideapp')
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
                                            redirect('/profile')
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
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center space-x-4">
                        <UserAvatar size="md" editable />
                        <div>
                            {/* //TODO (ET) add a form for user to update their profile */}
                            <h3 className="font-semibold text-lg">
                                {user?.displayName || 'John Doe'}
                            </h3>
                            {/* //TODO: (ET) user should be able to select what branch they are in */}
                            <p className="text-gray-600">
                                U.S. Army - Active Duty
                            </p>
                            <div className="mt-1 flex items-center text-sm text-green-700">
                                <Shield className="h-4 w-4 mr-1" />
                                ID.me Verified
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Rides</h3>
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
                                    <span className="text-sm text-green-700">
                                        {ride.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
