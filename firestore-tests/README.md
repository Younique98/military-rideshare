# Firestore rules tests

Standalone `@firebase/rules-unit-testing` suite for `../firestore.rules`, run
against a local Firestore emulator. Not part of the Next.js app or its build
— this directory has its own `package.json` on purpose so these dev-only
deps never touch the app's dependency tree.

Added during the post-launch standards audit of the real ride-data model /
Stripe Connect PR because that PR's description claimed "30/30 Firestore
rule-transition tests pass" against a real emulator, but no test file backing
that claim was committed. This suite is a from-scratch equivalent — it
independently re-verifies the properties `firestore.rules`' own comments
claim (fare/payment immutability, no client path to `PAID`, driver Stripe
onboarding eligibility is server-set only, read scoping, waitlist
create-only) rather than reproducing the original, uncommitted test cases
one-for-one. 32/32 passed against the rules file as of this audit.

## Running

Requires Java (the Firestore emulator needs it) and network access to
install the Firebase emulator binary and the two dev dependencies below.

```bash
# from this directory
npm install
npx firebase-tools@13 emulators:start --only firestore --project demo-baselink &
npm test
```
