import type { Page, TestInfo } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { expect } from '@playwright/test'

/** Runs axe-core against the page's current rendered state and asserts zero
 *  violations, attaching the full JSON report to the test's Playwright
 *  report either way so a failure is inspectable without re-running. */
export async function expectNoAxeViolations(
    page: Page,
    testInfo: TestInfo,
    label: string
) {
    const results = await new AxeBuilder({ page }).analyze()
    await testInfo.attach(`axe-${label}`, {
        body: JSON.stringify(results, null, 2),
        contentType: 'application/json',
    })
    expect(
        results.violations,
        `axe found ${results.violations.length} violation(s) on "${label}":\n` +
            results.violations
                .map((v) => `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`)
                .join('\n')
    ).toEqual([])
}
