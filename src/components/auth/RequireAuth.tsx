'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

/**
 * Client-side route guard for pages that must only be reachable by a
 * signed-in user (dashboard, profile, ride request flow).
 *
 * This app authenticates entirely through the Firebase client SDK — there
 * is no server-side session cookie for `middleware.ts` to inspect, so
 * enforcement has to happen once the client knows the Firebase auth state.
 * Until a real session is confirmed, nothing under `children` is rendered:
 * unauthenticated visitors are redirected to /login instead of seeing the
 * page (or any of the ride/profile data it will eventually load).
 */
export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const { isLoggedIn, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.replace('/login')
        }
    }, [isLoading, isLoggedIn, router])

    if (isLoading || !isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <span className="sr-only">Checking your session…</span>
                <div
                    aria-hidden="true"
                    className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent"
                />
            </div>
        )
    }

    return <>{children}</>
}
