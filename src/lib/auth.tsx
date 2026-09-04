import { createContext, useEffect, useMemo, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
interface IAuthContext {
    user: User | null
    isLoggedIn: boolean
    isLoading: boolean
}

// Context to store authentication state
export const AuthContext = createContext<IAuthContext | undefined>(undefined)

// Auth Provider — backed by a live onAuthStateChanged subscription for the
// life of the app.
//
// This used to cache a single fetchAuthState() promise via react-query
// with staleTime: Infinity / refetchOnMount: false. That's the wrong shape
// for Firebase auth state: it's a push-based subscription that changes
// over the session (sign in, sign out), not a fetchable resource with one
// answer. Caching its first resolution forever meant any component that
// mounted (and so read this context) *before* a user signed in — e.g. the
// very first /login page load — was frozen at "logged out" permanently:
// AuthForm's own separate onAuthStateChanged listener would see the real,
// current signed-in state and router.replace('/rideapp'), but RequireAuth
// would read this permanently-stale "no user" value from the old cache and
// immediately bounce back to /login — an infinite redirect loop between
// the two pages for any session that signed in without a full page reload.
// A plain live subscription doesn't have this staleness problem.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
} ) => {
    const [user, setUser] = useState<User | null>(auth.currentUser)
    const [isLoading, setIsLoading] = useState(auth.currentUser === null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setIsLoading(false)
        })
        return unsubscribe
    }, [])

    const contextValue = useMemo(
        () => ({
            user,
            isLoggedIn: !!user,
            isLoading,
        }),
        [isLoading, user]
    )

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}
