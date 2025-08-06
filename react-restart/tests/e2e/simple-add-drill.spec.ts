import { test, expect } from '@playwright/test';

test('simple add drill test', async ({ page }) => {
  await page.goto('/teams/1/practice-plans');
  await page.waitForTimeout(1000);
  
  // First, let's just try to find any plus button in the drill library
  const plusButtons = await page.locator('button').filter({ has: page.locator('svg.h-5.w-5') }).all();
  console.log(`Found ${plusButtons.length} buttons with Plus icons`);
  
  // Look for drill content that should be visible by default (skill category is expanded)
  const skillDrillsExpanded = await page.locator('text="Skill Drills"').isVisible();
  console.log(`Skill Drills header visible: ${skillDrillsExpanded}`);
  
  // Check if bg-gray-50 divs exist (expanded content areas)
  const expandedAreas = await page.locator('.bg-gray-50').all();
  console.log(`Found ${expandedAreas.length} expanded areas`);
  
  // Look for any text containing "Ball"
  const ballDrills = await page.locator('text=/.*Ball.*/').all();
  console.log(`Found ${ballDrills.length} elements with "Ball" in text`);
  
  // Try a different approach - look for the drill name directly
  try {
    // Force expand by clicking even if already expanded
    await page.locator('button:has-text("Skill Drills")').click();
    await page.waitForTimeout(1000);
    
    // Now look for drills
    const drillElements = await page.locator('h4').all();
    console.log(`\nAfter clicking Skill Drills:`);
    console.log(`Found ${drillElements.length} h4 elements`);
    
    for (const el of drillElements) {
      const text = await el.textContent();
      console.log(`- h4: ${text}`);
    }
  } catch (e) {
    console.log('Error clicking skill drills:', e);
  }
  
  await page.screenshot({ path: 'screenshots/simple-add-test.png', fullPage: true });
});