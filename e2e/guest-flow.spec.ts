import { test, expect } from '@playwright/test'

test.describe('Guest Flow', () => {
  test('guest can submit ticket via public form', async ({ page }) => {
    await page.goto('http://rcl-engineering.lvh.me:5173/report')

    await page.fill('input[name="title"]', 'E2E Test Issue')
    await page.fill('textarea[name="description"]', 'This is a test ticket from Playwright')
    await page.fill('input[name="fullName"]', 'Test Guest')
    await page.fill('input[name="email"]', 'e2e@test.com')
    await page.fill('input[name="phoneNumber"]', '0123456789')

    await page.click('button[type="submit"]')

    await expect(page.locator('text=Ticket Submitted')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('text=/track/')).toBeVisible()
  })

  test('guest can track ticket status', async ({ page }) => {
    // Submit a ticket first to get a tracking link
    await page.goto('http://rcl-engineering.lvh.me:5173/report')
    await page.fill('input[name="title"]', 'Track Test')
    await page.fill('input[name="fullName"]', 'Tracker')
    await page.fill('input[name="email"]', 'track@test.com')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Ticket Submitted')).toBeVisible({ timeout: 15_000 })

    // Extract the token from the page
    const trackingText = await page.locator('text=/track/').textContent()
    const token = trackingText?.trim().split('/track/').pop()
    expect(token).toBeTruthy()

    // Visit the tracking page
    await page.goto(`http://rcl-engineering.lvh.me:5173/track/${token}`)
    await expect(page.locator('text=Track Test')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('text=OPEN')).toBeVisible()
  })

  test('guest can reply on tracking page', async ({ page }) => {
    // Submit ticket
    await page.goto('http://rcl-engineering.lvh.me:5173/report')
    await page.fill('input[name="title"]', 'Reply Test')
    await page.fill('input[name="email"]', 'reply@test.com')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Ticket Submitted')).toBeVisible({ timeout: 15_000 })

    const trackingText = await page.locator('text=/track/').textContent()
    const token = trackingText?.trim().split('/track/').pop()

    // Reply
    await page.goto(`http://rcl-engineering.lvh.me:5173/track/${token}`)
    await page.fill('textarea', 'My issue is still happening')
    await page.click('button:has-text("Send Reply")')
    await expect(page.locator('text=My issue is still happening')).toBeVisible({ timeout: 10_000 })
  })
})
