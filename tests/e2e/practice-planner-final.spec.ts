import { test, expect } from '@playwright/test'

test.describe('Practice Planner Final Updates', () => {
  test('verify drill card updates - no POWLAX pill, clickable notes, parallel button below', async ({ page }) => {
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
              notes: 'Focus on body position',
              source: 'powlax'
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
                duration: 20
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
      path: 'screenshots/practice-planner-final-updates.png',
      fullPage: true 
    })
    
    console.log('Screenshot saved to screenshots/practice-planner-final-updates.png')
    
    // Check that POWLAX pill is not present
    const powlaxPill = page.locator('.bg-blue-100:has-text("POWLAX")')
    expect(await powlaxPill.count()).toBe(0)
    
    // Check that PARALLEL badge is not present
    const parallelBadge = page.locator('text=/PARALLEL.*activities/')
    expect(await parallelBadge.count()).toBe(0)
    
    // Check that coaching notes are present and look clickable (have hover states)
    const coachingNotes = page.locator('.bg-blue-50.hover\\:bg-blue-100').first()
    if (await coachingNotes.isVisible()) {
      // Verify it's a button
      const tagName = await coachingNotes.evaluate(el => el.tagName)
      expect(tagName.toLowerCase()).toBe('button')
    }
    
    // Check that Add Parallel button exists
    const addParallelButton = page.locator('button:has-text("Add Parallel Activity")')
    expect(await addParallelButton.count()).toBeGreaterThan(0)
    
    // Check navigation buttons have borders
    const navButtons = page.locator('.bg-blue-900 button.border-white\\/50')
    expect(await navButtons.count()).toBeGreaterThan(0)
  })
})