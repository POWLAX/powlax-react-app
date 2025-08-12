import { test, expect } from '@playwright/test'

test.describe('Practice Planner Fixes Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams/no-team/practiceplan')
    await page.waitForTimeout(2000) // Allow page to fully load
  })

  test('Add Custom Strategy button is visible and clickable', async ({ page }) => {
    // Navigate to Strategies tab
    const strategiesTab = page.locator('button:has-text("Strategies")')
    await strategiesTab.click()
    
    // Check if Add Custom Strategy button exists
    const addStrategyButton = page.locator('button:has-text("Add Custom Strategy")')
    await expect(addStrategyButton).toBeVisible()
    
    // Click the button to open modal
    await addStrategyButton.click()
    
    // Verify modal opens
    const modal = page.locator('text="Add Custom Strategy"').first()
    await expect(modal).toBeVisible()
    
    // Close modal
    const cancelButton = page.locator('button:has-text("Cancel")')
    await cancelButton.click()
  })

  test('Add Custom Drill button is visible and functional', async ({ page }) => {
    // Check if Add Custom Drill button exists
    const addDrillButton = page.locator('button:has-text("Add Custom Drill")')
    await expect(addDrillButton).toBeVisible()
    
    // Click the button to open modal
    await addDrillButton.click()
    
    // Verify modal opens
    const modal = page.locator('text="Add Custom Drill"').first()
    await expect(modal).toBeVisible()
    
    // Close modal
    const cancelButton = page.locator('button:has-text("Cancel")')
    await cancelButton.click()
  })

  test('Load Practice Plan modal opens without infinite loading', async ({ page }) => {
    // Click Load Practice button
    const loadButton = page.locator('button:has-text("Load Practice")')
    await expect(loadButton).toBeVisible()
    await loadButton.click()
    
    // Verify modal opens
    const modal = page.locator('text="Load Practice Plan"').first()
    await expect(modal).toBeVisible()
    
    // Check that it's not stuck loading (should show either plans or "No practice plans found")
    const noPlansMessage = page.locator('text="No practice plans found"')
    const plansList = page.locator('[role="button"]:has-text("min")')
    
    // Wait for either message to appear (not stuck loading)
    await expect(noPlansMessage.or(plansList.first())).toBeVisible({ timeout: 5000 })
    
    // Close modal
    const cancelButton = page.locator('button:has-text("Cancel")')
    await cancelButton.click()
  })

  test('Favorites functionality works without auth errors', async ({ page }) => {
    // Find a drill card with star icon
    const drillCard = page.locator('.border').filter({ hasText: '1v1' }).first()
    
    // If drill exists, try to favorite it
    const starButton = drillCard.locator('button:has(svg.lucide-star)')
    if (await starButton.count() > 0) {
      await starButton.first().click()
      
      // Check for either success toast or sign in message
      const toast = page.locator('.sonner-toast')
      await expect(toast).toBeVisible({ timeout: 3000 })
      
      // The toast should say either "Added to favorites" or "Please sign in to save favorites"
      const toastText = await toast.textContent()
      expect(toastText).toMatch(/Added to favorites|Please sign in to save favorites/)
    }
  })

  test('Save Practice modal opens and functions', async ({ page }) => {
    // Add a drill first
    const drillCard = page.locator('.border').filter({ hasText: '1v1' }).first()
    const addButton = drillCard.locator('button:has(svg.lucide-plus)')
    if (await addButton.count() > 0) {
      await addButton.first().click()
      await page.waitForTimeout(500)
    }
    
    // Click Save Practice button
    const saveButton = page.locator('button:has-text("Save Practice")')
    await expect(saveButton).toBeVisible()
    await saveButton.click()
    
    // Verify modal opens
    const modal = page.locator('text="Save Practice Plan"').first()
    await expect(modal).toBeVisible()
    
    // Check that form fields are present
    const nameInput = page.locator('input[placeholder*="practice name"]')
    await expect(nameInput).toBeVisible()
    
    // Close modal
    const cancelButton = page.locator('button:has-text("Cancel")')
    await cancelButton.click()
  })
})