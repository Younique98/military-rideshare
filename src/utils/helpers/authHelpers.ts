import {
    GoogleAuthProvider,
    signInWithPopup,
    fetchSignInMethodsForEmail,
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    signOut,
} from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { handleAuthError } from './handleAuthError'
import { FirebaseError } from 'firebase/app'

/**
 * Sign in with email and password.
 */
export const signIn = async (email: string, password: string) => {
    try {
        await setPersistence(auth, browserLocalPersistence)
        const signInMethods = await fetchSignInMethodsForEmail(auth, email)

        if (signInMethods.includes('google.com')) {
            alert(
                'This email is associated with Google. Please sign in using Google.'
            )
            return signInWithGoogle()
        } else if (signInMethods.includes('password')) {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            )
            return userCredential.user
        } else {
            // TODO: (ET) Handle this in a banner instead of an alert
            alert('No account found with this email. Please sign up.')
        }
    } catch (error) {
        handleAuthError(error as FirebaseError)
    }
}

/**
 * Google Sign-In
 */
export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
        await setPersistence(auth, browserLocalPersistence)
        const result = await signInWithPopup(auth, provider)
        return result.user
    } catch (error) {
        handleAuthError(error as FirebaseError)
    }
}

/**
 * Sign out user.
 */
export const signOutUser = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        handleAuthError(error as FirebaseError)
    }
}
