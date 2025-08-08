import { test, expect } from '@playwright/test'

const DRILL_ID = process.env.POW_LAX_DRILL_ID || '104680f1-9e6d-41ff-af22-5ba33bc2a968'
const STRATEGY_ID = process.env.POW_LAX_STRATEGY_ID || '1'

test.describe('Details Page (real data)', () => {
  test('drill detail returns 200 and renders component', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    const response = await page.goto(`/details/drill/${encodeURIComponent(DRILL_ID)}`, {
      waitUntil: 'domcontentloaded'
    })

    expect(response?.status()).toBe(200)
    await expect(page.getByText('Server Error')).toHaveCount(0)
    await expect(page.locator('[data-testid="drill-details"]')).toHaveCount(1)

    if (errors.length > 0) {
      console.warn('Console errors on drill detail:', errors.join('\n'))
    }
  })

  test('strategy detail returns 200 and renders component', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    const response = await page.goto(`/details/strategy/${encodeURIComponent(STRATEGY_ID)}`, {
      waitUntil: 'domcontentloaded'
    })

    expect(response?.status()).toBe(200)
    await expect(page.getByText('Server Error')).toHaveCount(0)
    await expect(page.locator('[data-testid="strategy-details"]')).toHaveCount(1)

    if (errors.length > 0) {
      console.warn('Console errors on strategy detail:', errors.join('\n'))
    }
  })
})


