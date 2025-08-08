import { test, expect } from '@playwright/test';

test.describe('Practice Planner smoke', () => {
  test('page loads without console errors', async ({ page }) => {
    // Do not start/stop servers; assume dev server may already be running at 3000
    const url = process.env.POW_LAX_PRACTICE_PLANNER_URL || 'http://localhost:3000/teams/1/practice-plans';

    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(url, { waitUntil: 'networkidle' });
    // Some setups apply visibility hidden during initial hydration; wait for main content
    const title = page.getByRole('heading', { name: /POWLAX Practice Planner/i });
    await expect(title).toBeVisible({ timeout: 15000 });

    // Minimal sanity for demo/public routes
    expect(await title.isVisible()).toBeTruthy();

    expect(errors, `Console errors present: ${errors.join('\n')}`).toHaveLength(0);
  });
});


