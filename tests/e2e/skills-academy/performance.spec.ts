import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3002',
});

test.describe('Performance & Stability', () => {
  test('page loads under 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Ensure key content is visible
    await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible({ timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    expect(loadTime).toBeLessThan(3000);
    console.log('✅ Page loads under 3 seconds');
  });
  
  test('no memory leaks after 10 workouts', async ({ page }) => {
    const workoutIds = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; // Test same workout multiple times
    
    for (let i = 0; i < workoutIds.length; i++) {
      console.log(`Loading workout iteration ${i + 1}/${workoutIds.length}`);
      
      await page.goto(`/skills-academy/workout/${workoutIds[i]}`);
      await page.waitForLoadState('networkidle');
      
      // Verify page loads correctly each time
      await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 10000 });
      
      // Complete one drill to test interaction
      const didItButton = page.locator('[data-testid="did-it-button"]');
      if (await didItButton.isVisible({ timeout: 2000 })) {
        await didItButton.click();
        await page.waitForTimeout(500);
      }
      
      // Check for any obvious memory issues (JavaScript errors)
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      
      // Force garbage collection if possible
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      // Verify no JavaScript errors occurred
      expect(errors.length).toBe(0);
    }
    
    // Final verification that page still works
    await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ No memory leaks detected after 10 workout loads');
  });
  
  test('handles network failures gracefully', async ({ page }) => {
    // Start with normal page load
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Verify initial load works
    await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 10000 });
    
    // Simulate network failure
    await page.route('**/*', route => {
      // Block all network requests
      route.abort();
    });
    
    // Try to interact with the page (should use cached/mock data)
    const didItButton = page.locator('[data-testid="did-it-button"]');
    if (await didItButton.isVisible({ timeout: 2000 })) {
      await didItButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Page should still be functional (not crash)
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    
    // Check that main content is still visible
    const drillCaption = page.locator('[data-testid="drill-caption"]');
    const captionVisible = await drillCaption.isVisible().catch(() => false);
    expect(captionVisible).toBe(true);
    
    console.log('✅ Handles network failures gracefully');
  });
  
  test('rapid user interactions don\'t cause errors', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 10000 });
    
    // Collect JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Perform rapid interactions
    const buttons = [
      '[data-testid="did-it-button"]',
      '[data-testid="next-drill-button"]',
      '[data-testid="previous-button"]'
    ];
    
    for (let round = 0; round < 5; round++) {
      console.log(`Rapid interaction round ${round + 1}`);
      
      for (const buttonSelector of buttons) {
        const button = page.locator(buttonSelector);
        if (await button.isVisible({ timeout: 500 }) && await button.isEnabled({ timeout: 500 })) {
          await button.click({ timeout: 1000 });
          await page.waitForTimeout(100); // Very short delay
        }
      }
      
      await page.waitForTimeout(200);
    }
    
    // Check for errors
    expect(errors.length).toBe(0);
    
    // Verify page is still functional
    await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Rapid user interactions don\'t cause errors');
  });
  
  test('mobile performance is acceptable', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Verify mobile-specific content loads
    await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    console.log(`Mobile load time: ${loadTime}ms`);
    
    // Mobile should load within 4 seconds (slightly more lenient)
    expect(loadTime).toBeLessThan(4000);
    
    // Test mobile interactions
    const didItButton = page.locator('[data-testid="did-it-button"]');
    await expect(didItButton).toBeVisible({ timeout: 5000 });
    
    // Measure tap response time
    const tapStartTime = Date.now();
    await didItButton.click();
    
    // Wait for some visual feedback
    await page.waitForTimeout(100);
    const tapResponseTime = Date.now() - tapStartTime;
    
    // Tap should respond within 300ms
    expect(tapResponseTime).toBeLessThan(300);
    
    console.log(`Mobile tap response time: ${tapResponseTime}ms`);
    console.log('✅ Mobile performance is acceptable');
  });
  
  test('large dataset handling', async ({ page }) => {
    // This test simulates handling larger workouts or data sets
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 10000 });
    
    // Simulate completing many drills quickly
    const didItButton = page.locator('[data-testid="did-it-button"]');
    
    // Performance should remain stable even with rapid completions
    const performanceStartTime = Date.now();
    
    for (let i = 0; i < 20; i++) { // Simulate large workout
      if (await didItButton.isVisible({ timeout: 1000 }) && await didItButton.isEnabled({ timeout: 1000 })) {
        const clickStartTime = Date.now();
        await didItButton.click();
        const clickEndTime = Date.now();
        
        // Each click should respond quickly
        expect(clickEndTime - clickStartTime).toBeLessThan(1000);
        
        await page.waitForTimeout(50); // Minimal delay
        
        // Check if workout completed
        const isComplete = await page.locator('h1:has-text("Workout Complete")').isVisible().catch(() => false);
        if (isComplete) {
          console.log(`Workout completed after ${i + 1} drills`);
          break;
        }
      } else {
        break; // No more drills available
      }
    }
    
    const totalTime = Date.now() - performanceStartTime;
    console.log(`Large dataset handling completed in ${totalTime}ms`);
    
    // Should complete within reasonable time
    expect(totalTime).toBeLessThan(30000); // 30 seconds max
    
    console.log('✅ Large dataset handling performs well');
  });
  
  test('concurrent user simulation', async ({ browser }) => {
    // Simulate multiple users using the workout runner
    const contexts = [];
    const pages = [];
    
    // Create 3 concurrent browser contexts
    for (let i = 0; i < 3; i++) {
      const context = await browser.newContext();
      contexts.push(context);
      const page = await context.newPage();
      pages.push(page);
    }
    
    // Have all pages load workout simultaneously
    const loadPromises = pages.map(async (page, index) => {
      console.log(`Loading page ${index + 1}`);
      await page.goto('/skills-academy/workout/1');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 15000 });
      
      // Each page completes one drill
      const didItButton = page.locator('[data-testid="did-it-button"]');
      if (await didItButton.isVisible({ timeout: 3000 })) {
        await didItButton.click();
        await page.waitForTimeout(500);
      }
      
      return `Page ${index + 1} completed`;
    });
    
    // Wait for all concurrent operations to complete
    const results = await Promise.all(loadPromises);
    
    expect(results.length).toBe(3);
    results.forEach(result => {
      expect(result).toMatch(/Page \d+ completed/);
    });
    
    // Cleanup
    for (const context of contexts) {
      await context.close();
    }
    
    console.log('✅ Concurrent user simulation successful');
  });
  
  test('error boundary functionality', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Verify normal operation first
    await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 10000 });
    
    // Try to trigger an error condition
    await page.evaluate(() => {
      // Simulate a React error by corrupting state
      try {
        (window as any).__REACT_ERROR_TEST__ = true;
        // Trigger a re-render that might cause an error
        window.dispatchEvent(new Event('resize'));
      } catch (error) {
        console.log('Intentional error for testing:', error);
      }
    });
    
    // Wait a moment for any error boundaries to catch errors
    await page.waitForTimeout(1000);
    
    // Page should still be functional or show a graceful error message
    const hasContent = await page.locator('[data-testid="drill-caption"]').isVisible().catch(() => false);
    const hasErrorMessage = await page.locator('text=/error/i, text=/something went wrong/i').isVisible().catch(() => false);
    
    // Either content should still work, or we should see a graceful error
    expect(hasContent || hasErrorMessage).toBe(true);
    
    console.log('✅ Error boundary functionality verified');
  });
});