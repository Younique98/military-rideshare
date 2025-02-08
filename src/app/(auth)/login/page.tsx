import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <AuthForm mode="login" />
        </div>
    )
}
