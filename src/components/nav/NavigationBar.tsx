'use client'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '../ui/UserAvatar'
import { signOutUser } from '@/utils/helpers/authHelpers'
import { SidebarMenu } from './SidebarMenu'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Menu } from 'lucide-react'
interface INavigationBar {
    menuOpen: boolean
    setMenuOpen: (open: boolean) => void
}

//TODO: (ET) Nav bar should be hidden when signed out
export const NavigationBar = ({ menuOpen, setMenuOpen }: INavigationBar) => {
    const router = useRouter()
    const isMobile = useIsMobile()
    return (
        <nav className="bg-white shadow-sm py-2">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        {/* Sidebar Menu (Visible on Mobile) */}

                        {isMobile && (
                            <div>
                                {' '}
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
                                >
                                    <Menu className="h-6 w-6" />
                                </button>{' '}
                                <SidebarMenu
                                    menuOpen={menuOpen}
                                    setMenuOpen={setMenuOpen}
                                    signOutUser={signOutUser}
                                />
                            </div>
                        )}
                        <span className="ml-2 font-semibold text-2xl md:text-3xl">
                            Base Link
                        </span>
                    </div>
                    <div className="flex items-center space-x-6">
                        {!isMobile && (
                            <div>
                                {/* // TODO: FIx spacing between Home and Profile */}
                                <button
                                    onClick={() => router.push('/')} // Link to Home
                                    className="text-gray-600 hover:text-gray-900 font-medium"
                                >
                                    Home
                                </button>
                                <button
                                    onClick={() => router.push('/profile')} // Link to Profile
                                    className="text-gray-600 hover:text-gray-900 font-medium"
                                >
                                    Profile
                                </button>
                            </div>
                        )}
                        <div>
                            <UserAvatar size="md" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
