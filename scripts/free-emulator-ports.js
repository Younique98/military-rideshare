#!/usr/bin/env node
/**
 * Frees the Firebase emulator ports (Auth 9099, Firestore 8085 + its
 * 9150 websocket port) before starting a fresh emulator pair.
 *
 * Why this exists: firebase-tools' Auth emulator runs in its own Node
 * process, but Firestore runs as a separate Java subprocess it spawns.
 * When the parent `firebase` CLI process is torn down ungracefully (e.g.
 * Playwright's webServer sending SIGTERM between test runs — see
 * playwright.config.ts), that Java subprocess has been observed to survive
 * as an orphan, still bound to 8085. On the next run, a port-only
 * "already running" check (Playwright's reuseExistingServer, or a human
 * eyeballing `lsof`) sees 8085 alive and assumes the whole emulator pair
 * is up — but Auth (9099) is actually dead, and every Admin-SDK call in
 * the e2e suite (see e2e/support/firebaseAdmin.ts) fails with
 * ECONNREFUSED. Killing anything on these ports first makes every run
 * start from a known-clean state instead of trusting a possibly-stale one.
 */
const { execSync } = require('node:child_process')

const PORTS = [8085, 9099, 9150]

for (const port of PORTS) {
    try {
        const pids = execSync(`fuser ${port}/tcp 2>/dev/null`, { encoding: 'utf8' })
            .trim()
            .split(/\s+/)
            .filter(Boolean)
        for (const pid of pids) {
            try {
                process.kill(Number(pid), 'SIGKILL')
                console.log(`[free-emulator-ports] killed pid ${pid} on port ${port}`)
            } catch {
                // Already gone — fine.
            }
        }
    } catch {
        // fuser exits non-zero when nothing is listening — nothing to do.
    }
}
