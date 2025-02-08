import React from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/hooks/useAuth'

interface IUserAvatar {
    imageUrl?: string | null
    size?: 'sm' | 'md' | 'lg'
    alt?: string
    editable?: boolean
    onImageUpload?: (file: File) => void
}

const UserAvatar = ({
    size = 'md',
    alt = 'User avatar',
    editable = false,
    onImageUpload,
}: IUserAvatar ) => {
    const { user, isLoading } = useAuth();

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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && onImageUpload) {
            onImageUpload(file)
        }
    }

      if (isLoading) {
    return <div className={`${sizeClasses[size]} bg-gray-200 animate-pulse rounded-full`} />;
  }

    return (
        <div
            className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center group`}
        >
            {user?.photoURL ? (
                <Image src={user.photoURL} alt={alt} fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
            ) : (
                <User
                    className={clsx(iconSizes[size], 'h-8 w-8 text-gray-500')}
                />
            )}

            {editable && (
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <span className="text-white text-sm">
                        {user?.photoURL ? 'Change' : 'Upload'}
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

export default UserAvatar
