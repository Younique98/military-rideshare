import { storage, auth } from '@/lib/firebase/config'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'

export const handleImageUpload = async (
    file: File,
    showSnackbar: (message: string, type: 'success' | 'error' | 'info') => void
) => {
    // Get current user
    const currentUser = auth.currentUser

    if (!currentUser) {
        showSnackbar('You must be logged in to upload an image', 'error')
        throw new Error('User not authenticated')
    }

    try {
        const profileImageRef = ref(
            storage,
            `users/${currentUser.uid}/profile-image`
        )
        await uploadBytes(profileImageRef, file)
        const downloadURL = await getDownloadURL(profileImageRef)

        // Update user's photoURL if needed
        await updateProfile(currentUser, {
            photoURL: downloadURL,
        })

        showSnackbar('Profile image updated successfully', 'success')
        return downloadURL
    } catch (error) {
        console.error('Error uploading image:', error)
        showSnackbar('Failed to upload image', 'error')
        throw error
    }
}
