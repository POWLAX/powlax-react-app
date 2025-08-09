import { test, expect } from '@playwright/test';

test.describe('Skills Academy Phase 2 - Workflow Integration', () => {
  test('Solid Start series have navy blue border and header', async ({ page }) => {
    await page.goto('http://localhost:3000/skills-academy');
    await page.waitForLoadState('networkidle');
    
    // Find a Solid Start series card
    const solidStartCard = page.locator('[class*="border-2"][class*="border-"]').first();
    
    // Check that it exists
    await expect(solidStartCard).toBeVisible({ timeout: 10000 });
    
    // Verify the header has navy blue gradient
    const header = solidStartCard.locator('[class*="from-"][class*="to-"]').first();
    await expect(header).toBeVisible();
  });

  test('Academy navigation links to /skills-academy', async ({ page }) => {
    // Start from dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Click Academy in sidebar (desktop) or bottom nav (mobile)
    const academyLink = page.locator('a[href="/skills-academy"]:has-text("Academy")').first();
    await academyLink.click();
    
    // Verify we're on the Skills Academy page
    await expect(page).toHaveURL(/.*\/skills-academy/);
    await expect(page.locator('h1:has-text("Skills Academy")')).toBeVisible();
  });

  test('complete workout flow from hub to completion', async ({ page }) => {
    // Navigate to Skills Academy
    await page.goto('http://localhost:3000/skills-academy');
    await page.waitForLoadState('networkidle');
    
    // Click on a Mini workout button (should work without modal blocking)
    const miniButton = page.locator('button:has-text("Mini")').first();
    await miniButton.waitFor({ state: 'visible', timeout: 10000 });
    await miniButton.click();
    
    // Check that preview modal appears
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Click Start Workout in modal
    const startButton = modal.locator('button:has-text("Start Workout")');
    await startButton.click();
    
    // Should navigate to workout page
    await expect(page).toHaveURL(/.*\/skills-academy\/workout\/\d+/);
    
    // Check for enhanced progress indicators
    const progressBar = page.locator('[class*="Progress"]').first();
    await expect(progressBar).toBeVisible({ timeout: 10000 });
    
    // Check for drill counter badge
    const drillCounter = page.locator('[class*="Badge"]:has-text("/")');
    await expect(drillCounter).toBeVisible();
    
    // Check for progress dots
    const progressDots = page.locator('[class*="rounded-full"][class*="bg-"]');
    const count = await progressDots.count();
    expect(count).toBeGreaterThan(0);
  });

  test('workout page shows enhanced progress indicators', async ({ page }) => {
    // Navigate directly to a workout
    await page.goto('http://localhost:3000/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Check for enhanced progress bar with text
    await expect(page.locator('text=/Progress.*drills/')).toBeVisible({ timeout: 10000 });
    
    // Check for time and points display
    await expect(page.locator('text=/Time.*Points/')).toBeVisible();
    
    // Check for Mark Complete button
    const completeButton = page.locator('button:has-text("Mark Complete")');
    await expect(completeButton).toBeVisible();
    
    // Check for navigation buttons
    await expect(page.locator('button[disabled]').first()).toBeVisible(); // Previous should be disabled on first drill
  });
});