import { test, expect } from '@playwright/test'

test.describe('Practice Planner Routes', () => {
  test('Standalone route /practiceplan redirects to /teams/no-team/practiceplan', async ({ page }) => {
    // Navigate to standalone route
    await page.goto('/practiceplan')
    
    // Wait for redirect
    await page.waitForURL('**/teams/no-team/practiceplan', { timeout: 5000 })
    
    // Verify we're on the correct URL
    expect(page.url()).toContain('/teams/no-team/practiceplan')
    
    // Verify practice planner loads
    await expect(page.locator('h1:has-text("Practice Planner")')).toBeVisible({ timeout: 10000 })
  })

  test('Practice planner header and buttons are visible', async ({ page }) => {
    // Go directly to no-team route
    await page.goto('/teams/no-team/practiceplan')
    
    // Check main elements are visible
    await expect(page.locator('h1:has-text("Practice Planner")')).toBeVisible()
    
    // Check action buttons
    await expect(page.locator('button:has-text("Templates")')).toBeVisible()
    await expect(page.locator('button:has-text("Load")')).toBeVisible()
    await expect(page.locator('button:has-text("Save")')).toBeVisible()
    await expect(page.locator('button:has-text("Print")')).toBeVisible()
    await expect(page.locator('button:has-text("Restart")')).toBeVisible()
    await expect(page.locator('button:has-text("Strategies")')).toBeVisible()
    await expect(page.locator('button:has-text("Share to Team")')).toBeVisible()
  })

  test('Share to Team button shows appropriate message for no-team users', async ({ page }) => {
    // Go to no-team route
    await page.goto('/teams/no-team/practiceplan')
    
    // Wait for page to load
    await expect(page.locator('h1:has-text("Practice Planner")')).toBeVisible()
    
    // Click Share to Team button
    await page.locator('button:has-text("Share to Team")').click()
    
    // Check for the no-team message
    await expect(page.locator('text=No team to share to!')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Consider getting a Team HQ to collaborate with your team.')).toBeVisible()
  })

  test('Practice info fields are functional', async ({ page }) => {
    await page.goto('/teams/no-team/practiceplan')
    
    // Wait for page to load
    await expect(page.locator('h1:has-text("Practice Planner")')).toBeVisible()
    
    // Test date input
    const dateInput = page.locator('input[type="date"]')
    await expect(dateInput).toBeVisible()
    await dateInput.fill('2025-01-15')
    await expect(dateInput).toHaveValue('2025-01-15')
    
    // Test time input
    const timeInput = page.locator('input[type="time"]')
    await expect(timeInput).toBeVisible()
    await timeInput.fill('15:30')
    await expect(timeInput).toHaveValue('15:30')
    
    // Test duration input
    const durationInput = page.locator('input[type="number"]')
    await expect(durationInput).toBeVisible()
    await durationInput.fill('120')
    await expect(durationInput).toHaveValue('120')
    
    // Test field select
    const fieldSelect = page.locator('select').first()
    await expect(fieldSelect).toBeVisible()
    await fieldSelect.selectOption('Grass')
    await expect(fieldSelect).toHaveValue('Grass')
  })

  test('Team route with valid UUID works', async ({ page }) => {
    // Use a valid team UUID
    const teamId = 'd6b72e87-8fab-4f4c-9921-260501605ee2'
    await page.goto(`/teams/${teamId}/practiceplan`)
    
    // Verify practice planner loads (may show error if team doesn't exist, but page should load)
    await expect(page.locator('h1:has-text("Practice Planner")')).toBeVisible({ timeout: 10000 })
  })

  test('Navigation sidebar has Practice Planner link', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Look for Practice Planner in navigation sidebar (not demo links)
    const navLink = page.locator('nav a[href="/practiceplan"]:has-text("Practice Planner")').first()
    await expect(navLink).toBeVisible()
    
    // Click it and verify redirect
    await navLink.click()
    await page.waitForURL('**/teams/no-team/practiceplan', { timeout: 5000 })
    expect(page.url()).toContain('/teams/no-team/practiceplan')
  })

  test('Practice Timeline section is visible', async ({ page }) => {
    await page.goto('/teams/no-team/practiceplan')
    
    // Wait for page to load
    await expect(page.locator('h1:has-text("Practice Planner")')).toBeVisible()
    
    // Check for the practice timeline area - it shows "Ready to Build Your Practice!" when empty
    await expect(page.locator('text=Ready to Build Your Practice!')).toBeVisible()
    
    // Check for drill library section
    await expect(page.locator('text=Drill Library')).toBeVisible()
  })

  test('Restart button clears the practice', async ({ page }) => {
    await page.goto('/teams/no-team/practiceplan')
    
    // Wait for page to load
    await expect(page.locator('h1:has-text("Practice Planner")')).toBeVisible()
    
    // Add some notes to test clearing
    const notesTextarea = page.locator('textarea[placeholder*="notes"]')
    await notesTextarea.fill('Test practice notes')
    await expect(notesTextarea).toHaveValue('Test practice notes')
    
    // Click Restart button
    await page.locator('button:has-text("Restart")').click()
    
    // Verify notes are cleared and success message appears
    await expect(page.locator('text=Practice plan cleared')).toBeVisible({ timeout: 5000 })
    await expect(notesTextarea).toHaveValue('')
  })
})