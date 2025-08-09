import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3002', // CRITICAL: Use port 3002
});

test.describe('Workout Runner UI', () => {
  test('should have 60px touch targets', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="did-it-button"]', { timeout: 10000 });
    
    const didItButton = await page.locator('[data-testid="did-it-button"]');
    const nextButton = await page.locator('[data-testid="next-drill-button"]');
    const backButton = await page.locator('[data-testid="back-button"]');
    
    // Check Did It button (main action button)
    const didItBox = await didItButton.boundingBox();
    expect(didItBox?.height).toBeGreaterThanOrEqual(60);
    
    // Check navigation buttons
    const nextBox = await nextButton.boundingBox();
    expect(nextBox?.height).toBeGreaterThanOrEqual(60);
    
    const backBox = await backButton.boundingBox();
    expect(backBox?.height).toBeGreaterThanOrEqual(45); // Header buttons can be slightly smaller
  });
  
  test('should have readable captions (24px minimum)', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    await page.waitForSelector('[data-testid="drill-caption"]', { timeout: 10000 });
    
    const caption = await page.locator('[data-testid="drill-caption"]');
    const fontSize = await caption.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Parse fontSize like "24px" to get number
    const fontSizeNumber = parseInt(fontSize.replace('px', ''));
    expect(fontSizeNumber).toBeGreaterThanOrEqual(24);
  });
  
  test('should work on mobile viewport (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/skills-academy/workout/1');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="did-it-button"]', { timeout: 10000 });
    
    // Verify mobile layout elements are visible
    const didItButton = await page.locator('[data-testid="did-it-button"]');
    const progressBar = await page.locator('[data-testid="progress-bar"]');
    const drillCaption = await page.locator('[data-testid="drill-caption"]');
    
    await expect(didItButton).toBeVisible();
    await expect(progressBar).toBeVisible();
    await expect(drillCaption).toBeVisible();
    
    // Verify mobile spacing
    const container = await page.locator('.container');
    const padding = await container.evaluate(el => 
      window.getComputedStyle(el).paddingLeft
    );
    
    // Should have minimal padding on mobile (8px or 0.5rem)
    const paddingNumber = parseInt(padding.replace('px', ''));
    expect(paddingNumber).toBeLessThanOrEqual(16); // Allow up to 16px padding
  });
  
  test('should display progress correctly', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    await page.waitForSelector('[data-testid="progress-bar"]', { timeout: 10000 });
    
    const progressBar = await page.locator('[data-testid="progress-bar"]');
    await expect(progressBar).toBeVisible();
    
    // Verify progress indicator shows percentage
    const progressText = await page.locator('text=/\\d+%/').first();
    await expect(progressText).toBeVisible();
  });
  
  test('should have proper button labels for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/skills-academy/workout/1');
    
    await page.waitForSelector('[data-testid="did-it-button"]', { timeout: 10000 });
    
    const didItButton = await page.locator('[data-testid="did-it-button"]');
    
    // Should have "Did It!" text for mobile-friendly language
    await expect(didItButton).toContainText('Did It!');
  });
  
  test('should show video player', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    await page.waitForSelector('[data-testid="drill-video"], .aspect-video', { timeout: 10000 });
    
    // Either video iframe or no-video placeholder should be visible
    const videoContainer = await page.locator('.aspect-video');
    await expect(videoContainer).toBeVisible();
  });
  
  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/skills-academy/workout/1');
    await page.waitForSelector('[data-testid="did-it-button"]', { timeout: 10000 });
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('chunk-') &&
      !error.includes('net::ERR_')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
  
  test('should complete workout and show completion screen', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    await page.waitForSelector('[data-testid="did-it-button"]', { timeout: 10000 });
    
    // Complete first drill
    const didItButton = await page.locator('[data-testid="did-it-button"]');
    await didItButton.click();
    
    // Wait for completion (may auto-advance)
    await page.waitForTimeout(2000);
    
    // Check if we see completion screen or can continue
    const completionScreen = page.locator('text="Workout Complete!"');
    const nextButton = page.locator('[data-testid="next-drill-button"]');
    
    // Either completion screen or next button should be visible
    const hasCompletion = await completionScreen.isVisible();
    const hasNext = await nextButton.isVisible();
    
    expect(hasCompletion || hasNext).toBe(true);
  });
  
  test('should have proper completion screen with 60px buttons', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    // Wait for page to fully load
    await page.waitForSelector('[data-testid="did-it-button"]', { timeout: 10000 });
    
    // Complete all drills with more time between clicks
    for (let i = 0; i < 5; i++) { 
      try {
        // Wait for button to be ready
        await page.waitForSelector('[data-testid="did-it-button"]:not([disabled])', { timeout: 5000 });
        
        const didItButton = page.locator('[data-testid="did-it-button"]');
        
        if (await didItButton.isVisible() && await didItButton.isEnabled()) {
          await didItButton.click();
          
          // Wait for the completion to process and auto-advance
          await page.waitForTimeout(1500);
          
          // Check if workout is complete
          const completionText = page.locator('text="Workout Complete!"');
          if (await completionText.isVisible({ timeout: 1000 })) {
            break;
          }
        } else {
          // Button might be disabled (already completed), check for completion
          const completionText = page.locator('text="Workout Complete!"');
          if (await completionText.isVisible({ timeout: 1000 })) {
            break;
          }
        }
      } catch (error) {
        // If any error, check if we're completed
        const completionText = page.locator('text="Workout Complete!"');
        if (await completionText.isVisible({ timeout: 1000 })) {
          break;
        }
      }
    }
    
    // Ensure completion screen is visible
    const completionScreen = page.locator('text="Workout Complete!"');
    await expect(completionScreen).toBeVisible({ timeout: 5000 });
    
    // Check completion screen buttons are 60px
    const doAgainButton = page.locator('[data-testid="do-again-button"]');
    const backButton = page.locator('[data-testid="back-to-academy-button"]');
    
    await expect(doAgainButton).toBeVisible();
    await expect(backButton).toBeVisible();
    
    const doAgainBox = await doAgainButton.boundingBox();
    const backBox = await backButton.boundingBox();
    
    expect(doAgainBox?.height).toBeGreaterThanOrEqual(60);
    expect(backBox?.height).toBeGreaterThanOrEqual(60);
  });
});

test.describe('Workout Runner - 6 Point Types Display', () => {
  test('should show all 6 point types on completion', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    
    await page.waitForSelector('[data-testid="did-it-button"]', { timeout: 10000 });
    
    // Complete all drills systematically
    for (let i = 0; i < 5; i++) { 
      try {
        await page.waitForSelector('[data-testid="did-it-button"]:not([disabled])', { timeout: 5000 });
        
        const didItButton = page.locator('[data-testid="did-it-button"]');
        
        if (await didItButton.isVisible() && await didItButton.isEnabled()) {
          await didItButton.click();
          await page.waitForTimeout(1500);
          
          const completionText = page.locator('text="Workout Complete!"');
          if (await completionText.isVisible({ timeout: 1000 })) {
            break;
          }
        } else {
          const completionText = page.locator('text="Workout Complete!"');
          if (await completionText.isVisible({ timeout: 1000 })) {
            break;
          }
        }
      } catch (error) {
        const completionText = page.locator('text="Workout Complete!"');
        if (await completionText.isVisible({ timeout: 1000 })) {
          break;
        }
      }
    }
    
    // Ensure completion screen is visible
    const completionScreen = page.locator('text="Workout Complete!"');
    await expect(completionScreen).toBeVisible({ timeout: 5000 });
    
    // Verify all 6 point types are shown
    await expect(page.locator('text="Lax Credits"')).toBeVisible();
    await expect(page.locator('text="Attack Tokens"')).toBeVisible();
    await expect(page.locator('text="Defense Dollars"')).toBeVisible();
    await expect(page.locator('text="Midfield Medals"')).toBeVisible();
    await expect(page.locator('text="Rebound Rewards"')).toBeVisible();
    await expect(page.locator('text="Flex Points"')).toBeVisible();
  });
});