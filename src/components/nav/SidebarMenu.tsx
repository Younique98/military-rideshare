import { X, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ISidebarMenu {
    menuOpen: boolean
    setMenuOpen: (open: boolean) => void
    signOutUser: () => void
}
export const SidebarMenu = ({
    menuOpen,
    setMenuOpen,
    signOutUser,
}: ISidebarMenu) => {
    const router = useRouter()
    if (!menuOpen) return null

    return (
        <div className="fixed inset-0 z-40">
            <div
                className="fixed inset-0 bg-black/30"
                onClick={() => setMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-8">
                        <span className="font-semibold text-lg">Menu</span>
                        <button onClick={() => setMenuOpen(false)}>
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => {
                                    router.push('/rideapp')
                                    setMenuOpen(false)
                                }}
                                className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100"
                            >
                                Home
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    router.push('/profile')
                                    setMenuOpen(false)
                                }}
                                className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100"
                            >
                                Profile
                            </button>
                        </li>
                        <li>
                            <button
                                className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 text-red-600"
                                onClick={() => signOutUser()}
                            >
                                <span className="flex items-center">
                                    <LogOut className="h-5 w-5 mr-2" />
                                    Sign Out
                                </span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
