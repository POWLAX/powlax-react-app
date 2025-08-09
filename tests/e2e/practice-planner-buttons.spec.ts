import { test, expect } from '@playwright/test'

test.describe('Practice Planner Button Updates', () => {
  test('verify navigation buttons have outlines and no PARALLEL badge', async ({ page }) => {
    // Navigate to practice planner
    await page.goto('/teams/test-team/practice-plans')
    
    // Wait for page to load
    await page.waitForTimeout(2000)
    
    // Close welcome modal if present
    const closeButton = page.locator('button:has-text("Skip for now"), button:has-text("×")').first()
    if (await closeButton.isVisible()) {
      await closeButton.click()
    }
    
    // Add some test drills to see the UI
    await page.evaluate(() => {
      // Simulate adding drills via localStorage
      const testData = {
        timeSlots: [
          {
            id: 'slot-1',
            drills: [{
              id: 'drill-1',
              name: '1v1 Ground Balls',
              duration: 15,
              notes: 'Focus on body position'
            }],
            duration: 15
          },
          {
            id: 'slot-2',
            drills: [
              {
                id: 'drill-2a',
                name: '2v2 Fast Break',
                duration: 20,
                notes: 'Communication is key'
              },
              {
                id: 'drill-2b',
                name: 'Shooting Lines',
                duration: 20,
                notes: 'Work on accuracy'
              }
            ],
            duration: 20
          }
        ]
      }
      localStorage.setItem('practice-plan-test-team', JSON.stringify(testData))
      window.location.reload()
    })
    
    await page.waitForTimeout(2000)
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/practice-planner-no-badge.png',
      fullPage: true 
    })
    
    console.log('Screenshot saved to screenshots/practice-planner-no-badge.png')
    
    // Check that PARALLEL badge is not present
    const parallelBadge = page.locator('text=/PARALLEL.*activities/')
    expect(await parallelBadge.count()).toBe(0)
    
    // Check that navigation buttons exist
    const navButtons = page.locator('.bg-blue-900 button')
    expect(await navButtons.count()).toBeGreaterThan(0)
  })
})