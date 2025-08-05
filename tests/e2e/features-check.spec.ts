import { test, expect } from '@playwright/test';

test('check new features are present', async ({ page }) => {
  await page.goto('/teams/1/practice-plans');
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Take screenshot to see current state
  await page.screenshot({ path: 'screenshots/features-loaded.png', fullPage: true });
  
  // Check if key elements exist
  const elements = [
    { selector: 'text="Filter Drills"', name: 'Filter button' },
    { selector: 'text="Add Custom Drill"', name: 'Add custom drill button' },
    { selector: 'text=/Total drills:/', name: 'Drill count' },
    { selector: 'text="Drill Library"', name: 'Drill library header' }
  ];
  
  for (const element of elements) {
    const exists = await page.locator(element.selector).count() > 0;
    console.log(`${element.name}: ${exists ? '✅' : '❌'}`);
  }
  
  // Try to count loaded drills
  const drillCount = await page.locator('h4.font-medium.text-gray-900').count();
  console.log(`\nLoaded drills: ${drillCount}`);
  
  // Check loading state
  const loadingVisible = await page.locator('text="Loading drills..."').isVisible().catch(() => false);
  const errorVisible = await page.locator('text="Error loading drills"').isVisible().catch(() => false);
  
  console.log(`\nLoading state: ${loadingVisible ? 'Still loading' : 'Loaded'}`);
  console.log(`Error state: ${errorVisible ? 'Error occurred' : 'No error'}`);
});