import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export interface WaitlistSignupInput {
    userId: string
    email: string
    note?: string
}

/**
 * Records a "notify me when Base Link launches in my area" signup. This is
 * the honest substitute for real ride booking while
 * `NEXT_PUBLIC_PLATFORM_LAUNCHED` is not "true" — see src/lib/launch.ts and
 * the pre-launch banner in MilitaryRideShareApp.tsx. It does not create a
 * ride and never touches payment.
 */
export async function joinWaitlist(input: WaitlistSignupInput): Promise<string> {
    const docRef = await addDoc(collection(db, 'waitlist'), {
        userId: input.userId,
        email: input.email,
        note: input.note ?? '',
        createdAt: serverTimestamp(),
    })
    return docRef.id
}
