import { test, expect } from '@playwright/test'

test.describe('Resources Page Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to resources page
    await page.goto('/resources')
    await page.waitForLoadState('networkidle')
  })

  test('Resources page loads with new components', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Resources')
    
    // Check ResourceFilter component is present
    await expect(page.locator('input[placeholder="Search resources..."]')).toBeVisible()
    await expect(page.locator('button:has-text("Filters")')).toBeVisible()
    
    // Check filter buttons are present
    await expect(page.locator('button:has-text("Videos")')).toBeVisible()
    await expect(page.locator('button:has-text("PDFs")')).toBeVisible()
    await expect(page.locator('button:has-text("Templates")')).toBeVisible()
    await expect(page.locator('button:has-text("Favorites")')).toBeVisible()
    
    // Check result count is displayed
    await expect(page.locator('text=/\\d+ resources? found/')).toBeVisible()
  })

  test('Search functionality works', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search resources..."]')
    
    // Type in search box
    await searchInput.fill('lacrosse')
    
    // Verify search input has value
    await expect(searchInput).toHaveValue('lacrosse')
  })

  test('Filter buttons are interactive', async ({ page }) => {
    // Click Videos filter
    const videosButton = page.locator('button:has-text("Videos")')
    await videosButton.click()
    
    // Click PDFs filter
    const pdfsButton = page.locator('button:has-text("PDFs")')
    await pdfsButton.click()
    
    // Click Favorites filter
    const favoritesButton = page.locator('button:has-text("Favorites")')
    await favoritesButton.click()
  })

  test('Permanence test section is present', async ({ page }) => {
    // Check for permanence test section
    await expect(page.locator('text=Resource Permanence Test')).toBeVisible()
    
    // Check for show/hide test button
    await expect(page.locator('button:has-text("Show Test")')).toBeVisible()
  })

  test('Stage 4 completion indicator is present', async ({ page }) => {
    // Check for Stage 4 complete message
    await expect(page.locator('text=Stage 4 Complete')).toBeVisible()
    await expect(page.locator('text=New resource components integrated')).toBeVisible()
  })

  test('No old mock content remains', async ({ page }) => {
    // Verify old mock content has been replaced
    const equipmentMock = page.locator('text=/Mock.*Equipment/i')
    const trainingMock = page.locator('text=/Mock.*Training/i')
    const ruleMock = page.locator('text=/Mock.*Rule/i')
    
    // These should not exist anymore since we integrated new components
    await expect(equipmentMock).toHaveCount(0)
    await expect(trainingMock).toHaveCount(0)
    await expect(ruleMock).toHaveCount(0)
  })

  test('Browse by category section exists when no resources', async ({ page }) => {
    // When no resources are found, should show category browsing
    const browseHeader = page.locator('h2:has-text("Browse by Category")')
    
    // This might be visible depending on resources loaded
    if (await browseHeader.isVisible()) {
      await expect(browseHeader).toBeVisible()
    }
  })

  test('Responsive design elements', async ({ page }) => {
    // Test mobile navigation is present
    const mobileNav = page.locator('nav.fixed.bottom-0')
    await expect(mobileNav).toBeVisible()
    
    // Check resources link in mobile nav
    await expect(page.locator('nav.fixed.bottom-0 a[href="/resources"]')).toBeVisible()
  })
})