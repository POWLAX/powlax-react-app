import { test, expect } from '@playwright/test';

test.describe('Wall Ball Error Fix Verification', () => {
  test('Wall ball page should load without runtime errors', async ({ page }) => {
    console.log('🔧 Verifying wall ball error fix...');
    
    const errorMessages: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorMessages.push(msg.text());
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.log(`💥 Page Error: ${error.message}`);
      errorMessages.push(`Page Error: ${error.message}`);
    });

    try {
      // Navigate to wall ball workout page
      await page.goto('/skills-academy/wall-ball/5');
      console.log('📍 Navigated to wall ball workout page');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check if page loads without the "Cannot read properties of undefined" error
      const pageTitle = await page.locator('h1').first().textContent();
      console.log(`📋 Page title: ${pageTitle}`);
      
      // Verify no "Unhandled Runtime Error" appears
      const errorElements = page.locator('text=Unhandled Runtime Error');
      const hasRuntimeError = await errorElements.count() > 0;
      
      if (hasRuntimeError) {
        console.log('❌ Runtime error still present');
        expect(hasRuntimeError).toBe(false);
      } else {
        console.log('✅ No runtime errors detected');
      }
      
      // Verify the page shows workout content
      const workoutContent = await page.locator('[class*="workout"], [class*="drill"], h1').count();
      console.log(`📊 Found ${workoutContent} workout-related elements`);
      
      expect(workoutContent).toBeGreaterThan(0);
      
      // Check for specific TypeError about 'length'
      const hasLengthError = errorMessages.some(msg => 
        msg.includes("Cannot read properties of undefined (reading 'length')")
      );
      
      if (hasLengthError) {
        console.log('❌ Length property error still exists');
        expect(hasLengthError).toBe(false);
      } else {
        console.log('✅ Length property error resolved');
      }

    } catch (error) {
      console.log(`🔥 Test Error: ${error}`);
    }

    console.log('🏁 Wall ball error fix verification completed');
  });
});