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
- Client-side mock ride request flow (pickup/dropoff → confirm → "finding a
  ride" → reset) using in-memory state, not live Firestore data
- Firestore and Storage security rules (`firestore.rules` / `storage.rules`)
  scoping every document to the user who owns it — committed to the repo as
  rules-as-code, but **not yet deployed** to a live Firebase project (see
  the header comment in each file for why, and what deploying them requires)
- Security response headers (CSP, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`) set in `next.config.ts`

**Planned / not yet implemented:**
- A real ID.me OAuth integration with a server-side token exchange
- Backend API routes for auth, ride matching, and verification (today all
  auth goes through the Firebase client SDK directly; there are no
  `src/app/api/*` routes)
- Live ride matching against real driver/rider Firestore data
- End-to-end message encryption
- Military base geofencing / sensitive-location masking
- Automated dependency/security scanning wired into CI
- Data retention/purging policies

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

## Tech Stack

- Frontend Framework: Next.js 15 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui-style components
- Authentication: Firebase Auth (email/password, Google) — real ID.me
  integration is planned but not yet built (see [Status](#status))
- Database: Firebase Firestore (rules deployed as code; live ride data is
  still mock/client-side — see [Status](#status))
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
│   │   ├── (authenticated)/   # dashboard (behind RequireAuth)
│   │   ├── (marketing)/       # public marketing pages (e.g. join)
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
│   │   └── firebase/           # Firebase app/auth/firestore/storage config
│   └── utils/
│       └── helpers/             # auth helpers, error handling, etc.
├── public/                     # static files
├── firestore.rules             # Firestore security rules (see Status)
├── storage.rules                # Storage security rules (see Status)
├── firebase.json                 # points the Firebase CLI at the rules above
└── package.json
```

There is no `src/app/api/` directory yet — all authentication currently
goes straight from the client to the Firebase client SDK. Backend API
routes for auth/rides/verification are part of the longer-term plan, not
something already running.

## Database Schema

These interfaces describe the **target** Firestore schema this app is
being built toward. `users/{uid}` documents are already read/written by
the real auth flow (`src/lib/firebase/config.ts`, `firestore.rules`); the
`Ride`/`Verification` shapes below are not yet written to Firestore
anywhere in the app — ride data today lives only in the mock, in-memory
state inside `MilitaryRideShareApp.tsx`.

```typescript
// Users
interface User {
  id: string;
  email: string;
  name: string;
  militaryStatus: 'active' | 'dependent' | 'veteran';
  verificationStatus: 'pending' | 'verified' | 'expired';
  currentBase: string;
  profileComplete: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Rides (planned — not yet written to Firestore; see note above)
interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickup: GeoPoint;
  dropoff: GeoPoint;
  status: 'requested' | 'accepted' | 'inProgress' | 'completed';
  fare: number;
  scheduledTime: Timestamp;
  completedTime?: Timestamp;
  baseAccess: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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

`firestore.rules` already locks the `rides/{rideId}` collection down to the
rider/driver named on each document, ahead of any code actually writing to
it, so access control doesn't default open the moment that write path
ships.

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
```

There is no dedicated `security-check` script or test suite yet — treat
`yarn lint`, `yarn build`, and `yarn audit` as the current baseline checks
for a PR, and add real tests as the app grows past its current mock-data
stage.

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
   `NEXT_PUBLIC_DEMO_MODE` unset/`false` for any real deployment
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
- Flag anything touching auth, Firestore/Storage rules, or PII handling
  for extra review

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with shadcn/ui-style components
- Powered by Next.js
- Authentication by Firebase (real ID.me military-status verification is
  planned, not yet integrated — see [Status](#status))
