import { test, expect } from '@playwright/test';

test('verify dashboard and version', async ({ page }) => {
  // Increase timeout for the whole test
  test.setTimeout(30000);

  // Listen for console logs
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:3000');

  // Wait for BootLoader to finish (it has a 2.6s timeout + transition)
  console.log('Waiting for BootLoader...');
  await page.waitForTimeout(6000);

  // Check if App is rendered - look for a common element
  // Based on previous knowledge, it should have "Atlas Strategic Agent" or similar
  await expect(page.locator('body')).toContainText('v3.5.1');

  await page.screenshot({ path: '/home/jules/verification/v351_dashboard_v2.png', fullPage: true });
  console.log('Screenshot saved to /home/jules/verification/v351_dashboard_v2.png');
});
