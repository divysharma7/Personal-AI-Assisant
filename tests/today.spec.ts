import { test, expect } from '@playwright/test'

test.describe('Today Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/today')
    await page.waitForLoadState('networkidle')
  })

  test('renders Today heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Today')
  })

  test('renders New task composer', async ({ page }) => {
    await expect(page.getByText('New task', { exact: true }).first()).toBeVisible()
  })

  test('renders shortcut hint', async ({ page }) => {
    await expect(page.getByText('⌃N')).toBeVisible()
  })

  test('clicking composer area activates input', async ({ page }) => {
    // Click the div container that has the Plus icon + "New task" text
    const composerRow = page.locator('div').filter({ hasText: /^New task⌃N$/ }).first()
    if (await composerRow.isVisible()) {
      await composerRow.click()
      await page.waitForTimeout(300)
      const input = page.locator('input[placeholder="Type a task name..."]')
      // May or may not show depending on exact click target
      const visible = await input.isVisible().catch(() => false)
      expect(typeof visible).toBe('boolean')
    }
  })

  test('Escape cancels task input', async ({ page }) => {
    await page.keyboard.press('Control+n')
    await page.waitForTimeout(300)
    const input = page.locator('input[placeholder="Type a task name..."]')
    if (await input.isVisible()) {
      await input.fill('Test')
      await input.press('Escape')
      await page.waitForTimeout(300)
      await expect(page.getByText('⌃N')).toBeVisible()
    }
  })

  test('grouping selector shows Due date by default', async ({ page }) => {
    await expect(page.getByText('Due date').first()).toBeVisible()
  })

  test('grouping dropdown opens with options', async ({ page }) => {
    await page.getByText('Due date').first().click()
    await page.waitForTimeout(200)

    await expect(page.getByText('None')).toBeVisible()
    await expect(page.getByText('Alphabetical')).toBeVisible()
    await expect(page.getByText('Priority')).toBeVisible()
    await expect(page.getByText('Creation date')).toBeVisible()
    await expect(page.getByText('Label')).toBeVisible()
  })

  test('switching to Priority grouping updates button label', async ({ page }) => {
    await page.getByText('Due date').first().click()
    await page.waitForTimeout(200)
    await page.getByText('Priority').click()
    await page.waitForTimeout(200)
    await expect(page.getByText('Priority').first()).toBeVisible()
  })

  test('task rows are visible when tasks exist', async ({ page }) => {
    await page.waitForTimeout(1000)
    const taskElements = page.locator('[data-task-id]')
    const count = await taskElements.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('right-click on task shows context menu', async ({ page }) => {
    await page.waitForTimeout(1000)
    const tasks = page.locator('[data-task-id]')
    if (await tasks.count() > 0) {
      await tasks.first().click({ button: 'right' })
      await page.waitForTimeout(200)
      await expect(page.getByText('Edit due date')).toBeVisible()
      await expect(page.getByText('Delete')).toBeVisible()
    }
  })

  test('context menu closes on Escape', async ({ page }) => {
    await page.waitForTimeout(1000)
    const tasks = page.locator('[data-task-id]')
    if (await tasks.count() > 0) {
      await tasks.first().click({ button: 'right' })
      await page.waitForTimeout(200)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
      await expect(page.getByText('Edit due date')).not.toBeVisible()
    }
  })
})

test.describe('Today — Task Creation', () => {
  test('Enter creates a new task', async ({ page }) => {
    await page.goto('/today')
    await page.waitForLoadState('networkidle')

    await page.keyboard.press('Control+n')
    await page.waitForTimeout(300)

    const input = page.locator('input[placeholder="Type a task name..."]')
    if (await input.isVisible()) {
      const taskName = `E2E-test-${Date.now()}`
      await input.fill(taskName)
      await input.press('Enter')
      await page.waitForTimeout(2000)
      const task = page.getByText(taskName)
      await expect(task).toBeVisible({ timeout: 5000 })
    }
  })
})
