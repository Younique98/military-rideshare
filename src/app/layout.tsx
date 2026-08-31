import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from './Providers'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

const SITE_URL = 'https://baselink.app'
const DESCRIPTION =
    'Base Link is a secure, military-verified rideshare platform built exclusively for service members and their dependents, connecting the military community with safe, reliable transportation between installations.'

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: 'Base Link - Military Rideshare',
        template: '%s | Base Link',
    },
    description: DESCRIPTION,
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        siteName: 'Base Link',
        title: 'Base Link - Military Rideshare',
        description: DESCRIPTION,
        url: SITE_URL,
    },
    twitter: {
        card: 'summary',
        title: 'Base Link - Military Rideshare',
        description: DESCRIPTION,
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
