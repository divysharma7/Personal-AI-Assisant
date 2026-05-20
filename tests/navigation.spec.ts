import { test, expect } from '@playwright/test'

test.describe('App Navigation — Route Coverage', () => {
  test('/ loads Inbox page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Inbox')
  })

  test('/today loads Today page', async ({ page }) => {
    await page.goto('/today')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Today')
  })

  test('/tasks loads Tasks page', async ({ page }) => {
    await page.goto('/tasks')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Tasks')
  })

  test('/habits loads Habits page', async ({ page }) => {
    await page.goto('/habits')
    await page.waitForLoadState('networkidle')
    const content = await page.locator('main, #main-content').first().textContent()
    expect(content).toBeTruthy()
  })

  test('/calendar loads Calendar page', async ({ page }) => {
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Today').first()).toBeVisible()
  })

  test('/statistics loads Statistics page', async ({ page }) => {
    await page.goto('/statistics')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Statistics')
  })

  test('/focus loads Focus page', async ({ page }) => {
    await page.goto('/focus')
    await page.waitForLoadState('networkidle')
    const content = await page.locator('main, #main-content').first().textContent()
    expect(content).toBeTruthy()
  })

  test('/lists loads Lists page', async ({ page }) => {
    await page.goto('/lists')
    await page.waitForLoadState('networkidle')
    const content = await page.locator('main, #main-content').first().textContent()
    expect(content).toBeTruthy()
  })

  test('/updates loads Updates page', async ({ page }) => {
    await page.goto('/updates')
    await page.waitForLoadState('networkidle')
    const content = await page.locator('main, #main-content').first().textContent()
    expect(content).toBeTruthy()
  })
})

test.describe('App Shell', () => {
  test('sidebar nav is visible', async ({ page }) => {
    await page.goto('/today')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Inbox').first()).toBeVisible()
    await expect(page.getByText('Today').first()).toBeVisible()
  })

  test('main content area renders', async ({ page }) => {
    await page.goto('/today')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main, #main-content').first()).toBeVisible()
  })

  test('skip to content link exists', async ({ page }) => {
    await page.goto('/today')
    const skip = page.locator('a', { hasText: 'Skip to content' })
    await expect(skip).toBeAttached()
  })

  test('sidebar persists across page navigation', async ({ page }) => {
    await page.goto('/today')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Inbox').first()).toBeVisible()

    await page.locator('a[href="/tasks"]').first().click()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Inbox').first()).toBeVisible()
  })
})
