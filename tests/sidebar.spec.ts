import { test, expect } from '@playwright/test'

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/today')
    await page.waitForLoadState('networkidle')
  })

  test('renders all 5 primary nav items', async ({ page }) => {
    await expect(page.locator('a[href="/"]').first()).toBeVisible()
    await expect(page.locator('a[href="/today"]').first()).toBeVisible()
    await expect(page.locator('a[href="/tasks"]').first()).toBeVisible()
    await expect(page.locator('a[href="/updates"]').first()).toBeVisible()
    await expect(page.locator('a[href="/lists"]').first()).toBeVisible()
  })

  test('Today nav item has active indicator', async ({ page }) => {
    const todayLink = page.locator('a[href="/today"]').first()
    const shadow = await todayLink.evaluate(el => getComputedStyle(el).boxShadow)
    expect(shadow).not.toBe('none')
  })

  test('navigates to Inbox on click', async ({ page }) => {
    await page.locator('a[href="/"]').first().click()
    await expect(page).toHaveURL('/')
  })

  test('navigates to Tasks on click', async ({ page }) => {
    await page.locator('a[href="/tasks"]').first().click()
    await expect(page).toHaveURL('/tasks')
  })

  test('shows Favorites section', async ({ page }) => {
    await expect(page.getByText('Favorites').first()).toBeVisible()
  })

  test('Favorites section is collapsible', async ({ page }) => {
    const gettingStarted = page.getByText('Getting Started').first()
    await expect(gettingStarted).toBeVisible()

    await page.getByText('Favorites').first().click()
    await page.waitForTimeout(300)
    await expect(gettingStarted).not.toBeVisible()

    await page.getByText('Favorites').first().click()
    await page.waitForTimeout(300)
    await expect(gettingStarted).toBeVisible()
  })
})

test.describe('Sidebar FAB Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/today')
    await page.waitForLoadState('networkidle')
  })

  test('+ button opens FAB menu with 4 options', async ({ page }) => {
    await page.getByLabel('Create new').click()
    await page.waitForTimeout(200)

    await expect(page.getByText('New task', { exact: true }).last()).toBeVisible()
    await expect(page.getByText('New list', { exact: true }).last()).toBeVisible()
    await expect(page.getByText('Talk mode')).toBeVisible()
    await expect(page.getByText('New meeting note')).toBeVisible()
  })

  test('FAB menu closes on second click', async ({ page }) => {
    await page.getByLabel('Create new').click()
    await page.waitForTimeout(200)
    await expect(page.getByText('Talk mode')).toBeVisible()

    await page.getByLabel('Create new').click()
    await page.waitForTimeout(300)
    await expect(page.getByText('Talk mode')).not.toBeVisible()
  })
})

test.describe('Sidebar Profile Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/today')
    await page.waitForLoadState('networkidle')
  })

  test('avatar opens profile menu', async ({ page }) => {
    await page.getByLabel('User menu').click()
    await page.waitForTimeout(200)

    // Use exact matching to avoid hitting Today page habits section
    await expect(page.getByText('Settings')).toBeVisible()
    await expect(page.getByText('Sign out')).toBeVisible()
    await expect(page.getByText('Calendar')).toBeVisible()
    await expect(page.getByText('Focus')).toBeVisible()
    await expect(page.getByText('Matrix')).toBeVisible()
  })

  test('clicking Calendar in profile navigates to /calendar', async ({ page }) => {
    await page.getByLabel('User menu').click()
    await page.waitForTimeout(200)
    await page.getByText('Calendar').click()
    await expect(page).toHaveURL('/calendar')
  })

  test('clicking Statistics in profile navigates to /statistics', async ({ page }) => {
    await page.getByLabel('User menu').click()
    await page.waitForTimeout(200)
    await page.getByText('Statistics').click()
    await expect(page).toHaveURL('/statistics')
  })
})
