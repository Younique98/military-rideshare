'use client'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useAuth } from '@/hooks/useAuth'
import { Shield } from 'lucide-react'

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
    const { user } = useAuth()
    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
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
                            <div className="mt-1 flex items-center text-sm text-green-600">
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
                                    <span className="text-sm text-green-600">
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
