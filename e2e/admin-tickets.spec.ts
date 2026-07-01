import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'admin@rclengineering.com'
const ADMIN_PASS = 'admin123'

test.describe('Admin Tickets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASS)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 15_000 })
  })

  test('ticket list shows real data', async ({ page }) => {
    await page.getByRole('link', { name: /tickets/i }).first().click()
    await expect(page.getByRole('heading', { name: /tickets/i })).toBeVisible({ timeout: 10_000 })
  })

  test('can navigate to ticket detail', async ({ page }) => {
    await page.getByRole('link', { name: /tickets/i }).first().click()
    // Click first ticket link (starts with #)
    await page.locator('a[href*="/admin/tickets/"]').first().click()
    await expect(page.getByRole('heading', { name: /^Ticket #/ })).toBeVisible({ timeout: 10_000 })
  })

  test('can add a comment', async ({ page }) => {
    await page.getByRole('link', { name: /tickets/i }).first().click()
    await page.locator('a[href*="/admin/tickets/"]').first().click()
    await expect(page.getByRole('heading', { name: /^Ticket #/ })).toBeVisible({ timeout: 10_000 })

    // Add comment
    await page.getByPlaceholder(/type your reply/i).fill('E2E test comment')
    await page.getByRole('button', { name: /submit reply/i }).click()
    await expect(page.getByText('E2E test comment')).toBeVisible({ timeout: 10_000 })
  })

  test('all admin pages load', async ({ page }) => {
    const pages = [
      { link: /dashboard/i, heading: /dashboard/i },
      { link: /tickets/i, heading: /tickets/i },
      { link: /categories/i, heading: /categories/i },
      { link: /staff/i, heading: /staff/i },
      { link: /roles/i, heading: /roles/i },
      { link: /settings/i, heading: /settings/i },
      { link: /reports/i, heading: /reports/i },
    ]
    for (const { link, heading } of pages) {
      await page.getByRole('link', { name: link }).first().click()
      await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 10_000 })
    }
  })
})
