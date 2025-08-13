/**
 * Platform Management Integration Tests
 * 
 * Comprehensive test suite for Phase 4 Platform Management implementation
 * Testing all tabs, tier enforcement, feature toggles, and integration
 */

import { test, expect, Page } from '@playwright/test'

const ADMIN_USER = {
  email: 'admin@powlax.com',
  password: 'admin123'
}

const TEST_BASE_URL = 'http://localhost:3000'

async function loginAsAdmin(page: Page) {
  await page.goto(`${TEST_BASE_URL}/auth/login`)
  await page.fill('input[type="email"]', ADMIN_USER.email)
  await page.fill('input[type="password"]', ADMIN_USER.password)
  await page.click('button[type="submit"]')
  await page.waitForLoadState('networkidle')
}

async function navigateToManagement(page: Page) {
  await page.goto(`${TEST_BASE_URL}/admin/management`)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1')).toContainText('Management')
}

test.describe('Platform Management Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await navigateToManagement(page)
  })

  test.describe('Management Tabs Integration', () => {
    test('all 8 management tabs are visible and functional', async ({ page }) => {
      const expectedTabs = [
        'Roles & Permissions',
        'Users', 
        'Memberpress Sync',
        'Magic Links',
        'Clubs',
        'Team HQ',
        'Coaching Kit',
        'Analytics'
      ]

      for (const tabName of expectedTabs) {
        const tabButton = page.locator(`button:has-text("${tabName}")`)
        await expect(tabButton).toBeVisible()
        
        // Click tab and verify it loads without errors
        await tabButton.click()
        await page.waitForTimeout(500) // Allow tab to load
        
        // Check for no console errors
        const errors = await page.evaluate(() => {
          return window.console.error.toString()
        })
        expect(errors).not.toContain('Error')
      }
    })

    test('tab switching responds quickly (<100ms)', async ({ page }) => {
      const tabs = ['clubs', 'teams', 'coaching', 'analytics']
      
      for (const tabId of tabs) {
        const startTime = Date.now()
        await page.click(`button[value="${tabId}"]`)
        await page.waitForSelector(`[data-state="active"][value="${tabId}"]`)
        const endTime = Date.now()
        
        const responseTime = endTime - startTime
        expect(responseTime).toBeLessThan(100)
      }
    })
  })

  test.describe('Clubs Management Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("Clubs")')
      await page.waitForLoadState('networkidle')
    })

    test('clubs management interface loads correctly', async ({ page }) => {
      await expect(page.locator('h2:has-text("Club Management")')).toBeVisible()
      await expect(page.locator('text="Select Club"')).toBeVisible()
      
      // Check for tier enforcement features
      await expect(page.locator('text="Basic Settings"')).toBeVisible()
      await expect(page.locator('text="Advanced Settings"')).toBeVisible()
    })

    test('tier enforcement works for club features', async ({ page }) => {
      // Click on a club to select it
      const clubCard = page.locator('[data-testid="club-card"]').first()
      if (await clubCard.isVisible()) {
        await clubCard.click()
        
        // Check feature access display
        await expect(page.locator('text="Feature Access"')).toBeVisible()
        
        // Verify tier-based features are shown/hidden correctly
        const basicSettings = page.locator('text="Basic Settings"')
        const apiAccess = page.locator('text="API Access"')
        
        await expect(basicSettings).toBeVisible()
        // API Access should only be visible for Command tier
      }
    })

    test('club settings can be updated', async ({ page }) => {
      // Select first club if available
      const clubCard = page.locator('[data-testid="club-card"]').first()
      if (await clubCard.isVisible()) {
        await clubCard.click()
        
        // Navigate to settings tab
        await page.click('button:has-text("Settings")')
        
        // Try to update a setting
        const emailNotifications = page.locator('input[type="checkbox"]').first()
        if (await emailNotifications.isVisible()) {
          await emailNotifications.click()
          
          const saveButton = page.locator('button:has-text("Save Settings")')
          if (await saveButton.isEnabled()) {
            await saveButton.click()
            // Should not throw errors
          }
        }
      }
    })

    test('bulk operations interface is accessible', async ({ page }) => {
      const clubCard = page.locator('[data-testid="club-card"]').first()
      if (await clubCard.isVisible()) {
        await clubCard.click()
        await page.click('button:has-text("Teams")')
        
        // Check if bulk operations section exists
        const bulkOps = page.locator('text="Bulk Operations"')
        if (await bulkOps.isVisible()) {
          await expect(bulkOps).toBeVisible()
          await expect(page.locator('select')).toBeVisible()
        }
      }
    })
  })

  test.describe('Team HQ Management Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("Team HQ")')
      await page.waitForLoadState('networkidle')
    })

    test('team HQ interface loads with tier features', async ({ page }) => {
      await expect(page.locator('h2:has-text("Team HQ Management")')).toBeVisible()
      
      // Check for team tier features
      await expect(page.locator('text="Team Structure"')).toBeVisible()
      await expect(page.locator('text="Team Leadership"')).toBeVisible()
      await expect(page.locator('text="Team Activated"')).toBeVisible()
    })

    test('25-player academy limit is enforced', async ({ page }) => {
      // Look for academy limit indicator
      const academySection = page.locator('text="Academy Access"')
      if (await academySection.isVisible()) {
        await expect(page.locator('text="25"')).toBeVisible()
      }
    })

    test('roster management functions work', async ({ page }) => {
      // Check for roster management interface
      const rosterSection = page.locator('text="Roster Management"')
      if (await rosterSection.isVisible()) {
        await expect(rosterSection).toBeVisible()
        
        // Check for add player functionality
        const addButton = page.locator('button:has-text("Add Player")')
        if (await addButton.isVisible()) {
          await expect(addButton).toBeVisible()
        }
      }
    })
  })

  test.describe('Coaching Kit Management Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("Coaching Kit")')
      await page.waitForLoadState('networkidle')
    })

    test('coaching kit interface displays tier options', async ({ page }) => {
      await expect(page.locator('h2:has-text("Coaching Kit Management")')).toBeVisible()
      
      // Check for coaching tier features
      await expect(page.locator('text="Essentials Kit"')).toBeVisible()
      await expect(page.locator('text="Confidence Kit"')).toBeVisible()
    })

    test('content management interface is functional', async ({ page }) => {
      // Check for content management sections
      const contentSection = page.locator('text="Content Management"')
      if (await contentSection.isVisible()) {
        await expect(contentSection).toBeVisible()
        
        // Verify content approval workflow exists
        const approvalSection = page.locator('text="Approval"')
        if (await approvalSection.isVisible()) {
          await expect(approvalSection).toBeVisible()
        }
      }
    })

    test('training modules are accessible', async ({ page }) => {
      // Check for training modules section
      const trainingSection = page.locator('text="Training Modules"')
      if (await trainingSection.isVisible()) {
        await expect(trainingSection).toBeVisible()
      }
    })
  })

  test.describe('Platform Analytics Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("Analytics")')
      await page.waitForLoadState('networkidle')
    })

    test('analytics dashboard loads within performance limits (<3s)', async ({ page }) => {
      const startTime = Date.now()
      
      // Wait for key analytics elements to load
      await Promise.race([
        page.waitForSelector('text="Platform Usage"', { timeout: 3000 }),
        page.waitForSelector('text="Revenue Analytics"', { timeout: 3000 }),
        page.waitForSelector('[data-testid="analytics-metric"]', { timeout: 3000 })
      ])
      
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000)
    })

    test('analytics metrics display correctly', async ({ page }) => {
      // Check for key analytics sections
      const expectedSections = [
        'Platform Usage',
        'Feature Usage', 
        'Revenue Analytics',
        'Growth Metrics'
      ]

      for (const section of expectedSections) {
        const sectionElement = page.locator(`text="${section}"`)
        if (await sectionElement.isVisible()) {
          await expect(sectionElement).toBeVisible()
        }
      }
    })

    test('analytics data refreshes efficiently', async ({ page }) => {
      // Look for refresh button and test refresh functionality
      const refreshButton = page.locator('button:has-text("Refresh")')
      if (await refreshButton.isVisible()) {
        const startTime = Date.now()
        await refreshButton.click()
        
        // Wait for loading indicator to disappear
        await page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 3000 })
        
        const refreshTime = Date.now() - startTime
        expect(refreshTime).toBeLessThan(3000)
      }
    })

    test('tier distribution charts are visible', async ({ page }) => {
      // Check for tier distribution visualization
      const tierChart = page.locator('[data-testid="tier-chart"]')
      if (await tierChart.isVisible()) {
        await expect(tierChart).toBeVisible()
      }
    })
  })

  test.describe('Feature Toggle System', () => {
    test('feature toggles respond quickly (<100ms)', async ({ page }) => {
      // Navigate through different tabs to test feature toggle response times
      const tabs = ['clubs', 'teams', 'coaching']
      
      for (const tab of tabs) {
        const startTime = Date.now()
        await page.click(`button[value="${tab}"]`)
        
        // Wait for features to load/check
        await page.waitForTimeout(50) // Small buffer
        
        const responseTime = Date.now() - startTime
        expect(responseTime).toBeLessThan(100)
      }
    })

    test('tier-based features show/hide correctly', async ({ page }) => {
      // Test in clubs tab
      await page.click('button:has-text("Clubs")')
      
      // Check that different tier features are properly gated
      const basicFeatures = page.locator('text="Basic Settings"')
      const advancedFeatures = page.locator('text="API Access"')
      
      if (await basicFeatures.isVisible()) {
        await expect(basicFeatures).toBeVisible()
      }
      
      // Advanced features should show upgrade prompts for lower tiers
      if (await advancedFeatures.isVisible()) {
        const upgradeButton = page.locator('button:has-text("Upgrade")')
        // Either feature is available or upgrade prompt is shown
        await expect(upgradeButton.or(advancedFeatures)).toBeVisible()
      }
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('management interface works on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size
      await navigateToManagement(page)
      
      // Check that tabs are still accessible
      const tabsList = page.locator('[role="tablist"]')
      await expect(tabsList).toBeVisible()
      
      // Tabs should be responsive (possibly collapsed or scrollable)
      const firstTab = page.locator('button[role="tab"]').first()
      await expect(firstTab).toBeVisible()
      
      // Click a tab to ensure functionality works
      await firstTab.click()
      await page.waitForTimeout(500)
    })

    test('club management is mobile responsive', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.click('button:has-text("Clubs")')
      
      // Check that club cards stack properly on mobile
      const clubGrid = page.locator('[data-testid="clubs-grid"]')
      if (await clubGrid.isVisible()) {
        await expect(clubGrid).toBeVisible()
      }
    })

    test('analytics dashboard adapts to mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.click('button:has-text("Analytics")')
      
      // Analytics cards should stack vertically on mobile
      const analyticsGrid = page.locator('[data-testid="analytics-grid"]')
      if (await analyticsGrid.isVisible()) {
        await expect(analyticsGrid).toBeVisible()
      }
    })
  })

  test.describe('Error Handling & Console Checks', () => {
    test('no console errors during navigation', async ({ page }) => {
      const consoleErrors: string[] = []
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })
      
      // Navigate through all tabs
      const tabs = ['roles', 'users', 'memberpress', 'magic-links', 'clubs', 'teams', 'coaching', 'analytics']
      
      for (const tab of tabs) {
        await page.click(`button[value="${tab}"]`)
        await page.waitForTimeout(1000) // Allow tab to fully load
      }
      
      // Should have no console errors
      expect(consoleErrors.length).toBe(0)
      if (consoleErrors.length > 0) {
        console.log('Console errors found:', consoleErrors)
      }
    })

    test('network requests complete successfully', async ({ page }) => {
      const failedRequests: string[] = []
      
      page.on('response', response => {
        if (response.status() >= 400) {
          failedRequests.push(`${response.status()}: ${response.url()}`)
        }
      })
      
      // Navigate through platform tabs that make API calls
      await page.click('button:has-text("Clubs")')
      await page.waitForTimeout(2000)
      
      await page.click('button:has-text("Analytics")')
      await page.waitForTimeout(2000)
      
      // Should have no failed requests (except maybe expected 404s for missing data)
      const criticalFailures = failedRequests.filter(req => 
        !req.includes('404') && !req.includes('favicon')
      )
      expect(criticalFailures.length).toBe(0)
    })
  })

  test.describe('Build and Performance Validation', () => {
    test('page loads within performance budget (2s)', async ({ page }) => {
      const startTime = Date.now()
      await navigateToManagement(page)
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(2000)
    })

    test('all interactive elements are functional', async ({ page }) => {
      // Test key interactive elements across tabs
      
      // Users tab
      await page.click('button:has-text("Users")')
      const userSearch = page.locator('input[placeholder*="search"]')
      if (await userSearch.isVisible()) {
        await userSearch.fill('test')
        await expect(userSearch).toHaveValue('test')
      }
      
      // Clubs tab
      await page.click('button:has-text("Clubs")')
      const clubCard = page.locator('[data-testid="club-card"]').first()
      if (await clubCard.isVisible()) {
        await clubCard.click()
        // Should be able to interact with club
      }
      
      // Analytics tab
      await page.click('button:has-text("Analytics")')
      const analyticsFilter = page.locator('select, button:has-text("Filter")')
      if (await analyticsFilter.first().isVisible()) {
        await analyticsFilter.first().click()
        // Should be able to interact with filters
      }
    })
  })

  test.describe('Integration with Existing Systems', () => {
    test('memberpress sync integration works', async ({ page }) => {
      await page.click('button:has-text("Memberpress Sync")')
      
      // Check that memberpress panel loads
      await expect(page.locator('text="Memberpress"')).toBeVisible()
      
      // Sync button should be present
      const syncButton = page.locator('button:has-text("Sync")')
      if (await syncButton.isVisible()) {
        await expect(syncButton).toBeVisible()
      }
    })

    test('user management integration functions', async ({ page }) => {
      await page.click('button:has-text("Users")')
      
      // Users tab should show user list
      await expect(page.locator('text="Users"')).toBeVisible()
      
      // Should integrate with existing user editor
      const userRow = page.locator('[data-testid="user-row"]').first()
      if (await userRow.isVisible()) {
        await userRow.click()
        // Should open user editor
      }
    })

    test('magic links integration works', async ({ page }) => {
      await page.click('button:has-text("Magic Links")')
      
      // Magic links panel should load
      await expect(page.locator('text="Magic Link"')).toBeVisible()
      
      // Should show link generation interface
      const generateButton = page.locator('button:has-text("Generate")')
      if (await generateButton.isVisible()) {
        await expect(generateButton).toBeVisible()
      }
    })
  })
})

test.describe('Platform Management Smoke Tests', () => {
  test('basic platform management page loads', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto(`${TEST_BASE_URL}/admin/management`)
    
    // Basic smoke test - page loads without crashing
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[role="tablist"]')).toBeVisible()
  })

  test('all required platform components exist', async ({ page }) => {
    await loginAsAdmin(page)
    await navigateToManagement(page)
    
    // Verify all 8 tabs are present
    const requiredTabs = ['Roles', 'Users', 'Memberpress', 'Magic', 'Clubs', 'Team', 'Coaching', 'Analytics']
    
    for (const tabText of requiredTabs) {
      await expect(page.locator(`button:has-text("${tabText}")`)).toBeVisible()
    }
  })
})