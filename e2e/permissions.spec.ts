import { test, expect } from '@playwright/test'

const AGENT_EMAIL = 'agent@rclengineering.com'
const AGENT_PASS = 'agent123'

test.describe('Role Permissions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', AGENT_EMAIL)
    await page.fill('input[name="password"]', AGENT_PASS)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 15_000 })
  })

  test('agent sidebar shows only permitted pages', async ({ page }) => {
    // Agent should see Dashboard and Tickets
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /tickets/i })).toBeVisible()

    // Agent should NOT see Staff, Roles, or Settings
    await expect(page.getByRole('link', { name: /staff/i })).not.toBeVisible()
    await expect(page.getByRole('link', { name: /roles/i })).not.toBeVisible()
    await expect(page.getByRole('link', { name: /settings/i })).not.toBeVisible()
  })

  test('agent cannot access Staff page directly', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.getByText(/insufficient permissions/i)).toBeVisible({ timeout: 10_000 })
  })

  test('agent cannot access Roles page directly', async ({ page }) => {
    await page.goto('/admin/roles')
    await expect(page.getByText(/insufficient permissions/i)).toBeVisible({ timeout: 10_000 })
  })

  test('agent cannot access Settings page directly', async ({ page }) => {
    await page.goto('/admin/settings')
    await expect(page.getByText(/insufficient permissions/i)).toBeVisible({ timeout: 10_000 })
  })
})
