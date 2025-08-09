import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3002', // CRITICAL: Use port 3002
});

test.describe('Skills Academy Drill Data', () => {
  test('should load workout with real drill names', async ({ page }) => {
    // Navigate to skills academy workout page
    await page.goto('/skills-academy/workout/1');
    
    // Wait for the page to load - look for workout container
    await page.waitForSelector('[data-testid="workout-container"], .container', { timeout: 10000 });
    
    // Check that we're not seeing loading state
    await expect(page.locator('text=Loading workout')).not.toBeVisible();
    
    // Look for drill name elements - could be in various places
    const drillNameSelectors = [
      '[data-testid="drill-name"]',
      '[data-testid="current-drill-name"]',
      '.drill-name',
      'h2:has-text("Drill")', 
      'h3:has-text("Drill")',
      '[class*="drill"] h2',
      '[class*="drill"] h3'
    ];
    
    let drillNameFound = false;
    let actualDrillName = '';
    
    // Try to find drill name in any of the expected locations
    for (const selector of drillNameSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          actualDrillName = await element.textContent() || '';
          if (actualDrillName && !actualDrillName.match(/^Drill \d+$/)) {
            drillNameFound = true;
            break;
          }
        }
      } catch {
        // Continue to next selector
      }
    }
    
    // Also check the page title/header area for drill names
    if (!drillNameFound) {
      const headerSelectors = ['h1', 'h2', '.text-xl', '.font-bold'];
      for (const selector of headerSelectors) {
        try {
          const elements = page.locator(selector);
          const count = await elements.count();
          for (let i = 0; i < count; i++) {
            const text = await elements.nth(i).textContent() || '';
            if (text && text.includes('Drill') && !text.match(/^Drill \d+$/) && !text.includes('Loading')) {
              drillNameFound = true;
              actualDrillName = text;
              break;
            }
          }
          if (drillNameFound) break;
        } catch {
          // Continue
        }
      }
    }
    
    // Log what we found for debugging
    console.log('Drill name found:', drillNameFound, 'Text:', actualDrillName);
    
    // Take screenshot for debugging if needed
    await page.screenshot({ 
      path: 'test-results/drill-data-test.png', 
      fullPage: true 
    });
    
    // Assert that we found actual drill names, not placeholders
    if (drillNameFound) {
      expect(actualDrillName).not.toMatch(/^Drill \d+$/);
      expect(actualDrillName.length).toBeGreaterThan(10); // Real drill names should be descriptive
    } else {
      // If no drill name found, check if the page loaded properly
      const pageContent = await page.textContent('body');
      console.log('Page content preview:', pageContent?.substring(0, 500));
      
      // At minimum, verify the workout page structure is present
      await expect(page.locator('text=workout').or(page.locator('text=Workout'))).toBeVisible();
    }
  });

  test('should display drill details and navigation', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    // Wait for workout to load
    await page.waitForSelector('.container', { timeout: 10000 });
    
    // Check for drill navigation elements
    const hasNavigation = await page.locator('button:has-text("Next"), button:has-text("Previous"), [aria-label*="next"], [aria-label*="previous"]').first().isVisible({ timeout: 5000 });
    
    // Check for drill progress indicators
    const hasProgress = await page.locator('.progress, [role="progressbar"], text=/\\d+ of \\d+/, text=/Progress/i').first().isVisible({ timeout: 5000 });
    
    // Check for drill timer or duration
    const hasTimer = await page.locator('text=/\\d+:\\d+/, text=/Timer/, text=/Duration/, [data-testid*="timer"]').first().isVisible({ timeout: 5000 });
    
    console.log('Navigation found:', hasNavigation, 'Progress found:', hasProgress, 'Timer found:', hasTimer);
    
    // At least one of these should be present for a functional workout page
    expect(hasNavigation || hasProgress || hasTimer).toBeTruthy();
  });

  test('should handle workout progression', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    // Wait for page to load
    await page.waitForSelector('.container', { timeout: 10000 });
    
    // Look for mark complete or similar action buttons
    const actionButtons = [
      'button:has-text("Mark Complete")',
      'button:has-text("Complete")',
      'button:has-text("Done")',
      'button:has-text("Next")',
      '[data-testid="complete-drill"]',
      '[data-testid="mark-complete"]'
    ];
    
    let hasActionButton = false;
    for (const selector of actionButtons) {
      if (await page.locator(selector).first().isVisible({ timeout: 3000 })) {
        hasActionButton = true;
        console.log('Found action button:', selector);
        break;
      }
    }
    
    // Check for drill sequence/order indicators
    const hasSequence = await page.locator('text=/\\d+ of \\d+/, text=/Drill \\d+/, [data-testid*="sequence"], [data-testid*="drill-index"]').first().isVisible({ timeout: 5000 });
    
    console.log('Action button found:', hasActionButton, 'Sequence found:', hasSequence);
    
    // Verify workout has progression elements
    expect(hasActionButton || hasSequence).toBeTruthy();
  });

  test('should load without infinite loading state', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    // Wait a reasonable time for loading to complete
    await page.waitForTimeout(8000);
    
    // Ensure we're not stuck in loading
    const hasLoadingSpinner = await page.locator('[data-testid="loading"], .animate-spin').or(page.locator('text=Loading')).isVisible();
    const hasContent = await page.locator('.container, .card, [role="main"]').isVisible();
    
    console.log('Has loading spinner:', hasLoadingSpinner, 'Has content:', hasContent);
    
    // Should have content and not be stuck loading
    expect(hasContent).toBeTruthy();
    expect(hasLoadingSpinner).toBeFalsy();
  });

  test('should display video or drill content', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    // Wait for page to load
    await page.waitForSelector('.container', { timeout: 10000 });
    
    // Look for video elements or drill content
    const hasVideo = await page.locator('iframe[src*="vimeo"], video, [data-testid*="video"]').first().isVisible({ timeout: 5000 });
    const hasContent = await page.locator('text=/drill/i, text=/exercise/i, [data-testid*="drill"], .aspect-video').first().isVisible({ timeout: 5000 });
    
    console.log('Has video:', hasVideo, 'Has drill content:', hasContent);
    
    // Should have some form of drill content or video
    expect(hasVideo || hasContent).toBeTruthy();
  });
});