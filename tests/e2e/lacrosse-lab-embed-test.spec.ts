import { test, expect } from '@playwright/test'

test.describe('Lacrosse Lab Embed Interaction', () => {
  test('should allow interaction with lacrosse lab iframe in Study Drill modal', async ({ page }) => {
    // Navigate to practice planner
    await page.goto('/teams/test-team/practice-plans')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Close any welcome modal if present
    const welcomeModal = page.locator('text="Welcome to POWLAX!"')
    if (await welcomeModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.locator('text="Skip for now"').click()
      await page.waitForTimeout(500)
    }
    
    // Wait for drill library to load
    await page.waitForSelector('text="Drill Library"', { timeout: 10000 })
    
    // Find and click on a drill with lacrosse lab content
    // First, let's look for a drill card with a Study button
    const drillCard = page.locator('.bg-white').filter({ hasText: /1v1 Ground Balls|2v1 Ground Ball|Ground Ball/ }).first()
    
    if (await drillCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click the Study button on the drill card
      const studyButton = drillCard.locator('button').filter({ hasText: 'Study' }).first()
      await studyButton.click()
      
      // Wait for Study modal to open
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
      
      // Click on Diagram tab if available
      const diagramTab = page.locator('button[role="tab"]').filter({ hasText: 'Diagram' })
      if (await diagramTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await diagramTab.click()
        
        // Wait for iframe to load
        await page.waitForTimeout(2000)
        
        // Try to interact with the iframe
        const iframe = page.frameLocator('iframe[title*="Diagram"]').first()
        
        // Check if iframe is loaded
        const iframeElement = page.locator('iframe[title*="Diagram"]').first()
        await expect(iframeElement).toBeVisible()
        
        // Get iframe attributes for debugging
        const iframeSrc = await iframeElement.getAttribute('src')
        const iframeAllow = await iframeElement.getAttribute('allow')
        const iframeStyle = await iframeElement.getAttribute('style')
        
        console.log('Iframe src:', iframeSrc)
        console.log('Iframe allow:', iframeAllow)
        console.log('Iframe style:', iframeStyle)
        
        // Try to click play button inside iframe
        try {
          // Wait for content inside iframe
          await iframe.locator('body').waitFor({ timeout: 5000 })
          
          // Look for play button or interactive elements
          const playButton = iframe.locator('button, [role="button"], .play-button, [class*="play"]').first()
          
          if (await playButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await playButton.click()
            console.log('Successfully clicked play button in iframe')
            
            // Verify something changed after clicking
            await page.waitForTimeout(1000)
            
            // Take screenshot for debugging
            await page.screenshot({ path: 'test-results/lacrosse-lab-interaction.png', fullPage: false })
          } else {
            console.log('No play button found in iframe')
            
            // Try to click anywhere in the iframe as a test
            const iframeBody = iframe.locator('body')
            await iframeBody.click({ position: { x: 100, y: 100 } })
            console.log('Clicked in iframe body')
          }
        } catch (error) {
          console.error('Error interacting with iframe:', error)
          
          // Take screenshot of the current state
          await page.screenshot({ path: 'test-results/lacrosse-lab-error.png', fullPage: false })
          
          // Check if it's a cross-origin issue
          const iframeElement = page.locator('iframe[title*="Diagram"]').first()
          const src = await iframeElement.getAttribute('src')
          
          if (src && !src.startsWith(page.url().split('/').slice(0, 3).join('/'))) {
            console.log('Cross-origin iframe detected. Src:', src)
            console.log('Page origin:', page.url().split('/').slice(0, 3).join('/'))
            
            // For cross-origin iframes, we can't directly interact with the content
            // We need to ensure the iframe has proper sandbox and allow attributes
            throw new Error('Cross-origin iframe - cannot directly interact with content. Need proper sandbox/allow attributes.')
          }
        }
      } else {
        console.log('No Diagram tab found')
      }
    } else {
      // If no drill with lab content, add one to test
      console.log('No drill cards found, checking if we can add a drill first')
      
      // Look for Add button in drill library
      const addButton = page.locator('button').filter({ hasText: '+' }).first()
      if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addButton.click()
        await page.waitForTimeout(500)
        
        // Now look for Study button on the added drill
        const timelineCard = page.locator('.bg-white').filter({ hasText: 'Study' }).first()
        if (await timelineCard.isVisible({ timeout: 2000 }).catch(() => false)) {
          const studyBtn = timelineCard.locator('button').filter({ hasText: 'Study' })
          await studyBtn.click()
          
          // Check for Diagram tab
          const diagramTab = page.locator('button[role="tab"]').filter({ hasText: 'Diagram' })
          if (await diagramTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await diagramTab.click()
            await page.waitForTimeout(2000)
            
            // Try iframe interaction again
            const iframe = page.frameLocator('iframe[title*="Diagram"]').first()
            const iframeBody = iframe.locator('body')
            await iframeBody.click({ position: { x: 100, y: 100 } })
            console.log('Clicked in iframe after adding drill')
          }
        }
      }
    }
  })
  
  test('should check iframe sandbox and allow attributes', async ({ page }) => {
    // This test specifically checks the iframe attributes
    await page.goto('/teams/test-team/practice-plans')
    await page.waitForLoadState('networkidle')
    
    // Close welcome modal if present
    const welcomeModal = page.locator('text="Welcome to POWLAX!"')
    if (await welcomeModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.locator('text="Skip for now"').click()
    }
    
    // Open any drill's Study modal
    await page.waitForSelector('.bg-white', { timeout: 10000 })
    const studyButton = page.locator('button').filter({ hasText: 'Study' }).first()
    
    if (await studyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await studyButton.click()
      await page.waitForSelector('[role="dialog"]')
      
      // Check for Diagram tab
      const diagramTab = page.locator('button[role="tab"]').filter({ hasText: 'Diagram' })
      if (await diagramTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await diagramTab.click()
        await page.waitForTimeout(1000)
        
        // Check iframe attributes
        const iframe = page.locator('iframe[title*="Diagram"]').first()
        if (await iframe.isVisible({ timeout: 2000 }).catch(() => false)) {
          const attributes = {
            src: await iframe.getAttribute('src'),
            allow: await iframe.getAttribute('allow'),
            sandbox: await iframe.getAttribute('sandbox'),
            style: await iframe.getAttribute('style'),
            allowfullscreen: await iframe.getAttribute('allowfullscreen')
          }
          
          console.log('Iframe attributes:', attributes)
          
          // Check if sandbox attribute is blocking interaction
          if (attributes.sandbox) {
            expect(attributes.sandbox).toContain('allow-scripts')
            expect(attributes.sandbox).toContain('allow-same-origin')
            console.log('Sandbox attribute found:', attributes.sandbox)
          }
          
          // Check allow attribute
          if (attributes.allow) {
            expect(attributes.allow).toContain('fullscreen')
            console.log('Allow attribute found:', attributes.allow)
          }
          
          // Check style for pointer-events
          if (attributes.style) {
            expect(attributes.style).toContain('pointer-events')
            console.log('Style attribute found:', attributes.style)
          }
        }
      }
    }
  })
})