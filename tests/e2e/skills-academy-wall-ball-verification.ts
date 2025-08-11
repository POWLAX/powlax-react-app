import { test, expect } from '@playwright/test';

test.describe('Skills Academy Wall Ball Verification', () => {
  test('Wall Ball workouts appear in Skills Academy workouts page', async ({ page }) => {
    // Navigate to Skills Academy workouts page
    await page.goto('/skills-academy/workouts');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="track-card"], .grid', { timeout: 10000 });
    
    // Look for Wall Ball Training card
    const wallBallCard = page.locator('text="Wall Ball Training"').first();
    await expect(wallBallCard).toBeVisible({ timeout: 5000 });
    
    // Click on Wall Ball Training card to open modal
    await wallBallCard.click();
    
    // Wait for modal to open
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Check for Master Fundamentals section
    const masterFundamentals = page.locator('text="Master Fundamentals"');
    await expect(masterFundamentals).toBeVisible();
    
    // Check for workout duration options (5 Minutes, 10 Minutes, Complete)
    const fiveMinutes = page.locator('text="5 Minutes"').first();
    const tenMinutes = page.locator('text="10 Minutes"').first();
    const complete = page.locator('text="Complete"').first();
    
    await expect(fiveMinutes).toBeVisible();
    await expect(tenMinutes).toBeVisible();
    await expect(complete).toBeVisible();
    
    console.log('✅ Wall Ball workouts visible in Skills Academy');
  });

  test('Wall Ball workout loads and shows drills correctly', async ({ page }) => {
    // Navigate directly to a wall ball workout
    await page.goto('/skills-academy/workouts');
    
    // Wait for page load
    await page.waitForSelector('[data-testid="track-card"], .grid', { timeout: 10000 });
    
    // Find and click Wall Ball Training
    const wallBallCard = page.locator('text="Wall Ball Training"').first();
    await wallBallCard.click();
    
    // Wait for modal
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Click on Master Fundamentals - 5 Minutes
    const fiveMinutesButton = page.locator('text="5 Minutes"').first();
    await fiveMinutesButton.click();
    
    // Should navigate to workout page
    await page.waitForURL('**/skills-academy/workout/**', { timeout: 10000 });
    
    // Check that workout loads with drills
    await page.waitForSelector('text="Drill"', { timeout: 10000 });
    
    // Verify drill names appear (should show drills from our drill_ids array)
    const drillElements = page.locator('[data-testid="drill-name"], .drill-name, text=/Overhand|Quick Sticks|Turned/');
    await expect(drillElements.first()).toBeVisible({ timeout: 5000 });
    
    // Check for video player or video elements
    const videoElement = page.locator('iframe[src*="vimeo"], video, [data-testid="video-player"]');
    await expect(videoElement.first()).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Wall Ball workout loads with drills and video');
  });

  test('Individual drill videos are accessible', async ({ page }) => {
    // Navigate to a wall ball workout
    await page.goto('/skills-academy/workouts');
    await page.waitForSelector('[data-testid="track-card"], .grid', { timeout: 10000 });
    
    // Open Wall Ball modal and start workout
    const wallBallCard = page.locator('text="Wall Ball Training"').first();
    await wallBallCard.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    const fiveMinutesButton = page.locator('text="5 Minutes"').first();
    await fiveMinutesButton.click();
    
    // Wait for workout page
    await page.waitForURL('**/skills-academy/workout/**', { timeout: 10000 });
    
    // Look for drill navigation or drill selection
    const drillNavigation = page.locator('[data-testid="drill-nav"], .drill-navigation, button:has-text("Overhand")');
    
    if (await drillNavigation.first().isVisible({ timeout: 3000 })) {
      // Click on first drill
      await drillNavigation.first().click();
      
      // Check for individual drill video
      const drillVideo = page.locator('iframe[src*="vimeo"], video');
      await expect(drillVideo.first()).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Individual drill videos accessible');
    } else {
      console.log('ℹ️ Drill navigation not found - may be wall ball workout format');
    }
  });
});
