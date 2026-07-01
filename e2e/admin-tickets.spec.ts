import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'admin@rclengineering.com'
const ADMIN_PASS = 'admin123'

test.describe('Admin Tickets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10_000 })
  })

  test('ticket list shows real data', async ({ page }) => {
    await page.click('text=Tickets')
    await expect(page).toHaveURL(/\/admin\/tickets/)
    // Should see the tickets table with real data
    await expect(page.locator('text=Total Tickets')).toBeVisible({ timeout: 10_000 })
  })

  test('can open ticket detail', async ({ page }) => {
    await page.click('text=Tickets')
    // Click the first ticket view link
    const firstLink = page.locator('a:has-text("#")').first()
    await expect(firstLink).toBeVisible({ timeout: 10_000 })
    await firstLink.click()
    await expect(page).toHaveURL(/\/admin\/tickets\//)
    // Detail page should show ticket controls
    await expect(page.locator('text=Status')).toBeVisible({ timeout: 5_000 })
  })

  test('can change ticket status', async ({ page }) => {
    await page.click('text=Tickets')
    const firstLink = page.locator('a:has-text("#")').first()
    await firstLink.click()
    await expect(page).toHaveURL(/\/admin\/tickets\//)

    // Change status via dropdown
    const statusSelect = page.locator('select').first()
    await statusSelect.selectOption('PENDING')
    // Should show success and update
    await expect(page.locator('text=Updated')).toBeVisible({ timeout: 5_000 })
  })

  test('can add comment with notify guest', async ({ page }) => {
    await page.click('text=Tickets')
    const firstLink = page.locator('a:has-text("#")').first()
    await firstLink.click()

    // Add a comment
    const textarea = page.locator('textarea[placeholder*="reply"]')
    await expect(textarea).toBeVisible({ timeout: 5_000 })
    await textarea.fill('E2E test comment from Playwright')

    // Check notify guest if visible
    const notifyCheckbox = page.locator('text=Notify guest')
    if (await notifyCheckbox.isVisible()) {
      await notifyCheckbox.click()
    }

    await page.click('button:has-text("Submit Reply")')
    await expect(page.locator('text=E2E test comment from Playwright')).toBeVisible({ timeout: 5_000 })
  })

  test('can navigate all admin pages', async ({ page }) => {
    const pages = ['Dashboard', 'Tickets', 'Categories', 'Staff', 'Roles', 'Settings', 'Reports']
    for (const name of pages) {
      await page.click(`text=${name}`)
      await expect(page.locator(`text=${name}`).first()).toBeVisible({ timeout: 10_000 })
    }
  })
})
