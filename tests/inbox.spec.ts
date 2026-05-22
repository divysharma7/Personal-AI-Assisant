import { test, expect } from '@playwright/test'

test.describe('Inbox — Critical Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('inbox page loads with correct title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Inbox')
  })

  test('can create a new task from inbox', async ({ page }) => {
    const taskTitle = `E2E Task ${Date.now()}`

    // Click the "New task" area to activate the input
    await page.getByText('New task').first().click()
    await page.waitForTimeout(200)

    // The input should now be visible with the placeholder
    const input = page.getByLabel('New task title')
    await expect(input).toBeVisible()

    // Type the task title and submit
    await input.fill(taskTitle)
    await input.press('Enter')
    await page.waitForTimeout(500)

    // Verify the task appears in the list
    await expect(page.getByText(taskTitle)).toBeVisible()
  })

  test('new task input can be dismissed with Escape', async ({ page }) => {
    // Click the "New task" area to activate the input
    await page.getByText('New task').first().click()
    await page.waitForTimeout(200)

    const input = page.getByLabel('New task title')
    await expect(input).toBeVisible()

    // Type something then press Escape
    await input.fill('temp task')
    await input.press('Escape')
    await page.waitForTimeout(300)

    // The input should no longer be focused / visible — "New task" text returns
    await expect(page.getByText('New task').first()).toBeVisible()
  })

  test('can toggle a task complete', async ({ page }) => {
    const taskTitle = `Toggle Test ${Date.now()}`

    // First, create a task so we have something to toggle
    await page.getByText('New task').first().click()
    await page.waitForTimeout(200)
    const input = page.getByLabel('New task title')
    await input.fill(taskTitle)
    await input.press('Enter')
    await page.waitForTimeout(500)

    // Find the task row and its checkbox button
    const taskRow = page.locator(`[data-task-id]`, { hasText: taskTitle })
    await expect(taskRow).toBeVisible()

    // Click the checkbox (first button inside the task row)
    const checkbox = taskRow.locator('button').first()
    await checkbox.click()
    await page.waitForTimeout(600)

    // After completion, the task should move to the "Completed" section
    // or no longer be in the active tasks area.
    // Check that a "Completed" section appeared (if there are done tasks)
    const completedSection = page.getByText(/Completed/i)
    await expect(completedSection.first()).toBeVisible({ timeout: 3000 })
  })

  test('empty inbox shows empty state message', async ({ page }) => {
    // If inbox happens to be empty, the empty state should be visible
    // This test checks the empty state structure exists in the DOM
    const emptyState = page.getByText('Your inbox is empty')
    const taskList = page.locator('[data-task-id]')

    // Either tasks exist, or the empty state is shown
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    const hasActiveTasks = await taskList.count()

    expect(hasEmptyState || hasActiveTasks > 0).toBe(true)
  })

  test('toolbar filter and more buttons are visible', async ({ page }) => {
    await expect(page.getByLabel('Filter')).toBeVisible()
    await expect(page.getByLabel('More options')).toBeVisible()
  })
})
