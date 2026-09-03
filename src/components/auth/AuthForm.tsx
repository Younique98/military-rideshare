'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase/config'
import {
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    fetchSignInMethodsForEmail,
    AuthError,
} from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { handleGoogleSignIn } from '@/utils/helpers/handleGoogleSignIn'
import Link from 'next/link'
import { signIn } from '@/utils/helpers/authHelpers'
import { useSnackbar } from '@/contexts/Snackbar'

interface IAuthForm {
    mode: 'login' | 'signup' | 'register'
}

type TAuthError = {
    code: string
    message: string
}

export const AuthForm = ({ mode = 'login' }: IAuthForm) => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState(auth.currentUser)
    const { showSnackbar } = useSnackbar()

    //  Check Auth State Instead of Signing Out Every Time
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            if (currentUser) {
                router.replace('/rideapp')
            }
        })
        return () => unsubscribe()
    }, [router])

    // Handle email/password authentication
    const handleAuth = async () => {
        setLoading(true)
        setError(null)
        try {
            const signInMethods = await fetchSignInMethodsForEmail(auth, email)
            // TODO: (ET) Handle this in a banner instead of an alert and clean this up instead of checking for a specific error message
            if (signInMethods.length > 0) {
                // ✅ User exists → Proceed with login
                const user = await signIn(email, password)
                if (user) router.replace('/rideapp')
            } else {
                if (
                    error !==
                    'This email is already registered. Please try logging in.'
                ) {
                    //  No account found → Ask user for confirmation before creating one
                    const confirmSignup = window.confirm(
                        `No account found for ${email}. Would you like to create one?`
                    )

                    if (!confirmSignup) {
                        setError('Signup canceled. Please try logging in.')
                    }

                    return
                }

                try {
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    )
                    console.log('✅ Account created')
                    router.replace('/rideapp')
                } catch (createError) {
                    if (
                        (createError as AuthError).code ===
                        'auth/email-already-in-use'
                    ) {
                        setError(
                            'This email is already registered. Please try logging in with your Google account.'
                        )
                    } else {
                        setError(
                            (createError as AuthError).message ||
                                'An unexpected error occurred.'
                        )
                    }
                }
            }
        } catch (err) {
            const error = err as TAuthError
            setError(error.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        setLoading(true)
        setError(null)
        try {
            await handleGoogleSignIn(router.replace)
        } catch (err) {
            const error = err as TAuthError
            setError(error.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    // Explicitly sign out (not automatically)
    const handleSignOut = async () => {
        try {
            await signOut(auth)
            setUser(null)
            router.replace('/login')
        } catch (err) {
            // TODO: (ET) handle error
            showSnackbar('Error signing out', 'error')
            console.error('Error signing out:', err)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 w-full">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    {mode === 'login' ? 'Log In' : 'Register'}
                </h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className="mb-4">
                    <label
                        htmlFor="auth-email"
                        className="block text-sm text-gray-700"
                    >
                        Email
                    </label>
                    <input
                        id="auth-email"
                        type="email"
                        autoComplete="email"
                        className="w-full p-2 border rounded-md focus:ring focus:ring-indigo-200"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="auth-password"
                        className="block text-sm text-gray-700"
                    >
                        Password
                    </label>
                    <input
                        id="auth-password"
                        type="password"
                        autoComplete={
                            mode === 'login' ? 'current-password' : 'new-password'
                        }
                        className="w-full p-2 border rounded-md focus:ring focus:ring-indigo-200"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    className="w-full bg-accent text-accent-foreground py-2 px-4 rounded-md hover:bg-indigo-700 transition"
                    onClick={handleAuth}
                    disabled={loading}
                >
                    {mode === 'login' ? 'Log In' : 'Sign Up'}
                </button>

                <button
                    className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                >
                    {mode === 'login' ? 'Log In' : 'Register'} with Google
                </button>
                {/* // TODO: (ET move sign out button to navbar */}
                {user && (
                    <button
                        className="w-full mt-4 bg-destructive text-destructive-foreground py-2 px-4 rounded-md hover:opacity-90 transition"
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </button>
                )}

                {mode === 'login' ? (
                    <div className="mt-4 text-sm text-gray-600 text-center">
                        <Link href={'/register'}>Create an account?</Link>
                    </div>
                ) : (
                    <div className="mt-4 text-sm text-gray-600 text-center">
                        <Link href={'/login'}>Already have an account?</Link>
                    </div>
                )}
            </div>
        </div>
    )
}
