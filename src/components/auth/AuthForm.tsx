'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase/config'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from 'firebase/auth'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { handleGoogleSignIn } from '@/utils/helpers/handleGoogleSignIn'

interface IAuthForm {
    mode: 'login' | 'signup' | 'register'
}

// TODO: (ET) add loading state
export const AuthForm = ({ mode = 'login' }: IAuthForm) => {
    //TODO: (ET) add loading state and utilize them
    console.log('mode', mode)
    const { isLoggedIn } = useAuth()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        signOut(auth)
    }, [])

    const handleAuth = async (isLogin: boolean) => {
        console.log('isLogin', isLogin)
        setLoading(true)
        setError(null)
        try {
            if (isLogin) {
                console.log('isLogin', isLogin)
                await signInWithEmailAndPassword(auth, email, password)
            } else {
                console.log('is Not Login', isLogin)
                await createUserWithEmailAndPassword(auth, email, password)
            }
            // TODO: (ET) create enums or a better routing system
            router.replace('/rideapp')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        setLoading(true)
        setError(null)
        try {
            await handleGoogleSignIn(router.replace)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }
    console.log('isLoggedIn', isLoggedIn)
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Log In
                </h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-sm text-gray-700">Email</label>
                    <input
                        type="email"
                        className="w-full p-2 border rounded-md focus:ring focus:ring-indigo-200"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        className="w-full p-2 border rounded-md focus:ring focus:ring-indigo-200"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    className="w-full bg-accent text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
                    onClick={() => handleAuth(true)}
                    disabled={loading}
                >
                    Log In
                </button>
                <button
                    className="w-full mt-4 bg-accent text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
                    onClick={() => handleAuth(false)}
                    disabled={loading}
                >
                    Sign Up
                </button>
                <button
                    className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                >
                    Sign in with Google
                </button>
            </div>
        </div>
    )
}
