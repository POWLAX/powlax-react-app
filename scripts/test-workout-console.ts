import { chromium } from 'playwright';

async function testWorkoutWithConsole() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console messages
  page.on('console', msg => {
    const text = msg.text();
    // Filter for relevant messages
    if (text.includes('📡') || text.includes('✅') || text.includes('⚠️') || 
        text.includes('drills table') || text.includes('video_url') || 
        text.includes('Creating') || text.includes('fallback')) {
      console.log(`[CONSOLE] ${text}`);
    }
  });
  
  console.log('🌐 Navigating to http://localhost:3000/skills-academy/workout/1...\n');
  await page.goto('http://localhost:3000/skills-academy/workout/1');
  
  // Wait for the page to load
  await page.waitForTimeout(3000);
  
  // Check for iframe
  const iframes = await page.$$('iframe[src*="vimeo.com"]');
  console.log(`\n📊 Found ${iframes.length} Vimeo iframe(s)`);
  
  if (iframes.length > 0) {
    const src = await iframes[0].getAttribute('src');
    console.log(`🎬 First iframe src: ${src}`);
  }
  
  // Check for fallback content
  const fallbackContent = await page.$('text=Video not available');
  if (fallbackContent) {
    console.log('⚠️ Fallback content is showing');
  }
  
  // Keep browser open for manual inspection
  console.log('\n👀 Browser is open for manual inspection. Press Ctrl+C to close.');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

testWorkoutWithConsole().catch(console.error);