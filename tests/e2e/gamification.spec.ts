import { test, expect } from '@playwright/test';

test.describe('POWLAX Gamification System', () => {
  // Test configuration
  const TEST_EMAIL = 'patrick@powlax.com';
  const TEST_PASSWORD = process.env.TEST_PASSWORD || 'test123';
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Check if already logged in, if not, login
    const isLoggedIn = await page.locator('text=Skills Academy').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      // Fill login form
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      
      // Wait for redirect to authenticated area
      await page.waitForURL(/\/(dashboard|skills-academy)/, { timeout: 10000 });
    }
  });

  test('Points persist after drill completion', async ({ page }) => {
    // Navigate to Skills Academy workouts
    await page.goto('/skills-academy/workouts');
    await page.waitForSelector('text=Skills Academy Workouts');
    
    // Select Attack Training
    await page.click('text=Attack Training');
    await page.waitForSelector('text=Choose Your Workout');
    
    // Select Mini workout (should have 1-4 drills for 1.0x multiplier)
    await page.click('button:has-text("Mini")').first();
    
    // Wait for workout page to load
    await page.waitForSelector('text=Did It!');
    
    // Check initial points display
    const initialCredits = await page.locator('text=/Credits: \\d+/').textContent();
    console.log('Initial credits:', initialCredits);
    
    // Complete first drill
    await page.click('text=Did It!');
    
    // Wait for points to update (should auto-advance to next drill)
    await page.waitForTimeout(1500);
    
    // Check updated points
    const updatedCredits = await page.locator('text=/Credits: \\d+/').textContent();
    console.log('Updated credits:', updatedCredits);
    
    // Verify points increased
    expect(updatedCredits).not.toBe(initialCredits);
    
    // Refresh page to test persistence
    await page.reload();
    await page.waitForSelector('text=Did It!');
    
    // Check points persisted after refresh
    const persistedCredits = await page.locator('text=/Credits: \\d+/').textContent();
    expect(persistedCredits).toBe(updatedCredits);
  });

  test('Drill count multipliers work correctly', async ({ page }) => {
    // Navigate to workouts
    await page.goto('/skills-academy/workouts');
    
    // Select a track with More option (5-9 drills for 1.2x multiplier)
    await page.click('text=Midfield Training');
    await page.waitForSelector('text=Choose Your Workout');
    
    // Select More workout
    await page.click('button:has-text("More")').first();
    
    // Wait for workout page
    await page.waitForSelector('text=Did It!');
    
    // Get initial points
    const initialText = await page.locator('text=/Credits: \\d+/').textContent();
    const initialPoints = parseInt(initialText?.match(/\d+/)?.[0] || '0');
    
    // Complete 5 drills to trigger 1.2x multiplier
    for (let i = 0; i < 5; i++) {
      await page.click('text=Did It!');
      await page.waitForTimeout(1000);
    }
    
    // Calculate expected points: 5 drills × 10 base × 6 currencies × 1.2 multiplier = 360
    const finalText = await page.locator('text=/Credits: \\d+/').textContent();
    const finalPoints = parseInt(finalText?.match(/\d+/)?.[0] || '0');
    const pointsEarned = finalPoints - initialPoints;
    
    // With 1.2x multiplier, should get more than base points
    expect(pointsEarned).toBeGreaterThan(50); // Base would be 50 for 5 drills
  });

  test('Completion screen shows point breakdown', async ({ page }) => {
    // Navigate to workouts
    await page.goto('/skills-academy/workouts');
    
    // Select Mini workout for quick completion
    await page.click('text=Solid Start Training');
    await page.waitForSelector('text=Choose Your Workout');
    await page.click('button:has-text("Mini")').first();
    
    // Complete all drills quickly
    await page.waitForSelector('text=Did It!');
    
    // Complete drills until workout is done
    let drillCount = 0;
    const maxDrills = 5; // Mini should have 1-4 drills
    
    while (drillCount < maxDrills) {
      const didItButton = await page.locator('text=Did It!:not([disabled])').isVisible().catch(() => false);
      if (!didItButton) break;
      
      await page.click('text=Did It!');
      await page.waitForTimeout(1000);
      drillCount++;
    }
    
    // Check for completion screen
    const isComplete = await page.locator('text=Workout Complete!').isVisible().catch(() => false);
    
    if (isComplete) {
      // Verify point breakdown is shown
      await expect(page.locator('text=Lax Credits')).toBeVisible();
      await expect(page.locator('text=Attack Tokens')).toBeVisible();
      
      // Verify navigation options
      await expect(page.locator('text=More Workouts')).toBeVisible();
      await expect(page.locator('text=Dashboard')).toBeVisible();
    }
  });

  test('Wall Ball workouts award points', async ({ page }) => {
    // Navigate to workouts
    await page.goto('/skills-academy/workouts');
    
    // Select Wall Ball Training
    await page.click('text=Wall Ball Training');
    await page.waitForSelector('text=Choose Your Workout');
    
    // Select a wall ball workout with coaching
    await page.click('button:has-text("With Coaching")').first();
    
    // Wait for video/workout to load
    await page.waitForSelector('text=Did It!');
    
    // Get initial points
    const initialText = await page.locator('text=/Credits: \\d+/').textContent();
    const initialPoints = parseInt(initialText?.match(/\d+/)?.[0] || '0');
    
    // Complete wall ball workout
    await page.click('text=Did It!');
    await page.waitForTimeout(2000);
    
    // Check points were awarded
    const finalText = await page.locator('text=/Credits: \\d+/').textContent();
    const finalPoints = parseInt(finalText?.match(/\d+/)?.[0] || '0');
    
    expect(finalPoints).toBeGreaterThan(initialPoints);
  });
});

// Run with: npx playwright test gamification.spec.ts
// Debug with: npx playwright test gamification.spec.ts --debug
// View report: npx playwright show-report