import { test, expect } from '@playwright/test';

test.describe('Skills Academy smoke', () => {
  test('page loads without console errors', async ({ page }) => {
    const url = process.env.POW_LAX_SKILLS_URL || 'http://localhost:3000/skills-academy';

    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();

    // Minimal sanity for public route
    expect(await page.locator('body').isVisible()).toBeTruthy();

    expect(errors, `Console errors present: ${errors.join('\n')}`).toHaveLength(0);
  });
});


