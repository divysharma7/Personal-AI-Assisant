import { test, expect } from '@playwright/test'

test.describe('Workflows — Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('workflows section is visible in sidebar', async ({ page }) => {
    await expect(page.getByText('Workflows').first()).toBeVisible()
  })

  test('can open create workflow dialog from sidebar', async ({ page }) => {
    // Hover the Workflows section header to reveal the "+" button
    const workflowsHeader = page.getByText('Workflows').first()
    await workflowsHeader.hover()
    await page.waitForTimeout(200)

    // Click the "New Workflow" button (aria-label)
    const newWorkflowBtn = page.getByLabel('New Workflow')
    await newWorkflowBtn.click()
    await page.waitForTimeout(400)

    // Verify the Create Workflow dialog opens
    await expect(page.getByText('Create Workflow')).toBeVisible()

    // Verify template cards are visible (Kanban, Sprint, Sales Pipeline, Content, Matrix, Custom)
    await expect(page.getByText('Kanban').first()).toBeVisible()
    await expect(page.getByText('Sprint').first()).toBeVisible()
    await expect(page.getByText('Sales Pipeline').first()).toBeVisible()
    await expect(page.getByText('Content').first()).toBeVisible()
    await expect(page.getByText('Matrix').first()).toBeVisible()
    await expect(page.getByText('Custom').first()).toBeVisible()
  })

  test('create workflow dialog has name input', async ({ page }) => {
    // Open the dialog
    const workflowsHeader = page.getByText('Workflows').first()
    await workflowsHeader.hover()
    await page.waitForTimeout(200)
    await page.getByLabel('New Workflow').click()
    await page.waitForTimeout(400)

    // Verify name input is present with placeholder
    const nameInput = page.getByPlaceholder('Workflow name...')
    await expect(nameInput).toBeVisible()
  })

  test('create workflow dialog can be closed with Escape', async ({ page }) => {
    // Open the dialog
    const workflowsHeader = page.getByText('Workflows').first()
    await workflowsHeader.hover()
    await page.waitForTimeout(200)
    await page.getByLabel('New Workflow').click()
    await page.waitForTimeout(400)

    await expect(page.getByText('Create Workflow')).toBeVisible()

    // Press Escape to close
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    await expect(page.getByText('Create Workflow')).not.toBeVisible()
  })

  test('create workflow dialog can be closed by clicking backdrop', async ({ page }) => {
    // Open the dialog
    const workflowsHeader = page.getByText('Workflows').first()
    await workflowsHeader.hover()
    await page.waitForTimeout(200)
    await page.getByLabel('New Workflow').click()
    await page.waitForTimeout(400)

    await expect(page.getByText('Create Workflow')).toBeVisible()

    // Click the backdrop (the overlay area outside the dialog)
    await page.mouse.click(10, 10)
    await page.waitForTimeout(300)

    await expect(page.getByText('Create Workflow')).not.toBeVisible()
  })

  test('can also open create workflow from FAB menu', async ({ page }) => {
    // Open the FAB menu
    await page.getByLabel('Create new').click()
    await page.waitForTimeout(200)

    // Click "New workflow"
    const newWorkflowOption = page.getByText('New workflow')
    await expect(newWorkflowOption).toBeVisible()
    await newWorkflowOption.click()
    await page.waitForTimeout(400)

    // Verify the Create Workflow dialog opens
    await expect(page.getByText('Create Workflow')).toBeVisible()
  })

  test('empty workflows shows placeholder text', async ({ page }) => {
    // If no workflows exist, should show "No workflows yet"
    const noWorkflows = page.getByText('No workflows yet')
    const workflowLinks = page.locator('a[href^="/workflows/"]')

    const hasPlaceholder = await noWorkflows.isVisible().catch(() => false)
    const hasWorkflows = await workflowLinks.count()

    // Either placeholder or actual workflow links should be present
    expect(hasPlaceholder || hasWorkflows > 0).toBe(true)
  })
})
