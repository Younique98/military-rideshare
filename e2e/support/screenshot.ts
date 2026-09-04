import type { Page } from '@playwright/test'
import path from 'node:path'

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../screenshots')

/** Saves a full-page screenshot to the committed screenshots/ directory
 *  under a stable, descriptive name (see screenshots/README.md). */
export async function captureCheckpoint(page: Page, name: string) {
    await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `${name}.png`),
        fullPage: true,
    })
}
