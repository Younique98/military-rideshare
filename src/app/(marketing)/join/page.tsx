import type { Metadata } from 'next'
import LandingPage from '@/components/LandingPage'

export const metadata: Metadata = {
    title: 'Join the Waitlist',
    description:
        'Join the Base Link waitlist for secure, ID.me-verified rideshare built for military families — base-to-base rides and trusted transportation within your military community.',
    alternates: {
        canonical: '/join',
    },
    openGraph: {
        title: 'Join the Base Link Waitlist',
        description:
            'Secure, ID.me-verified rideshare for service members and their families. Sign up for early access to base-to-base rides with Base Link.',
        url: '/join',
    },
}

export default function JoinPage() {
    return <LandingPage />
}
