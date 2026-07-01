import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'admin@rclengineering.com'
const ADMIN_PASS = 'admin123'
const LOGIN_URL = '/login'

test.describe('Auth', () => {
  test('admin can login and see dashboard', async ({ page }) => {
    await page.goto(LOGIN_URL)
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')

    // Wait for dashboard heading
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 15_000 })
  })

  test('wrong credentials show error', async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', 'wrongpass')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 10_000 })
  })

  test('admin can logout', async ({ page }) => {
    // Login first
    await page.goto(LOGIN_URL)
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 15_000 })

    // Click logout button in sidebar
    await page.getByRole('button', { name: /logout/i }).click()
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible({ timeout: 10_000 })
  })
})
