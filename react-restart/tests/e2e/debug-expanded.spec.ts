import { test, expect } from '@playwright/test';

test('debug drill library expansion', async ({ page }) => {
  await page.goto('/teams/1/practice-plans');
  
  // Check initial state
  console.log('Checking initial state...');
  const skillDrillsButton = page.locator('button:has-text("Skill Drills")');
  await expect(skillDrillsButton).toBeVisible();
  console.log('✅ Found Skill Drills button');
  
  // Get the parent div to check expansion state
  const skillDrillsParent = page.locator('div:has(> button:has-text("Skill Drills"))');
  
  // Check for chevron icon
  const chevronRight = skillDrillsParent.locator('svg.h-4.w-4.mr-2');
  const isInitiallyExpanded = await chevronRight.evaluate(el => el.classList.contains('ChevronDown'));
  console.log(`Initial expansion state: ${isInitiallyExpanded ? 'expanded' : 'collapsed'}`);
  
  // Click to expand
  await skillDrillsButton.click();
  await page.waitForTimeout(1000);
  console.log('✅ Clicked Skill Drills button');
  
  // Check if expanded div appears
  const expandedContent = page.locator('.bg-gray-50').first();
  const isVisible = await expandedContent.isVisible();
  console.log(`Expanded content visible: ${isVisible}`);
  
  // Look for drill elements in different ways
  const drillDivs = await page.locator('.px-6.py-3.border-t.border-gray-200').all();
  console.log(`Found ${drillDivs.length} drill divs with full selector`);
  
  const h4Elements = await page.locator('h4.font-medium.text-gray-900').all();
  console.log(`Found ${h4Elements.length} h4 elements`);
  
  // Log all h4 text content
  for (let i = 0; i < h4Elements.length; i++) {
    const text = await h4Elements[i].textContent();
    console.log(`h4[${i}]: ${text}`);
  }
  
  // Look for specific drill text
  const drillTextVisible = await page.locator('text="2 Ball Reaction Drill"').isVisible();
  console.log(`"2 Ball Reaction Drill" visible: ${drillTextVisible}`);
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/debug-expanded.png', fullPage: true });
});