'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'
import clsx from 'clsx'
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { Button } from './button'
import { useRouter } from 'next/navigation'

interface IUserAvatar {
    size?: 'sm' | 'md' | 'lg'
    alt?: string
    editable?: boolean
}

// Size mappings
const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
}

const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
}

export const UserAvatar = ({
    size = 'md',
    alt = 'User avatar',
    editable = false,
}: IUserAvatar) => {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const auth = getAuth()

    // Ensure Profile Image Updates on Login & Re-login
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (updatedUser) => {
            if (updatedUser) {
                let imageUrl = updatedUser.photoURL

                if (!imageUrl) {
                    try {
                        const imageRef = ref(
                            storage,
                            `profileImages/${updatedUser.uid}.jpg`
                        )
                        imageUrl = await getDownloadURL(imageRef)

                        // If Auth doesn't have photoURL, update Firebase Auth
                        await updateProfile(updatedUser, { photoURL: imageUrl })
                    } catch (error) {
                        console.error(
                            'Error fetching stored profile image:',
                            error
                        )
                    }
                }

                setProfileImage(imageUrl || null)
            }
        })

        return () => unsubscribe()
    }, [auth])

    // Handle Image Upload
    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]
        if (!file || !user) return

        setUploading(true)

        try {
            const storageRef = ref(storage, `profileImages/${user.uid}.jpg`)
            await uploadBytes(storageRef, file)

            // Fetch updated image URL
            const downloadURL = await getDownloadURL(storageRef)
            setProfileImage(downloadURL)

            // Update Firebase Auth `photoURL`
            await updateProfile(user, { photoURL: downloadURL })
        } catch (error) {
            console.error('Error updating profile:', error)
        } finally {
            setUploading(false)
        }
    }

    // Loader while fetching image
    if (isLoading) {
        return (
            <div
                className={`${sizeClasses[size]} bg-gray-200 animate-pulse rounded-full`}
            />
        )
    }

    return (
        <div
            className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center group`}
        >
            <Button
                onClick={() => router.push('/profile')}
                className={clsx(
                    'relative overflow-hidden rounded-full flex items-center justify-center',
                    sizeClasses[size] // Ensure button matches the size of the avatar
                )}
            >
                {profileImage ? (
                    <Image
                        src={profileImage}
                        alt={alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <User className={clsx(iconSizes[size], 'text-gray-500')} />
                )}
            </Button>

            {editable && (
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <span className="text-white text-sm">
                        {uploading
                            ? 'Uploading...'
                            : profileImage
                            ? 'Change'
                            : 'Upload'}
                    </span>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </label>
            )}
        </div>
    )
}
