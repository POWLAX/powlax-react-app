import { test, expect } from '@playwright/test';

test.describe('POWLAX Practice Planner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams/1/practice-plans');
  });

  test('displays practice planner header and toolbar', async ({ page }) => {
    // Check header
    await expect(page.locator('h1:has-text("POWLAX Practice Planner")')).toBeVisible();
    await expect(page.locator('text=Finally: A practice planner built by a lacrosse coach who actually gets it.')).toBeVisible();
    
    // Check toolbar icons
    await expect(page.locator('button').filter({ hasText: '' }).first()).toBeVisible(); // Folder icon
    await expect(page.locator('button').nth(1)).toBeVisible(); // Save icon
    await expect(page.locator('button').nth(2)).toBeVisible(); // Print icon
    await expect(page.locator('button').nth(3)).toBeVisible(); // Refresh icon
  });

  test('practice schedule form works correctly', async ({ page }) => {
    // Test date input
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
    await dateInput.fill('2025-08-15');
    await expect(dateInput).toHaveValue('2025-08-15');

    // Test time input
    const timeInput = page.locator('input[type="time"]');
    await expect(timeInput).toBeVisible();
    await timeInput.fill('15:30');
    await expect(timeInput).toHaveValue('15:30');

    // Test field input
    const fieldInput = page.locator('input[type="text"]').filter({ hasText: '' });
    await fieldInput.fill('Main Field');
    await expect(fieldInput).toHaveValue('Main Field');

    // Test duration input
    const durationInput = page.locator('input[type="number"]').first();
    await durationInput.fill('120');
    await expect(durationInput).toHaveValue('120');

    // Check that end time updates
    await expect(page.locator('text=/End:.*5:30 PM/i')).toBeVisible();
  });

  test('setup time toggle works', async ({ page }) => {
    // Toggle setup time
    const setupCheckbox = page.locator('input#setupTime');
    await setupCheckbox.check();
    
    // Setup time input should appear
    const setupTimeInput = page.locator('input[type="number"]').nth(1);
    await expect(setupTimeInput).toBeVisible();
    await setupTimeInput.fill('30');
    
    // Check arrival time is shown
    await expect(page.locator('text=/arrive by/i')).toBeVisible();
  });

  test('practice notes can be added', async ({ page }) => {
    const notesTextarea = page.locator('textarea[placeholder*="practice goals"]');
    await expect(notesTextarea).toBeVisible();
    await notesTextarea.fill('Focus on ground balls and clearing drills today. Work on communication.');
    await expect(notesTextarea).toHaveValue('Focus on ground balls and clearing drills today. Work on communication.');
  });

  test('drill library is visible and functional', async ({ page }) => {
    // Desktop view - should see drill library on right
    if (page.viewportSize()?.width && page.viewportSize().width >= 768) {
      await expect(page.locator('h2:has-text("Drill Library")')).toBeVisible();
      await expect(page.locator('button:has-text("Filter Drills")')).toBeVisible();
      await expect(page.locator('button:has-text("Add Custom Drill")')).toBeVisible();
      
      // Test search
      const searchInput = page.locator('input[placeholder="Search drills..."]');
      await searchInput.fill('Ground Ball');
      
      // Test category expansion
      const skillDrillsCategory = page.locator('button:has-text("Skill Drills")');
      await skillDrillsCategory.click();
      
      // Should see some drills
      await expect(page.locator('text=2 Ball Reaction Drill')).toBeVisible();
    }
  });

  test('can add drill to practice plan', async ({ page }) => {
    // Expand skill drills category
    await page.locator('button:has-text("Skill Drills")').click();
    
    // Click the plus button on a drill
    const addDrillButton = page.locator('button.bg-blue-600').filter({ has: page.locator('svg') }).first();
    await addDrillButton.click();
    
    // Check that practice timeline shows the drill
    await expect(page.locator('text=Ready to Build Your Practice!')).not.toBeVisible();
  });

  test('drill duration progress bar updates', async ({ page }) => {
    // Add a drill first
    await page.locator('button:has-text("Skill Drills")').click();
    await page.locator('button.bg-blue-600').filter({ has: page.locator('svg') }).first().click();
    
    // Check progress bar exists
    await expect(page.locator('text=Practice Duration')).toBeVisible();
    const progressBar = page.locator('.bg-gray-200.rounded-full');
    await expect(progressBar).toBeVisible();
  });

  test('mobile view has floating action button', async ({ page, isMobile }) => {
    if (isMobile) {
      // Should see floating action button
      const fab = page.locator('button.fixed.bottom-20.right-4');
      await expect(fab).toBeVisible();
      
      // Click it to open drill library
      await fab.click();
      
      // Drill library should appear as modal
      await expect(page.locator('.fixed.inset-0.bg-black')).toBeVisible();
      await expect(page.locator('h3:has-text("Drill Library")')).toBeVisible();
      
      // Close button should work
      await page.locator('button:has-text("✕")').click();
      await expect(page.locator('.fixed.inset-0.bg-black')).not.toBeVisible();
    }
  });

  test('favorites system works', async ({ page }) => {
    // Expand a category
    await page.locator('button:has-text("Skill Drills")').click();
    
    // Click star on first drill
    const starButton = page.locator('button').filter({ has: page.locator('svg.h-4.w-4') }).nth(5);
    await starButton.click();
    
    // Star should be filled (has fill-current class)
    await expect(starButton.locator('svg')).toHaveClass(/fill-current/);
    
    // Click again to unfavorite
    await starButton.click();
    await expect(starButton.locator('svg')).not.toHaveClass(/fill-current/);
  });

  test('responsive design works correctly', async ({ page, viewport }) => {
    if (viewport && viewport.width < 768) {
      // Mobile view - bottom navigation visible
      await expect(page.locator('nav.fixed.bottom-0')).toBeVisible();
      // Sidebar should not be visible
      await expect(page.locator('aside')).not.toBeVisible();
    } else {
      // Desktop/tablet view - sidebar visible
      await expect(page.locator('aside')).toBeVisible();
      // Bottom navigation should not be visible
      await expect(page.locator('nav.fixed.bottom-0')).not.toBeVisible();
    }
  });
});

test.describe('Practice Timeline Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams/1/practice-plans');
    // Add some drills
    await page.locator('button:has-text("Skill Drills")').click();
    await page.locator('button.bg-blue-600').filter({ has: page.locator('svg') }).first().click();
    await page.waitForTimeout(500);
    await page.locator('button.bg-blue-600').filter({ has: page.locator('svg') }).nth(1).click();
  });

  test('drill cards display correctly', async ({ page }) => {
    // Should show drill cards with time
    await expect(page.locator('text=7:00 AM')).toBeVisible();
    
    // Duration input should be editable
    const durationInput = page.locator('.bg-white.rounded-lg').first().locator('input[type="number"]');
    await expect(durationInput).toBeVisible();
    await durationInput.fill('15');
    await expect(durationInput).toHaveValue('15');
  });

  test('drill notes can be edited', async ({ page }) => {
    // Click edit notes button
    const editButton = page.locator('button[title="Edit Notes"]').first();
    await editButton.click();
    
    // Notes textarea should appear
    const notesTextarea = page.locator('textarea[placeholder*="Add notes for this drill"]');
    await expect(notesTextarea).toBeVisible();
    await notesTextarea.fill('Focus on quick stick skills');
    
    // Save notes
    await page.locator('button:has-text("Save")').click();
    
    // Notes should be displayed
    await expect(page.locator('text=Focus on quick stick skills')).toBeVisible();
  });

  test('drill move up/down buttons work', async ({ page }) => {
    // Get initial order
    const firstDrillName = await page.locator('.bg-white.rounded-lg').first().locator('h3').textContent();
    
    // Click move down on first drill
    const moveDownButton = page.locator('button').filter({ has: page.locator('svg.h-4.w-4') }).nth(8);
    await moveDownButton.click();
    
    // First drill should now be second
    const secondDrillName = await page.locator('.bg-white.rounded-lg').nth(1).locator('h3').textContent();
    expect(firstDrillName).toBe(secondDrillName);
  });

  test('remove drill works', async ({ page }) => {
    // Count initial drills
    const initialCount = await page.locator('.bg-white.rounded-lg').count();
    
    // Click remove on first drill
    const removeButton = page.locator('button[title="Remove Drill"]').first();
    await removeButton.click();
    
    // Should have one less drill
    await expect(page.locator('.bg-white.rounded-lg')).toHaveCount(initialCount - 1);
  });
});