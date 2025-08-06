import { test, expect } from '@playwright/test';

test.describe('Modal Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3001/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to practice planner
    await page.goto('http://localhost:3001/teams/test-team/practice-plans');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Desktop View', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('DrillLibrary - Video Modal opens correctly', async ({ page }) => {
      // Find a drill with video (Spike Stickwork)
      await page.getByText('Spike Stickwork').first().waitFor();
      
      // Click video icon in drill library
      const drillCard = page.locator('text=Spike Stickwork').first().locator('..');
      const videoButton = drillCard.locator('img[alt="Video"]').first();
      await videoButton.click();
      
      // Check if video modal opened
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText('Spike Stickwork - Video')).toBeVisible();
      
      // Close modal
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('DrillLibrary - Lacrosse Lab Modal opens correctly', async ({ page }) => {
      // Find a drill and click Lacrosse Lab icon
      const drillCard = page.locator('text=Spike Stickwork').first().locator('..');
      const labButton = drillCard.locator('img[alt="Lacrosse Lab"]').first();
      await labButton.click();
      
      // Check if Lacrosse Lab modal opened
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText('Spike Stickwork - Lacrosse Lab')).toBeVisible();
      
      // Check for iframe or no diagrams message
      const iframe = page.locator('iframe[title*="Lacrosse Lab"]');
      const noDiagramsMessage = page.getByText('No Lacrosse Lab diagrams available');
      
      // Either iframe or no diagrams message should be visible
      const iframeCount = await iframe.count();
      const noMessageCount = await noDiagramsMessage.count();
      
      expect(iframeCount + noMessageCount).toBeGreaterThan(0);
      
      // Close modal
      await page.keyboard.press('Escape');
    });

    test('DrillLibrary - Links Modal opens correctly', async ({ page }) => {
      // Find a drill and click link icon
      const drillCard = page.locator('text=Spike Stickwork').first().locator('..');
      const linkButton = drillCard.getByRole('button', { name: 'External Links' });
      await linkButton.click();
      
      // Check if links modal opened
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText('Spike Stickwork - External Links')).toBeVisible();
      
      // Close modal
      await page.keyboard.press('Escape');
    });

    test('DrillLibrary - Strategies Modal opens correctly', async ({ page }) => {
      // Find a drill and click X/O button
      const drillCard = page.locator('text=Spike Stickwork').first().locator('..');
      const strategiesButton = drillCard.getByRole('button', { name: 'Strategies & Concepts' });
      await strategiesButton.click();
      
      // Check if strategies modal opened
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText('Spike Stickwork - Strategies & Concepts')).toBeVisible();
      
      // Check for notes content (Spike Stickwork has notes)
      await expect(page.getByText('VERIFYING THAT NOTES WORK')).toBeVisible();
      
      // Close modal
      await page.keyboard.press('Escape');
    });

    test('Practice Timeline - All modals work after adding drill', async ({ page }) => {
      // Add a drill to the timeline
      const drillCard = page.locator('text=Spike Stickwork').first().locator('..');
      const addButton = drillCard.locator('button').filter({ has: page.locator('svg') }).last();
      await addButton.click();
      
      // Wait for drill to appear in timeline
      await page.waitForSelector('.bg-white.rounded-lg.border.shadow-sm');
      
      // Test video modal from timeline
      const timelineDrill = page.locator('.bg-white.rounded-lg.border.shadow-sm').first();
      await timelineDrill.locator('img[alt="View Video"]').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      
      // Test Lacrosse Lab modal from timeline
      await timelineDrill.locator('img[alt="Lacrosse Lab"]').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      
      // Test strategies modal from timeline
      await timelineDrill.getByText('X/O').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
    });
  });

  test.describe('Mobile View', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('Mobile - DrillLibrary modals work correctly', async ({ page }) => {
      // Expand a category in drill library
      await page.getByText('Skill Drills').click();
      
      // Find Spike Stickwork
      await page.getByText('Spike Stickwork').first().waitFor();
      
      // Test video modal
      const drillCard = page.locator('text=Spike Stickwork').first().locator('..');
      await drillCard.locator('img[alt="Video"]').first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      
      // Test Lacrosse Lab modal
      await drillCard.locator('img[alt="Lacrosse Lab"]').first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
    });

    test('Mobile - Timeline modals work correctly', async ({ page }) => {
      // Expand category and add drill
      await page.getByText('Skill Drills').click();
      const drillCard = page.locator('text=Spike Stickwork').first().locator('..');
      const addButton = drillCard.locator('button').filter({ has: page.locator('svg') }).last();
      await addButton.click();
      
      // Test modals from timeline
      const timelineDrill = page.locator('.bg-white.rounded-lg.border.shadow-sm').first();
      
      // Video modal
      await timelineDrill.locator('img[alt="View Video"]').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      
      // Lacrosse Lab modal
      await timelineDrill.locator('img[alt="Lacrosse Lab"]').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
    });
  });

  test('Check modal backgrounds are white', async ({ page }) => {
    // Add a drill to timeline
    const drillCard = page.locator('text=Spike Stickwork').first().locator('..');
    const addButton = drillCard.locator('button').filter({ has: page.locator('svg') }).last();
    await addButton.click();
    
    // Open strategies modal
    const timelineDrill = page.locator('.bg-white.rounded-lg.border.shadow-sm').first();
    await timelineDrill.getByText('X/O').click();
    
    // Check that modal cards have white background
    const modalCards = page.locator('.bg-white').filter({ has: page.locator('text=Drill Notes & Instructions') });
    await expect(modalCards).toBeVisible();
    
    // Verify background color
    const backgroundColor = await modalCards.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(backgroundColor).toBe('rgb(255, 255, 255)'); // white
  });

  test('Lacrosse Lab iframe displays correctly', async ({ page }) => {
    // Find a drill that should have lab URLs
    const drillsWithLab = await page.locator('img[alt="Lacrosse Lab"]').count();
    
    if (drillsWithLab > 0) {
      // Click first Lacrosse Lab icon
      await page.locator('img[alt="Lacrosse Lab"]').first().click();
      
      // Wait for modal
      await expect(page.getByRole('dialog')).toBeVisible();
      
      // Check for iframe with correct dimensions
      const iframe = page.locator('iframe[width="500"][height="500"]');
      const iframeCount = await iframe.count();
      
      if (iframeCount > 0) {
        // Verify iframe has correct style
        const style = await iframe.getAttribute('style');
        expect(style).toContain('max-width: 100%');
      }
    }
  });
});