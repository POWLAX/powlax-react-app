import { test, expect } from '@playwright/test';

test('Simple modal functionality check', async ({ page }) => {
  // Navigate directly to the practice planner without auth
  await page.goto('http://localhost:3001');
  
  // Take a screenshot to see current state
  await page.screenshot({ path: 'test-screenshot.png' });
  
  console.log('Current URL:', await page.url());
  console.log('Page title:', await page.title());
  
  // Look for any modals or drill components
  const drillCards = await page.locator('.bg-white.rounded-lg.border.shadow-sm').count();
  console.log('Drill cards found:', drillCards);
  
  const videoIcons = await page.locator('img[alt="Video"]').count();
  console.log('Video icons found:', videoIcons);
  
  const labIcons = await page.locator('img[alt="Lacrosse Lab"]').count();
  console.log('Lacrosse Lab icons found:', labIcons);
});