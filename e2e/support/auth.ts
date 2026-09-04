import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/** Drives the real /login form: fills the already-registered test user's
 *  email/password and clicks "Log In". This only works for a user that
 *  already has a password credential (see createTestUser() in
 *  firebaseAdmin.ts) — AuthForm's "no account found" branch opens a native
 *  window.confirm() dialog that this intentionally avoids exercising, since
 *  every test account here is pre-seeded via the Admin SDK. */
export async function loginAsTestUser(
    page: Page,
    creds: { email: string; password: string }
) {
    // `next dev`'s RSC streaming can still be finishing right after
    // Playwright's default 'load' wait resolves; interacting before it
    // settles has been observed (rarely) to throw a real "Invalid or
    // unexpected token" page error that aborts hydration mid-flight and
    // leaves the login form inert. 'networkidle' is not the fix — this app
    // opens a live Firestore/Auth emulator connection on every page (see
    // src/lib/firebase/config.ts), which can keep the network "active"
    // indefinitely and hang that wait for the full test timeout instead.
    // A short settle delay after 'load' avoids the race without that risk;
    // the one-retry-on-failure below is the actual safety net.
    await page.goto('/login')
    await page.waitForTimeout(500)

    async function fillAndSubmit() {
        await page.getByLabel('Email').fill(creds.email)
        await page.getByLabel('Password').fill(creds.password)
        await page.getByRole('button', { name: 'Log In', exact: true }).click()
    }

    await fillAndSubmit()
    try {
        await expect(page).toHaveURL(/\/rideapp/, { timeout: 10000 })
    } catch {
        // One retry covers the rare dev-mode hydration race above — a
        // second attempt against an already-settled page is reliable.
        await page.goto('/login')
        await page.waitForTimeout(500)
        await fillAndSubmit()
        await expect(page).toHaveURL(/\/rideapp/, { timeout: 15000 })
    }
}

/** MilitaryRideShareApp only renders past the "Military Verification
 *  Required" screen once NEXT_PUBLIC_DEMO_MODE's mock ID.me button has been
 *  clicked — see src/components/features/MilitaryRideShareApp.tsx. Every
 *  e2e project runs with NEXT_PUBLIC_DEMO_MODE=true for exactly this
 *  reason (see playwright.config.ts); real ID.me verification isn't wired
 *  up yet, so this demo path is the only way to reach the app at all,
 *  logged-out landing aside. */
export async function completeDemoIdMeVerification(page: Page) {
    await page.getByRole('button', { name: /Simulate ID\.me Verification/i }).click()
}
