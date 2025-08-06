import { test, expect } from '@playwright/test';

test('debug drill library structure', async ({ page }) => {
  await page.goto('/teams/1/practice-plans');
  
  // Expand Skill Drills
  await page.locator('button:has-text("Skill Drills")').click();
  await page.waitForTimeout(1000);
  
  // Take screenshot to see structure
  await page.screenshot({ path: 'screenshots/drill-library-expanded.png', fullPage: true });
  
  // Log all drill containers
  const drillContainers = await page.locator('.px-6.py-3.border-t').all();
  console.log(`Found ${drillContainers.length} drill containers`);
  
  // Log drill names
  for (let i = 0; i < drillContainers.length; i++) {
    const drillName = await drillContainers[i].locator('h4').textContent();
    console.log(`Drill ${i}: ${drillName}`);
  }
  
  // Try to find add buttons
  const addButtons = await page.locator('button.p-1.bg-blue-600').all();
  console.log(`Found ${addButtons.length} add buttons`);
  
  // Click first add button if found
  if (addButtons.length > 0) {
    await addButtons[0].click();
    await page.waitForTimeout(1000);
    
    // Check if drill was added
    const timelineCards = await page.locator('.bg-white.rounded-lg.border.shadow-sm').all();
    console.log(`Found ${timelineCards.length} drill cards in timeline`);
    
    await page.screenshot({ path: 'screenshots/after-add-drill.png', fullPage: true });
  }
});