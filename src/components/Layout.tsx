'use client'
import { useState } from 'react'
import { NavigationBar } from '@/components/nav/NavigationBar'
import Providers from '@/app/Providers'

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const [menuOpen, setMenuOpen] = useState(false)
    return (
        <Providers>
            <div className="flex flex-col min-h-screen">
                {/* Navigation Bar (Always Visible) */}
                <NavigationBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

                {/* Main Page Content */}
                <main className="flex-grow">{children}</main>
            </div>
        </Providers>
    )
}
