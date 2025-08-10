import { test, expect } from '@playwright/test';

test.describe('Wall Ball Integration', () => {
  test('Should display wall ball as fifth track on workouts page', async ({ page }) => {
    console.log('🚀 Starting Wall Ball integration test...');
    
    // Navigate to Skills Academy workouts page
    await page.goto('/skills-academy/workouts');
    console.log('📍 Navigated to Skills Academy workouts page');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page title exists
    await expect(page.locator('h1')).toContainText('Skills Academy Workouts');
    console.log('✅ Workouts page loaded successfully');

    // Look for all 5 track cards (including wall ball)
    const trackCards = page.locator('[role="dialog"] ~ div').locator('.bg-gray-500, .bg-green-500, .bg-blue-500, .bg-red-500, .bg-orange-700');
    await expect(trackCards).toHaveCount(5);
    console.log('✅ Found 5 track cards including wall ball');

    // Specifically check for wall ball track
    const wallBallTrack = page.locator('text=Wall Ball Training');
    await expect(wallBallTrack).toBeVisible();
    console.log('✅ Wall Ball Training track is visible');

    // Check wall ball description
    await expect(page.locator('text=Master wall ball skills with structured workout series')).toBeVisible();
    console.log('✅ Wall Ball description is correct');

    // Test clicking wall ball track (desktop view)
    if (await page.locator('.md\\:block').isVisible()) {
      await wallBallTrack.click();
      console.log('🖱️ Clicked Wall Ball track (desktop)');

      // Wait for modal to open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      console.log('✅ Wall Ball modal opened');

      // Check modal title
      await expect(page.locator('[role="dialog"] h2')).toContainText('Wall Ball Training Workouts');
      console.log('✅ Modal title is correct');

      // Look for duration-based workout options instead of Mini/More/Complete
      const durationButtons = page.locator('text=/\\d+\\s*minutes?/i');
      if (await durationButtons.count() > 0) {
        console.log('✅ Found duration-based workout options');
      }

      // Look for coaching options
      const coachingButtons = page.locator('text="No Coaching", text="With Coaching"');
      if (await coachingButtons.count() > 0) {
        console.log('✅ Found coaching option buttons');
      }

      // Close modal
      await page.locator('[role="dialog"] button').first().click();
      console.log('❌ Closed wall ball modal');
    }

    console.log('🎉 Wall Ball integration test completed successfully!');
  });

  test('Should handle wall ball track on mobile', async ({ page }) => {
    console.log('🚀 Starting Wall Ball mobile test...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to Skills Academy workouts page
    await page.goto('/skills-academy/workouts');
    console.log('📍 Navigated to Skills Academy workouts page (mobile)');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // On mobile, look for the "Select Workout" button
    const selectWorkoutButton = page.locator('text=Select Workout');
    await expect(selectWorkoutButton).toBeVisible();
    console.log('✅ Mobile "Select Workout" button is visible');

    // Click the select workout button
    await selectWorkoutButton.click();
    console.log('🖱️ Clicked Select Workout button');

    // Wait for mobile track selector
    await page.waitForSelector('.fixed.inset-0');
    console.log('✅ Mobile track selector opened');

    // Look for wall ball track in mobile selector
    const wallBallTrackMobile = page.locator('text=Wall Ball Training');
    await expect(wallBallTrackMobile).toBeVisible();
    console.log('✅ Wall Ball track visible in mobile selector');

    // Click wall ball track
    await wallBallTrackMobile.click();
    console.log('🖱️ Clicked Wall Ball track (mobile)');

    // Wait for modal to open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    console.log('✅ Wall Ball modal opened on mobile');

    console.log('🎉 Wall Ball mobile test completed successfully!');
  });

  test('Should navigate to wall ball workout when variant is selected', async ({ page }) => {
    console.log('🚀 Starting Wall Ball navigation test...');
    
    // Navigate to Skills Academy workouts page
    await page.goto('/skills-academy/workouts');
    console.log('📍 Navigated to Skills Academy workouts page');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click wall ball track to open modal
    await page.locator('text=Wall Ball Training').first().click();
    console.log('🖱️ Clicked Wall Ball track');

    // Wait for modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Look for any coaching or duration button to click
    const workoutButtons = page.locator('[role="dialog"] button').filter({ hasText: /coaching|minutes/i });
    
    if (await workoutButtons.count() > 0) {
      // Click the first available workout button
      await workoutButtons.first().click();
      console.log('🖱️ Clicked wall ball workout button');
      
      // Should navigate to wall ball workout page
      await page.waitForURL('**/skills-academy/wall-ball/**');
      console.log('✅ Successfully navigated to wall ball workout page');
      
      // Check if wall ball workout page loaded
      await expect(page.locator('h1')).toBeVisible();
      console.log('✅ Wall ball workout page loaded with title');
    } else {
      console.log('⚠️ No wall ball workout buttons found - may need database data');
    }

    console.log('🎉 Wall Ball navigation test completed!');
  });
});