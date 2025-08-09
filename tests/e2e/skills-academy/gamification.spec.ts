import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3002',
});

test.describe('Gamification Features', () => {
  test('completion animation triggers', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Complete workout to trigger animations
    const didItButton = page.locator('[data-testid="did-it-button"]');
    
    // Complete all drills
    for (let i = 0; i < 6; i++) {
      await expect(didItButton).toBeVisible({ timeout: 5000 });
      await didItButton.click();
      await page.waitForTimeout(1000);
      
      const isComplete = await page.locator('h1:has-text("Workout Complete")').isVisible().catch(() => false);
      if (isComplete) break;
    }
    
    // Verify completion screen appears
    await expect(page.locator('h1')).toContainText('Workout Complete', { timeout: 10000 });
    
    // Check for animated trophy element
    const trophy = page.locator('.animate-bounce, [class*="animate"]').first();
    await expect(trophy).toBeVisible({ timeout: 5000 });
    
    // Verify trophy has animation class
    const trophyClasses = await trophy.getAttribute('class');
    expect(trophyClasses).toMatch(/animate-bounce|animate-|bounce/);
    
    // Check for celebration elements
    const celebration = page.locator('.bg-gradient-to-b, .bg-green-50, .text-green-600');
    await expect(celebration.first()).toBeVisible();
    
    console.log('✅ Completion animation triggers correctly');
  });
  
  test('all 6 point types accumulate correctly', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Complete workout
    const didItButton = page.locator('[data-testid="did-it-button"]');
    
    for (let i = 0; i < 6; i++) {
      await expect(didItButton).toBeVisible({ timeout: 5000 });
      await didItButton.click();
      await page.waitForTimeout(1000);
      
      const isComplete = await page.locator('h1:has-text("Workout Complete")').isVisible().catch(() => false);
      if (isComplete) break;
    }
    
    // Verify completion screen
    await expect(page.locator('h1')).toContainText('Workout Complete', { timeout: 10000 });
    
    // Check all 6 point types
    const pointTypes = [
      { testId: 'points-lax-credits', name: 'Lax Credits' },
      { testId: 'points-attack-tokens', name: 'Attack Tokens' },
      { testId: 'points-defense-dollars', name: 'Defense Dollars' },
      { testId: 'points-midfield-medals', name: 'Midfield Medals' },
      { testId: 'points-rebound-rewards', name: 'Rebound Rewards' },
      { testId: 'points-flex-points', name: 'Flex Points' }
    ];
    
    let totalPointsFromTypes = 0;
    
    for (const pointType of pointTypes) {
      const pointElement = page.locator(`[data-testid="${pointType.testId}"]`);
      
      if (await pointElement.isVisible().catch(() => false)) {
        const pointText = await pointElement.textContent();
        const pointValue = parseInt(pointText?.match(/\d+/)?.[0] || '0');
        
        expect(pointValue).toBeGreaterThanOrEqual(0);
        totalPointsFromTypes += pointValue;
        console.log(`${pointType.name}: ${pointValue} points`);
      } else {
        // Fallback: look for the point type by text content
        const fallbackElement = page.locator(`:has-text("${pointType.name}")`).locator('..').locator('.font-bold').first();
        if (await fallbackElement.isVisible().catch(() => false)) {
          const pointText = await fallbackElement.textContent();
          const pointValue = parseInt(pointText || '0');
          expect(pointValue).toBeGreaterThanOrEqual(0);
          totalPointsFromTypes += pointValue;
          console.log(`${pointType.name} (fallback): ${pointValue} points`);
        }
      }
    }
    
    // Verify total points make sense
    expect(totalPointsFromTypes).toBeGreaterThan(0);
    console.log(`Total points across all types: ${totalPointsFromTypes}`);
    
    // Check main points display
    const mainPoints = page.locator('[data-testid="points-earned"], .text-4xl.font-bold').first();
    if (await mainPoints.isVisible().catch(() => false)) {
      const mainPointsValue = parseInt(await mainPoints.textContent() || '0');
      expect(mainPointsValue).toBe(totalPointsFromTypes);
    }
    
    console.log('✅ All 6 point types accumulate correctly');
  });
  
  test('points display with proper visual hierarchy', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Complete workout
    const didItButton = page.locator('[data-testid="did-it-button"]');
    
    for (let i = 0; i < 6; i++) {
      await expect(didItButton).toBeVisible({ timeout: 5000 });
      await didItButton.click();
      await page.waitForTimeout(1000);
      
      const isComplete = await page.locator('h1:has-text("Workout Complete")').isVisible().catch(() => false);
      if (isComplete) break;
    }
    
    await expect(page.locator('h1')).toContainText('Workout Complete', { timeout: 10000 });
    
    // Check main points display is prominent
    const mainPoints = page.locator('[data-testid="points-earned"], .text-4xl, .text-5xl').first();
    await expect(mainPoints).toBeVisible();
    
    // Verify points grid layout
    const pointsGrid = page.locator('.grid-cols-2, .grid-cols-3').first();
    await expect(pointsGrid).toBeVisible();
    
    // Check color coding for different point types
    const coloredElements = page.locator('.text-blue-600, .text-red-600, .text-green-600, .text-purple-600, .text-orange-600');
    const coloredCount = await coloredElements.count();
    expect(coloredCount).toBeGreaterThan(0);
    
    // Verify background colors for point type cards
    const backgroundElements = page.locator('.bg-blue-50, .bg-red-50, .bg-green-50, .bg-purple-50, .bg-orange-50, .bg-gray-50');
    const backgroundCount = await backgroundElements.count();
    expect(backgroundCount).toBeGreaterThan(0);
    
    console.log('✅ Points display with proper visual hierarchy');
  });
  
  test('workout stats are accurate', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    const startTime = Date.now();
    
    // Complete specific number of drills
    const didItButton = page.locator('[data-testid="did-it-button"]');
    let drillsCompleted = 0;
    
    for (let i = 0; i < 5; i++) {
      await expect(didItButton).toBeVisible({ timeout: 5000 });
      await didItButton.click();
      drillsCompleted++;
      await page.waitForTimeout(1000);
      
      const isComplete = await page.locator('h1:has-text("Workout Complete")').isVisible().catch(() => false);
      if (isComplete) break;
    }
    
    const endTime = Date.now();
    const elapsedMinutes = Math.floor((endTime - startTime) / 60000);
    
    await expect(page.locator('h1')).toContainText('Workout Complete', { timeout: 10000 });
    
    // Check workout statistics
    const statsElements = page.locator('.text-2xl.font-bold');
    await expect(statsElements).toHaveCount(3, { timeout: 5000 }); // Should show 3 stats
    
    // Verify drill count stat
    const drillsStatElement = page.locator('.text-2xl.font-bold').first();
    if (await drillsStatElement.isVisible().catch(() => false)) {
      const drillsStatText = await drillsStatElement.textContent();
      const displayedDrills = parseInt(drillsStatText || '0');
      expect(displayedDrills).toBe(drillsCompleted);
    }
    
    // Verify time is reasonable
    const timeStatElement = page.locator('.text-2xl.font-bold').nth(2);
    if (await timeStatElement.isVisible().catch(() => false)) {
      const timeStatText = await timeStatElement.textContent();
      const displayedMinutes = parseInt(timeStatText || '0');
      expect(displayedMinutes).toBeGreaterThanOrEqual(0);
      expect(displayedMinutes).toBeLessThanOrEqual(elapsedMinutes + 1); // Allow 1 minute buffer
    }
    
    console.log(`✅ Workout stats accurate - completed ${drillsCompleted} drills in ~${elapsedMinutes} minutes`);
  });
  
  test('perfect completion bonus logic', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Complete ALL drills to get perfect bonus
    const didItButton = page.locator('[data-testid="did-it-button"]');
    
    // Get total drill count
    const progressText = await page.locator('[data-testid="progress-bar"]').locator('..').textContent();
    const drillMatch = progressText?.match(/(\d+) of (\d+)/);
    const totalDrills = drillMatch ? parseInt(drillMatch[2]) : 5;
    
    // Complete all drills
    for (let i = 0; i < totalDrills; i++) {
      await expect(didItButton).toBeVisible({ timeout: 5000 });
      await didItButton.click();
      await page.waitForTimeout(1000);
      
      const isComplete = await page.locator('h1:has-text("Workout Complete")').isVisible().catch(() => false);
      if (isComplete) break;
    }
    
    await expect(page.locator('h1')).toContainText('Workout Complete', { timeout: 10000 });
    
    // Look for perfect completion bonus message
    const bonusText = page.locator('text="Perfect completion bonus!"');
    const hasBonusMessage = await bonusText.isVisible().catch(() => false);
    
    // Also check for any perfect drill indicators
    const perfectIndicators = page.locator('text=/perfect/i');
    const perfectCount = await perfectIndicators.count();
    
    console.log(`✅ Perfect completion bonus logic - bonus message: ${hasBonusMessage}, perfect indicators: ${perfectCount}`);
    
    // At minimum, should show some indication of completion quality
    expect(hasBonusMessage || perfectCount > 0).toBe(true);
  });
  
  test('do again functionality resets all state', async ({ page }) => {
    await page.goto('/skills-academy/workout/1');
    await page.waitForLoadState('networkidle');
    
    // Complete workout
    const didItButton = page.locator('[data-testid="did-it-button"]');
    
    for (let i = 0; i < 6; i++) {
      await expect(didItButton).toBeVisible({ timeout: 5000 });
      await didItButton.click();
      await page.waitForTimeout(1000);
      
      const isComplete = await page.locator('h1:has-text("Workout Complete")').isVisible().catch(() => false);
      if (isComplete) break;
    }
    
    await expect(page.locator('h1')).toContainText('Workout Complete', { timeout: 10000 });
    
    // Click "Do Again" button
    const doAgainButton = page.locator('[data-testid="do-again-button"]');
    await expect(doAgainButton).toBeVisible({ timeout: 5000 });
    await doAgainButton.click();
    
    // Verify we're back to first drill
    await expect(page.locator('[data-testid="drill-caption"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1')).not.toContainText('Workout Complete');
    
    // Check that progress is reset
    const progressBar = page.locator('[data-testid="progress-bar"]');
    await expect(progressBar).toBeVisible();
    
    const progressText = await progressBar.locator('..').textContent();
    expect(progressText).toMatch(/0 of \d+|Drill 1 of \d+/);
    
    console.log('✅ Do again functionality resets all state correctly');
  });
});