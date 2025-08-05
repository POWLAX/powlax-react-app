import { test, expect } from '@playwright/test';

test('final practice planner demo', async ({ page }) => {
  await page.goto('/teams/1/practice-plans');
  console.log('🏑 POWLAX Practice Planner Demo');
  console.log('================================\n');
  
  // 1. Setup practice details
  console.log('📋 Setting up practice details...');
  await page.locator('textarea[placeholder*="practice goals"]').fill('Focus on ground balls, clearing, and team communication. Work on quick transitions.');
  await page.locator('input[type="date"]').fill('2025-08-15');
  await page.locator('input[type="time"]').fill('15:30');
  
  // 2. Add some drills
  console.log('➕ Adding drills to practice...');
  
  // Add first drill
  const drill1 = page.locator('text="2 Ball Reaction Drill"').locator('xpath=ancestor::div[contains(@class, "px-6")]');
  await drill1.locator('button.bg-blue-600').click();
  await page.waitForTimeout(300);
  
  // Add second drill
  const drill2 = page.locator('text="3 Man Passing"').locator('xpath=ancestor::div[contains(@class, "px-6")]');
  await drill2.locator('button.bg-blue-600').click();
  await page.waitForTimeout(300);
  
  // Add third drill
  const drill3 = page.locator('text="+1 Ground Ball"').locator('xpath=ancestor::div[contains(@class, "px-6")]');
  await drill3.locator('button.bg-blue-600').click();
  await page.waitForTimeout(300);
  
  console.log('✅ Added 3 drills to practice timeline');
  
  // 3. Edit a drill
  console.log('\n✏️ Editing drill details...');
  
  // Get the first drill card in the timeline (not the header cards)
  const drillCards = page.locator('div.bg-white.rounded-lg.border.shadow-sm').filter({ has: page.locator('h3') });
  const firstDrill = drillCards.first();
  
  // Change duration
  await firstDrill.locator('input[type="number"]').fill('15');
  
  // Add notes
  await firstDrill.locator('button[title="Edit Notes"]').click();
  await page.locator('textarea[placeholder*="Add notes"]').fill('Focus on quick reactions and communication');
  await page.locator('button:has-text("Save")').click();
  
  console.log('✅ Updated drill duration and added notes');
  
  // 4. Check practice duration
  const durationBar = await page.locator('text=/\\d+m \\/ \\d+m/').textContent();
  console.log(`\n⏱️ Practice duration: ${durationBar}`);
  
  // 5. Take screenshots
  console.log('\n📸 Capturing screenshots...');
  
  // Desktop view
  await page.screenshot({ path: 'screenshots/practice-planner-final.png', fullPage: true });
  console.log('✅ Desktop screenshot saved');
  
  // Tablet view
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.screenshot({ path: 'screenshots/practice-planner-tablet.png', fullPage: true });
  console.log('✅ Tablet screenshot saved');
  
  // Mobile view
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'screenshots/practice-planner-mobile-final.png', fullPage: true });
  console.log('✅ Mobile screenshot saved');
  
  console.log('\n🎉 Practice Planner Demo Complete!');
  console.log('==================================');
  console.log('\nKey Features Demonstrated:');
  console.log('✓ Practice details and goals');
  console.log('✓ Drill library with categories');
  console.log('✓ Adding drills to timeline');
  console.log('✓ Editing drill duration and notes');
  console.log('✓ Auto-time calculations');
  console.log('✓ Duration progress bar');
  console.log('✓ Responsive design (mobile/tablet/desktop)');
  console.log('\nScreenshots saved to screenshots/ directory');
});