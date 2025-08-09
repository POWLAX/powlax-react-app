import { test, expect } from '@playwright/test'

test.describe('Practice Planner View', () => {
  test('view practice planner UI', async ({ page }) => {
    // Navigate to practice planner
    await page.goto('/teams/test-team/practice-plans')
    
    // Wait for page to load
    await page.waitForTimeout(2000)
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/practice-planner-current.png',
      fullPage: true 
    })
    
    // Check if drill cards are too compact
    const drillCards = page.locator('[data-testid="drill-card"]').first()
    if (await drillCards.count() > 0) {
      const box = await drillCards.boundingBox()
      console.log('Drill card dimensions:', box)
    }
    
    // Keep browser open for manual inspection
    await page.waitForTimeout(30000)
  })
})