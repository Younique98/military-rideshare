import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = {
    title: 'Register',
    description:
        'Create your Base Link account — sign up with ID.me military verification to start booking safe, verified rides within your military community.',
    alternates: {
        canonical: '/register',
    },
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <AuthForm mode="register" />
        </div>
    )
}
