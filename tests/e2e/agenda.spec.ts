import { test, expect } from '@playwright/test'

/**
 * Agenda E2E Tests — Critical User Journeys
 *
 * Tests the Agenda page: loading, date navigation, and keyboard shortcuts.
 * The Agenda page lives at `/agenda` and uses search params `?date=YYYY-MM-DD`.
 *
 * Assumptions:
 *  - Authenticated session (or dev server bypasses auth).
 */

test.describe('Agenda — Page Load', () => {
  test('navigate to Agenda → verify page loads', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    // The header should show "Today" when viewing the current date
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })

    // The h1 should contain either "Today" or a date string
    const heading = page.locator('h1')
    const text = await heading.textContent()
    expect(text).toBeTruthy()
    expect(text!.length).toBeGreaterThan(0)

    // Previous/Next navigation buttons should be visible
    await expect(page.getByLabel('Previous day')).toBeVisible()
    await expect(page.getByLabel('Next day')).toBeVisible()
  })

  test('agenda shows today by default', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    // When viewing today, the heading should say "Today"
    await expect(page.locator('h1')).toContainText('Today', { timeout: 10000 })
  })

  test('agenda has date picker input', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    // The date input should be visible
    const dateInput = page.locator('input[type="date"]')
    await expect(dateInput).toBeVisible()
  })

  test('agenda shows content area (items or empty state)', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    // Either agenda items are rendered, or the empty state is shown
    const items = page.locator('[role="listitem"]')
    const emptyState = page.getByText('Your day has room')

    const hasItems = await items.count()
    const hasEmpty = await emptyState.isVisible().catch(() => false)

    expect(hasItems > 0 || hasEmpty).toBe(true)
  })
})

test.describe('Agenda — Date Navigation', () => {
  test('date navigation → verify date changes via Next button', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    // Get the current heading text
    const heading = page.locator('h1')
    const todayText = await heading.textContent()

    // Click the "Next day" button
    await page.getByLabel('Next day').click()
    await page.waitForTimeout(500)

    // The heading should change
    const nextText = await heading.textContent()
    expect(nextText).not.toBe(todayText)
  })

  test('date navigation → verify date changes via Previous button', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    const heading = page.locator('h1')
    const todayText = await heading.textContent()

    // Click the "Previous day" button
    await page.getByLabel('Previous day').click()
    await page.waitForTimeout(500)

    const prevText = await heading.textContent()
    expect(prevText).not.toBe(todayText)
  })

  test('URL updates with ?date= param on navigation', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    // Navigate forward one day
    await page.getByLabel('Next day').click()
    await page.waitForTimeout(500)

    // The URL should contain ?date= with a date string
    const url = page.url()
    expect(url).toMatch(/date=\d{4}-\d{2}-\d{2}/)
  })

  test('"Back to today" button returns to current date', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    // Navigate away from today
    await page.getByLabel('Next day').click()
    await page.waitForTimeout(500)

    // The "Back to today" button should appear when not on today
    const backBtn = page.getByText('Back to today')
    await expect(backBtn).toBeVisible()

    // Click it
    await backBtn.click()
    await page.waitForTimeout(500)

    // Should be back to Today
    await expect(page.locator('h1')).toContainText('Today')
  })

  test('navigating multiple days and back works correctly', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    // Navigate forward 3 days
    for (let i = 0; i < 3; i++) {
      await page.getByLabel('Next day').click()
      await page.waitForTimeout(200)
    }

    // The heading should not say "Today"
    const heading = page.locator('h1')
    await expect(heading).not.toContainText('Today')

    // Navigate back 3 days
    for (let i = 0; i < 3; i++) {
      await page.getByLabel('Previous day').click()
      await page.waitForTimeout(200)
    }

    // Should be back to Today
    await expect(heading).toContainText('Today')
  })
})

test.describe('Agenda — Keyboard Shortcuts', () => {
  test('keyboard shortcut T returns to today', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    // Navigate away from today
    await page.getByLabel('Next day').click()
    await page.waitForTimeout(500)
    await page.getByLabel('Next day').click()
    await page.waitForTimeout(500)

    // Verify we are not on today
    await expect(page.locator('h1')).not.toContainText('Today')

    // Press 'T' to return to today
    await page.keyboard.press('t')
    await page.waitForTimeout(500)

    // Should be back to today
    await expect(page.locator('h1')).toContainText('Today')
  })

  test('keyboard shortcut ArrowLeft navigates to previous day', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    const heading = page.locator('h1')
    const todayText = await heading.textContent()

    // Press left arrow
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(500)

    const prevText = await heading.textContent()
    expect(prevText).not.toBe(todayText)
  })

  test('keyboard shortcut ArrowRight navigates to next day', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    const heading = page.locator('h1')
    const todayText = await heading.textContent()

    // Press right arrow
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(500)

    const nextText = await heading.textContent()
    expect(nextText).not.toBe(todayText)
  })

  test('keyboard shortcuts do not fire when input is focused', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')

    const heading = page.locator('h1')
    const todayText = await heading.textContent()

    // Focus the date input
    const dateInput = page.locator('input[type="date"]')
    await dateInput.focus()

    // Press ArrowRight — should NOT change the agenda date (input handles it)
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(300)

    // The heading text should still be "Today" (keyboard shortcuts are blocked
    // when an input is focused)
    // Note: This tests the shortcut guard; the date input may or may not change
    // its own value depending on browser behavior.
    const afterText = await heading.textContent()
    expect(afterText).toBe(todayText)
  })
})
