# Base Link

Base Link is a rideshare platform being built for service members and their
dependents. It's an active work in progress: this README describes what is
actually implemented in the codebase today, separately from the longer-term
vision the project is being built toward — see [Status](#status) below.

![Base Link](https://github.com/user-attachments/assets/baselink-preview.png)

## Status

**Implemented today:**
- Firebase Authentication (email/password and Google sign-in)
- Client-side route protection (`RequireAuth`) that redirects signed-out
  visitors away from authenticated pages
- A **demo-gated mock** military-verification flow (see
  [Military Verification](#military-verification) below) — not a real
  ID.me integration
- A **real** ride data model in Firestore (`rides/{rideId}`, see
  [Database Schema](#database-schema)) with a real status lifecycle —
  REQUESTED → ACCEPTED → IN_PROGRESS → COMPLETED → PAID, or CANCELLED —
  written and read through `src/lib/firebase/rides.ts`, not mock/in-memory
  data anymore
- A **real** Stripe Connect (Express) marketplace payment integration —
  driver onboarding, a PaymentIntent per completed ride split
  automatically between the platform and the driver, and a webhook that
  reconciles both — see `src/app/api/stripe/**` and
  [Payments (Stripe Connect)](#payments-stripe-connect) below
- Firestore and Storage security rules (`firestore.rules` / `storage.rules`)
  scoping every document to the user who owns it, including the real ride
  lifecycle and Stripe-controlled fields above — committed to the repo as
  rules-as-code, but **not yet deployed** to a live Firebase project (see
  the header comment in each file for why, and what deploying them requires)
- A **pre-launch gate** (`NEXT_PUBLIC_PLATFORM_LAUNCHED`) that keeps the
  real ride booking/payment code above from being reachable by real users
  until Base Link is actually licensed to operate — see
  [Pre-Launch Gate](#pre-launch-gate) below. This is the most important
  section in this README if you're deploying this app anywhere.
- Security response headers (CSP, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`) set in `next.config.ts`

**Planned / not yet implemented:**
- A real ID.me OAuth integration with a server-side token exchange
- Real distance/time-based fare pricing (today's fare is a flat
  placeholder — see `src/lib/fare.ts`) once a live maps/routing
  integration exists
- A real card-collection UI (Stripe Elements) on the rider side — the
  PaymentIntent creation route exists and is real, but nothing yet renders
  Stripe's card form to actually confirm it
- Live ride matching against real driver/rider Firestore data
- End-to-end message encryption
- Military base geofencing / sensitive-location masking
- Automated dependency/security scanning wired into CI
- Data retention/purging policies
- The actual TNC (Transportation Network Company) license and insurance
  required before `NEXT_PUBLIC_PLATFORM_LAUNCHED` can be turned on for
  real — see [Pre-Launch Gate](#pre-launch-gate)

The [Database Schema](#database-schema) and [Security Features](#security-features)
sections below describe both what's live now and where each planned piece
is headed.

## Military Verification

`MilitaryRideShareApp` gates ride requests behind an "ID.me verification"
step. There is currently no real ID.me OAuth credential wired into this app
— no client secret, no server-side token exchange, no verified-status
check — so the verification button's behavior depends on the
`NEXT_PUBLIC_DEMO_MODE` environment variable:

- **`NEXT_PUBLIC_DEMO_MODE` unset or `false` (default, production):** the
  "Verify with ID.me" button is disabled and the UI says plainly that
  verification is not yet connected. No one can click through to a
  real-looking "✓ Verified" badge that isn't backed by anything.
- **`NEXT_PUBLIC_DEMO_MODE=true` (local/demo/portfolio use only):** a mock
  "Simulate ID.me Verification (Demo)" button is enabled, and every screen
  reachable through it carries a persistent, visibly-labeled
  "DEMO — not a real verification" badge so it's never mistaken for the
  real thing.

See `.env.example` for the full list of variables, and
`src/components/features/MilitaryRideShareApp.tsx` for the implementation.

## Pre-Launch Gate

**Read this before deploying this app anywhere real.**

Most US states require a Transportation Network Company (TNC) license
before a ride-matching-for-pay service can operate for real, paying users
— Virginia's license alone runs $100K+; other states are cheaper or free
but still require insurance. Base Link does not have that license or
insurance yet, in any state.

The real ride-booking and Stripe Connect payment code described in
[Database Schema](#database-schema) and
[Payments (Stripe Connect)](#payments-stripe-connect) is fully built — not
a stub — but it stays off for real users behind one flag:
`NEXT_PUBLIC_PLATFORM_LAUNCHED`.

- **Unset or anything other than the exact string `"true"` (default, and
  what must ship to production until licensing/insurance is sorted):**
  the ride-request screen shows a clear "Base Link is in pre-launch
  testing" banner, and "Request a Ride" routes to a waitlist / notify-me
  signup instead of creating a real ride. This is enforced in more than
  one place on purpose, so a UI bug or a missing env var can't
  accidentally open real charges:
  1. `MilitaryRideShareApp.tsx` — the banner and the waitlist routing.
  2. `createRideRequest()` in `src/lib/firebase/rides.ts` — refuses to
     write a ride document at all.
  3. `POST /api/stripe/payment/create-intent` — refuses to create a real
     Stripe charge, independent of what any client sends it.
- **`NEXT_PUBLIC_PLATFORM_LAUNCHED=true`:** the real flow goes live —
  rides can be created and paid for through Stripe Connect.

This fails closed by design (see `src/lib/launch.ts`): only the exact
string `"true"` turns it on. Unset, empty, `"false"`, `"1"`, a typo, or
any other value all mean "not launched." Never set this to `"true"` in a
real deployment until the actual TNC license and insurance are in place.

## Payments (Stripe Connect)

Rider payments are not a simple "customer pays the platform" flow — a
rider pays for a ride, and the driver has to actually receive that money
minus Base Link's cut. This uses **Stripe Connect** with Express accounts
and destination charges:

1. **Driver onboarding** (`POST /api/stripe/connect/onboarding-link`) —
   creates a Stripe Connect Express account for the calling driver (or
   reuses their existing one) and returns a Stripe-hosted onboarding URL
   (`accountLinks.create`). The resulting account id is stored on
   `users/{uid}.stripeConnectedAccountId`, and
   `users/{uid}.stripeOnboardingComplete` is only ever set `true` by the
   webhook once Stripe confirms the account can actually accept charges
   and payouts — never by the client. See `src/app/(authenticated)/driver/payouts/page.tsx`.
2. **Ride matching eligibility** — a driver only sees and can accept
   open `REQUESTED` rides once `stripeOnboardingComplete` is `true` (see
   `firestore.rules`) — you can't be matched with a ride you have no way
   to get paid for. See `src/app/(authenticated)/driver/page.tsx`.
3. **Rider payment** (`POST /api/stripe/payment/create-intent`) — once a
   ride reaches `COMPLETED`, creates a Stripe PaymentIntent with
   `application_fee_amount` (the platform's cut) and
   `transfer_data.destination` set to the driver's connected account, so
   Stripe splits and transfers the money automatically. The platform fee
   percentage is one named constant, easy to change:
   `PLATFORM_FEE_PERCENT` in `src/lib/stripe/server.ts` (currently 15%).
4. **Webhook** (`POST /api/stripe/webhook`) — the only path that ever
   moves a ride to `PAID` or flips `stripeOnboardingComplete` to `true`,
   driven entirely by Stripe's own signed events
   (`payment_intent.succeeded`, `payment_intent.payment_failed`,
   `charge.refunded`, `account.updated`).

All of this is gated behind [the pre-launch flag](#pre-launch-gate) — see
that section before turning it on anywhere real. What's **not** built
yet: a card-collection UI (Stripe Elements) on the rider side to actually
confirm a PaymentIntent, and real distance-based fare pricing (today's
fare is a flat placeholder — see `src/lib/fare.ts`).

## Tech Stack

- Frontend Framework: Next.js 15 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui-style components
- Authentication: Firebase Auth (email/password, Google) — real ID.me
  integration is planned but not yet built (see [Status](#status))
- Database: Firebase Firestore (rules committed as code but not yet
  deployed to a live project — see [Status](#status)); ride/user writes
  that must be trusted server-side go through the Firebase Admin SDK
  (`src/lib/firebase/admin.ts`)
- Payments: Stripe Connect (Express accounts, destination charges) — see
  [Payments (Stripe Connect)](#payments-stripe-connect); gated behind
  [the pre-launch flag](#pre-launch-gate)
- Package manager: Yarn (this repo pins `packageManager: "yarn@1.22.22"` —
  use Yarn, not npm, so `yarn.lock` stays the single source of truth)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.19.0 or higher)
- Yarn 1.x (`corepack enable` will pick up the pinned version automatically)
- Git
- Firebase CLI (only needed if you plan to deploy `firestore.rules` /
  `storage.rules` to a real Firebase project — not required to run the app
  locally)

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/Younique98/military-rideshare.git
cd military-rideshare
```

2. Install dependencies
```bash
yarn install
```

3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in real values:
```bash
cp .env.example .env.local
```
```env
# App Configuration
NEXT_PUBLIC_APP_NAME=Base Link
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Demo mode — leave unset/false in production. See "Military Verification"
# above. Only set to true for local/portfolio demos.
NEXT_PUBLIC_DEMO_MODE=false
```

4. Run the development server
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure
```bash
military-rideshare/
├── src/
│   ├── app/
│   │   ├── (auth)/            # login / register pages
│   │   ├── (authenticated)/   # dashboard, driver dashboard + payouts (behind RequireAuth)
│   │   ├── (marketing)/       # public marketing pages (e.g. join)
│   │   ├── api/stripe/        # Stripe Connect onboarding, payment, webhook routes
│   │   ├── profile/           # user profile page
│   │   ├── rideapp/           # main ride-request flow (behind RequireAuth)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── auth/              # AuthForm, RequireAuth route guard
│   │   ├── features/          # MilitaryRideShareApp, Sarge recommendations
│   │   └── ui/                # shared UI primitives
│   ├── contexts/               # React context providers (e.g. Snackbar)
│   ├── hooks/                  # shared hooks (e.g. useAuth)
│   ├── lib/
│   │   ├── api/                 # server-side request auth (Firebase ID token verification)
│   │   ├── firebase/            # client SDK config + admin SDK (server) + rides/waitlist writes
│   │   ├── stripe/               # server-side Stripe client + platform fee constant
│   │   ├── fare.ts               # placeholder flat-fare estimator
│   │   └── launch.ts             # NEXT_PUBLIC_PLATFORM_LAUNCHED gate (see Pre-Launch Gate)
│   ├── types/
│   │   └── ride.ts               # Ride/RideStatus/RidePayment shapes
│   └── utils/
│       └── helpers/             # auth helpers, error handling, etc.
├── public/                     # static files
├── firestore.rules             # Firestore security rules (see Status)
├── storage.rules                # Storage security rules (see Status)
├── firebase.json                 # points the Firebase CLI at the rules above
└── package.json
```

Authentication still goes straight from the client to the Firebase client
SDK — there's no backend auth route. `src/app/api/` does now exist for
the Stripe Connect payment routes (`src/app/api/stripe/**`), which need a
trusted server to hold the Stripe secret key and verify Firebase ID
tokens; see [Payments (Stripe Connect)](#payments-stripe-connect).

## Database Schema

`users/{uid}` documents are read/written by the real auth flow
(`src/lib/firebase/config.ts`, `firestore.rules`). `rides/{rideId}`
documents are **real** too now — written and read through
`src/lib/firebase/rides.ts`, not mock data — see `src/types/ride.ts` for
the authoritative shape. `Verification` below is still planned, pending
the real ID.me integration.

```typescript
// Users (src/types — the driver-payout fields are only ever written by
// the Stripe Connect webhook / onboarding route, never by the client —
// see firestore.rules and Payments (Stripe Connect) above)
interface User {
  id: string;
  email: string;
  name: string;
  militaryStatus: 'active' | 'dependent' | 'veteran';
  verificationStatus: 'pending' | 'verified' | 'expired';
  currentBase: string;
  profileComplete: boolean;
  stripeConnectedAccountId?: string;   // server-written only
  stripeOnboardingComplete?: boolean;  // server-written only
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Rides — real, live Firestore data (src/types/ride.ts). fare, payment,
// and every field set at creation are immutable from the client after
// create; only the Stripe webhook can move a ride to PAID or write
// .payment — see firestore.rules for the exact rules.
interface Ride {
  id: string;
  riderId: string;
  driverId: string | null;
  status: 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID' | 'CANCELLED';
  pickup: { address: string; lat?: number; lng?: number };
  dropoff: { address: string; lat?: number; lng?: number };
  fare: number;       // cents; flat placeholder today — see src/lib/fare.ts
  currency: string;
  requestedAt: Timestamp;
  acceptedAt?: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  cancelledAt?: Timestamp;
  cancelledBy?: 'rider' | 'driver';
  payment?: {
    stripePaymentIntentId?: string;
    status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
    amount?: number;
    platformFeeAmount?: number;
    driverPayoutAmount?: number;
    currency?: string;
  };
}

// Waitlist — "notify me" signups collected while
// NEXT_PUBLIC_PLATFORM_LAUNCHED is not "true" (src/lib/firebase/waitlist.ts).
// Write-only from the client: create-only, never read/updated/deleted back.
interface WaitlistEntry {
  userId: string;
  email: string;
  note?: string;
  createdAt: Timestamp;
}

// Verification (planned — depends on the real ID.me integration)
interface Verification {
  userId: string;
  idmeToken: string;
  militaryStatus: string;
  verifiedAt: Timestamp;
  expiresAt: Timestamp;
}
```

`firestore.rules` locks the `rides/{rideId}`, `users/{userId}`, and
`waitlist/{docId}` collections down to exactly who should be able to
touch each field — see that file's header comment for the full model,
including which fields are never trusted from the client no matter who's
asking.

## Security Features

**Implemented today:**
- Firebase Authentication for sign-in (email/password + Google), with
  client-side route guarding (`RequireAuth`) on authenticated pages
- Firestore and Storage security rules (`firestore.rules`, `storage.rules`)
  scoping every user/ride/profile-photo document to its owner — see the
  header comments in those files for exactly what's covered and, notably,
  that they are **committed but not yet deployed** to a live Firebase
  project
- HTTP security response headers (CSP, `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) applied
  to every route in `next.config.ts`
- A demo-gated, clearly-labeled mock verification flow instead of a fake
  "verified" badge with no backing (see [Military Verification](#military-verification))
- A hard, fail-closed pre-launch gate (`NEXT_PUBLIC_PLATFORM_LAUNCHED`)
  keeping the real ride-booking/payment code from being reachable by real
  users until Base Link is actually licensed — see
  [Pre-Launch Gate](#pre-launch-gate)
- Server-verified Stripe operations: every Stripe API route re-checks the
  caller's Firebase ID token and the ride's actual state server-side
  (Admin SDK) rather than trusting anything the client sends — see
  [Payments (Stripe Connect)](#payments-stripe-connect)

**Planned:**
- Real ID.me integration for military status verification, with periodic
  reverification
- Military base geofencing and sensitive-area masking
- End-to-end message encryption between riders and drivers
- Automated dependency/security scanning in CI
- Data retention/purging policies

## Development

Available scripts (see `package.json`):
```bash
yarn dev      # start the dev server
yarn build    # production build
yarn start    # run a production build
yarn lint     # run ESLint
yarn test:e2e # Playwright + axe-core e2e/accessibility suite — see below
```

Treat `yarn lint`, `yarn build`, `yarn test:e2e`, and `yarn audit` as the
baseline checks for a PR. `firestore-tests/` (a separate, standalone
package — see its own README) covers `firestore.rules` directly against a
Firestore emulator.

### End-to-end / accessibility tests (`e2e/`)

A real Playwright suite — no mocked DOM, no fake component tree — that
drives an actual `next dev` server against a real local Firebase Auth +
Firestore emulator pair, and runs [axe-core](https://github.com/dequelabs/axe-core)
against real rendered pages. Two Playwright *projects* cover the two states
`NEXT_PUBLIC_PLATFORM_LAUNCHED` puts the app in:

- **`prelaunch`** (the flag unset/false — today's actual default
  production state): the logged-out `/login` page, the signed-in pre-launch
  banner + waitlist flow, and the driver dashboard's pre-launch banner —
  and a real UI-level check that there is no reachable path to a real
  ride-request form while the platform isn't launched.
- **`launched`** (the flag set to `"true"` in this test environment only):
  a full real lifecycle across two independently-authenticated browser
  sessions — a rider requests a ride, a driver Accepts / Starts / Completes
  it (the exact `acceptRide()`/`startRide()`/`completeRide()` calls Fix 1
  independently gates), and the rider reaches the payment step.

Stripe is mocked in-page (`e2e/support/stripeMock.ts` — a fake
`window.Stripe` installed before `@stripe/stripe-js` ever loads, plus a
routed fixture response for `/api/stripe/payment/create-intent`) so this
never talks to real Stripe or needs real API keys, per the "don't hit live
payment infra in CI" rule.

Screenshots land in the committed `screenshots/` directory at every key
checkpoint (landing, pre-launch banner, ride-request form, driver
dashboard, payment UI states).

**Running it:**
```bash
yarn test:e2e              # runs both projects; starts the emulator + two
                            # next dev servers itself (see playwright.config.ts)
yarn test:e2e:report       # opens the last run's HTML report
```
Requires Java (the Firestore emulator) and, once, `npx playwright install
--with-deps chromium` to fetch a browser binary (not needed if
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` already points at one — see
`playwright.config.ts`).

### Verifying a firebase-admin version bump

`scripts/verify-firebase-admin-migration.ts` is a standalone check for
exactly the risk a firebase-admin major-version bump carries on this
repo: that Auth token verification and Firestore Admin writes (the code
every Stripe route's auth check depends on — see `src/lib/api/auth.ts` /
`src/lib/firebase/admin.ts`) still work. It runs those real code paths
against a real Auth + Firestore emulator — not a mock of firebase-admin.
```bash
yarn emulators &            # start the emulator pair
yarn verify:firebase-admin  # exercises verifyIdToken() + Firestore reads/writes
```

To create a new feature:
```bash
git checkout -b feature/YourFeature
yarn lint
yarn build
```

## Working with Maps

The current build shows a static placeholder map image on the main ride
screen — there is no live Google Maps integration, route/direction lookup,
or geofencing utility (`@/lib/maps`, `@/lib/security/geofencing`) wired up
yet. Live maps and base-access geofencing are tracked in
[Status](#status) as planned work.

## Deployment

The application can be deployed on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables (see `.env.example`) — leave
   `NEXT_PUBLIC_DEMO_MODE` **and** `NEXT_PUBLIC_PLATFORM_LAUNCHED`
   unset/`false` for any real deployment until the real ID.me integration
   and the TNC license/insurance (respectively) are actually in place —
   see [Pre-Launch Gate](#pre-launch-gate). `NEXT_PUBLIC_` variables are
   inlined at build time, not read at runtime, so changing either later
   requires a new build/deploy, not just an env var change.
4. Set up build settings:
```bash
Build Command: yarn build
Output Directory: .next
Install Command: yarn install
```

Deploying `firestore.rules` / `storage.rules` is a separate step from the
app deployment above — run `firebase deploy --only firestore:rules,storage:rules`
against the real Firebase project once you're authenticated against it
(`firebase login`). As of this writing those rules are committed but not
yet deployed anywhere.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Security Guidelines
- No sensitive data (real credentials, PII, `.env.local`) in commits
- Never remove the `NEXT_PUBLIC_DEMO_MODE` gate around the mock
  verification flow, or ship it enabled by default
- **Never set `NEXT_PUBLIC_PLATFORM_LAUNCHED=true` in a real deployment
  without confirming Base Link is actually licensed (TNC license +
  insurance) in that state** — see [Pre-Launch Gate](#pre-launch-gate).
  This is a legal precondition, not a style preference.
- Flag anything touching auth, Firestore/Storage rules, Stripe, or PII
  handling for extra review

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with shadcn/ui-style components
- Powered by Next.js
- Authentication by Firebase (real ID.me military-status verification is
  planned, not yet integrated — see [Status](#status))
