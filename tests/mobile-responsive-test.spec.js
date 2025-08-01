import { test, expect } from '@playwright/test';

test.describe('Practice Planner Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice-planner');
  });

  test('Mobile view shows Add Drills button at bottom', async ({ page }) => {
    // Set mobile viewport (iPhone 12 size)
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Check that Add Drills button is visible at bottom
    const addDrillsButton = page.locator('button:has-text("Add Drills to Plan")');
    await expect(addDrillsButton).toBeVisible();
    
    // Verify button is fixed at bottom
    const buttonBox = await addDrillsButton.boundingBox();
    expect(buttonBox.y + buttonBox.height).toBeGreaterThan(800);
    
    // Verify drill library is hidden initially on mobile
    const drillLibrary = page.locator('text="Drill Library"').first();
    await expect(drillLibrary).toBeHidden();
  });

  test('Clicking Add Drills button opens drill library overlay', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Click Add Drills button
    await page.click('button:has-text("Add Drills to Plan")');
    
    // Verify drill library is now visible
    const drillLibrary = page.locator('h2:has-text("Drill Library")');
    await expect(drillLibrary).toBeVisible();
    
    // Verify close button is visible (the one with the X icon)
    const closeButton = page.locator('button.sm\\:hidden').filter({ has: page.locator('svg path[d*="M6 18L18 6M6 6l12 12"]') });
    await expect(closeButton).toBeVisible();
    
    // Click close button
    await closeButton.click();
    
    // Verify drill library is hidden again
    await expect(drillLibrary).toBeHidden();
  });

  test('Desktop view shows drill library sidebar', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Verify Add Drills button is NOT visible on desktop
    const addDrillsButton = page.locator('button:has-text("Add Drills to Plan")');
    await expect(addDrillsButton).toBeHidden();
    
    // Verify drill library is visible as sidebar
    const drillLibrary = page.locator('h2:has-text("Drill Library")');
    await expect(drillLibrary).toBeVisible();
  });

  test('Tablet view (640px breakpoint) shows desktop layout', async ({ page }) => {
    // Set viewport to exactly 640px (sm breakpoint)
    await page.setViewportSize({ width: 640, height: 768 });
    
    // Should show desktop layout at 640px
    const addDrillsButton = page.locator('button:has-text("Add Drills to Plan")');
    await expect(addDrillsButton).toBeHidden();
    
    const drillLibrary = page.locator('h2:has-text("Drill Library")');
    await expect(drillLibrary).toBeVisible();
  });

  test('Adding drill on mobile closes library automatically', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Open drill library
    await page.click('button:has-text("Add Drills to Plan")');
    
    // Expand a category (e.g., Admin)
    await page.click('text="Admin"');
    
    // Wait for drills to be visible
    await page.waitForSelector('text="Team Meeting"');
    
    // Click add button for a drill
    const addButton = page.locator('button[title="Add to practice"]').first();
    await addButton.click();
    
    // Verify drill library is automatically closed
    const drillLibrary = page.locator('h2:has-text("Drill Library")');
    await expect(drillLibrary).toBeHidden();
    
    // Verify the drill was added to the schedule (in the practice schedule, not drill library)
    await expect(page.locator('.w-full.sm\\:w-2\\/3').locator('text="Team Meeting"').first()).toBeVisible();
  });

  test('Practice schedule has padding for bottom button on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Check that the practice schedule container has bottom padding
    const scheduleContainer = page.locator('.pb-16.sm\\:pb-0');
    await expect(scheduleContainer).toBeVisible();
  });
});