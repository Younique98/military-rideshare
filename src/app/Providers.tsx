'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth'
import { SnackbarProvider } from '@/contexts/Snackbar'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SnackbarProvider>{children}</SnackbarProvider>
            </AuthProvider>
        </QueryClientProvider>
    )
}
