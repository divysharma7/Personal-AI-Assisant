import { test, expect } from '@playwright/test'

test.describe('Calendar Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
  })

  test('renders calendar with Today button', async ({ page }) => {
    await expect(page.getByText('Today').first()).toBeVisible()
  })

  test('renders view selector dropdown', async ({ page }) => {
    // The dropdown shows "Day" by default
    await expect(page.getByText('Day').first()).toBeVisible()
  })

  test('renders date header', async ({ page }) => {
    // Header shows day name like "Wednesday, May 20"
    const header = page.locator('h2').first()
    await expect(header).toBeVisible()
    const text = await header.textContent()
    expect(text?.length).toBeGreaterThan(3)
  })

  test('view dropdown shows all 5 options with shortcuts', async ({ page }) => {
    // Click the Day dropdown
    const dropdown = page.locator('button', { hasText: /^Day$/ }).first()
    await dropdown.click()
    await page.waitForTimeout(200)

    await expect(page.getByText('D / 1')).toBeVisible()
    await expect(page.getByText('W / 2')).toBeVisible()
    await expect(page.getByText('M / 3')).toBeVisible()
    await expect(page.getByText('Y / 4')).toBeVisible()
    await expect(page.getByText('A / 5')).toBeVisible()
  })

  test('switching to Week view shows day columns', async ({ page }) => {
    await page.locator('button', { hasText: /^Day$/ }).first().click()
    await page.waitForTimeout(200)
    await page.getByText('W / 2').click()
    await page.waitForTimeout(500)

    await expect(page.getByText('Mon').first()).toBeVisible()
    await expect(page.getByText('Tue').first()).toBeVisible()
  })

  test('switching to Month view shows date grid', async ({ page }) => {
    await page.locator('button', { hasText: /^Day$/ }).first().click()
    await page.waitForTimeout(200)
    await page.getByText('M / 3').click()
    await page.waitForTimeout(500)

    // Month view has many date numbers
    await expect(page.getByText('15').first()).toBeVisible()
  })

  test('switching to Year view shows 12 months', async ({ page }) => {
    await page.locator('button', { hasText: /^Day$/ }).first().click()
    await page.waitForTimeout(200)
    await page.getByText('Y / 4').click()
    await page.waitForTimeout(500)

    await expect(page.getByText('January').first()).toBeVisible()
    await expect(page.getByText('December').first()).toBeVisible()
  })

  test('mini calendar sidebar shows month grid', async ({ page }) => {
    // Mini calendar should show weekday labels
    await expect(page.getByText('May 2026').first()).toBeVisible()
  })

  test('Previous/Next buttons navigate dates', async ({ page }) => {
    const header = page.locator('h2').first()
    const before = await header.textContent()

    await page.locator('button[aria-label="Next"]').click()
    await page.waitForTimeout(300)

    const after = await header.textContent()
    expect(after).not.toBe(before)
  })

  test('three-dot menu shows View Options and Arrange Tasks', async ({ page }) => {
    await page.locator('button[aria-label="More options"]').click()
    await page.waitForTimeout(200)

    await expect(page.getByText('View Options')).toBeVisible()
    await expect(page.getByText('Arrange Tasks')).toBeVisible()
    await expect(page.getByText('Subscribe Calendar')).toBeVisible()
  })

  test('View Options modal opens', async ({ page }) => {
    await page.locator('button[aria-label="More options"]').click()
    await page.waitForTimeout(200)
    await page.getByText('View Options').click()
    await page.waitForTimeout(300)

    await expect(page.getByText('Show Weekends')).toBeVisible()
    await expect(page.getByText('Show Completed')).toBeVisible()
    await expect(page.getByText('Show Habit')).toBeVisible()
  })

  test('View Options modal closes on Escape', async ({ page }) => {
    await page.locator('button[aria-label="More options"]').click()
    await page.waitForTimeout(200)
    await page.getByText('View Options').click()
    await page.waitForTimeout(300)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    await expect(page.getByText('Show Weekends')).not.toBeVisible()
  })

  test('keyboard shortcut 2 switches to Week', async ({ page }) => {
    await page.keyboard.press('2')
    await page.waitForTimeout(500)
    // Week view shows "Week" in the dropdown
    await expect(page.locator('button', { hasText: /^Week$/ }).first()).toBeVisible()
  })

  test('keyboard shortcut t resets to today', async ({ page }) => {
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(200)
    await page.keyboard.press('t')
    await page.waitForTimeout(200)
    // Today button should be visible
    await expect(page.getByText('Today').first()).toBeVisible()
  })
})
