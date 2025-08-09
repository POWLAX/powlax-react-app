import { test, expect } from '@playwright/test';

test.describe('POWLAX Page Showcase', () => {
  test('Capture all new pages', async ({ page }) => {
    // Public pages
    await test.step('Public Skills Academy', async () => {
      await page.goto('/skills-academy');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/new-pages/01-skills-academy-public.png', fullPage: true });
    });

    await test.step('Public Strategies', async () => {
      await page.goto('/strategies');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/new-pages/02-strategies-public.png', fullPage: true });
    });

    await test.step('Public Gamification', async () => {
      await page.goto('/gamification');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/new-pages/03-gamification-public.png', fullPage: true });
    });

    // Authenticated pages (will show login or default state)
    await test.step('Skills Academy Workouts', async () => {
      await page.goto('/skills-academy');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/new-pages/04-skills-workouts.png', fullPage: true });
    });

    await test.step('Skills Academy Progress', async () => {
      await page.goto('/skills-academy/progress');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/new-pages/05-skills-progress.png', fullPage: true });
    });

    await test.step('Strategies Authenticated', async () => {
      await page.goto('/strategies');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/new-pages/06-strategies-auth.png', fullPage: true });
    });

    await test.step('Player Gamification', async () => {
      await page.goto('/gamification');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/new-pages/07-gamification-player.png', fullPage: true });
    });

    // Mobile views
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Mobile Skills Academy', async () => {
      await page.goto('/skills-academy');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/new-pages/08-skills-academy-mobile.png', fullPage: true });
    });

    await test.step('Mobile Gamification', async () => {
      await page.goto('/gamification');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/new-pages/09-gamification-mobile.png', fullPage: true });
    });
  });
});