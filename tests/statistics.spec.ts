import { test, expect } from '@playwright/test'

test.describe('Statistics Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statistics')
    await page.waitForLoadState('networkidle')
  })

  test('renders Statistics heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Statistics')
  })

  test('renders 3 tab buttons', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Overview' })).toBeVisible()
    // Use locator with exact text to avoid matching "Task" inside other elements
    const tabs = page.locator('button').filter({ hasText: /^(Overview|Task|Focus)$/ })
    const count = await tabs.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('renders Done link', async ({ page }) => {
    await expect(page.locator('a', { hasText: 'Done' })).toBeVisible()
  })

  test('Overview tab shows stat cards', async ({ page }) => {
    await expect(page.getByText("Today's Completion").first()).toBeVisible()
    await expect(page.getByText('Total Completed').first()).toBeVisible()
  })

  test('Overview tab shows completion chart', async ({ page }) => {
    await expect(page.getByText('Recent Completion Curve').first()).toBeVisible()
  })

  test('Task tab shows metrics', async ({ page }) => {
    // Click the tab button specifically (not any "Task" text)
    const taskTab = page.locator('button').filter({ hasText: /^Task$/ })
    await taskTab.click()
    await page.waitForTimeout(500)
    await expect(page.getByText('Completed Tasks').first()).toBeVisible()
  })

  test('Task tab shows distribution', async ({ page }) => {
    const taskTab = page.locator('button').filter({ hasText: /^Task$/ })
    await taskTab.click()
    await page.waitForTimeout(500)
    await expect(page.getByText('Completion Rate Distribution').first()).toBeVisible()
    await expect(page.getByText('Overdue').first()).toBeVisible()
  })

  test('Focus tab shows overview', async ({ page }) => {
    const focusTab = page.locator('button').filter({ hasText: /^Focus$/ })
    await focusTab.click()
    await page.waitForTimeout(500)
    await expect(page.getByText('Focus Overview').first()).toBeVisible()
  })

  test('Focus tab shows year grid', async ({ page }) => {
    const focusTab = page.locator('button').filter({ hasText: /^Focus$/ })
    await focusTab.click()
    await page.waitForTimeout(500)
    await expect(page.getByText('Year Grid').first()).toBeVisible()
  })

  test('Done link navigates to /', async ({ page }) => {
    await page.locator('a', { hasText: 'Done' }).click()
    await expect(page).toHaveURL('/')
  })
})
