import { test, expect } from '@playwright/test'

test.describe('Practice Planner Print Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to practice planner
    await page.goto('/demo/practice-planner')
    
    // Wait for the page to load
    await expect(page.getByText('POWLAX Practice Planner')).toBeVisible()
  })

  test('Print button should be disabled when no drills are added', async ({ page }) => {
    // Check that print button is disabled initially
    const printButton = page.locator('[title="Print Practice Plan"]')
    await expect(printButton).toBeDisabled()
  })

  test('Print button should become enabled after adding a drill', async ({ page }) => {
    // Add a drill from the library
    const drillCard = page.locator('.drill-card').first()
    await drillCard.click()
    
    // Wait for drill to be added to timeline
    await expect(page.locator('.timeline-drill')).toBeVisible()
    
    // Check that print button is now enabled
    const printButton = page.locator('[title="Print Practice Plan"]')
    await expect(printButton).toBeEnabled()
  })

  test('Print preview modal should open on desktop', async ({ page }) => {
    // Add a drill first
    const drillCard = page.locator('.drill-card').first()
    await drillCard.click()
    
    // Click print button
    const printButton = page.locator('[title="Print Practice Plan"]')
    await printButton.click()
    
    // Check that print preview modal opens
    await expect(page.getByText('Print Practice Plan')).toBeVisible()
    await expect(page.locator('#printable-plan')).toBeVisible()
  })

  test('Print preview should contain all practice information', async ({ page }) => {
    // Add a drill first
    const drillCard = page.locator('.drill-card').first()
    await drillCard.click()
    
    // Add practice notes
    const notesTextarea = page.locator('textarea[placeholder*="practice goals"]')
    await notesTextarea.fill('Test practice notes for print verification')
    
    // Click print button
    const printButton = page.locator('[title="Print Practice Plan"]')
    await printButton.click()
    
    // Verify print content contains expected elements
    const printContent = page.locator('#printable-plan')
    await expect(printContent.getByText('POWLAX')).toBeVisible()
    await expect(printContent.getByText('Practice Plan')).toBeVisible()
    await expect(printContent.getByText('Practice Activities')).toBeVisible()
    await expect(printContent.getByText('Test practice notes for print verification')).toBeVisible()
    
    // Check for POWLAX branding
    await expect(printContent.getByText('Professional Online Workouts for Lacrosse')).toBeVisible()
    
    // Check for signature lines
    await expect(printContent.getByText('Coach Signature')).toBeVisible()
  })

  test('Print content should have proper styling classes', async ({ page }) => {
    // Add a drill first  
    const drillCard = page.locator('.drill-card').first()
    await drillCard.click()
    
    // Click print button
    const printButton = page.locator('[title="Print Practice Plan"]')
    await printButton.click()
    
    // Check for key styling classes that ensure proper print formatting
    const printContent = page.locator('#printable-plan')
    await expect(printContent.locator('.printable-practice-plan')).toBeVisible()
    await expect(printContent.locator('.practice-header')).toBeVisible()
    await expect(printContent.locator('.timeline-item')).toBeVisible()
    await expect(printContent.locator('.timeline-time')).toBeVisible()
    await expect(printContent.locator('.timeline-drill')).toBeVisible()
  })

  test('Equipment list should be generated from drills', async ({ page }) => {
    // Add a drill that has equipment
    const drillCard = page.locator('.drill-card').first()
    await drillCard.click()
    
    // Click print button
    const printButton = page.locator('[title="Print Practice Plan"]')
    await printButton.click()
    
    // Check if equipment checklist appears (if the drill has equipment)
    const printContent = page.locator('#printable-plan')
    const equipmentSection = printContent.getByText('Equipment Checklist')
    
    // Equipment section should either be visible with items or not present
    const equipmentExists = await equipmentSection.isVisible()
    if (equipmentExists) {
      // Should have checkboxes for equipment items
      await expect(printContent.locator('input[type="checkbox"]')).toBeVisible()
    }
  })

  test('Safety reminders should be present in print view', async ({ page }) => {
    // Add a drill first
    const drillCard = page.locator('.drill-card').first()
    await drillCard.click()
    
    // Click print button
    const printButton = page.locator('[title="Print Practice Plan"]')
    await printButton.click()
    
    // Check for safety reminders
    const printContent = page.locator('#printable-plan')
    await expect(printContent.getByText('Safety Reminders:')).toBeVisible()
    await expect(printContent.getByText('proper protective equipment')).toBeVisible()
    await expect(printContent.getByText('first aid kit')).toBeVisible()
    await expect(printContent.getByText('hydration breaks')).toBeVisible()
  })

  test('Print modal should close properly', async ({ page }) => {
    // Add a drill first
    const drillCard = page.locator('.drill-card').first()
    await drillCard.click()
    
    // Click print button
    const printButton = page.locator('[title="Print Practice Plan"]')
    await printButton.click()
    
    // Modal should be visible
    await expect(page.getByText('Print Practice Plan')).toBeVisible()
    
    // Close the modal using the X button
    await page.locator('button:has-text("✕")').last().click()
    
    // Modal should be closed
    await expect(page.getByText('Print Practice Plan')).toBeHidden()
  })
})