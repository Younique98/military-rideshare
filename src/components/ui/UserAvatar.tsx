import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface UserAvatarProps {
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
  editable?: boolean;
  onImageUpload?: (file: File) => void;
}

const UserAvatar = ({ 
  imageUrl, 
  size = 'md', 
  alt = 'User avatar',
  editable = false,
  onImageUpload 
}: UserAvatarProps) => {
  // Size mappings
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  return (
    <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center group`}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
        />
      ) : (
        <User className={`${iconSizes[size]} text-gray-500`} />
      )}
      
      {editable && (
        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
          <span className="text-white text-sm">Change</span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
};

export default UserAvatar;