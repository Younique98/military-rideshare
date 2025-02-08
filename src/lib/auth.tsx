import { createContext } from 'react'
import { useMemo } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useQuery } from '@tanstack/react-query'
import { useSnackbar } from '@/contexts/Snackbar'
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

        // Get cached user first
        const currentUser = auth.currentUser
        if (currentUser) {
            resolve(currentUser)
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            resolve(firebaseUser)
            unsubscribe() // Unsubscribe after first resolution
        })
    })
}

// Auth Provider Using React Query
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
} ) => {
    const { showSnackbar } = useSnackbar()
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

    if (error) {
        showSnackbar( 
            'Failed to fetch user',
            'error',
        )
    }
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}
