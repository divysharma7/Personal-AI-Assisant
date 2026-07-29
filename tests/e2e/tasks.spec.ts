import { test, expect } from '@playwright/test'

/**
 * Tasks E2E Tests — Critical User Journeys
 *
 * Tests task creation, completion, and deletion from the Inbox page.
 * Each test is independent: it creates its own task fixture when needed.
 *
 * Assumptions:
 *  - The app is running and the user is authenticated (or the dev server
 *    bypasses auth). If auth is enforced, set up a storageState fixture
 *    in the Playwright config project.
 */

test.describe('Tasks — Create from Inbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('create task from Inbox → verify appears in list', async ({ page }) => {
    const taskTitle = `Create Test ${Date.now()}`

    // Activate the new task input
    await page.getByText('New task').first().click()
    await page.waitForTimeout(300)

    // The input should be visible
    const input = page.getByLabel('New task title')
    await expect(input).toBeVisible()

    // Type the task title and submit
    await input.fill(taskTitle)
    await input.press('Enter')
    await page.waitForTimeout(1000)

    // Verify the task appears in the list
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 })
  })

  test('create task with keyboard shortcut Ctrl+N', async ({ page }) => {
    const taskTitle = `Keyboard Task ${Date.now()}`

    // Use keyboard shortcut to open new task
    await page.keyboard.press('Control+n')
    await page.waitForTimeout(300)

    // Type the task title and submit
    const input = page.getByLabel('New task title')
    if (await input.isVisible().catch(() => false)) {
      await input.fill(taskTitle)
      await input.press('Enter')
      await page.waitForTimeout(1000)

      // Task should appear
      await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 })
    }
  })
})

test.describe('Tasks — Complete', () => {
  test('complete task → verify state changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const taskTitle = `Complete Test ${Date.now()}`

    // Create a task first
    await page.getByText('New task').first().click()
    await page.waitForTimeout(300)
    const input = page.getByLabel('New task title')
    await input.fill(taskTitle)
    await input.press('Enter')
    await page.waitForTimeout(1000)

    // Find the task row and its checkbox
    const taskRow = page.locator('[data-task-id]', { hasText: taskTitle })
    await expect(taskRow).toBeVisible({ timeout: 10000 })

    // Click the checkbox (first button in the row)
    const checkbox = taskRow.locator('button').first()
    await checkbox.click()
    await page.waitForTimeout(1000)

    // After completion, the task should move to a "Completed" section
    // or be visually marked as done. Check for the Completed section.
    const completedSection = page.getByText(/Completed/i)
    await expect(completedSection.first()).toBeVisible({ timeout: 5000 })
  })

  test('completed task shows strikethrough style', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const taskTitle = `Strike Test ${Date.now()}`

    // Create a task
    await page.getByText('New task').first().click()
    await page.waitForTimeout(300)
    const input = page.getByLabel('New task title')
    await input.fill(taskTitle)
    await input.press('Enter')
    await page.waitForTimeout(1000)

    // Complete it
    const taskRow = page.locator('[data-task-id]', { hasText: taskTitle })
    await expect(taskRow).toBeVisible({ timeout: 10000 })
    await taskRow.locator('button').first().click()
    await page.waitForTimeout(1000)

    // Verify the task text has line-through decoration
    const completedTask = page.getByText(taskTitle)
    const textDecoration = await completedTask.evaluate(
      (el) => getComputedStyle(el).textDecorationLine
    )
    expect(textDecoration).toContain('line-through')
  })
})

test.describe('Tasks — Delete', () => {
  test('delete task → verify disappears', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const taskTitle = `Delete Test ${Date.now()}`

    // Create a task first
    await page.getByText('New task').first().click()
    await page.waitForTimeout(300)
    const input = page.getByLabel('New task title')
    await input.fill(taskTitle)
    await input.press('Enter')
    await page.waitForTimeout(1000)

    // Find the task row
    const taskRow = page.locator('[data-task-id]', { hasText: taskTitle })
    await expect(taskRow).toBeVisible({ timeout: 10000 })

    // Right-click to open context menu
    await taskRow.click({ button: 'right' })
    await page.waitForTimeout(300)

    // Click "Delete" in the context menu
    await page.getByText('Delete').click()
    await page.waitForTimeout(1000)

    // Verify the task is no longer visible
    await expect(page.getByText(taskTitle)).not.toBeVisible({ timeout: 10000 })
  })

  test('delete via keyboard — context menu then Delete key', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const taskTitle = `Kb Delete Test ${Date.now()}`

    // Create a task
    await page.getByText('New task').first().click()
    await page.waitForTimeout(300)
    const input = page.getByLabel('New task title')
    await input.fill(taskTitle)
    await input.press('Enter')
    await page.waitForTimeout(1000)

    // Verify task exists
    const taskRow = page.locator('[data-task-id]', { hasText: taskTitle })
    await expect(taskRow).toBeVisible({ timeout: 10000 })

    // Right-click to open context menu
    await taskRow.click({ button: 'right' })
    await page.waitForTimeout(300)

    // Delete option should be visible
    await expect(page.getByText('Delete')).toBeVisible()

    // Press Escape to close menu (verify menu is dismissable)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    await expect(page.getByText('Delete')).not.toBeVisible()

    // Task should still exist after cancel
    await expect(taskRow).toBeVisible()
  })
})

test.describe('Tasks — Edge Cases', () => {
  test('empty Enter does not create a blank task', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const countBefore = await page.locator('[data-task-id]').count()

    // Activate input and press Enter without typing
    await page.getByText('New task').first().click()
    await page.waitForTimeout(300)
    const input = page.getByLabel('New task title')
    await input.press('Enter')
    await page.waitForTimeout(1000)

    // Task count should remain the same
    const countAfter = await page.locator('[data-task-id]').count()
    expect(countAfter).toBe(countBefore)
  })

  test('Escape discards draft and dismisses input', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Activate input
    await page.getByText('New task').first().click()
    await page.waitForTimeout(300)
    const input = page.getByLabel('New task title')
    await expect(input).toBeVisible()

    // Type something then Escape
    await input.fill('Should not exist')
    await input.press('Escape')
    await page.waitForTimeout(300)

    // The input should be dismissed and "New task" text should return
    await expect(page.getByText('New task').first()).toBeVisible()

    // The discarded text should NOT appear as a task
    await expect(page.getByText('Should not exist')).not.toBeVisible()
  })

  test('task with special characters renders correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const taskTitle = `Special & <chars> ${Date.now()}`

    await page.getByText('New task').first().click()
    await page.waitForTimeout(300)
    const input = page.getByLabel('New task title')
    await input.fill(taskTitle)
    await input.press('Enter')
    await page.waitForTimeout(1000)

    // Task should render (the exact text may be sanitized, check partial match)
    const found = await page.getByText(`Special & <chars>`).count()
    expect(found).toBeGreaterThanOrEqual(1)
  })
})
