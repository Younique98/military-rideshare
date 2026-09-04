// Test-only shim for the `server-only` package.
//
// `server-only`'s real module unconditionally throws — Next.js's bundler
// swaps it for a no-op via package.json export conditions when building a
// server bundle, but this verification script runs under plain Node/tsx,
// outside that bundler, so the real package's guard fires unconditionally
// and blocks importing src/lib/firebase/admin.ts at all. This shim (wired
// in via tsconfig.verify.json's `paths`, verification-script use only —
// never referenced by the app itself) is a no-op so the script can import
// and exercise the app's real server-only Firebase Admin code.
export {}
