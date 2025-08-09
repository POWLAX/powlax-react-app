import { test, expect } from '@playwright/test';

test.describe('Skills Academy Integration', () => {
  test('main Skills Academy page loads and shows series cards', async ({ page }) => {
    // Navigate to main Skills Academy page
    await page.goto('http://localhost:3000/skills-academy');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page title is visible
    await expect(page.locator('h1:has-text("Skills Academy")')).toBeVisible();
    
    // Check that at least one series card is visible
    const seriesCards = page.locator('[class*="card"]');
    await expect(seriesCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('clicking on workout size opens preview modal', async ({ page }) => {
    // Navigate to Skills Academy
    await page.goto('http://localhost:3000/skills-academy');
    await page.waitForLoadState('networkidle');
    
    // Click on a Mini workout button
    const miniButton = page.locator('button:has-text("Mini")').first();
    await miniButton.waitFor({ state: 'visible', timeout: 10000 });
    await miniButton.click();
    
    // Check that modal appears with white background
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Verify modal has proper styling (white background)
    const modalContent = modal.locator('[class*="bg-white"]');
    await expect(modalContent).toBeVisible();
    
    // Check that drill list is visible
    await expect(modal.locator('text=/Workout Drills|drills/')).toBeVisible();
  });

  test('workout runner page loads with drill data', async ({ page }) => {
    // Navigate directly to a workout (assuming workout ID 1 exists)
    await page.goto('http://localhost:3000/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Check that workout page loads
    const workoutContent = page.locator('[class*="container"]');
    await expect(workoutContent).toBeVisible({ timeout: 10000 });
    
    // Check for drill navigation buttons
    await expect(page.locator('button:has-text("Mark Complete")')).toBeVisible({ timeout: 10000 });
  });
});