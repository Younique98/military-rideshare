import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

// ============================================================================
// Playwright e2e/accessibility suite — Base Link (military-rideshare)
// ============================================================================
// See e2e/README.md for how to run this locally and what each project
// covers. Short version: two real `next dev` servers are started, one with
// NEXT_PUBLIC_PLATFORM_LAUNCHED=false (the default production state — the
// pre-launch banner, waitlist-only flow) and one with it set to "true" (the
// real ride-request -> driver -> payment flow), alongside a real Firebase
// Auth + Firestore emulator pair. NEXT_PUBLIC_USE_FIREBASE_EMULATOR routes
// the app's own Firebase client SDK at those emulators (see
// src/lib/firebase/config.ts) instead of any real project. Stripe is
// mocked in-page (see e2e/support/stripeMock.ts) — this suite never talks
// to real Stripe or a real Firebase project.
const emulatorEnv = {
    FIRESTORE_EMULATOR_HOST: '127.0.0.1:8085',
    FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
}

// e2e/support/firebaseAdmin.ts (imported by the spec files themselves, not
// just the webServer subprocesses below) needs these in *this* process too
// — Playwright's test workers run as children of the process that loads
// this config, inheriting process.env at the time they're spawned.
process.env.FIRESTORE_EMULATOR_HOST = emulatorEnv.FIRESTORE_EMULATOR_HOST
process.env.FIREBASE_AUTH_EMULATOR_HOST = emulatorEnv.FIREBASE_AUTH_EMULATOR_HOST

const sharedAppEnv = {
    NEXT_PUBLIC_DEMO_MODE: 'true',
    NEXT_PUBLIC_USE_FIREBASE_EMULATOR: 'true',
    NEXT_PUBLIC_FIREBASE_API_KEY: 'fake-api-key-for-emulator',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'demo-baselink.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'demo-baselink',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'demo-baselink.appspot.com',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
    NEXT_PUBLIC_FIREBASE_APP_ID: '1:000000000000:web:0000000000000000000000',
    // Never a real key — the e2e suite mocks window.Stripe before any app
    // code runs (see e2e/support/stripeMock.ts) and intercepts
    // /api/stripe/payment/create-intent, so this only needs to be
    // *present* to satisfy getStripeJsPromise()'s own config check.
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_e2e_mock_not_real',
    // Throwaway service-account shape (see scripts/testServiceAccount.ts) —
    // only ever used to talk to the local emulators above, never a real
    // Firebase/GCP project.
    FIREBASE_SERVICE_ACCOUNT_KEY: JSON.stringify({
        project_id: 'demo-baselink',
        client_email: 'fake@demo-baselink.iam.gserviceaccount.com',
        private_key:
            '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDBIdfuN+pHm/sb\nVkoGqelRbJdun9bCLVTwF8ZAA/7R7PB0vAX3JceGZXq4cQqTSPTOcbS+0ZwdRYak\nQSDwAPXfcFgrGGtAkV0zUf9CovUZMpvPGLPul0CT6DRdB5FjYP9lunAgXDbE+ccX\nnIi8Yjg7tgw5Lq2Yzw6S3JTF0Upwi/zsOJzXM0s3hRy8yJLZ4FAUOG7Mi7Qq7u4Q\nLxW855ndj8DAfnJbEYsqw71BD5/6GNR37E3C5gWAYnnv46cfFzEavYG9nd1u2D2D\nEzReJCgCjxrANsYNLYMOoqV8oXJvNgD7C+wxxd5yiuLnwAeql37aoZ9Yd8nCatbj\niCEGo9FbAgMBAAECggEADcyHu48GL7Ce2+Cp8FjygS1TkoVcGEqZ33+rXAaNDd2y\nfnyypmpuG5Wjk4sMGOLlDt0D74BVeafui0zV+B/xcVH7ErUvcJESSijpJo8zGOZL\nSJw4uurWo9q65wyz4Bhdlxyfh0hfZ2p7RZ4bDO6tmuKSdAF4SMs+fNLC1HF0Mp9G\nF8F6IsIjADUlFoEZ1w6kbHtrd2nykNx2/8DvJ8ejdNpNHjZfSyYX5k7lhvKras+Y\nVpNrde5KrMke46PjW/tlUW1rdZSF0iAbdMfCVu3x/g9kqok6oVTRsc4qyZ3yhEQ9\nO6OG2Lleh61OnRHIpFKYUez44J91MjUpa2P41wvdOQKBgQDovfP5pI0hZYcLY8Db\n8GG5pK22seLfoCP+u0LTbd+vI+NPx36ZZb+v3INxwWuKTVdW7tItLmVsgCN2ujmz\nUT29z7LBNdKy6DW6WLdJY9WrwjG5YtFTNiz/czmC1QtmMU/cZgQBwlaXibLbINqq\n/wRX4j4x13SU39a8bnYkCQgRmQKBgQDUbpXir6QSWOoDsvRlhlIx/0E+Rwe9yCjz\nT5GXT7nAN/N2HG1av2RxP4A+DtC0QEJe4fvrT4wuqQ5YX7DzSrSc029Mp2USfVg1\nibHT7GCIAWqnNjPTMgF4LIRNVnDIIvWPcc7k31XzO2gvArZcMx7GnEAs4Hptkg4R\nn/5SOQZ7EwKBgDoXn5wCLI/XbZu0LGE5YMsbhZiCUiSLLjDYwNdRJ3HpvUUegET9\nlpjoq45rPtJod5JlTeSlHf+1BCUQWnKdppGIFBARxSOOvkpi9mzFFIIomIyzU5g3\nf4fLVOGJF61MRai3deySe1absh7r1miz+nuNJwT9yEWYkVq7H5XjAzaRAoGAFM9Q\nd4hlNjbnlb0uG9PwsV0j8wnaREkbWdptlLkGpUHV47gdLkqZeE6ULYAeCcpRtiHF\nH+QHA3skIJwfJXYoA0TjHks3p3wH7Ba1COGbAzfATukMYp//bNpPi5PwMGrcS1UG\nw3ztWopzRkepvZZ0aVhdIQhMdfdc0XUu4LcdX2kCgYBroCS7q5naMPUmbyAo09fW\nfA1nguGZjxNhA8/LGbhNdd3b0aNI+ALA6lIGccfsea7zJ7N/O+0cfVcD90DKAa5o\nlkIyvofHegLqxhItCBmItCkE9Fw4HGT4x4F8qD9lCEqVp2j0oR4c6rH3PykiAsCy\nE3YhhBVjsDPP/mQWuU+9TQ==\n-----END PRIVATE KEY-----\n',
    }),
    ...emulatorEnv,
}

// The sandbox this suite is developed/verified in ships a pre-cached
// Chromium build at a revision Playwright's own `install` command can't
// fetch (its CDN is not reachable through this environment's egress
// policy). Point launches at that binary when present; CI environments
// with normal internet access can `npx playwright install --with-deps
// chromium` instead and this override is simply unused (the env var won't
// be set).
const cachedChromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE

export default defineConfig({
    testDir: './e2e/tests',
    globalSetup: require.resolve('./e2e/global-setup'),
    fullyParallel: false,
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
    outputDir: 'test-results',
    use: {
        trace: 'retain-on-failure',
        launchOptions: cachedChromiumExecutable
            ? { executablePath: cachedChromiumExecutable, args: ['--no-sandbox'] }
            : undefined,
    },
    projects: [
        {
            name: 'prelaunch',
            testMatch: /.*\.prelaunch\.spec\.ts/,
            use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3400' },
        },
        {
            name: 'launched',
            testMatch: /.*\.launched\.spec\.ts/,
            use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3401' },
        },
    ],
    webServer: [
        {
            // Always run fresh (scripts/free-emulator-ports.js kills
            // anything already on these ports first) rather than trusting
            // reuseExistingServer's port-8085-only check — Firestore's
            // Java subprocess has been observed to survive as an orphan
            // independently of the Auth emulator, which a port-only check
            // can't detect (see that script's comment for the full story).
            command: 'yarn emulators',
            port: 8085,
            reuseExistingServer: false,
            timeout: 120_000,
            cwd: path.resolve(__dirname),
        },
        {
            command: 'yarn next dev -p 3400',
            port: 3400,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
            cwd: path.resolve(__dirname),
            env: {
                ...sharedAppEnv,
                NEXT_PUBLIC_PLATFORM_LAUNCHED: 'false',
                NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3400',
                NEXT_DIST_DIR: '.next-e2e-prelaunch',
            },
        },
        {
            command: 'yarn next dev -p 3401',
            port: 3401,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
            cwd: path.resolve(__dirname),
            env: {
                ...sharedAppEnv,
                NEXT_PUBLIC_PLATFORM_LAUNCHED: 'true',
                NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3401',
                NEXT_DIST_DIR: '.next-e2e-launched',
            },
        },
    ],
})
