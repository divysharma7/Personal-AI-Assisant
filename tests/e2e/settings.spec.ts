import { test, expect } from '@playwright/test'

/**
 * Settings E2E Tests — Critical User Journeys
 *
 * Tests the Settings page: tab rendering, tab switching, and URL sync.
 * The Settings page lives at `/settings` and syncs the active tab to `?section=`.
 *
 * Assumptions:
 *  - Authenticated session (or dev server bypasses auth).
 */

test.describe('Settings — Page Load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test('settings page loads with correct title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Settings')
  })

  test('navigate to Settings → verify tabs render', async ({ page }) => {
    // All three groups should be visible
    await expect(page.getByText('Personal').first()).toBeVisible()
    await expect(page.getByText('System').first()).toBeVisible()
    await expect(page.getByText('Workspace').first()).toBeVisible()

    // Key tabs should render in the sidebar
    await expect(page.getByText('Profile').first()).toBeVisible()
    await expect(page.getByText('Date & Time').first()).toBeVisible()
    await expect(page.getByText('Calendar').first()).toBeVisible()
    await expect(page.getByText('Habits').first()).toBeVisible()
    await expect(page.getByText('Personalization').first()).toBeVisible()
    await expect(page.getByText('Integrations').first()).toBeVisible()
    await expect(page.getByText('Notifications').first()).toBeVisible()
    await expect(page.getByText('Shortcuts').first()).toBeVisible()
  })

  test('Profile tab is active by default', async ({ page }) => {
    // The Profile tab button should have aria-current="page"
    const profileBtn = page.locator('button', { hasText: 'Profile' }).first()
    await expect(profileBtn).toHaveAttribute('aria-current', 'page')

    // Profile content should be visible — First name and Last name fields
    await expect(page.getByText('First name')).toBeVisible()
    await expect(page.getByText('Last name')).toBeVisible()
  })

  test('Sign out button is visible', async ({ page }) => {
    await expect(page.getByText('Sign out')).toBeVisible()
  })

  test('settings page has 2-column layout', async ({ page }) => {
    // The settings page uses a grid layout with sidebar (220px) + content
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()

    // Content section should be visible
    const content = page.locator('section')
    await expect(content.first()).toBeVisible()
  })
})

test.describe('Settings — Tab Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test('switch tabs → verify URL updates with ?section=', async ({ page }) => {
    // Default: ?section=profile
    await expect(page).toHaveURL(/section=profile/)

    // Switch to Features / Personalization
    await page.locator('button', { hasText: 'Personalization' }).first().click()
    await page.waitForTimeout(300)
    await expect(page).toHaveURL(/section=features/)

    // Switch to Integrations
    await page.locator('button', { hasText: 'Integrations' }).first().click()
    await page.waitForTimeout(300)
    await expect(page).toHaveURL(/section=integrations/)

    // Switch to Shortcuts
    await page.locator('button', { hasText: 'Shortcuts' }).first().click()
    await page.waitForTimeout(300)
    await expect(page).toHaveURL(/section=shortcuts/)
  })

  test('switching to Date & Time tab shows correct content', async ({ page }) => {
    await page.locator('button', { hasText: 'Date & Time' }).first().click()
    await page.waitForTimeout(500)

    // Should show date/time related settings
    await expect(page.getByText('Week starts on').first()).toBeVisible()
  })

  test('switching to Personalization (Features) tab shows theme options', async ({ page }) => {
    await page.locator('button', { hasText: 'Personalization' }).first().click()
    await page.waitForTimeout(500)

    // Appearance section should be visible
    await expect(page.getByText('Appearance').first()).toBeVisible()
  })

  test('switching to Integrations tab shows connected services', async ({ page }) => {
    await page.locator('button', { hasText: 'Integrations' }).first().click()
    await page.waitForTimeout(500)

    // Should show known integration options
    await expect(page.getByText('Gmail').first()).toBeVisible()
    await expect(page.getByText('Google Calendar').first()).toBeVisible()
    await expect(page.getByText('Slack').first()).toBeVisible()
    await expect(page.getByText('GitHub').first()).toBeVisible()
  })

  test('switching to Shortcuts tab shows keyboard shortcuts', async ({ page }) => {
    await page.locator('button', { hasText: 'Shortcuts' }).first().click()
    await page.waitForTimeout(500)

    // Shortcuts tab content should render
    // (exact text depends on ShortcutsTab component)
    const content = page.locator('section')
    await expect(content.first()).toBeVisible()
  })

  test('can switch between all tabs without error', async ({ page }) => {
    const tabs = [
      'Profile',
      'Date & Time',
      'Calendar',
      'Habits',
      'Personalization',
      'Focus',
      'Integrations',
      'Notifications',
      'Data & privacy',
      'Shortcuts',
    ]

    for (const tabName of tabs) {
      await page.locator('button', { hasText: tabName }).first().click()
      await page.waitForTimeout(300)

      // The active tab should have aria-current="page"
      const activeBtn = page.locator('button[aria-current="page"]')
      await expect(activeBtn).toBeVisible()

      // URL should contain ?section= parameter
      await expect(page).toHaveURL(/section=/)
    }
  })

  test('direct URL with ?section= param opens correct tab', async ({ page }) => {
    // Navigate directly to a specific section
    await page.goto('/settings?section=integrations')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Integrations tab should be active
    const integrationsBtn = page.locator('button', { hasText: 'Integrations' }).first()
    await expect(integrationsBtn).toHaveAttribute('aria-current', 'page')

    // Integrations content should be visible
    await expect(page.getByText('Gmail').first()).toBeVisible()
  })

  test('invalid ?section= value falls back to Profile', async ({ page }) => {
    await page.goto('/settings?section=nonexistent')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Should fall back to Profile tab
    const profileBtn = page.locator('button', { hasText: 'Profile' }).first()
    await expect(profileBtn).toHaveAttribute('aria-current', 'page')
  })

  test('tab header updates when switching tabs', async ({ page }) => {
    // Default: Profile
    await expect(page.locator('h2')).toContainText('Profile')

    // Switch to Notifications
    await page.locator('button', { hasText: 'Notifications' }).first().click()
    await page.waitForTimeout(500)

    await expect(page.locator('h2')).toContainText('Notifications')
  })
})
