import net from 'node:net'

/**
 * Playwright's webServer readiness check can only watch one port per
 * entry. The Firebase emulator pair opens Firestore's port (8085) and
 * Auth's port (9099) at slightly different times during startup, so
 * watching only 8085 (see playwright.config.ts) can let the suite start
 * running tests in the split second before Auth is actually accepting
 * connections yet, producing a flaky ECONNREFUSED on the very first
 * Admin SDK call (see e2e/support/firebaseAdmin.ts). This waits for both
 * ports to actually accept a TCP connection before any test runs.
 */
function waitForPort(port: number, host = '127.0.0.1', timeoutMs = 60000): Promise<void> {
    const deadline = Date.now() + timeoutMs
    return new Promise((resolve, reject) => {
        function attempt() {
            const socket = net.createConnection({ port, host })
            socket.once('connect', () => {
                socket.end()
                resolve()
            })
            socket.once('error', () => {
                socket.destroy()
                if (Date.now() > deadline) {
                    reject(new Error(`Timed out waiting for ${host}:${port}`))
                } else {
                    setTimeout(attempt, 250)
                }
            })
        }
        attempt()
    })
}

export default async function globalSetup() {
    await Promise.all([waitForPort(8085), waitForPort(9099)])
}
