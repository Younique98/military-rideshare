import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = {
    title: 'Log In',
    description:
        'Log in to Base Link, the ID.me-verified rideshare platform for military service members and their families, to request or manage a ride.',
    alternates: {
        canonical: '/login',
    },
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <AuthForm mode="login" />
        </div>
    )
}
