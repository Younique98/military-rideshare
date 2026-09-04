import type { NextConfig } from "next";

// Firebase Auth (Google sign-in popup), Storage, Firestore and Analytics
// each need their own hosts allow-listed below; nothing else should be
// added here without a specific reason.
//
// The one addition: when NEXT_PUBLIC_USE_FIREBASE_EMULATOR is exactly
// "true" (same fail-closed, explicit-flag pattern as NEXT_PUBLIC_DEMO_MODE
// / NEXT_PUBLIC_PLATFORM_LAUNCHED — see src/lib/launch.ts and
// src/lib/firebase/config.ts), connect-src also allows the local Firebase
// Auth/Firestore emulators so the Playwright e2e suite (see
// playwright.config.ts) can actually reach them from the browser. This
// flag is never set in production, so the CSP served to real users is
// unchanged.
const useFirebaseEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
const emulatorConnectSrc = useFirebaseEmulator
  ? ' http://127.0.0.1:9099 http://127.0.0.1:8085 ws://127.0.0.1:8085'
  : ''

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js needs 'unsafe-inline'/'unsafe-eval' for its own runtime and
  // dev-mode HMR; Firebase Auth's popup flow is also same-origin JS.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://*.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://firebasestorage.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com" +
    emulatorConnectSrc,
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
]

const nextConfig: NextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // The Playwright e2e suite runs two `next dev` servers at once (one per
  // NEXT_PUBLIC_PLATFORM_LAUNCHED value — see playwright.config.ts). Two
  // concurrent dev servers writing to the same default `.next/` directory
  // corrupt each other's webpack/HMR cache, so each is given its own
  // dist dir via NEXT_DIST_DIR; a normal `next dev`/`next build` (this
  // env var unset) still uses the default `.next`.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;
