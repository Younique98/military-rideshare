# Screenshots

Checkpoint captures from the Playwright e2e suite (`e2e/`), regenerated on
every `yarn test:e2e` run — see `e2e/support/screenshot.ts`. Each file is a
full-page screenshot of a real rendered state, not a mockup.

| File | Project | State |
|---|---|---|
| `01-logged-out-landing.png` | prelaunch | `/login`, signed out |
| `02-prelaunch-banner.png` | prelaunch | Signed-in rider, platform not launched (today's default production state) |
| `03-prelaunch-waitlist-form.png` | prelaunch | The waitlist form a pre-launch "Request a Ride" click routes to |
| `04-driver-dashboard-prelaunch.png` | prelaunch | Driver dashboard, platform not launched |
| `05-launched-main-no-banner.png` | launched | Signed-in rider, platform launched — no banner, real "Request a Ride" CTA |
| `06-ride-request-form.png` | launched | Pickup/dropoff step of the real ride-request flow |
| `07-ride-request-confirm.png` | launched | Ride Details confirmation step |
| `08-driver-dashboard-open-queue.png` | launched | Driver dashboard showing the real open-ride queue |
| `09-driver-active-ride-accepted.png` | launched | Driver's active-ride view right after accepting |
| `10-rider-payment-ui.png` | launched | Rider payment step — mocked Stripe Payment Element (see `e2e/support/stripeMock.ts`) |
| `11-rider-payment-success.png` | launched | Payment confirmed |
