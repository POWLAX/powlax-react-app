import { test, expect } from '@playwright/test';

test.describe('Skills Academy Full Flow with Videos', () => {
  test('Navigate to workout and verify video functionality', async ({ page }) => {
    console.log('🚀 Starting Skills Academy full flow test...');
    
    // Start from Skills Academy main page
    await page.goto('http://localhost:3000/skills-academy', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('📍 Navigated to Skills Academy main page');
    await page.waitForTimeout(3000);
    
    // Check if page loaded
    const pageTitle = await page.textContent('h1');
    console.log(`Page title: ${pageTitle}`);
    
    // Look for workout cards or start buttons
    const startButtons = await page.locator('button:has-text("Start")').count();
    console.log(`Found ${startButtons} Start buttons`);
    
    if (startButtons > 0) {
      console.log('✅ Clicking first Start button...');
      await page.locator('button:has-text("Start")').first().click();
      await page.waitForTimeout(5000);
      
      // Check current URL
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/workout/')) {
        console.log('✅ Successfully navigated to workout page');
        
        // Look for video elements
        const iframes = await page.locator('iframe').count();
        console.log(`Found ${iframes} iframe(s) on page`);
        
        if (iframes > 0) {
          const iframeSrcs = await page.locator('iframe').evaluateAll(
            elements => elements.map(el => el.src)
          );
          
          iframeSrcs.forEach((src, index) => {
            console.log(`  Video ${index + 1}: ${src}`);
            if (src.includes('vimeo')) {
              console.log('    ✅ Vimeo video detected!');
            }
          });
          
          // Check video visibility
          const firstIframe = page.locator('iframe').first();
          const isVisible = await firstIframe.isVisible();
          console.log(`Video visibility: ${isVisible ? '✅ Visible' : '❌ Not visible'}`);
          
          if (isVisible) {
            const box = await firstIframe.boundingBox();
            if (box) {
              console.log(`Video dimensions: ${box.width}x${box.height}px`);
            }
          }
        } else {
          console.log('⚠️ No video iframes found');
          
          // Check for fallback content
          const videoNotAvailable = await page.locator('text=Video not available').count();
          if (videoNotAvailable > 0) {
            console.log('Found "Video not available" message');
          }
          
          // Check for loading state
          const loadingVideo = await page.locator('text=Loading video').count();
          if (loadingVideo > 0) {
            console.log('Video is in loading state');
          }
        }
        
        // Check for workout controls
        const didItButton = await page.locator('button:has-text("Did It")').isVisible();
        const nextButton = await page.locator('[data-testid="next-drill-button"]').isVisible();
        const previousButton = await page.locator('[data-testid="previous-button"]').isVisible();
        
        console.log('\n📱 Workout Controls:');
        console.log(`  Did It button: ${didItButton ? '✅' : '❌'}`);
        console.log(`  Next button: ${nextButton ? '✅' : '❌'}`);
        console.log(`  Previous button: ${previousButton ? '✅' : '❌'}`);
        
        // Check for drill information
        const drillCaption = await page.locator('[data-testid="drill-caption"]').textContent();
        if (drillCaption) {
          console.log(`\n📝 Current drill: ${drillCaption}`);
        }
        
        // Try clicking "Did It" to advance
        if (didItButton) {
          console.log('\n🎯 Testing drill progression...');
          await page.locator('button:has-text("Did It")').click();
          await page.waitForTimeout(2000);
          
          // Check if we advanced
          const newDrillCaption = await page.locator('[data-testid="drill-caption"]').textContent();
          if (newDrillCaption && newDrillCaption !== drillCaption) {
            console.log(`  ✅ Advanced to next drill: ${newDrillCaption}`);
            
            // Check for new video
            const newIframes = await page.locator('iframe').count();
            console.log(`  Video count after advancement: ${newIframes}`);
          }
        }
        
      } else {
        console.log('❌ Failed to navigate to workout page');
        console.log('Current URL:', currentUrl);
      }
    } else {
      console.log('❌ No Start buttons found on Skills Academy page');
      
      // Try direct navigation as fallback
      console.log('Attempting direct navigation to workout/1...');
      await page.goto('http://localhost:3000/skills-academy/workout/1', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      await page.waitForTimeout(3000);
      
      const workoutPageContent = await page.textContent('body');
      if (workoutPageContent.includes('Workout Not Found')) {
        console.log('❌ Workout Not Found error');
      } else if (workoutPageContent.includes('404')) {
        console.log('❌ 404 error on workout page');
      } else {
        console.log('✅ Workout page loaded');
      }
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'screenshots/skills-academy-full-flow.png',
      fullPage: true 
    });
    console.log('\n📸 Final screenshot saved to screenshots/skills-academy-full-flow.png');
  });
});