import { test, expect } from '@playwright/test';

test.describe('Practice Planner smoke', () => {
  test('page loads without console errors', async ({ page }) => {
    // Do not start/stop servers; assume dev server may already be running at 3000
    const url = process.env.POW_LAX_PRACTICE_PLANNER_URL || 'http://localhost:3000/teams/1/practice-plans';

    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();

    // Minimal sanity for demo/public routes
    expect(await page.locator('body').isVisible()).toBeTruthy();

    expect(errors, `Console errors present: ${errors.join('\n')}`).toHaveLength(0);
  });
});


