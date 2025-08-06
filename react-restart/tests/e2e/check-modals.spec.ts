import { test, expect } from '@playwright/test';

test.describe('Quick Modal Check', () => {
  test('Check modals from timeline drills', async ({ page }) => {
    // Go directly to practice planner
    await page.goto('http://localhost:3001/teams/test-team/practice-plans');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if we're on login page and login if needed
    if (await page.url().includes('login')) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // Look for drill library
    await page.waitForSelector('text=Drill Library', { timeout: 10000 });
    
    // Try to find and add Spike Stickwork drill
    const drillLibrary = page.locator('text=Drill Library').locator('..');
    
    // Expand Skill Drills category if needed
    const skillDrillsButton = page.getByText('Skill Drills').first();
    if (await skillDrillsButton.isVisible()) {
      await skillDrillsButton.click();
      await page.waitForTimeout(500);
    }
    
    // Look for Spike Stickwork
    const spikeDrill = page.locator('text=Spike Stickwork').first();
    if (await spikeDrill.isVisible()) {
      // Find and click the add button (Plus icon)
      const addButton = spikeDrill.locator('..').locator('button').last();
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Now check if drill was added to timeline
      const timelineDrill = page.locator('.bg-white.rounded-lg.border.shadow-sm').first();
      
      if (await timelineDrill.isVisible()) {
        console.log('Drill added to timeline successfully');
        
        // Test Video Modal
        const videoIcon = timelineDrill.locator('img[alt="View Video"]');
        if (await videoIcon.isVisible()) {
          await videoIcon.click();
          await page.waitForTimeout(1000);
          const videoModal = page.getByRole('dialog');
          console.log('Video modal visible:', await videoModal.isVisible());
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
        
        // Test Lacrosse Lab Modal
        const labIcon = timelineDrill.locator('img[alt="Lacrosse Lab"]');
        if (await labIcon.isVisible()) {
          await labIcon.click();
          await page.waitForTimeout(1000);
          const labModal = page.getByRole('dialog');
          console.log('Lab modal visible:', await labModal.isVisible());
          
          // Check for iframe or no diagrams message
          const iframe = page.locator('iframe[title*="Lacrosse Lab"]');
          const noMessage = page.getByText('No Lacrosse Lab diagrams');
          console.log('Lab iframe count:', await iframe.count());
          console.log('No diagrams message:', await noMessage.count());
          
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
        
        // Test Strategies Modal  
        const xoButton = timelineDrill.getByText('X/O');
        if (await xoButton.isVisible()) {
          await xoButton.click();
          await page.waitForTimeout(1000);
          const strategiesModal = page.getByRole('dialog');
          console.log('Strategies modal visible:', await strategiesModal.isVisible());
          
          // Check for notes
          const notesText = page.getByText('VERIFYING THAT NOTES WORK');
          console.log('Notes visible:', await notesText.count() > 0);
          
          await page.keyboard.press('Escape');
        }
      }
    }
  });
  
  test('Check modals from drill library', async ({ page }) => {
    // Go directly to practice planner
    await page.goto('http://localhost:3001/teams/test-team/practice-plans');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if we're on login page and login if needed
    if (await page.url().includes('login')) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // Expand Skill Drills
    const skillDrillsButton = page.getByText('Skill Drills').first();
    if (await skillDrillsButton.isVisible()) {
      await skillDrillsButton.click();
      await page.waitForTimeout(500);
    }
    
    // Find Spike Stickwork in library
    const drillInLibrary = page.locator('text=Spike Stickwork').first().locator('..');
    
    // Test icons in library
    const libraryVideoIcon = drillInLibrary.locator('img[alt="Video"]').first();
    if (await libraryVideoIcon.isVisible()) {
      await libraryVideoIcon.click();
      await page.waitForTimeout(1000);
      console.log('Library video modal visible:', await page.getByRole('dialog').isVisible());
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    const libraryLabIcon = drillInLibrary.locator('img[alt="Lacrosse Lab"]').first();
    if (await libraryLabIcon.isVisible()) {
      await libraryLabIcon.click();
      await page.waitForTimeout(1000);
      console.log('Library lab modal visible:', await page.getByRole('dialog').isVisible());
      await page.keyboard.press('Escape');
    }
  });
});