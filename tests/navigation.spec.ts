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

test.describe('Sidebar Link Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('sidebar Inbox link navigates to /', async ({ page }) => {
    // Navigate somewhere else first
    await page.goto('/today')
    await page.waitForLoadState('networkidle')

    await page.locator('a[href="/"]').first().click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('Inbox')
  })

  test('sidebar Today link navigates to /today', async ({ page }) => {
    await page.locator('a[href="/today"]').first().click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/today')
    await expect(page.locator('h1')).toContainText('Today')
  })

  test('sidebar Tasks link navigates to /tasks', async ({ page }) => {
    await page.locator('a[href="/tasks"]').first().click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/tasks')
    await expect(page.locator('h1')).toContainText('Tasks')
  })

  test('Calendar accessible via profile menu', async ({ page }) => {
    await page.getByLabel('User menu').click()
    await page.waitForTimeout(200)
    await page.getByText('Calendar').click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/calendar')
  })

  test('Habits accessible via profile menu', async ({ page }) => {
    await page.getByLabel('User menu').click()
    await page.waitForTimeout(200)
    await page.getByText('Habits').click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/habits')
  })

  test('Settings accessible via profile menu', async ({ page }) => {
    await page.getByLabel('User menu').click()
    await page.waitForTimeout(200)
    await page.getByText('Settings').click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/settings')
  })
})

test.describe('Collapsed Sidebar', () => {
  test('collapsed sidebar shows icons only', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Hover sidebar to reveal the collapse button
    const sidebar = page.locator('aside').first()
    await sidebar.hover()
    await page.waitForTimeout(300)

    // Click the collapse button
    const collapseBtn = page.getByLabel('Collapse sidebar')
    await collapseBtn.click()
    await page.waitForTimeout(400)

    // Verify sidebar is now narrow (48px) — icon-only mode
    const collapsedSidebar = page.locator('aside').first()
    const width = await collapsedSidebar.evaluate((el) => el.getBoundingClientRect().width)
    expect(width).toBeLessThanOrEqual(60)

    // Text labels should not be visible in collapsed state
    // The nav links should still exist but without text labels
    const navLinks = collapsedSidebar.locator('a')
    const linkCount = await navLinks.count()
    expect(linkCount).toBeGreaterThan(0)

    // Expand button should be available
    await expect(page.getByLabel('Expand sidebar')).toBeVisible()
  })

  test('can expand sidebar after collapsing', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Collapse sidebar
    const sidebar = page.locator('aside').first()
    await sidebar.hover()
    await page.waitForTimeout(300)
    await page.getByLabel('Collapse sidebar').click()
    await page.waitForTimeout(400)

    // Expand sidebar
    await page.getByLabel('Expand sidebar').click()
    await page.waitForTimeout(400)

    // Verify sidebar is expanded again — text labels should be visible
    await expect(page.getByText('Inbox').first()).toBeVisible()
    await expect(page.getByText('Today').first()).toBeVisible()
    await expect(page.getByText('Tasks').first()).toBeVisible()
  })
})
