import { test, expect } from '@playwright/test';

test.describe('Practice Planner Demo', () => {
  test('demonstrate practice planner features', async ({ page }) => {
    // Go to practice planner
    await page.goto('/teams/1/practice-plans');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'screenshots/01-practice-planner-initial.png', fullPage: true });

    // Fill in practice details
    await page.locator('input[type="date"]').fill('2025-08-15');
    await page.locator('input[type="time"]').fill('16:00');
    await page.locator('textarea[placeholder*="practice goals"]').fill('Today we will focus on ground balls and clearing. Emphasize communication and quick decision making.');
    
    // Enable setup time
    await page.locator('input#setupTime').check();
    await page.locator('input[type="number"]').nth(1).fill('20');
    
    await page.screenshot({ path: 'screenshots/02-practice-details-filled.png', fullPage: true });

    // Add some drills
    await page.locator('button:has-text("Skill Drills")').click();
    await page.waitForTimeout(500);
    
    // Add first drill
    await page.locator('.bg-gray-50').filter({ hasText: '2 Ball Reaction Drill' }).locator('button.bg-blue-600').click();
    await page.waitForTimeout(500);
    
    // Add second drill
    await page.locator('.bg-gray-50').filter({ hasText: '3 Man Passing' }).locator('button.bg-blue-600').click();
    await page.waitForTimeout(500);
    
    // Add third drill
    await page.locator('.bg-gray-50').filter({ hasText: '+1 Ground Ball' }).locator('button.bg-blue-600').click();
    
    await page.screenshot({ path: 'screenshots/03-drills-added.png', fullPage: true });

    // Edit a drill duration
    const firstDrillDuration = page.locator('.bg-white.rounded-lg').first().locator('input[type="number"]');
    await firstDrillDuration.fill('15');
    
    // Add notes to first drill
    await page.locator('button[title="Edit Notes"]').first().click();
    await page.locator('textarea[placeholder*="Add notes for this drill"]').fill('Focus on quick reactions and communication. Players should call "ball" when going for ground balls.');
    await page.locator('button:has-text("Save")').click();
    
    await page.screenshot({ path: 'screenshots/04-drill-edited.png', fullPage: true });

    // Favorite a drill in the library
    await page.locator('.bg-gray-50').filter({ hasText: 'Box Lacrosse Ground Ball' }).locator('button').filter({ has: page.locator('svg.h-4.w-4') }).last().click();
    
    // Take final screenshot
    await page.screenshot({ path: 'screenshots/05-final-state.png', fullPage: true });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: 'screenshots/06-mobile-view.png', fullPage: true });
    
    // Click floating action button
    const fab = page.locator('button.fixed.bottom-20.right-4');
    await fab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/07-mobile-drill-library.png', fullPage: true });
  });
});