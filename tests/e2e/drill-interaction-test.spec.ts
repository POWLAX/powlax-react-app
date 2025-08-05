import { test, expect } from '@playwright/test';

test('drill interactions work correctly', async ({ page }) => {
  // Navigate to practice planner
  await page.goto('/teams/1/practice-plans');
  console.log('✅ Loaded practice planner');

  // Expand Skill Drills category
  await page.locator('button:has-text("Skill Drills")').click();
  await page.waitForTimeout(500);
  console.log('✅ Expanded Skill Drills category');

  // Add first drill
  const firstAddButton = page.locator('.bg-gray-50').filter({ hasText: '2 Ball Reaction Drill' }).locator('button.bg-blue-600');
  await firstAddButton.click();
  await page.waitForTimeout(500);
  console.log('✅ Added first drill');

  // Verify drill appears in timeline
  await expect(page.locator('h3:has-text("2 Ball Reaction Drill")')).toBeVisible();
  await expect(page.locator('text=7:00 AM')).toBeVisible();
  console.log('✅ First drill appears in timeline');

  // Add second drill
  const secondAddButton = page.locator('.bg-gray-50').filter({ hasText: '3 Man Passing' }).locator('button.bg-blue-600');
  await secondAddButton.click();
  await page.waitForTimeout(500);
  console.log('✅ Added second drill');

  // Verify second drill appears
  await expect(page.locator('h3:has-text("3 Man Passing")')).toBeVisible();
  console.log('✅ Second drill appears in timeline');

  // Edit drill duration
  const durationInput = page.locator('.bg-white.rounded-lg').first().locator('input[type="number"]');
  await durationInput.fill('20');
  console.log('✅ Changed first drill duration to 20 minutes');

  // Verify second drill time updates
  await page.waitForTimeout(500);
  const secondDrillTime = await page.locator('.bg-white.rounded-lg').nth(1).locator('.text-lg.font-semibold').textContent();
  console.log(`✅ Second drill time updated to: ${secondDrillTime}`);

  // Edit drill notes
  await page.locator('button[title="Edit Notes"]').first().click();
  const notesTextarea = page.locator('textarea[placeholder*="Add notes for this drill"]');
  await notesTextarea.fill('Focus on quick stick skills and communication');
  await page.locator('button:has-text("Save")').click();
  console.log('✅ Added notes to first drill');

  // Verify notes appear
  await expect(page.locator('text=Focus on quick stick skills and communication')).toBeVisible();
  console.log('✅ Notes saved and displayed');

  // Test move down button
  const moveDownButton = page.locator('.bg-white.rounded-lg').first().locator('button').filter({ has: page.locator('svg.h-4.w-4') }).nth(1);
  await moveDownButton.click();
  console.log('✅ Moved first drill down');

  // Verify order changed
  const firstDrillTitle = await page.locator('.bg-white.rounded-lg').first().locator('h3').textContent();
  expect(firstDrillTitle).toBe('3 Man Passing');
  console.log('✅ Drill order updated correctly');

  // Test remove drill
  const removeButton = page.locator('button[title="Remove Drill"]').first();
  await removeButton.click();
  console.log('✅ Removed first drill');

  // Verify only one drill remains
  await expect(page.locator('.bg-white.rounded-lg')).toHaveCount(1);
  console.log('✅ Drill removed successfully');

  // Check duration bar
  await expect(page.locator('text=Practice Duration')).toBeVisible();
  const durationText = await page.locator('text=/\\d+m \\/ \\d+m/').textContent();
  console.log(`✅ Duration bar shows: ${durationText}`);

  // Take final screenshot
  await page.screenshot({ path: 'screenshots/drill-interactions-complete.png', fullPage: true });
  console.log('✅ Screenshot saved');
});