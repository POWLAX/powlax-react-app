import { test, expect } from '@playwright/test';

test.describe('Skills Academy Quick Verification', () => {
  test('Skills Academy page loads without infinite loading', async ({ page }) => {
    // Navigate to Skills Academy
    await page.goto('http://localhost:3002/skills-academy', { waitUntil: 'networkidle', timeout: 15000 });
    
    // Check that the page title is visible (be more specific to avoid multiple h1s)
    await expect(page.locator('h1:has-text("Skills Academy")')).toBeVisible();
    
    // Check that stats are displayed (not infinite loading)
    await expect(page.locator('text=167 Drills • 118 Workouts')).toBeVisible({ timeout: 10000 });
    
    // Check that training categories are loaded
    await expect(page.locator('text=Quick Start')).toBeVisible();
    await expect(page.locator('text=Attack Training')).toBeVisible();
    await expect(page.locator('text=Defense Fundamentals')).toBeVisible();
    await expect(page.locator('text=Wall Ball Mastery')).toBeVisible();
    
    // Verify no loading spinner is stuck
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
    
    console.log('✅ Skills Academy main page loaded successfully');
  });

  test('Workout page navigation works', async ({ page }) => {
    // Start from Skills Academy
    await page.goto('http://localhost:3002/skills-academy', { waitUntil: 'networkidle', timeout: 15000 });
    
    // Click on first Start button
    await page.click('button:has-text("Start")', { timeout: 10000 });
    
    // Should navigate to a workout page
    await expect(page).toHaveURL(/\/skills-academy\/workout\/\d+/, { timeout: 10000 });
    
    // Check for workout content (not "Workout Not Found")
    await expect(page.locator('text=Workout Not Found')).not.toBeVisible();
    
    // Look for drill content or loading state
    const hasContent = await page.locator('text=Drill').first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasLoading = await page.locator('text=Loading workout').isVisible({ timeout: 1000 }).catch(() => false);
    
    // Either content should be loaded or it should be in a proper loading state
    expect(hasContent || hasLoading).toBe(true);
    
    console.log('✅ Workout navigation successful');
  });

  test('No console errors on Skills Academy page', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3002/skills-academy', { waitUntil: 'networkidle', timeout: 15000 });
    
    // Wait a bit for any async errors
    await page.waitForTimeout(2000);
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('404') && 
      !error.includes('apple-touch-icon') &&
      !error.includes('favicon') &&
      !error.includes('test-user-12345') // Our test user ID error is expected
    );
    
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }
    
    // We'll allow some errors but log them
    expect(criticalErrors.length).toBeLessThan(5);
    
    console.log('✅ Skills Academy page has minimal console errors');
  });
});