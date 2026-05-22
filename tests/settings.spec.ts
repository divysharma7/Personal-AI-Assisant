import { test, expect } from '@playwright/test'

test.describe('Settings — Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test('settings page loads with correct title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Settings')
  })

  test('Profile tab is active by default', async ({ page }) => {
    // The Profile tab button should have the accent background (active state)
    const profileBtn = page.locator('button', { hasText: 'Profile' }).first()
    await expect(profileBtn).toBeVisible()

    // Profile tab content should show First name and Last name fields
    await expect(page.getByText('First name')).toBeVisible()
    await expect(page.getByText('Last name')).toBeVisible()
  })

  test('can switch to Features tab', async ({ page }) => {
    await page.locator('button', { hasText: 'Features' }).first().click()
    await page.waitForTimeout(300)

    // Appearance card should be visible
    await expect(page.getByText('Appearance')).toBeVisible()
    // Sounds card should be visible
    await expect(page.getByText('Sounds')).toBeVisible()
  })

  test('can switch to Integrations tab', async ({ page }) => {
    await page.locator('button', { hasText: 'Integrations' }).first().click()
    await page.waitForTimeout(300)

    // Integration list should be visible with known integrations
    await expect(page.getByText('Gmail').first()).toBeVisible()
    await expect(page.getByText('Google Calendar').first()).toBeVisible()
    await expect(page.getByText('Slack').first()).toBeVisible()
    await expect(page.getByText('GitHub').first()).toBeVisible()
  })

  test('can switch between all tabs', async ({ page }) => {
    const tabs = [
      { name: 'Date & Time', check: 'Week starts on' },
      { name: 'Calendar', check: 'Color coding' },
      { name: 'Shortcuts', check: '' },
      { name: 'Features', check: 'Appearance' },
      { name: 'Integrations', check: 'Gmail' },
      { name: 'Notifications', check: '' },
      { name: 'Labels', check: '' },
    ]

    for (const tab of tabs) {
      await page.locator('button', { hasText: tab.name }).first().click()
      await page.waitForTimeout(300)
      if (tab.check) {
        await expect(page.getByText(tab.check).first()).toBeVisible()
      }
    }
  })

  test('sign out button is visible', async ({ page }) => {
    await expect(page.getByText('Sign out')).toBeVisible()
  })
})

test.describe('Settings — Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test('can toggle theme from Features tab', async ({ page }) => {
    // Navigate to Features tab
    await page.locator('button', { hasText: 'Features' }).first().click()
    await page.waitForTimeout(300)

    // Find the theme dropdown (select element)
    const themeSelect = page.locator('select').first()
    await expect(themeSelect).toBeVisible()

    // Change to dark theme
    await themeSelect.selectOption('dark')
    await page.waitForTimeout(300)

    // Verify data-theme attribute changes on html element
    const dataTheme = await page.locator('html').getAttribute('data-theme')
    expect(dataTheme).toBe('dark')

    // Change to light theme
    await themeSelect.selectOption('light')
    await page.waitForTimeout(300)

    const dataThemeLight = await page.locator('html').getAttribute('data-theme')
    expect(dataThemeLight).toBe('light')
  })

  test('system theme option exists', async ({ page }) => {
    await page.locator('button', { hasText: 'Features' }).first().click()
    await page.waitForTimeout(300)

    const themeSelect = page.locator('select').first()
    const options = themeSelect.locator('option')

    // Should have System, Light, Dark options
    await expect(options.filter({ hasText: 'System preference' })).toBeAttached()
    await expect(options.filter({ hasText: 'Light' })).toBeAttached()
    await expect(options.filter({ hasText: 'Dark' })).toBeAttached()
  })

  test('sounds toggle switch works', async ({ page }) => {
    await page.locator('button', { hasText: 'Features' }).first().click()
    await page.waitForTimeout(300)

    // Find the sounds toggle switch
    const soundsToggle = page.getByLabel('Sounds')
    await expect(soundsToggle).toBeVisible()

    // Get initial state
    const initialState = await soundsToggle.getAttribute('aria-checked')

    // Click to toggle
    await soundsToggle.click()
    await page.waitForTimeout(200)

    // Verify state changed
    const newState = await soundsToggle.getAttribute('aria-checked')
    expect(newState).not.toBe(initialState)
  })
})
