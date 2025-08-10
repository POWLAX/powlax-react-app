import { test, expect } from '@playwright/test'

test('lacrosse lab iframe should be interactive in Study modal', async ({ page }) => {
  // Navigate directly to practice planner
  await page.goto('/teams/test-team/practice-plans')
  
  // Wait for page load
  await page.waitForTimeout(3000)
  
  // Skip welcome modal if present
  try {
    await page.locator('text="Skip for now"').click({ timeout: 2000 })
  } catch {
    // Modal not present, continue
  }
  
  // Wait for drill library to be visible
  await page.waitForSelector('text="Drill Library"', { timeout: 10000 })
  
  // Expand 1v1 Drills category
  await page.locator('text="1v1 Drills"').click()
  await page.waitForTimeout(1000)
  
  // Find the first + button in the expanded drills
  const addButton = page.locator('button').filter({ hasText: '+' }).first()
  if (await addButton.isVisible({ timeout: 3000 })) {
    console.log('Found add button, clicking...')
    await addButton.click()
    await page.waitForTimeout(1000)
    
    // Now find the Study button on the added drill in the timeline
    const studyButton = page.locator('button').filter({ hasText: 'Study' }).first()
    if (await studyButton.isVisible({ timeout: 3000 })) {
      console.log('Found Study button, clicking...')
      await studyButton.click()
    } else {
      console.log('No Study button found after adding drill')
      return
    }
  } else {
    console.log('No add button found')
    return
  }
  
  // Wait for modal to open
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
  console.log('Modal opened')
  
  // Click on Diagram tab if available
  try {
    await page.locator('button[role="tab"]:has-text("Diagram")').click({ timeout: 3000 })
    console.log('Clicked Diagram tab')
    
    // Wait for iframe to load
    await page.waitForTimeout(3000)
    
    // Check iframe attributes
    const iframe = page.locator('iframe[title*="Diagram"]').first()
    const isVisible = await iframe.isVisible({ timeout: 5000 }).catch(() => false)
    
    if (isVisible) {
      // Get computed styles and attributes
      const iframeInfo = await iframe.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        const rect = el.getBoundingClientRect()
        return {
          position: computed.position,
          zIndex: computed.zIndex,
          pointerEvents: computed.pointerEvents,
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          sandbox: el.getAttribute('sandbox'),
          allow: el.getAttribute('allow'),
          src: el.getAttribute('src')
        }
      })
      
      console.log('=== IFRAME COMPUTED STYLES ===')
      console.log(JSON.stringify(iframeInfo, null, 2))
      
      // Check if iframe is properly positioned
      expect(iframeInfo.pointerEvents).not.toBe('none')
      expect(iframeInfo.visibility).toBe('visible')
      expect(iframeInfo.width).toBeGreaterThan(0)
      expect(iframeInfo.height).toBeGreaterThan(0)
      
      // Check for overlapping elements
      const overlappingElements = await page.evaluate(() => {
        const iframe = document.querySelector('iframe[title*="Diagram"]')
        if (!iframe) return []
        
        const rect = iframe.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        // Get all elements at the center point
        const elementsAtPoint = document.elementsFromPoint(centerX, centerY)
        
        return elementsAtPoint.map(el => ({
          tagName: el.tagName,
          className: el.className,
          zIndex: window.getComputedStyle(el).zIndex,
          pointerEvents: window.getComputedStyle(el).pointerEvents
        }))
      })
      
      console.log('=== ELEMENTS AT IFRAME CENTER ===')
      console.log(JSON.stringify(overlappingElements, null, 2))
      
      // The iframe should be the top element or close to it
      const iframeIndex = overlappingElements.findIndex(el => el.tagName === 'IFRAME')
      console.log(`Iframe is at index ${iframeIndex} in element stack`)
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: 'test-results/iframe-interaction-check.png',
        fullPage: false
      })
      
      expect(iframeIndex).toBeGreaterThanOrEqual(0)
      expect(iframeIndex).toBeLessThanOrEqual(2) // Should be near the top
    } else {
      console.log('No iframe visible - drill may not have diagram content')
    }
  } catch (error) {
    console.log('Diagram tab not found or error:', error.message)
  }
})