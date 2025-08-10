import { test, expect } from '@playwright/test';

test.describe('Wall Ball Simple Integration Test', () => {
  test('Wall ball track should be visible and clickable', async ({ page }) => {
    console.log('🚀 Starting simple wall ball test...');
    
    // Navigate to workouts page
    await page.goto('/skills-academy/workouts');
    await page.waitForLoadState('networkidle');
    console.log('📍 Loaded workouts page');

    // Check for wall ball track (more specific selector)
    const wallBallCard = page.locator('h3:text("Wall Ball Training")').first();
    await expect(wallBallCard).toBeVisible({ timeout: 10000 });
    console.log('✅ Wall Ball Training card is visible');

    // Check for rust color background
    const wallBallContainer = page.locator('.bg-orange-700').first();
    await expect(wallBallContainer).toBeVisible();
    console.log('✅ Wall ball rust color background confirmed');

    // Check description
    await expect(page.locator('text=Master wall ball skills with structured workout series')).toBeVisible();
    console.log('✅ Wall ball description is correct');

    // Try to click wall ball (desktop version if visible)
    const desktopContainer = page.locator('.hidden.md\\:block');
    if (await desktopContainer.isVisible()) {
      await wallBallCard.click();
      console.log('🖱️ Clicked wall ball track (desktop)');
      
      // Check if modal opened
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        console.log('✅ Wall ball modal opened successfully');
        
        // Look for "Wall Ball Training Workouts" in modal title
        await expect(page.locator('text=Wall Ball Training Workouts')).toBeVisible();
        console.log('✅ Modal has correct title');
      }
    }

    console.log('🎉 Wall ball integration test completed successfully!');
  });
});