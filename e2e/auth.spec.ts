import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'admin@rclengineering.com'
const ADMIN_PASS = 'admin123'

test.describe('Auth', () => {
  test('admin can login and see dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.locator('text=Sign in to your account')).toBeVisible()

    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10_000 })
  })

  test('wrong credentials show error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', 'wrongpass')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 10_000 })
  })

  test('admin can logout', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10_000 })

    // Logout via menu button (the logout icon in the sidebar)
    await page.click('text=logout')
    await expect(page.locator('text=Sign in to your account')).toBeVisible({ timeout: 10_000 })
  })
})
