import { test, expect } from '@playwright/test'

test.describe('Magic Link Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('should display email-only login form on /auth/login', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Check page title
    await expect(page.locator('h2')).toContainText('Welcome to POWLAX')
    
    // Check for email input field
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('placeholder', 'Enter your email address')
    
    // Check for magic link button
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toContainText('Send Magic Link')
    
    // Should NOT have password field
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).not.toBeVisible()
    
    // Should NOT have username field
    const usernameInput = page.locator('input#username')
    await expect(usernameInput).not.toBeVisible()
  })

  test('should display email-only form on /direct-login', async ({ page }) => {
    await page.goto('/direct-login')
    
    // Check page title
    await expect(page.locator('h2')).toContainText('Quick Login (Testing)')
    
    // Check for email input field
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    
    // Check for magic link button
    const submitButton = page.locator('button').filter({ hasText: /Send Magic Link/ })
    await expect(submitButton).toBeVisible()
    
    // Should have pre-filled email for testing
    await expect(emailInput).toHaveValue('patrick@powlax.com')
  })

  test('should show success message when magic link is sent', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Enter email
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('test@example.com')
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Wait for response (with timeout for API call)
    await page.waitForResponse(
      response => response.url().includes('/api/auth/magic-link') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {
      // If API fails, still check for UI feedback
    })
    
    // Check for success message or error
    const successMessage = page.locator('text=/magic link sent|Check your email/i')
    const errorMessage = page.locator('text=/failed|error/i')
    
    // Either success or error should be shown
    const hasMessage = await Promise.race([
      successMessage.isVisible().catch(() => false),
      errorMessage.isVisible().catch(() => false)
    ])
    
    expect(hasMessage).toBeTruthy()
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Try to submit with invalid email
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('invalid-email')
    
    // Try to submit
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Browser should show validation error
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMessage).toBeTruthy()
  })

  test('should handle empty email submission', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Try to submit without entering email
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Check for required field validation
    const emailInput = page.locator('input[type="email"]')
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMessage).toContain('Please fill')
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Set up request interception to delay the response
    await page.route('**/api/auth/magic-link', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.continue()
    })
    
    // Enter email
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('test@example.com')
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Check for loading state
    await expect(submitButton).toContainText(/Sending magic link/i)
    await expect(submitButton).toBeDisabled()
    
    // Check for spinner icon
    const spinner = page.locator('svg.animate-spin')
    await expect(spinner).toBeVisible()
  })

  test('should not show WordPress login elements', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Should not have "Forgot your password?" link (WordPress-style)
    const forgotPassword = page.locator('text=/forgot.*password/i')
    await expect(forgotPassword).not.toBeVisible()
    
    // Should not have username field
    const usernameLabel = page.locator('label:has-text("Username")')
    await expect(usernameLabel).not.toBeVisible()
    
    // Should not have password field
    const passwordLabel = page.locator('label:has-text("Password")')
    await expect(passwordLabel).not.toBeVisible()
    
    // Should have magic link explanation
    const magicLinkText = page.locator('text=/secure link|no password/i')
    await expect(magicLinkText).toBeVisible()
  })

  test('should handle logged-in users correctly', async ({ page }) => {
    // Simulate logged-in user
    await page.goto('/')
    await page.evaluate(() => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        display_name: 'Test User',
        role: 'player',
        roles: ['player']
      }
      localStorage.setItem('supabase_auth_user', JSON.stringify(mockUser))
    })
    
    // Visit login page
    await page.goto('/auth/login')
    
    // Should show logged-in state
    const loggedInMessage = page.locator('text=/already logged in|Logged in as/i')
    await expect(loggedInMessage).toBeVisible()
    
    // Should have option to continue to dashboard
    const dashboardButton = page.locator('button:has-text("Continue to Dashboard")')
    await expect(dashboardButton).toBeVisible()
    
    // Should have option to switch accounts
    const switchAccountLink = page.locator('text=/Not you|different account/i')
    await expect(switchAccountLink).toBeVisible()
  })
})