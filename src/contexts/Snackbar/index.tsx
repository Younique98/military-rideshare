import React, { createContext, useContext, useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type SnackbarType = 'success' | 'error' | 'info'

interface SnackbarProps {
    message: string
    type: SnackbarType
}

interface SnackbarContextType {
    showSnackbar: (message: string, type: SnackbarType) => void
    hideSnackbar: () => void
}

const SnackbarContext = createContext<SnackbarContextType>({
    showSnackbar: () => {},
    hideSnackbar: () => {},
})

const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
}

const styles = {
    success: 'bg-brand-primary text-white',
    error: 'bg-destructive text-white',
    info: 'bg-brand-secondary text-white',
}

export const SnackbarProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const [snackbar, setSnackbar] = useState<SnackbarProps | null>(null)

    const showSnackbar = (message: string, type: SnackbarType) => {
        setSnackbar({ message, type })
    }

    const hideSnackbar = () => {
        setSnackbar(null)
    }

    useEffect(() => {
        if (snackbar) {
            const timer = setTimeout(() => {
                hideSnackbar()
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [snackbar])

    return (
        <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
            {children}
            {snackbar && (
                <div className="fixed top-4 right-4 left-4 md:left-auto md:right-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div
                        className={`rounded-lg shadow-lg ${
                            styles[snackbar.type]
                        } p-4 flex items-center justify-between max-w-md`}
                    >
                        <div className="flex items-center gap-2">
                            {icons[snackbar.type]}
                            <p className="text-sm font-medium">
                                {snackbar.message}
                            </p>
                        </div>
                        <button
                            onClick={hideSnackbar}
                            aria-label="Dismiss notification"
                            className="ml-4 hover:opacity-80 transition-opacity"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </SnackbarContext.Provider>
    )
}

export const useSnackbar = () => useContext(SnackbarContext)
