import MilitaryRideShareApp from '@/components/features/MilitaryRideShareApp'
import { RequireAuth } from '@/components/auth/RequireAuth'

export default function RideShareAppPage() {
    return (
        <RequireAuth>
            <main>
                <MilitaryRideShareApp />
            </main>
        </RequireAuth>
    )
}
