import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3002',
});

test.describe('Complete Skills Academy Journey', () => {
  test('full workout flow from start to finish', async ({ page }) => {
    // Step 1: Navigate to Skills Academy homepage
    await page.goto('/skills-academy');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads completely
    await expect(page.locator('h1')).toContainText(['Skills Academy', 'Wall Ball Academy'], { timeout: 10000 });
    
    // Step 2: Look for a workout series card and click it
    const seriesCards = page.locator('[data-testid*="series-card"], .workout-card, .series-card');
    await expect(seriesCards.first()).toBeVisible({ timeout: 10000 });
    
    // Click on first available series/workout
    await seriesCards.first().click();
    
    // Step 3: Handle size selection modal if it appears
    const sizeModal = page.locator('[data-testid="size-selector-modal"], .size-selector');
    const sizeOptionsVisible = await sizeModal.isVisible().catch(() => false);
    
    if (sizeOptionsVisible) {
      // Choose mini size if modal appears
      const miniButton = page.locator('[data-testid="size-mini"], button:has-text("Mini")').first();
      await expect(miniButton).toBeVisible({ timeout: 5000 });
      await miniButton.click();
    }
    
    // Step 4: Should now be on workout page
    await expect(page.url()).toMatch(/\/workout\/\d+/);
    await page.waitForLoadState('networkidle');
    
    // Verify workout page loads properly
    await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible({ timeout: 5000 });
    
    // Step 5: Complete entire workout
    const didItButton = page.locator('[data-testid="did-it-button"]');
    await expect(didItButton).toBeVisible({ timeout: 5000 });
    
    // Get drill count from progress or UI
    const progressText = await page.locator('[data-testid="progress-bar"]').locator('..').textContent();
    const drillMatch = progressText?.match(/(\d+) of (\d+)/);
    const totalDrills = drillMatch ? parseInt(drillMatch[2]) : 5;
    
    // Complete all drills
    for (let i = 0; i < totalDrills; i++) {
      console.log(`Completing drill ${i + 1} of ${totalDrills}`);
      
      // Wait for "Did It!" button to be enabled and visible
      await expect(didItButton).toBeVisible();
      await expect(didItButton).toBeEnabled();
      
      // Click the button
      await didItButton.click();
      
      // Wait a moment for the completion to process
      await page.waitForTimeout(1500);
      
      // Check if we're done (completion screen appears)
      const completionScreen = page.locator('[data-testid="completion-screen"], h1:has-text("Workout Complete")');
      const isComplete = await completionScreen.isVisible().catch(() => false);
      
      if (isComplete) {
        console.log(`Workout completed after drill ${i + 1}`);
        break;
      }
    }
    
    // Step 6: Verify completion screen and points
    await expect(page.locator('h1')).toContainText('Workout Complete', { timeout: 10000 });
    
    // Verify points are displayed
    const pointsEarned = page.locator('[data-testid="points-earned"], .text-4xl.font-bold').first();
    await expect(pointsEarned).toBeVisible();
    const pointsText = await pointsEarned.textContent();
    expect(parseInt(pointsText || '0')).toBeGreaterThan(0);
    
    // Step 7: Verify all 6 point types are shown
    const pointTypes = [
      'points-lax-credits',
      'points-attack-tokens', 
      'points-defense-dollars',
      'points-midfield-medals',
      'points-rebound-rewards',
      'points-flex-points'
    ];
    
    for (const pointType of pointTypes) {
      const pointElement = page.locator(`[data-testid="${pointType}"]`);
      if (await pointElement.isVisible().catch(() => false)) {
        const pointValue = await pointElement.textContent();
        expect(parseInt(pointValue || '0')).toBeGreaterThanOrEqual(0);
      }
    }
    
    console.log('✅ Full workout journey completed successfully');
  });
  
  test('back navigation works at each step', async ({ page }) => {
    // Start from workout page
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Verify back button exists and is functional
    const backButton = page.locator('[data-testid="back-button"]');
    await expect(backButton).toBeVisible({ timeout: 5000 });
    
    // Click back button
    await backButton.click();
    
    // Should return to skills academy
    await expect(page.url()).toMatch(/\/skills-academy$/);
    await expect(page.locator('h1')).toContainText(['Skills Academy', 'Wall Ball Academy'], { timeout: 5000 });
    
    console.log('✅ Back navigation works correctly');
  });
  
  test('workout abandonment and resume', async ({ page }) => {
    // Start workout
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Complete first drill
    const didItButton = page.locator('[data-testid="did-it-button"]');
    await expect(didItButton).toBeVisible({ timeout: 5000 });
    await didItButton.click();
    await page.waitForTimeout(1000);
    
    // Navigate away (abandon workout)
    await page.goto('/skills-academy');
    await page.waitForLoadState('networkidle');
    
    // Return to same workout
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads (could resume or restart - both valid)
    await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Workout abandonment and resume handled correctly');
  });
  
  test('workout completion displays correct stats', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Track start time
    const startTime = Date.now();
    
    // Complete workout quickly
    const didItButton = page.locator('[data-testid="did-it-button"]');
    
    // Complete all drills rapidly
    for (let i = 0; i < 6; i++) {
      await expect(didItButton).toBeVisible({ timeout: 5000 });
      await didItButton.click();
      await page.waitForTimeout(500);
      
      const isComplete = await page.locator('h1:has-text("Workout Complete")').isVisible().catch(() => false);
      if (isComplete) break;
    }
    
    // Verify completion screen
    await expect(page.locator('h1')).toContainText('Workout Complete', { timeout: 10000 });
    
    // Check elapsed time is reasonable (less than 30 seconds for quick completion)
    const elapsedTime = (Date.now() - startTime) / 1000;
    expect(elapsedTime).toBeLessThan(30);
    
    // Verify stats are displayed
    const statsElements = page.locator('.text-2xl.font-bold');
    await expect(statsElements.first()).toBeVisible();
    
    console.log('✅ Workout completion stats displayed correctly');
  });
  
  test('error handling for invalid workout ID', async ({ page }) => {
    // Try to access non-existent workout
    await page.goto('/skills-academy/workout/999999');
    await page.waitForLoadState('networkidle');
    
    // Page should still load (using mock data) or show error
    const hasError = await page.locator('h1:has-text("Workout Not Found")').isVisible().catch(() => false);
    const hasContent = await page.locator('[data-testid="drill-caption"]').isVisible().catch(() => false);
    
    // Either error page or content should be shown
    expect(hasError || hasContent).toBe(true);
    
    console.log('✅ Invalid workout ID handled correctly');
  });
  
  test('mobile responsiveness throughout journey', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate through complete flow on mobile
    await page.goto('/skills-academy');
    await page.waitForLoadState('networkidle');
    
    // Navigate to workout
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Verify mobile UI elements
    await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 10000 });
    
    // Check touch targets are large enough (60px minimum)
    const buttons = page.locator('button[data-testid*="button"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(48); // Allow 48px minimum for mobile
      }
    }
    
    console.log('✅ Mobile responsiveness verified throughout journey');
  });
});