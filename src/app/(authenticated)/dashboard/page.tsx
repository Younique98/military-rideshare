import MilitaryRideShareApp from '@/components/features/MilitaryRideShareApp'
import { RequireAuth } from '@/components/auth/RequireAuth'

export default function DashboardPage() {
    return (
        <RequireAuth>
            <div className="min-h-screen bg-background flex items-center justify-center">
                <MilitaryRideShareApp />
            </div>
        </RequireAuth>
    )
}
