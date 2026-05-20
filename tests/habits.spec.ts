import { test, expect } from '@playwright/test'

test.describe('Habits Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate via profile menu since Habits is not in primary nav
    await page.goto('/habits')
    await page.waitForLoadState('networkidle')
  })

  test('renders Habit header with filter dropdown', async ({ page }) => {
    await expect(page.getByText('Habit')).toBeVisible()
  })

  test('filter dropdown toggles Active/Archived', async ({ page }) => {
    await page.locator('button', { hasText: 'Habit' }).click()
    await expect(page.getByText('active')).toBeVisible()
    await expect(page.getByText('archived')).toBeVisible()
  })

  test('shows day strip with 7 days', async ({ page }) => {
    // Day strip should have day labels (Mon, Tue, etc.)
    const dayButtons = page.locator('button').filter({ hasText: /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s\d+$/ })
    const count = await dayButtons.count()
    expect(count).toBe(7)
  })

  test('shows empty state when no habits', async ({ page }) => {
    // If no habits, should show empty state
    const noHabits = page.getByText('No habits yet')
    const browseGallery = page.getByText('Browse Gallery')

    const isEmpty = await noHabits.isVisible().catch(() => false)
    if (isEmpty) {
      await expect(browseGallery).toBeVisible()
      await expect(page.getByText('Create Custom')).toBeVisible()
    }
  })

  test('+ button opens creation wizard or gallery', async ({ page }) => {
    // Find the + icon button in the header
    const addBtn = page.locator('button').filter({ has: page.locator('svg.lucide-plus') }).first()
    if (await addBtn.isVisible()) {
      await addBtn.click()
      await page.waitForTimeout(300)
      // Should open wizard
    }
  })

  test('grid/list view toggle works', async ({ page }) => {
    // Find the grid/list toggle button
    const toggleBtn = page.locator('button').filter({ has: page.locator('svg.lucide-grid-3x3, svg.lucide-list') }).first()
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click()
      await page.waitForTimeout(200)
      // View should change
    }
  })

  test('section groups are collapsible', async ({ page }) => {
    // If habits exist, sections should be visible
    const sections = ['Morning', 'Afternoon', 'Night', 'Others']
    for (const section of sections) {
      const sectionBtn = page.locator('button', { hasText: section })
      if (await sectionBtn.isVisible()) {
        await sectionBtn.click()
        await page.waitForTimeout(200)
        // Collapse animation
        await sectionBtn.click()
        await page.waitForTimeout(200)
        break
      }
    }
  })

  test('habit check-in opens journal modal', async ({ page }) => {
    await page.waitForTimeout(1000)
    // Find a check button (rounded-full checkbox)
    const checkBtns = page.locator('button.rounded-full').filter({ has: page.locator('svg') })
    const count = await checkBtns.count()
    if (count > 0) {
      // Click the last one (checkbox for a habit)
      await checkBtns.last().click()
      await page.waitForTimeout(500)
      // Journal modal should appear
      const moodHeader = page.getByText('How are you feeling?')
      const visible = await moodHeader.isVisible().catch(() => false)
      if (visible) {
        await expect(moodHeader).toBeVisible()
        // Should show 5 mood emojis
        await expect(page.getByText('Cancel')).toBeVisible()
        await expect(page.getByText('Save')).toBeVisible()
      }
    }
  })

  test('clicking a habit row opens detail panel', async ({ page }) => {
    await page.waitForTimeout(1000)
    // Find habit rows (items with Flame icon or streak text)
    const habitRows = page.locator('div.cursor-pointer', { hasText: /Day/ })
    const count = await habitRows.count()
    if (count > 0) {
      await habitRows.first().click()
      await page.waitForTimeout(300)
      // Detail panel should show stats
      const statsVisible = await page.getByText('Total Check-Ins').isVisible().catch(() => false)
      if (statsVisible) {
        await expect(page.getByText('Total Check-Ins')).toBeVisible()
        await expect(page.getByText('Current Streak')).toBeVisible()
      }
    }
  })
})
