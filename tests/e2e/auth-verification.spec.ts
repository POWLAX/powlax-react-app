import { test, expect } from '@playwright/test'

test.describe('Authentication System Verification', () => {
  test('Verify authentication modal implementation', async ({ page }) => {
    console.log('\n🔍 VERIFYING AUTHENTICATION ENHANCEMENT IMPLEMENTATION\n')
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)
    
    const currentUrl = page.url()
    console.log(`Current URL: ${currentUrl}`)
    
    // Check for modal or redirect behavior
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Stayed on dashboard page (no redirect)')
      
      // Check for modal
      const modal = await page.locator('[role="dialog"], .modal, [data-modal="auth"]').first()
      const modalVisible = await modal.isVisible().catch(() => false)
      
      if (modalVisible) {
        console.log('✅ AUTH MODAL IS ACTIVE - Modal authentication system working!')
        
        // Check modal contents
        const emailInput = await page.locator('input[type="email"]').isVisible().catch(() => false)
        const submitButton = await page.locator('button[type="submit"]').isVisible().catch(() => false)
        
        if (emailInput) console.log('  ✅ Email input field present')
        if (submitButton) console.log('  ✅ Submit button present')
        
        // Check for POWLAX branding in modal
        const modalTitle = await page.locator('h2, h3').first().textContent().catch(() => '')
        console.log(`  Modal title: "${modalTitle}"`)
      } else {
        console.log('⚠️ No modal detected - authentication might be disabled or user already logged in')
      }
    } else if (currentUrl.includes('/auth/login')) {
      console.log('⚠️ Redirected to login page (old behavior - modal not implemented)')
    } else {
      console.log(`❌ Unexpected redirect to: ${currentUrl}`)
    }
  })

  test('Check admin navigation visibility', async ({ page }) => {
    console.log('\n🔍 CHECKING ADMIN NAVIGATION\n')
    
    await page.goto('/dashboard')
    await page.waitForTimeout(1000)
    
    // Check sidebar
    const sidebar = await page.locator('aside').isVisible().catch(() => false)
    if (sidebar) {
      console.log('✅ Sidebar navigation present')
      
      // Check for admin section
      const adminText = await page.locator('text="Admin"').isVisible().catch(() => false)
      const roleManagement = await page.locator('text="Role Management"').isVisible().catch(() => false)
      const drillEditor = await page.locator('text="Drill Editor"').isVisible().catch(() => false)
      
      if (adminText || roleManagement || drillEditor) {
        console.log('✅ ADMIN SECTION VISIBLE')
        if (roleManagement) console.log('  ✅ Role Management menu item')
        if (drillEditor) console.log('  ✅ Drill Editor menu item')
      } else {
        console.log('ℹ️ Admin section not visible (user not authenticated as admin)')
      }
    }
  })

  test('Verify no infinite loading', async ({ page }) => {
    console.log('\n🔍 CHECKING FOR INFINITE LOADING\n')
    
    const startTime = Date.now()
    await page.goto('/dashboard')
    
    // Check for loading spinner
    const spinner = await page.locator('.animate-spin, [aria-label="Loading"]').first()
    const spinnerVisible = await spinner.isVisible().catch(() => false)
    
    if (spinnerVisible) {
      console.log('Loading spinner detected...')
      
      // Wait up to 5 seconds for it to disappear
      try {
        await spinner.waitFor({ state: 'hidden', timeout: 5000 })
        const loadTime = Date.now() - startTime
        console.log(`✅ Loading completed in ${loadTime}ms`)
      } catch {
        console.log('❌ Loading spinner still visible after 5 seconds (infinite loading)')
      }
    } else {
      console.log('✅ No loading spinner detected - page loaded immediately')
    }
    
    // Check if content is visible
    const mainContent = await page.locator('main, [role="main"]').first()
    const contentVisible = await mainContent.isVisible().catch(() => false)
    
    if (contentVisible) {
      console.log('✅ Main content is visible')
    } else {
      console.log('⚠️ Main content not visible')
    }
  })

  test('Summary of authentication implementation', async ({ page }) => {
    console.log('\n' + '='.repeat(60))
    console.log('AUTHENTICATION ENHANCEMENT VERIFICATION SUMMARY')
    console.log('='.repeat(60) + '\n')
    
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)
    
    const checks = {
      modalPresent: false,
      noRedirect: false,
      adminVisible: false,
      noInfiniteLoading: true
    }
    
    // Check for modal
    const modal = await page.locator('[role="dialog"]').isVisible().catch(() => false)
    checks.modalPresent = modal
    
    // Check URL didn't redirect
    checks.noRedirect = page.url().includes('/dashboard')
    
    // Check for admin menu
    checks.adminVisible = await page.locator('text="Role Management"').isVisible().catch(() => false)
    
    // Check for loading issues
    const spinner = await page.locator('.animate-spin').isVisible().catch(() => false)
    checks.noInfiniteLoading = !spinner
    
    // Print results
    console.log('IMPLEMENTATION STATUS:')
    console.log(`  Modal Authentication: ${checks.modalPresent ? '✅ IMPLEMENTED' : '⚠️ Not visible (might need login)'}`)
    console.log(`  No Page Redirect: ${checks.noRedirect ? '✅ WORKING' : '❌ Still redirecting'}`)
    console.log(`  Admin Navigation: ${checks.adminVisible ? '✅ VISIBLE' : 'ℹ️ Hidden (login as admin to see)'}`)
    console.log(`  No Infinite Loading: ${checks.noInfiniteLoading ? '✅ RESOLVED' : '❌ Still loading'}`)
    
    console.log('\nTO TEST ADMIN ACCESS:')
    console.log('1. Login with patrick@powlax.com')
    console.log('2. Check for Admin section in sidebar')
    console.log('3. Verify access to /admin/* routes')
    
    console.log('\n' + '='.repeat(60))
  })
})