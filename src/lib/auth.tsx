import { createContext } from 'react'
import { useMemo } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useQuery } from '@tanstack/react-query'

interface IAuthContext {
    user: User | null
    isLoggedIn: boolean
    isLoading: boolean
}

// Context to store authentication state
export const AuthContext = createContext<IAuthContext | undefined>(undefined)

// Hook to fetch user auth state
const fetchAuthState = (): Promise<User | null> => {
    return new Promise((resolve) => {
        console.log('fetchAuthState')

        // Get cached user first
        const currentUser = auth.currentUser
        if (currentUser) {
            resolve(currentUser)
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            console.log('user auth state changed', firebaseUser)
            resolve(firebaseUser)
            unsubscribe() // Unsubscribe after first resolution
        })
    })
}

// Auth Provider Using React Query
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const {
        data: user,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['authUser'],
        queryFn: fetchAuthState,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    })

    const contextValue = useMemo(
        () => ({
            user: user ?? null,
            isLoggedIn: !!user,
            isLoading,
        }),
        [isLoading, user]
    )

    console.log('🚀 useAuth Query Loading:', isLoading)
    console.log('✅ useAuth User Data:', user)
    console.log('❌ useAuth Error:', error)

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}
