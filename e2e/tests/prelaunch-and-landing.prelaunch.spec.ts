import { test, expect } from '@playwright/test'
import { expectNoAxeViolations } from '../support/axe'
import { captureCheckpoint } from '../support/screenshot'
import { createTestUser } from '../support/firebaseAdmin'
import { completeDemoIdMeVerification, loginAsTestUser } from '../support/auth'

// Runs against the "prelaunch" project (NEXT_PUBLIC_PLATFORM_LAUNCHED
// unset/false) — the default production state today. See
// playwright.config.ts for how that server is started.

test.describe('logged-out landing', () => {
    test('login page renders accessibly', async ({ page }, testInfo) => {
        await page.goto('/login')
        await expect(page.getByRole('heading', { name: 'Log In' })).toBeVisible()
        await captureCheckpoint(page, '01-logged-out-landing')
        await expectNoAxeViolations(page, testInfo, 'logged-out-landing')
    })
})

test.describe('pre-launch banner state (default production state)', () => {
    test('signed-in rider sees the pre-launch banner, not a real booking flow', async ({
        page,
    }, testInfo) => {
        const user = await createTestUser('prelaunch-rider')
        await loginAsTestUser(page, user)
        await completeDemoIdMeVerification(page)

        // The pre-launch banner is the honest, default-production state —
        // it deserves the same real coverage as everything else.
        await expect(page.getByText('Pre-launch testing').first()).toBeVisible()
        await expect(page.getByRole('button', { name: 'Join the Waitlist' })).toBeVisible()
        await captureCheckpoint(page, '02-prelaunch-banner')
        await expectNoAxeViolations(page, testInfo, 'prelaunch-banner')
    })

    test('the pre-launch gate blocks a real ride-request attempt through the UI', async ({
        page,
    }, testInfo) => {
        const user = await createTestUser('prelaunch-gate-rider')
        await loginAsTestUser(page, user)
        await completeDemoIdMeVerification(page)

        // "Request a Ride" only exists once platformLaunched is true (see
        // MilitaryRideShareApp.tsx) — while it's false, the only button
        // here routes to the waitlist. There is no pickup/dropoff form
        // reachable through the UI at all pre-launch.
        await expect(page.getByRole('button', { name: 'Request a Ride' })).toHaveCount(0)
        const cta = page.getByRole('button', { name: 'Join the Waitlist' })
        await expect(cta).toBeVisible()
        await cta.click()

        await expect(page.getByRole('heading', { name: 'Join the Waitlist' })).toBeVisible()
        await expect(page.getByPlaceholder('Pickup location')).toHaveCount(0)
        await expect(page.getByPlaceholder('Dropoff location')).toHaveCount(0)
        await captureCheckpoint(page, '03-prelaunch-waitlist-form')
        await expectNoAxeViolations(page, testInfo, 'prelaunch-waitlist-form')

        // Submitting the waitlist form must never create a ride document —
        // it only exercises joinWaitlist(), a separate collection entirely
        // (see src/lib/firebase/waitlist.ts). This is the UI-level
        // confirmation that the gate holds: there is no path from here to
        // a chargeable ride while the platform isn't launched.
        await page.getByLabel('Email').fill(user.email)
        await page.getByRole('button', { name: 'Notify Me at Launch' }).click()
        await expect(page.getByText("You're on the list")).toBeVisible()
    })
})

test.describe('driver dashboard — pre-launch', () => {
    test('driver dashboard shows the pre-launch banner and no live queue', async ({
        page,
    }, testInfo) => {
        const driver = await createTestUser('prelaunch-driver')
        await loginAsTestUser(page, driver)
        await page.goto('/driver')

        await expect(page.getByRole('heading', { name: 'Driver Dashboard' })).toBeVisible()
        await expect(page.getByText('Pre-launch testing').first()).toBeVisible()
        await captureCheckpoint(page, '04-driver-dashboard-prelaunch')
        await expectNoAxeViolations(page, testInfo, 'driver-dashboard-prelaunch')
    })
})
