import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

export const handleGoogleSignIn = async (
    onSuccessRedirect: (path: string) => void
) => {
    const provider = new GoogleAuthProvider()
    try {
        const result = await signInWithPopup(auth, provider)
        console.log('✅ Google Sign-In Success:', result.user)
        onSuccessRedirect('/rideapp')
    } catch (error) {
        //TODO: (ET) handle error
        console.error('Google Sign-In Error:', error)
    }
}
