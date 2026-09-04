import MilitaryRideShareApp from '@/components/features/MilitaryRideShareApp'
import { RequireAuth } from '@/components/auth/RequireAuth'

// MilitaryRideShareApp already renders its own top-level <main> (with the
// real page padding/max-width classes) — wrapping it in a second <main>
// here produced a real axe "nested main landmark" violation.
export default function RideShareAppPage() {
    return (
        <RequireAuth>
            <MilitaryRideShareApp />
        </RequireAuth>
    )
}
