import { test } from '@playwright/test';

test('quick practice planner demo', async ({ page }) => {
  // Navigate to practice planner
  await page.goto('/teams/1/practice-plans');
  console.log('✅ Loaded practice planner page');
  
  // Fill practice info
  await page.locator('textarea[placeholder*="practice goals"]').fill('Focus on ground balls and clearing drills today.');
  console.log('✅ Added practice goals');
  
  // Change practice duration
  await page.locator('input[type="number"]').first().fill('120');
  console.log('✅ Set practice duration to 120 minutes');
  
  // Enable setup time
  await page.locator('input#setupTime').check();
  console.log('✅ Enabled setup time');
  
  // Expand drill categories
  const categories = ['Skill Drills', '1v1 Drills', 'Concept Drills'];
  for (const category of categories) {
    await page.locator(`button:has-text("${category}")`).click();
    console.log(`✅ Expanded ${category} category`);
    await page.waitForTimeout(300);
  }
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'screenshots/practice-planner-demo.png', 
    fullPage: true 
  });
  console.log('✅ Screenshot saved to screenshots/practice-planner-demo.png');
  
  // Mobile view
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ 
    path: 'screenshots/practice-planner-mobile.png', 
    fullPage: true 
  });
  console.log('✅ Mobile screenshot saved');
});