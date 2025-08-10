import { test, expect } from '@playwright/test';

test.describe('Debug Console Errors', () => {
  test('Should capture console errors on workouts page', async ({ page }) => {
    console.log('🔍 Starting console error debugging...');
    
    // Listen for console messages
    const consoleMessages: string[] = [];
    const errorMessages: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      if (msg.type() === 'error') {
        errorMessages.push(text);
        console.log(`❌ Console Error: ${text}`);
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.log(`💥 Page Error: ${error.message}`);
      errorMessages.push(`Page Error: ${error.message}`);
    });

    try {
      // Navigate to workouts page
      await page.goto('/skills-academy/workouts');
      console.log('📍 Navigated to workouts page');
      
      // Wait a bit for any async errors
      await page.waitForTimeout(3000);
      
      // Try to find any error elements on the page
      const errorElements = page.locator('[class*="error"], [class*="Error"], .error-boundary');
      const errorCount = await errorElements.count();
      
      if (errorCount > 0) {
        console.log(`⚠️ Found ${errorCount} error elements on page`);
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorElements.nth(i).textContent();
          console.log(`Error Element ${i}: ${errorText}`);
        }
      }

      // Check if page has Wall Ball content
      const wallBallExists = await page.locator('text=Wall Ball Training').isVisible();
      console.log(`Wall Ball visible: ${wallBallExists}`);

      // Log all console messages
      console.log('\n📋 All Console Messages:');
      consoleMessages.forEach(msg => console.log(msg));
      
      if (errorMessages.length > 0) {
        console.log('\n🚨 Error Summary:');
        errorMessages.forEach(err => console.log(`- ${err}`));
      } else {
        console.log('\n✅ No console errors detected!');
      }

    } catch (error) {
      console.log(`🔥 Test Error: ${error}`);
    }

    console.log('🏁 Console debugging completed');
  });
});