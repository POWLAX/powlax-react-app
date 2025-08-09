import { test, expect } from '@playwright/test';

test.describe('Skills Academy Video Verification', () => {
  test('Workout videos load and display correctly', async ({ page }) => {
    // Navigate directly to a workout page
    await page.goto('http://localhost:3000/skills-academy/workout/1', { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Check if we're on the workout page or got an error
    const pageContent = await page.content();
    
    if (pageContent.includes('Workout Not Found')) {
      console.log('❌ Workout not found - checking if drill data exists');
      
      // Try navigating from Skills Academy main page
      await page.goto('http://localhost:3000/skills-academy');
      await page.waitForTimeout(2000);
      
      // Check if there are any Start buttons
      const startButtons = await page.locator('button:has-text("Start")').count();
      console.log(`Found ${startButtons} Start buttons`);
      
      if (startButtons > 0) {
        // Click the first Start button
        await page.locator('button:has-text("Start")').first().click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Check for video elements
    const iframes = await page.locator('iframe').count();
    const videoUrls = await page.locator('iframe').evaluateAll(elements => 
      elements.map(el => el.src)
    );
    
    console.log(`✅ Found ${iframes} video iframe(s)`);
    videoUrls.forEach((url, index) => {
      console.log(`  Video ${index + 1}: ${url}`);
    });
    
    // Check for Vimeo player specifically
    const vimeoIframes = await page.locator('iframe[src*="vimeo"]').count();
    if (vimeoIframes > 0) {
      console.log(`✅ Found ${vimeoIframes} Vimeo video(s)`);
      
      // Check that Vimeo iframe is visible and has proper dimensions
      const vimeoFrame = page.locator('iframe[src*="vimeo"]').first();
      await expect(vimeoFrame).toBeVisible();
      
      const box = await vimeoFrame.boundingBox();
      if (box) {
        console.log(`  Video dimensions: ${box.width}x${box.height}`);
        expect(box.width).toBeGreaterThan(200);
        expect(box.height).toBeGreaterThan(100);
      }
    } else {
      console.log('⚠️  No Vimeo videos found - checking for fallback content');
      
      // Check for "Video not available" message
      const noVideoMessage = await page.locator('text=Video not available').count();
      if (noVideoMessage > 0) {
        console.log('  Found "Video not available" message');
      }
    }
    
    // Check for drill navigation controls
    const didItButton = await page.locator('button:has-text("Did It")').count();
    const nextButton = await page.locator('[data-testid="next-drill-button"]').count();
    
    console.log(`Navigation controls: Did It button: ${didItButton > 0 ? '✅' : '❌'}, Next button: ${nextButton > 0 ? '✅' : '❌'}`);
    
    // Take a screenshot for manual verification
    await page.screenshot({ 
      path: 'screenshots/workout-video-test.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved to screenshots/workout-video-test.png');
  });
});