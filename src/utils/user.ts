import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export const updateUserProfile = async (
  userId: string, 
  imageUrl: string
) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    imageUrl: imageUrl,
    updatedAt: new Date().toISOString()
  });
};