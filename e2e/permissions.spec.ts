import { test, expect } from '@playwright/test'

const AGENT_EMAIL = 'agent@rclengineering.com'
const AGENT_PASS = 'agent123'

test.describe('Role Permissions', () => {
  test('agent cannot access Staff page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', AGENT_EMAIL)
    await page.fill('input[name="password"]', AGENT_PASS)
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10_000 })

    // Try to navigate to Staff page directly
    await page.goto('/admin/users')
    await expect(page.locator('text=Insufficient permissions')).toBeVisible({ timeout: 10_000 })
  })

  test('agent cannot access Roles page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', AGENT_EMAIL)
    await page.fill('input[name="password"]', AGENT_PASS)
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10_000 })

    await page.goto('/admin/roles')
    await expect(page.locator('text=Insufficient permissions')).toBeVisible({ timeout: 10_000 })
  })

  test('agent cannot access Settings page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', AGENT_EMAIL)
    await page.fill('input[name="password"]', AGENT_PASS)
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10_000 })

    await page.goto('/admin/settings')
    await expect(page.locator('text=Insufficient permissions')).toBeVisible({ timeout: 10_000 })
  })

  test('agent sidebar shows only permitted pages', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', AGENT_EMAIL)
    await page.fill('input[name="password"]', AGENT_PASS)
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10_000 })

    // Agent should see Dashboard and Tickets in sidebar
    await expect(page.locator('text=Dashboard').first()).toBeVisible()
    await expect(page.locator('text=Tickets').first()).toBeVisible()

    // Agent should NOT see Staff, Roles, or Settings
    await expect(page.locator('a:has-text("Staff")')).not.toBeVisible()
  })
})
