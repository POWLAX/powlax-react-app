import { test, expect } from '@playwright/test';

test.describe('New POWLAX Pages Navigation Test', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the home page
    await page.goto('/');
  });

  test('Navigate through all public pages', async ({ page }) => {
    // Test public Skills Academy page
    await test.step('Visit public Skills Academy page', async () => {
      await page.goto('/skills-academy');
      await expect(page.locator('h1')).toContainText('POWLAX Skills Academy');
      await expect(page.locator('text=167 Drills • 192 Workouts')).toBeVisible();
      
      // Check for skill categories
      await expect(page.locator('text=Attack Training')).toBeVisible();
      await expect(page.locator('text=Defense Training')).toBeVisible();
      await expect(page.locator('text=Midfield Training')).toBeVisible();
      await expect(page.locator('text=Wall Ball Training')).toBeVisible();
      
      // Screenshot
      await page.screenshot({ path: 'test-results/skills-academy-public.png', fullPage: true });
    });

    // Test public Strategies page
    await test.step('Visit public Strategies page', async () => {
      await page.goto('/strategies');
      await expect(page.locator('h1')).toContainText('Master Lacrosse Strategy');
      await expect(page.locator('text=132 Strategies • 87 Concepts')).toBeVisible();
      
      // Check for categories
      await expect(page.locator('text=Offense')).toBeVisible();
      await expect(page.locator('text=Defense')).toBeVisible();
      await expect(page.locator('text=Transition')).toBeVisible();
      
      // Screenshot
      await page.screenshot({ path: 'test-results/strategies-public.png', fullPage: true });
    });

    // Test public Gamification page
    await test.step('Visit public Gamification page', async () => {
      await page.goto('/gamification');
      await expect(page.locator('h1')).toContainText('Level Up Your Lacrosse Journey');
      
      // Check for point types
      await expect(page.locator('text=Lax Credits')).toBeVisible();
      await expect(page.locator('text=Attack Tokens')).toBeVisible();
      await expect(page.locator('text=Defense Dollars')).toBeVisible();
      
      // Check for ranks
      await expect(page.locator('text=Rookie')).toBeVisible();
      await expect(page.locator('text=All-American')).toBeVisible();
      
      // Screenshot
      await page.screenshot({ path: 'test-results/gamification-public.png', fullPage: true });
    });
  });

  test('Navigate authenticated pages (with mock auth)', async ({ page }) => {
    // Mock authentication by going to dashboard first
    await page.goto('/dashboard');
    
    // Test authenticated Skills Academy workouts
    await test.step('Visit Skills Academy Workouts', async () => {
      await page.goto('/skills-academy');
      
      // Wait for page load
      await page.waitForLoadState('networkidle');
      
      // Check for page elements
      const h1 = page.locator('h1');
      await expect(h1).toContainText('Skills Academy Workouts');
      
      // Check for stats cards
      await expect(page.locator('text=Total Completed')).toBeVisible();
      await expect(page.locator('text=Current Streak')).toBeVisible();
      
      // Check for tabs
      await expect(page.locator('text=All')).toBeVisible();
      await expect(page.locator('text=Attack')).toBeVisible();
      await expect(page.locator('text=Defense')).toBeVisible();
      
      // Screenshot
      await page.screenshot({ path: 'test-results/skills-academy-workouts.png', fullPage: true });
    });

    // Test Skills Academy progress
    await test.step('Visit Skills Academy Progress', async () => {
      await page.goto('/skills-academy/progress');
      
      await expect(page.locator('h1')).toContainText('My Progress');
      
      // Check for stats
      await expect(page.locator('text=Total Points')).toBeVisible();
      await expect(page.locator('text=Workouts Completed')).toBeVisible();
      await expect(page.locator('text=Day Streak')).toBeVisible();
      await expect(page.locator('text=Badges Earned')).toBeVisible();
      
      // Check tabs
      await expect(page.locator('button[role="tab"]:has-text("Overview")')).toBeVisible();
      await expect(page.locator('button[role="tab"]:has-text("Points")')).toBeVisible();
      await expect(page.locator('button[role="tab"]:has-text("Badges")')).toBeVisible();
      await expect(page.locator('button[role="tab"]:has-text("Skills")')).toBeVisible();
      
      // Screenshot
      await page.screenshot({ path: 'test-results/skills-academy-progress.png', fullPage: true });
    });

    // Test authenticated Strategies
    await test.step('Visit Strategies Page', async () => {
      await page.goto('/strategies');
      
      await expect(page.locator('h1')).toContainText('Strategies & Concepts');
      
      // Check for search
      await expect(page.locator('input[placeholder="Search strategies..."]')).toBeVisible();
      
      // Check for category tabs
      await expect(page.locator('button[role="tab"]:has-text("all")')).toBeVisible();
      await expect(page.locator('button[role="tab"]:has-text("offense")')).toBeVisible();
      
      // Screenshot
      await page.screenshot({ path: 'test-results/strategies-authenticated.png', fullPage: true });
    });

    // Test player Gamification dashboard
    await test.step('Visit Player Gamification Dashboard', async () => {
      await page.goto('/gamification');
      
      // Check for rank section
      await expect(page.locator('text=Total Points')).toBeVisible();
      
      // Check for quick stats
      await expect(page.locator('text=Current Streak')).toBeVisible();
      await expect(page.locator('text=Total Badges')).toBeVisible();
      await expect(page.locator('text=This Week')).toBeVisible();
      
      // Check tabs
      await expect(page.locator('button[role="tab"]:has-text("Overview")')).toBeVisible();
      await expect(page.locator('button[role="tab"]:has-text("Points")')).toBeVisible();
      await expect(page.locator('button[role="tab"]:has-text("Badges")')).toBeVisible();
      await expect(page.locator('button[role="tab"]:has-text("Achievements")')).toBeVisible();
      
      // Screenshot
      await page.screenshot({ path: 'test-results/gamification-player.png', fullPage: true });
    });
  });

  test('Test page interactions and navigation flow', async ({ page }) => {
    // Start at Skills Academy
    await test.step('Navigate from Skills Academy to Gamification', async () => {
      await page.goto('/skills-academy');
      
      // Click "Start Training" CTA
      const startButton = page.locator('text=Start Training').first();
      await expect(startButton).toBeVisible();
      await startButton.click();
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    // Test tab switching on authenticated pages
    await test.step('Test tab navigation on Progress page', async () => {
      await page.goto('/skills-academy/progress');
      
      // Click Points tab
      await page.click('button[role="tab"]:has-text("Points")');
      await expect(page.locator('text=Points Breakdown')).toBeVisible();
      
      // Click Badges tab
      await page.click('button[role="tab"]:has-text("Badges")');
      await expect(page.locator('text=BRONZE')).toBeVisible();
      
      // Click Skills tab
      await page.click('button[role="tab"]:has-text("Skills")');
      await expect(page.locator('text=Progress')).toBeVisible();
      
      // Screenshot of skills tab
      await page.screenshot({ path: 'test-results/progress-skills-tab.png' });
    });
  });

  test('Test responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await test.step('Test mobile Skills Academy', async () => {
      await page.goto('/skills-academy');
      await page.waitForLoadState('networkidle');
      
      // Check mobile layout
      await expect(page.locator('h1')).toBeVisible();
      
      // Screenshot
      await page.screenshot({ path: 'test-results/skills-academy-mobile.png', fullPage: true });
    });

    await test.step('Test mobile Gamification', async () => {
      await page.goto('/gamification');
      await page.waitForLoadState('networkidle');
      
      // Check mobile layout
      await expect(page.locator('text=Level Up Your Lacrosse Journey')).toBeVisible();
      
      // Screenshot
      await page.screenshot({ path: 'test-results/gamification-mobile.png', fullPage: true });
    });
  });
});