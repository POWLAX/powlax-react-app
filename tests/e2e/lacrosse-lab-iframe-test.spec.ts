import { test, expect } from '@playwright/test'

test.describe('Lacrosse Lab Iframe Interaction', () => {
  test('should verify iframe attributes and interaction capability', async ({ page }) => {
    // Navigate to practice planner
    await page.goto('/teams/test-team/practice-plans')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Close welcome modal if present
    const skipButton = page.locator('text="Skip for now"')
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click()
      await page.waitForTimeout(500)
    }
    
    // Wait for drill library to be visible
    await page.waitForSelector('text="Drill Library"', { timeout: 10000 })
    
    // Add a drill to the practice plan
    console.log('Looking for drill to add...')
    
    // Find a drill with a + button and add it
    const addButtons = await page.locator('button').filter({ hasText: '+' }).all()
    console.log(`Found ${addButtons.length} add buttons`)
    
    if (addButtons.length > 0) {
      // Click the first add button
      await addButtons[0].click()
      await page.waitForTimeout(1000)
      
      // Now find the Study button on the added drill
      const studyButton = page.locator('button').filter({ hasText: 'Study' }).first()
      
      if (await studyButton.isVisible({ timeout: 5000 })) {
        console.log('Found Study button, clicking...')
        await studyButton.click()
        
        // Wait for modal to open
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
        console.log('Study modal opened')
        
        // Look for Diagram tab
        const diagramTab = page.locator('button[role="tab"]').filter({ hasText: 'Diagram' })
        
        if (await diagramTab.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log('Diagram tab found, clicking...')
          await diagramTab.click()
          
          // Wait for iframe to load
          await page.waitForTimeout(2000)
          
          // Check iframe attributes
          const iframe = page.locator('iframe[title*="Diagram"]').first()
          
          if (await iframe.isVisible({ timeout: 5000 })) {
            const attributes = {
              src: await iframe.getAttribute('src'),
              allow: await iframe.getAttribute('allow'),
              sandbox: await iframe.getAttribute('sandbox'),
              style: await iframe.getAttribute('style')
            }
            
            console.log('=== IFRAME ATTRIBUTES ===')
            console.log('src:', attributes.src)
            console.log('allow:', attributes.allow)
            console.log('sandbox:', attributes.sandbox)
            console.log('style:', attributes.style)
            
            // Verify critical attributes for interaction
            expect(attributes.sandbox).toBeTruthy()
            expect(attributes.sandbox).toContain('allow-scripts')
            expect(attributes.sandbox).toContain('allow-same-origin')
            expect(attributes.sandbox).toContain('allow-forms')
            expect(attributes.style).toContain('pointer-events: auto')
            
            // Take screenshot of the iframe area
            await page.screenshot({ 
              path: 'test-results/lacrosse-lab-iframe-state.png',
              fullPage: false
            })
            
            // Try to interact with iframe using JavaScript
            const canInteract = await page.evaluate(() => {
              const iframe = document.querySelector('iframe[title*="Diagram"]') as HTMLIFrameElement
              if (!iframe) return { error: 'No iframe found' }
              
              try {
                // Check if we can access iframe content (will fail for cross-origin)
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
                if (iframeDoc) {
                  return { 
                    canAccess: true, 
                    bodyExists: !!iframeDoc.body,
                    origin: 'same-origin'
                  }
                }
                return { canAccess: false, origin: 'cross-origin' }
              } catch (e) {
                // Cross-origin iframe - expected for external lacrosse lab
                return { 
                  canAccess: false, 
                  origin: 'cross-origin',
                  error: e.message
                }
              }
            })
            
            console.log('=== IFRAME INTERACTION TEST ===')
            console.log('Result:', canInteract)
            
            // For cross-origin iframes, we can't directly interact with content
            // But the iframe should still be interactive for users
            if (canInteract.origin === 'cross-origin') {
              console.log('Cross-origin iframe detected (expected for external lacrosse lab)')
              console.log('User interaction should work with proper sandbox attributes')
              
              // Verify the iframe is set up for user interaction
              expect(attributes.sandbox).toContain('allow-scripts')
              expect(attributes.sandbox).toContain('allow-pointer-lock')
              console.log('✅ Iframe configured correctly for user interaction')
            }
          } else {
            console.log('No iframe found in Diagram tab')
            
            // Check if there's a placeholder
            const placeholder = page.locator('text="Interactive field diagram would load here"')
            if (await placeholder.isVisible({ timeout: 1000 }).catch(() => false)) {
              console.log('Found placeholder - drill has no lacrosse lab content')
            }
          }
        } else {
          console.log('No Diagram tab available - drill has no diagram content')
        }
      } else {
        console.log('No Study button found after adding drill')
      }
    } else {
      console.log('No add buttons found in drill library')
    }
  })
  
  test('should test with a specific drill that has lacrosse lab content', async ({ page }) => {
    // This test assumes we know a specific drill with lacrosse lab content
    // You can update the drill name based on your data
    
    await page.goto('/teams/test-team/practice-plans')
    await page.waitForLoadState('networkidle')
    
    // Skip welcome modal
    const skipButton = page.locator('text="Skip for now"')
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click()
    }
    
    // Wait for drill library
    await page.waitForSelector('text="Drill Library"', { timeout: 10000 })
    
    // Look for a specific drill that likely has lacrosse lab content
    // Common drills with diagrams: "2v1", "3v2", "Fast Break", "Clear", "Ride"
    const drillsToTry = ['2v1', '3v2', 'Fast Break', 'Ground Ball', 'Clear', 'Ride']
    
    for (const drillName of drillsToTry) {
      const drillCard = page.locator('.bg-white').filter({ hasText: drillName }).first()
      
      if (await drillCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`Found drill: ${drillName}`)
        
        // Add the drill
        const addButton = drillCard.locator('button').filter({ hasText: '+' }).first()
        if (await addButton.isVisible()) {
          await addButton.click()
          await page.waitForTimeout(1000)
          
          // Find and click Study button
          const studyButton = page.locator('button').filter({ hasText: 'Study' }).first()
          if (await studyButton.isVisible({ timeout: 3000 })) {
            await studyButton.click()
            await page.waitForSelector('[role="dialog"]')
            
            // Check for Diagram tab
            const diagramTab = page.locator('button[role="tab"]').filter({ hasText: 'Diagram' })
            if (await diagramTab.isVisible({ timeout: 2000 }).catch(() => false)) {
              await diagramTab.click()
              await page.waitForTimeout(2000)
              
              const iframe = page.locator('iframe[title*="Diagram"]').first()
              if (await iframe.isVisible({ timeout: 3000 })) {
                console.log(`✅ Drill "${drillName}" has lacrosse lab content!`)
                
                // Verify iframe setup
                const sandbox = await iframe.getAttribute('sandbox')
                console.log('Sandbox attributes:', sandbox)
                
                expect(sandbox).toContain('allow-scripts')
                expect(sandbox).toContain('allow-pointer-lock')
                
                // Take screenshot
                await page.screenshot({ 
                  path: `test-results/lacrosse-lab-${drillName.replace(/\s+/g, '-')}.png`,
                  fullPage: false
                })
                
                break // Found a drill with content, exit loop
              }
            }
          }
        }
      }
    }
  })
})