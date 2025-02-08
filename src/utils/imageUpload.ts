import { storage, db } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from "firebase/firestore";

export const handleImageUpload = async (
  file: File,
  userId: string,
  showSnackbar: (message: string, type: 'success' | 'error' | 'info') => void
) => {
    try {
    // Create a reference to the file location
    const profileImageRef = ref(storage, `users/${userId}/profile-image`);
    
    // Upload the file
    await uploadBytes(profileImageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(profileImageRef);
    
    // Update the user's profile in Firestore
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      photoURL: downloadURL,
      updatedAt: new Date().toISOString()
    });

    showSnackbar('Profile image updated successfully', 'success');
    return downloadURL;
  } catch (error) {
    showSnackbar('Failed to upload image', 'error');
    throw error;
  }
};