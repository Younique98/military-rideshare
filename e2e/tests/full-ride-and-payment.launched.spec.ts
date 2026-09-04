import { test, expect } from '@playwright/test'
import { expectNoAxeViolations } from '../support/axe'
import { captureCheckpoint } from '../support/screenshot'
import { createTestUser, markDriverOnboarded, waitForRequestedRide } from '../support/firebaseAdmin'
import { completeDemoIdMeVerification, loginAsTestUser } from '../support/auth'
import { installStripeMock, mockCreateIntentRoute } from '../support/stripeMock'

// Runs against the "launched" project (NEXT_PUBLIC_PLATFORM_LAUNCHED=true in
// a test environment — see playwright.config.ts). This is the direct
// confirmation of BUILD requirement #2: flipping the flag to true allows
// the flow to proceed to the payment step.
//
// The rider and driver are two real, separately-authenticated browser
// contexts driving the same real Firestore-backed ride document — the
// driver's Accept / Start Trip / Complete Trip clicks call the exact
// acceptRide()/startRide()/completeRide() functions covered by Fix 1's
// independent isPlatformLaunched() gating (src/lib/firebase/rides.ts), so a
// regression there would break this test.

test('rider requests a ride, driver completes it, rider pays', async ({
    browser,
}, testInfo) => {
    // This drives two full real browser sessions through a first-compile
    // `next dev` server (rider signup+login+ride request, then a second
    // driver session, then back to the rider for payment) — comfortably
    // longer than Playwright's 30s default, independent of the app itself
    // being slow.
    test.setTimeout(120_000)

    const rider = await createTestUser('launched-rider')
    const driver = await createTestUser('launched-driver')
    await markDriverOnboarded(driver.uid)

    const riderContext = await browser.newContext()
    const riderPage = await riderContext.newPage()
    // Installed before any navigation so it's present for the whole SPA
    // session, including the client-side route change into the payment
    // step much later in this test.
    await installStripeMock(riderPage)
    await mockCreateIntentRoute(riderPage)

    await loginAsTestUser(riderPage, rider)
    await completeDemoIdMeVerification(riderPage)

    // Platform launched: no pre-launch banner, a real "Request a Ride" CTA.
    await expect(riderPage.getByText('Pre-launch testing')).toHaveCount(0)
    const requestRideButton = riderPage.getByRole('button', { name: 'Request a Ride' })
    await expect(requestRideButton).toBeVisible()
    await captureCheckpoint(riderPage, '05-launched-main-no-banner')
    await expectNoAxeViolations(riderPage, testInfo, 'launched-main-no-banner')
    await requestRideButton.click()

    await riderPage.getByPlaceholder('Pickup location').fill('Fort Liberty Main Gate')
    await riderPage.getByPlaceholder('Dropoff location').fill('Womack Army Medical Center')
    await captureCheckpoint(riderPage, '06-ride-request-form')
    await expectNoAxeViolations(riderPage, testInfo, 'ride-request-form')
    await riderPage.getByRole('button', { name: 'Continue' }).click()

    await expect(riderPage.getByRole('heading', { name: 'Ride Details' })).toBeVisible()
    await captureCheckpoint(riderPage, '07-ride-request-confirm')
    await riderPage.getByRole('button', { name: 'Confirm Ride' }).click()

    await expect(riderPage.getByText('Finding your ride...')).toBeVisible()

    // The ride now genuinely exists in Firestore (createRideRequest()
    // succeeded because the platform is launched in this project) — find
    // it the same way a real driver's open-queue listener would surface
    // it, then drive the rest of the lifecycle from a second real,
    // independently-authenticated browser session.
    const rideId = await waitForRequestedRide(rider.uid)

    const driverContext = await browser.newContext()
    const driverPage = await driverContext.newPage()
    await loginAsTestUser(driverPage, driver)
    await driverPage.goto('/driver')
    await expect(driverPage.getByText('Pre-launch testing')).toHaveCount(0)

    const openRideCard = driverPage.getByText('Fort Liberty Main Gate')
    await expect(openRideCard).toBeVisible({ timeout: 15000 })
    await captureCheckpoint(driverPage, '08-driver-dashboard-open-queue')
    await expectNoAxeViolations(driverPage, testInfo, 'driver-dashboard-open-queue')

    await driverPage.getByRole('button', { name: 'Accept' }).click()
    await expect(driverPage.getByText('Status: ACCEPTED')).toBeVisible()
    await captureCheckpoint(driverPage, '09-driver-active-ride-accepted')

    await driverPage.getByRole('button', { name: 'Start Trip' }).click()
    await expect(driverPage.getByText('Status: IN_PROGRESS')).toBeVisible()

    await driverPage.getByRole('button', { name: 'Complete Trip' }).click()
    // Once COMPLETED, the driver's active-ride subscription (ACCEPTED /
    // IN_PROGRESS only) stops matching this ride and the dashboard falls
    // back to the open-queue view.
    await expect(driverPage.getByRole('heading', { name: 'Open ride requests' })).toBeVisible()
    await driverContext.close()

    // Back on the rider's still-open tab: the real subscribeToRide()
    // onSnapshot listener picks up the driver's writes with no reload.
    await expect(riderPage.getByText(/Pay \$15\.00/)).toBeVisible({ timeout: 15000 })
    await expect(riderPage.getByTestId('mock-payment-element')).toBeVisible()
    await captureCheckpoint(riderPage, '10-rider-payment-ui')
    await expectNoAxeViolations(riderPage, testInfo, 'rider-payment-ui')

    await riderPage.getByRole('button', { name: /Pay \$15\.00/ }).click()
    await expect(riderPage.getByText('Payment successful')).toBeVisible({ timeout: 5000 })
    await captureCheckpoint(riderPage, '11-rider-payment-success')
    await expectNoAxeViolations(riderPage, testInfo, 'rider-payment-success')
    expect(rideId).toBeTruthy()

    await riderContext.close()
})
