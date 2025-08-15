import puppeteer from 'puppeteer'

async function testDirectAuth() {
  console.log('🧪 Testing Direct Auth Workaround...\n')
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    defaultViewport: { width: 1280, height: 800 }
  })
  
  try {
    const page = await browser.newPage()
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Browser error:', msg.text())
      } else if (msg.text().includes('✅') || msg.text().includes('localStorage')) {
        console.log('📋 Browser log:', msg.text())
      }
    })
    
    // Step 1: Navigate to direct auth page
    console.log('📍 Step 1: Navigating to /auth/direct-auth...')
    await page.goto('http://localhost:3000/auth/direct-auth', {
      waitUntil: 'networkidle0'
    })
    
    // Step 2: Click the create session button
    console.log('🖱️ Step 2: Clicking "Create Patrick Admin Session" button...')
    await page.waitForSelector('button:has-text("Create Patrick Admin Session")', { timeout: 5000 })
    await page.click('button:has-text("Create Patrick Admin Session")')
    
    // Step 3: Wait for navigation or success message
    console.log('⏳ Step 3: Waiting for authentication...')
    await page.waitForTimeout(2000)
    
    // Step 4: Check if we're redirected to dashboard
    const currentUrl = page.url()
    console.log('📍 Current URL:', currentUrl)
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS: Redirected to dashboard!')
      
      // Check for user info on dashboard
      const userInfo = await page.evaluate(() => {
        const storage = localStorage.getItem('sb-bhviqmmtzjvqkyfsddtk-auth-token')
        return storage ? JSON.parse(storage) : null
      })
      
      if (userInfo) {
        console.log('✅ User session found in localStorage:', {
          email: userInfo.user?.email,
          hasToken: !!userInfo.access_token
        })
      }
    } else if (currentUrl.includes('/auth/direct-auth')) {
      // Check for error message
      const message = await page.$eval('.bg-red-50', el => el.textContent).catch(() => null)
      if (message) {
        console.error('❌ Error message:', message)
      } else {
        console.log('⚠️ Still on auth page - checking localStorage...')
        
        const session = await page.evaluate(() => {
          return localStorage.getItem('sb-bhviqmmtzjvqkyfsddtk-auth-token')
        })
        
        if (session) {
          console.log('✅ Session created in localStorage')
          console.log('📝 Manual navigation to /dashboard may be needed')
        } else {
          console.log('❌ No session created')
        }
      }
    } else {
      console.log('❓ Unexpected redirect to:', currentUrl)
    }
    
    // Step 5: Test dashboard access
    console.log('\n📍 Step 5: Testing direct dashboard access...')
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'networkidle0'
    })
    
    await page.waitForTimeout(2000)
    const finalUrl = page.url()
    
    if (finalUrl.includes('/dashboard')) {
      console.log('✅ Dashboard is accessible!')
      
      // Check for content
      const hasContent = await page.$eval('body', el => {
        return !el.textContent?.includes('Loading') && el.textContent?.length > 100
      }).catch(() => false)
      
      if (hasContent) {
        console.log('✅ Dashboard has content loaded')
      } else {
        console.log('⚠️ Dashboard accessible but may be loading')
      }
    } else {
      console.log('❌ Dashboard not accessible, redirected to:', finalUrl)
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST SUMMARY:')
    console.log('='.repeat(60))
    if (finalUrl.includes('/dashboard')) {
      console.log('✅ WORKAROUND IS FUNCTIONAL')
      console.log('📝 Patrick can access the dashboard using /auth/direct-auth')
    } else {
      console.log('❌ WORKAROUND NEEDS ADJUSTMENT')
      console.log('📝 Check browser console for errors')
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  } finally {
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser will stay open for manual inspection')
    console.log('Close the browser window when done')
  }
}

testDirectAuth().catch(console.error)