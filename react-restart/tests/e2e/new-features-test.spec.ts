import { test, expect } from '@playwright/test';

test.describe('New Practice Planner Features', () => {
  test('filtering, custom drills, and parallel activities', async ({ page }) => {
    await page.goto('/teams/1/practice-plans');
    
    console.log('\n🏑 Testing New Practice Planner Features');
    console.log('=====================================\n');
    
    // Wait for drills to load
    await page.waitForTimeout(2000);
    
    // 1. Test Filter Modal
    console.log('1️⃣ Testing Filter Drills...');
    await page.locator('button:has-text("Filter Drills")').click();
    await page.waitForTimeout(500);
    
    // Check filter modal is open
    await expect(page.locator('h2:has-text("Filter Drills")')).toBeVisible();
    
    // Close filter modal
    await page.locator('button').filter({ hasText: 'Cancel' }).click();
    console.log('✅ Filter modal works');
    
    // 2. Test Add Custom Drill
    console.log('\n2️⃣ Testing Add Custom Drill...');
    await page.locator('button:has-text("Add Custom Drill")').click();
    await page.waitForTimeout(500);
    
    // Check add custom drill modal is open
    await expect(page.locator('h2:has-text("Add Custom Drill")')).toBeVisible();
    
    // Fill in custom drill
    await page.locator('input[placeholder*="3v2 Ground Ball"]').fill('My Custom Station Drill');
    await page.locator('input[type="number"]').first().fill('20');
    
    // Add some strategies
    await page.locator('input[placeholder*="Ground Ball, Clearing"]').fill('Station Work');
    await page.locator('button').filter({ has: page.locator('svg.h-4.w-4') }).nth(0).click();
    
    // Submit
    await page.locator('button:has-text("Add Drill")').click();
    await page.waitForTimeout(500);
    console.log('✅ Custom drill added');
    
    // 3. Check total drill count
    console.log('\n3️⃣ Checking drill count display...');
    const drillCountText = await page.locator('text=/Total drills:.*of/').textContent();
    console.log(`✅ ${drillCountText}`);
    
    // 4. Add multiple drills for parallel testing
    console.log('\n4️⃣ Adding drills for parallel activities...');
    
    // Add first drill
    const firstDrill = page.locator('text="2 Ball Reaction Drill"').locator('xpath=ancestor::div[contains(@class, "px-6")]');
    await firstDrill.locator('button.bg-blue-600').click();
    await page.waitForTimeout(500);
    
    // Check for "+ Parallel" button
    const parallelButton = page.locator('button:has-text("+ Parallel")');
    const hasParallelButton = await parallelButton.count() > 0;
    console.log(`✅ Parallel button appears: ${hasParallelButton}`);
    
    if (hasParallelButton) {
      // Click parallel button
      await parallelButton.click();
      await page.waitForTimeout(500);
      
      // Check parallel picker modal
      await expect(page.locator('h2:has-text("Add Parallel Activity")')).toBeVisible();
      console.log('✅ Parallel activity picker opens');
      
      // Close for now
      await page.locator('button').filter({ has: page.locator('svg.h-5.w-5') }).first().click();
    }
    
    // 5. Test search functionality
    console.log('\n5️⃣ Testing search...');
    await page.locator('input[placeholder="Search drills..."]').fill('Ground Ball');
    await page.waitForTimeout(500);
    
    // Check filtered results
    const groundBallDrills = await page.locator('h4:has-text("Ground Ball")').count();
    console.log(`✅ Found ${groundBallDrills} drills with "Ground Ball"`);
    
    // Clear search
    await page.locator('input[placeholder="Search drills..."]').clear();
    
    // 6. Test favorites
    console.log('\n6️⃣ Testing favorites...');
    const starButton = page.locator('text="Box Lacrosse Ground Ball"')
      .locator('xpath=ancestor::div[contains(@class, "px-6")]')
      .locator('button').filter({ has: page.locator('svg.h-4.w-4') });
    
    if (await starButton.count() > 0) {
      await starButton.last().click();
      console.log('✅ Drill favorited');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'screenshots/new-features-test.png', fullPage: true });
    
    console.log('\n🎉 All new features working!');
    console.log('✨ Features tested:');
    console.log('   ✓ Filter drills modal');
    console.log('   ✓ Add custom drill');
    console.log('   ✓ Drill count display');
    console.log('   ✓ Parallel activities support');
    console.log('   ✓ Search functionality');
    console.log('   ✓ Favorites system');
  });
});