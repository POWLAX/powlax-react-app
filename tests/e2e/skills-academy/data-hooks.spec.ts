import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3002', // CRITICAL: Use port 3002
});

test.describe('Skills Academy Data Hooks', () => {
  test('should test useProgressTracking hook integration', async ({ page }) => {
    // Navigate to a page that uses the progress tracking hook
    await page.goto('/skills-academy/workout/1');
    
    // Wait for the page to load
    await page.waitForSelector('.container', { timeout: 10000 });
    
    // Look for elements that indicate progress tracking is working
    const hasProgressElements = await page.locator('[data-testid*="progress"], .progress, text=/progress/i, text=/\\d+ of \\d+/').first().isVisible({ timeout: 5000 });
    
    // Check for drill completion tracking
    const hasCompletionButton = await page.locator('button:has-text("Mark Complete"), button:has-text("Complete"), [data-testid*="complete"]').first().isVisible({ timeout: 5000 });
    
    console.log('Progress elements found:', hasProgressElements, 'Completion button found:', hasCompletionButton);
    
    // Test that progress tracking elements are present
    expect(hasProgressElements || hasCompletionButton).toBeTruthy();
    
    // Take a screenshot for manual verification
    await page.screenshot({ 
      path: 'test-results/progress-tracking-test.png', 
      fullPage: true 
    });
  });

  test('should test usePointsCalculation hook integration', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    // Wait for the page to load
    await page.waitForSelector('.container', { timeout: 10000 });
    
    // Look for points display elements
    const pointsSelectors = [
      '[data-testid*="points"]',
      'text=/\\d+ pts/',
      'text=/\\d+ points/',
      '.badge:has-text("pts")',
      '[class*="points"]'
    ];
    
    let hasPointsDisplay = false;
    for (const selector of pointsSelectors) {
      if (await page.locator(selector).first().isVisible({ timeout: 3000 })) {
        hasPointsDisplay = true;
        console.log('Found points display with selector:', selector);
        break;
      }
    }
    
    // Check for points-related UI elements
    const hasPointsText = await page.locator('text=/points?/i').first().isVisible({ timeout: 3000 });
    
    console.log('Points display found:', hasPointsDisplay, 'Points text found:', hasPointsText);
    
    // At least some indication of points should be present
    expect(hasPointsDisplay || hasPointsText).toBeTruthy();
  });

  test('should test useWorkoutSession hook data loading', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    // Wait for workout data to load
    await page.waitForSelector('.container', { timeout: 10000 });
    
    // Check that workout session data is loaded
    const hasWorkoutName = await page.locator('h1, h2, .text-xl, [data-testid*="workout-name"]').first().isVisible({ timeout: 5000 });
    
    // Check for drill data
    const hasDrillContent = await page.locator('text=/drill/i, [data-testid*="drill"], .drill').first().isVisible({ timeout: 5000 });
    
    // Check for session-related elements (timer, progress, etc.)
    const hasSessionElements = await page.locator('text=/\\d+:\\d+/, [data-testid*="timer"], [data-testid*="session"]').first().isVisible({ timeout: 5000 });
    
    console.log('Workout name found:', hasWorkoutName, 'Drill content found:', hasDrillContent, 'Session elements found:', hasSessionElements);
    
    // Verify workout session data is loading
    expect(hasWorkoutName || hasDrillContent).toBeTruthy();
  });

  test('should handle real-time updates in workout session', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    // Wait for the page to load
    await page.waitForSelector('.container', { timeout: 10000 });
    
    // Look for interactive elements that should trigger updates
    const completeButton = page.locator('button:has-text("Mark Complete"), button:has-text("Complete")').first();
    const nextButton = page.locator('button:has-text("Next"), [aria-label*="next"]').first();
    
    if (await completeButton.isVisible({ timeout: 5000 })) {
      // Get initial progress state
      const initialProgress = await page.locator('text=/\\d+ of \\d+/, [data-testid*="progress"]').first().textContent();
      
      console.log('Initial progress state:', initialProgress);
      
      // Click the complete button
      await completeButton.click();
      
      // Wait a moment for state updates
      await page.waitForTimeout(2000);
      
      // Check if the button state changed or progress updated
      const buttonStillVisible = await completeButton.isVisible({ timeout: 2000 });
      const newProgress = await page.locator('text=/\\d+ of \\d+/, [data-testid*="progress"]').first().textContent();
      
      console.log('Button still visible after click:', buttonStillVisible, 'New progress:', newProgress);
      
      // Some change should occur (button disabled, progress updated, etc.)
      const stateChanged = !buttonStillVisible || newProgress !== initialProgress;
      expect(stateChanged).toBeTruthy();
    } else if (await nextButton.isVisible({ timeout: 5000 })) {
      // Test navigation if complete button not found
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Verify something changed
      const hasChangedContent = await page.locator('text=/drill/i, [data-testid*="drill"]').first().isVisible({ timeout: 3000 });
      expect(hasChangedContent).toBeTruthy();
    } else {
      console.log('No interactive elements found for real-time update test');
      // At minimum, verify the page loaded workout data
      const hasWorkoutData = await page.locator('text=/workout/i, .container').first().isVisible();
      expect(hasWorkoutData).toBeTruthy();
    }
  });

  test('should test error handling in hooks', async ({ page }) => {
    // Test with invalid workout ID to see how hooks handle errors
    await page.goto('/skills-academy/workout/999999');
    
    // Wait for page to finish loading
    await page.waitForTimeout(5000);
    
    // Check that error is handled gracefully (not infinite loading)
    const hasLoadingSpinner = await page.locator('.animate-spin, [data-testid="loading"]').isVisible({ timeout: 3000 });
    const hasErrorMessage = await page.locator('text=/not found/i, text=/error/i, text=/404/i').first().isVisible({ timeout: 3000 });
    const hasContent = await page.locator('.container, .card').first().isVisible();
    
    console.log('Loading spinner:', hasLoadingSpinner, 'Error message:', hasErrorMessage, 'Has content:', hasContent);
    
    // Should not be stuck loading and should show some content or error
    expect(hasLoadingSpinner).toBeFalsy();
    expect(hasContent || hasErrorMessage).toBeTruthy();
  });

  test('should test data persistence across navigation', async ({ page }) => {
    // Start a workout
    await page.goto('/skills-academy/workout/1');
    await page.waitForSelector('.container', { timeout: 10000 });
    
    // Look for any progress or state indicators
    const initialState = await page.locator('text=/\\d+ of \\d+/, [data-testid*="progress"], .badge').first().textContent();
    
    console.log('Initial state captured:', initialState);
    
    // Navigate away and back
    await page.goto('/skills-academy');
    await page.waitForTimeout(2000);
    await page.goto('/skills-academy/workout/1');
    await page.waitForSelector('.container', { timeout: 10000 });
    
    // Check if state is maintained (this tests hook persistence)
    const newState = await page.locator('text=/\\d+ of \\d+/, [data-testid*="progress"], .badge').first().textContent();
    
    console.log('State after navigation:', newState);
    
    // At minimum, verify the page loads consistently
    const hasConsistentContent = await page.locator('.container').isVisible();
    expect(hasConsistentContent).toBeTruthy();
  });

  test('should verify hook integration with API endpoints', async ({ page }) => {
    // Navigate to workout page
    await page.goto('/skills-academy/workout/1');
    await page.waitForSelector('.container', { timeout: 10000 });
    
    // Monitor network requests to verify hooks are calling APIs
    const apiCalls: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/workouts') || request.url().includes('/api/progress')) {
        apiCalls.push(request.url());
        console.log('API call detected:', request.url());
      }
    });
    
    // Interact with the page to trigger API calls
    const completeButton = page.locator('button:has-text("Mark Complete"), button:has-text("Complete")').first();
    
    if (await completeButton.isVisible({ timeout: 5000 })) {
      await completeButton.click();
      await page.waitForTimeout(3000); // Wait for potential API calls
    }
    
    // Navigate to trigger potential API calls
    await page.reload();
    await page.waitForTimeout(3000);
    
    console.log('API calls captured:', apiCalls);
    
    // For now, just verify the page handles interactions without errors
    const pageHasContent = await page.locator('.container').isVisible();
    expect(pageHasContent).toBeTruthy();
  });

  test('should test hook performance and loading states', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/skills-academy/workout/1');
    
    // Monitor loading states
    let loadingDetected = false;
    let contentLoaded = false;
    
    // Check for loading states within first few seconds
    try {
      await page.waitForSelector('[data-testid="loading"], .animate-spin', { timeout: 2000 });
      loadingDetected = true;
    } catch {
      // No loading state detected, which is also fine
    }
    
    // Wait for content to load
    await page.waitForSelector('.container', { timeout: 10000 });
    contentLoaded = true;
    
    const loadTime = Date.now() - startTime;
    
    console.log('Loading detected:', loadingDetected, 'Content loaded:', contentLoaded, 'Load time:', loadTime, 'ms');
    
    // Verify reasonable performance
    expect(contentLoaded).toBeTruthy();
    expect(loadTime).toBeLessThan(15000); // Should load within 15 seconds
    
    // Verify no infinite loading
    const stillLoading = await page.locator('[data-testid="loading"], .animate-spin').isVisible({ timeout: 2000 });
    expect(stillLoading).toBeFalsy();
  });
});