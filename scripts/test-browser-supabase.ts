import { chromium } from 'playwright';

async function testBrowserSupabase() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to the page
  await page.goto('http://localhost:3000/skills-academy/workout/1');
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Execute query directly in browser console
  const result = await page.evaluate(async () => {
    // Hardcode the values since process.env is not available in browser
    const url = 'https://avvpyjwytcmtoiyrbibb.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQyNTMsImV4cCI6MjA2OTUxMDI1M30.ExYEGgmmh4D7HnObISlg8ntGsVi5_zOvNiSjJuX5K0s';
    
    // Make a direct fetch to test if we can reach Supabase
    try {
      const response = await fetch(`${url}/rest/v1/skills_academy_drills?id=in.(1,2,3,4,5)`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });
      
      const data = await response.json();
      return { 
        success: true, 
        status: response.status,
        drillCount: Array.isArray(data) ? data.length : 0,
        data: data
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  });
  
  console.log('Browser Supabase test result:', JSON.stringify(result, null, 2));
  
  await browser.close();
}

testBrowserSupabase().catch(console.error);