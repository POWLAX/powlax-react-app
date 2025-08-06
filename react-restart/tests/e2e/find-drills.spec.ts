import { test, expect } from '@playwright/test';

test('find and click drill', async ({ page }) => {
  await page.goto('/teams/1/practice-plans');
  await page.waitForTimeout(1000);
  
  // Look for the specific drill containers
  console.log('Looking for drill containers...');
  
  // Try to find drill by looking for parent containers
  const drillContainers = await page.locator('div.px-6.py-3').all();
  console.log(`Found ${drillContainers.length} potential drill containers`);
  
  // Look for the drill name and its parent
  const ballReactionDrill = page.locator('text="2 Ball Reaction Drill"');
  const isDrillVisible = await ballReactionDrill.isVisible();
  console.log(`2 Ball Reaction Drill visible: ${isDrillVisible}`);
  
  if (isDrillVisible) {
    // Find the parent container
    const drillContainer = ballReactionDrill.locator('xpath=ancestor::div[contains(@class, "px-6 py-3")]');
    
    // Find the plus button within this container
    const plusButton = drillContainer.locator('button.p-1.bg-blue-600');
    const buttonExists = await plusButton.count() > 0;
    console.log(`Plus button exists: ${buttonExists}`);
    
    if (buttonExists) {
      // Click the plus button
      await plusButton.click();
      console.log('✅ Clicked plus button!');
      await page.waitForTimeout(1000);
      
      // Check if drill was added to timeline
      const timelineDrill = page.locator('.bg-white.rounded-lg.border').filter({ hasText: '2 Ball Reaction Drill' });
      const drillAdded = await timelineDrill.isVisible();
      console.log(`Drill added to timeline: ${drillAdded}`);
      
      if (drillAdded) {
        console.log('✅ SUCCESS! Drill was added to practice timeline');
      }
    }
  }
  
  await page.screenshot({ path: 'screenshots/find-drills-result.png', fullPage: true });
});