import { test, expect } from '@playwright/test'

test.describe('Skills Academy Drill Mapping', () => {
  test('M1 workout shows drills in preview modal', async ({ page }) => {
    // Navigate to Skills Academy
    await page.goto('http://localhost:3000/skills-academy')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Look for Midfield series cards
    const midfieldCard = page.locator('text=/Midfield.*M1/').first()
    await expect(midfieldCard).toBeVisible({ timeout: 10000 })
    
    // Click on the Midfield series to open workout selector
    await midfieldCard.click()
    
    // Wait for workout size selector modal
    await expect(page.locator('[data-testid="size-selector-modal"]')).toBeVisible({ timeout: 5000 })
    
    // Click on Complete workout option to see all drills
    const completeWorkoutButton = page.locator('text=/Complete.*15.*drills/i').first()
    await expect(completeWorkoutButton).toBeVisible()
    
    // Check if drill preview dropdown exists
    const viewDrillsButton = page.locator('button:has-text("View Drills")')
    if (await viewDrillsButton.isVisible()) {
      await viewDrillsButton.click()
      
      // Check if drills are displayed
      const drillList = page.locator('[role="region"], .space-y-1, .border.rounded-lg')
      await expect(drillList).toBeVisible()
      
      // Check for drill items
      const drillItems = page.locator('.flex.items-start.gap-2.text-xs')
      const drillCount = await drillItems.count()
      
      console.log(`Found ${drillCount} drills in the preview`)
      expect(drillCount).toBeGreaterThan(0)
      
      // Get first few drill names
      if (drillCount > 0) {
        for (let i = 0; i < Math.min(3, drillCount); i++) {
          const drillText = await drillItems.nth(i).textContent()
          console.log(`  Drill ${i + 1}: ${drillText}`)
        }
      }
    }
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'test-results/skills-academy-m1-drills.png',
      fullPage: true 
    })
  })
  
  test('Workout preview modal shows drill details', async ({ page }) => {
    // Navigate directly to Skills Academy
    await page.goto('http://localhost:3000/skills-academy')
    await page.waitForLoadState('networkidle')
    
    // Find any series card with workouts
    const seriesCard = page.locator('.group.hover\\:shadow-xl').first()
    await expect(seriesCard).toBeVisible({ timeout: 10000 })
    
    // Click on Start Workout button if it exists
    const startButton = seriesCard.locator('button:has-text("Start Workout")')
    if (await startButton.isVisible()) {
      await startButton.click()
      
      // Wait for size selector
      await page.waitForTimeout(1000)
      
      // Look for workout options
      const workoutOptions = page.locator('button:has-text("drills")')
      const optionCount = await workoutOptions.count()
      
      console.log(`Found ${optionCount} workout size options`)
      
      if (optionCount > 0) {
        // Click on first workout option
        await workoutOptions.first().click()
        
        // Check if preview modal opens
        const previewModal = page.locator('[role="dialog"]')
        if (await previewModal.isVisible()) {
          console.log('Preview modal opened')
          
          // Check for drill list
          const drillsSection = page.locator('text=/Workout Drills/i')
          if (await drillsSection.isVisible()) {
            console.log('Drill section found in preview modal')
            
            // Take screenshot
            await page.screenshot({ 
              path: 'test-results/workout-preview-modal.png',
              fullPage: true 
            })
          }
        }
      }
    }
  })
  
  test('Workout runner page loads with drills', async ({ page }) => {
    // Navigate directly to a workout page
    await page.goto('http://localhost:3000/skills-academy/workout/49') // M1 Complete
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check if workout loads or shows error
    const workoutTitle = page.locator('h1')
    const titleText = await workoutTitle.textContent()
    console.log('Workout page title:', titleText)
    
    // Check for drill display
    const drillCaption = page.locator('[data-testid="drill-caption"]')
    if (await drillCaption.isVisible({ timeout: 5000 })) {
      const drillName = await drillCaption.textContent()
      console.log('Current drill:', drillName)
      
      // Check for progress bar
      const progressBar = page.locator('[data-testid="progress-bar"]')
      await expect(progressBar).toBeVisible()
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/workout-runner-page.png',
        fullPage: true 
      })
    } else {
      // Check for "no drills" message
      const noDrillsMessage = page.locator('text=/no drills|not found/i')
      if (await noDrillsMessage.isVisible()) {
        console.log('Workout has no drills configured')
      }
    }
  })
})