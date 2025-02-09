import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

export const handleGoogleSignIn = async (
    onSuccessRedirect: (path: string) => void
) => {
    const provider = new GoogleAuthProvider()
    try {
        const result = await signInWithPopup(auth, provider)
        onSuccessRedirect('/rideapp')
        return result.user
    } catch (error) {
        throw error
    }
}
