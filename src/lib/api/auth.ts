import 'server-only'
import type { NextRequest } from 'next/server'
import { getAdminAuth } from '@/lib/firebase/admin'

export class UnauthorizedError extends Error {
    constructor(message = 'Missing or invalid Authorization header') {
        super(message)
        this.name = 'UnauthorizedError'
    }
}

/**
 * Verifies the Firebase ID token sent as `Authorization: Bearer <idToken>`
 * and returns the caller's uid. Every Stripe API route uses this instead of
 * trusting a uid the client puts in the request body — the whole point of
 * these routes is to do things (create a Connect account, create a charge)
 * on behalf of a specific, cryptographically-verified user.
 */
export async function requireAuthenticatedUid(request: NextRequest): Promise<string> {
    const header = request.headers.get('authorization') ?? request.headers.get('Authorization')
    if (!header?.startsWith('Bearer ')) {
        throw new UnauthorizedError()
    }

    const idToken = header.slice('Bearer '.length).trim()
    if (!idToken) {
        throw new UnauthorizedError()
    }

    try {
        const decoded = await getAdminAuth().verifyIdToken(idToken)
        return decoded.uid
    } catch {
        throw new UnauthorizedError('Firebase ID token is invalid or expired')
    }
}
