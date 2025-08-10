import { chromium } from 'playwright';

async function testFinalVideo() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen for console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('📡') || text.includes('✅') || text.includes('⚠️') || 
        text.includes('video') || text.includes('drill')) {
      console.log(`[CONSOLE] ${text}`);
    }
  });
  
  console.log('🌐 Navigating to Skills Academy main page...');
  await page.goto('http://localhost:3000/skills-academy');
  await page.waitForTimeout(2000);
  
  // Try to click on a workout
  console.log('🔍 Looking for workout cards...');
  const workoutCards = await page.$$('[data-testid*="workout"], .cursor-pointer');
  console.log(`Found ${workoutCards.length} clickable elements`);
  
  if (workoutCards.length > 0) {
    console.log('📍 Clicking first workout card...');
    await workoutCards[0].click();
    await page.waitForTimeout(3000);
  }
  
  // Check current URL
  const currentUrl = page.url();
  console.log(`📍 Current URL: ${currentUrl}`);
  
  // Try direct navigation
  console.log('\n🎯 Trying direct navigation to workout 1...');
  await page.goto('http://localhost:3000/skills-academy/workout/1');
  await page.waitForTimeout(3000);
  
  // Check for video iframe
  const iframes = await page.$$('iframe[src*="vimeo"]');
  console.log(`\n✅ Found ${iframes.length} Vimeo iframe(s)`);
  
  if (iframes.length > 0) {
    const src = await iframes[0].getAttribute('src');
    console.log(`🎬 Video src: ${src}`);
  }
  
  // Check for error messages
  const errorText = await page.$('text=404');
  if (errorText) {
    console.log('❌ 404 error found on page');
  }
  
  const notFoundText = await page.$('text=Workout Not Found');
  if (notFoundText) {
    console.log('❌ "Workout Not Found" message displayed');
  }
  
  const videoNotAvailable = await page.$('text=Video not available');
  if (videoNotAvailable) {
    console.log('⚠️ "Video not available" fallback displayed');
  }
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/final-video-test.png' });
  console.log('📸 Screenshot saved to screenshots/final-video-test.png');
  
  console.log('\n👀 Browser stays open for manual inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

testFinalVideo().catch(console.error);