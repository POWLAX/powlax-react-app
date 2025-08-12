import { test, expect } from '@playwright/test';

test.describe('Practice Planner - Drill Edit Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to practice planner
    await page.goto('http://localhost:3000/teams/1/practiceplan');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should show edit button for drills when user is admin', async ({ page }) => {
    // Look for drill cards in the library
    const drillCard = page.locator('.p-3.bg-white.border.rounded-lg').first();
    
    // Hover over the drill card to reveal edit button
    await drillCard.hover();
    
    // Check if edit button is visible (pencil icon)
    const editButton = drillCard.locator('button[title="Edit this drill"]');
    
    // The edit button should exist in the DOM
    await expect(editButton).toBeVisible({ timeout: 5000 });
  });

  test('should open edit modal when edit button is clicked', async ({ page }) => {
    // Find a drill card
    const drillCard = page.locator('.p-3.bg-white.border.rounded-lg').first();
    
    // Hover and click edit button
    await drillCard.hover();
    const editButton = drillCard.locator('button[title="Edit this drill"]');
    await editButton.click();
    
    // Check if edit modal opens with "Edit Drill" title
    const modalTitle = page.locator('h2:has-text("Edit Drill")');
    await expect(modalTitle).toBeVisible();
    
    // Check if form fields are pre-populated
    const titleInput = page.locator('input[placeholder="e.g., 3v2 Transition Drill"]');
    const titleValue = await titleInput.inputValue();
    expect(titleValue).not.toBe(''); // Should have a value
  });

  test('should have "Add Custom Drill" button in drill library', async ({ page }) => {
    // Check for Add Custom Drill button
    const addButton = page.locator('button:has-text("Add Custom Drill")');
    await expect(addButton).toBeVisible();
    
    // Click to open create modal
    await addButton.click();
    
    // Check if create modal opens with "Add Custom Drill" title
    const modalTitle = page.locator('h2:has-text("Add Custom Drill")');
    await expect(modalTitle).toBeVisible();
  });

  test('should update drill when saving edits', async ({ page }) => {
    // Find a custom drill (if exists)
    const customDrillsAccordion = page.locator('button:has-text("User Drills")');
    
    if (await customDrillsAccordion.isVisible()) {
      // Expand custom drills section
      await customDrillsAccordion.click();
      
      // Find first custom drill
      const customDrill = page.locator('.p-3.bg-white.border.rounded-lg').filter({ has: page.locator('text=Custom') }).first();
      
      if (await customDrill.isVisible()) {
        // Hover and click edit
        await customDrill.hover();
        const editButton = customDrill.locator('button[title="Edit this drill"]');
        await editButton.click();
        
        // Modify the title
        const titleInput = page.locator('input[placeholder="e.g., 3v2 Transition Drill"]');
        await titleInput.fill('Updated Test Drill');
        
        // Save changes
        const updateButton = page.locator('button:has-text("Update Drill")');
        await updateButton.click();
        
        // Check for success message
        await expect(page.locator('text=Drill updated successfully')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});