import { test, expect } from '@playwright/test'

test.describe('Parallel Drill Duration Editing', () => {
  test('verify parallel drill container has editable duration', async ({ page }) => {
    // Navigate to practice planner
    await page.goto('/teams/test-team/practice-plans')
    
    // Wait for page to load
    await page.waitForTimeout(2000)
    
    // Close welcome modal if present
    const closeButton = page.locator('button:has-text("Skip for now"), button:has-text("×")').first()
    if (await closeButton.isVisible()) {
      await closeButton.click()
    }
    
    // Add parallel drills to see the UI
    await page.evaluate(() => {
      const testData = {
        timeSlots: [
          {
            id: 'slot-1',
            drills: [
              {
                id: 'drill-1a',
                name: '2v2 Fast Break',
                duration: 20,
                notes: 'Communication is key'
              },
              {
                id: 'drill-1b',
                name: 'Shooting Lines',
                duration: 20,
                notes: 'Focus on accuracy'
              }
            ],
            duration: 20
          }
        ],
        practiceDate: new Date().toISOString().split('T')[0],
        startTime: '07:00',
        duration: 90,
        field: 'Turf'
      }
      localStorage.setItem('practice-plan-test-team', JSON.stringify(testData))
      window.location.reload()
    })
    
    await page.waitForTimeout(3000)
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/practice-planner-parallel-duration.png',
      fullPage: true 
    })
    
    console.log('Screenshot saved to screenshots/practice-planner-parallel-duration.png')
    
    // Check that duration badge exists in parallel container header
    const parallelDurationBadge = page.locator('.bg-blue-900 button:has-text("20m")').first()
    expect(await parallelDurationBadge.isVisible()).toBe(true)
    
    // Click to edit duration
    await parallelDurationBadge.click()
    
    // Check that input appears
    const durationInput = page.locator('.bg-blue-900 input[type="number"]').first()
    expect(await durationInput.isVisible()).toBe(true)
    
    // Test editing the duration
    await durationInput.fill('25')
    await durationInput.press('Enter')
    
    // Verify the duration updated
    await page.waitForTimeout(500)
    const updatedBadge = page.locator('.bg-blue-900 button:has-text("25m")').first()
    expect(await updatedBadge.isVisible()).toBe(true)
    
    console.log('Parallel drill duration editing works correctly!')
  })
})