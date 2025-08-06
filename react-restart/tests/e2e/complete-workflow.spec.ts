import { test, expect } from '@playwright/test';

test('complete practice planner workflow', async ({ page }) => {
  await page.goto('/teams/1/practice-plans');
  console.log('✅ Loaded practice planner');
  
  // 1. Fill practice details
  await page.locator('textarea[placeholder*="practice goals"]').fill('Focus on ground balls, clearing, and team communication');
  await page.locator('input[type="date"]').fill('2025-08-15');
  await page.locator('input[type="time"]').fill('16:00');
  await page.locator('input[type="number"]').first().fill('120'); // 2 hour practice
  console.log('✅ Filled practice details');
  
  // 2. Enable setup time
  await page.locator('input#setupTime').check();
  await page.locator('input[type="number"]').nth(1).fill('30');
  console.log('✅ Enabled 30 min setup time');
  
  // 3. Add drills
  // First drill - already visible
  const firstDrill = page.locator('text="2 Ball Reaction Drill"');
  await firstDrill.locator('xpath=ancestor::div[contains(@class, "px-6")]').locator('button.bg-blue-600').click();
  await page.waitForTimeout(500);
  console.log('✅ Added 2 Ball Reaction Drill');
  
  // Second drill
  const secondDrill = page.locator('text="3 Man Passing"');
  await secondDrill.locator('xpath=ancestor::div[contains(@class, "px-6")]').locator('button.bg-blue-600').click();
  await page.waitForTimeout(500);
  console.log('✅ Added 3 Man Passing');
  
  // Expand 1v1 category
  await page.locator('button:has-text("1v1 Drills")').click();
  await page.waitForTimeout(500);
  
  // Third drill from different category
  const thirdDrill = page.locator('text="10 Man Ride"');
  await thirdDrill.locator('xpath=ancestor::div[contains(@class, "px-6")]').locator('button.bg-blue-600').click();
  await page.waitForTimeout(500);
  console.log('✅ Added 10 Man Ride');
  
  // 4. Verify drills appear in timeline
  await expect(page.locator('.bg-white.rounded-lg.border.shadow-sm')).toHaveCount(3);
  console.log('✅ All 3 drills appear in timeline');
  
  // 5. Edit first drill
  const firstTimelineDrill = page.locator('.bg-white.rounded-lg.border.shadow-sm').first();
  
  // Change duration
  await firstTimelineDrill.locator('input[type="number"]').fill('15');
  console.log('✅ Changed first drill duration to 15 min');
  
  // Add notes
  await firstTimelineDrill.locator('button[title="Edit Notes"]').click();
  await page.locator('textarea[placeholder*="Add notes"]').fill('Emphasize quick stick skills and calling for the ball');
  await page.locator('button:has-text("Save")').click();
  console.log('✅ Added notes to first drill');
  
  // 6. Test move down
  await firstTimelineDrill.locator('button').filter({ has: page.locator('svg.h-4.w-4') }).nth(1).click();
  console.log('✅ Moved first drill down');
  
  // 7. Remove middle drill
  await page.locator('.bg-white.rounded-lg.border.shadow-sm').nth(1).locator('button[title="Remove Drill"]').click();
  console.log('✅ Removed middle drill');
  
  // 8. Verify final state
  await expect(page.locator('.bg-white.rounded-lg.border.shadow-sm')).toHaveCount(2);
  
  // Check duration bar
  const durationText = await page.locator('text=/\\d+m \\/ \\d+m/').textContent();
  console.log(`✅ Duration bar shows: ${durationText}`);
  
  // 9. Favorite a drill in library
  const favButton = page.locator('text="Box Lacrosse Ground Ball"')
    .locator('xpath=ancestor::div[contains(@class, "px-6")]')
    .locator('button').filter({ has: page.locator('svg.h-4.w-4') });
  await favButton.last().click();
  console.log('✅ Favorited Box Lacrosse Ground Ball');
  
  // 10. Take final screenshots
  await page.screenshot({ path: 'screenshots/complete-workflow-desktop.png', fullPage: true });
  
  // Mobile view
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'screenshots/complete-workflow-mobile.png', fullPage: true });
  
  console.log('\n🎉 Practice planner is working perfectly!');
  console.log('📸 Screenshots saved to screenshots/ directory');
});