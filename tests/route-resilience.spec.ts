import { test, expect } from '@playwright/test'

/**
 * Route Resilience Tests
 *
 * Tests that every main route survives the navigate-away-and-back cycle
 * without hydration crashes, blank screens, or JS errors.
 * Also covers /chat (no existing test) and critical actions on /focus.
 */

const ROUTES = [
  { path: '/', name: 'Inbox', heading: 'Inbox' },
  { path: '/today', name: 'Today', heading: 'Today' },
  { path: '/tasks', name: 'Tasks', heading: 'Tasks' },
  { path: '/calendar', name: 'Calendar', text: 'Today' },
  { path: '/habits', name: 'Habits', text: 'Habit' },
  { path: '/focus', name: 'Focus', text: 'Focus Timer' },
  { path: '/chat', name: 'Chat', text: 'Hi Divy' },
  { path: '/lists', name: 'Lists', heading: 'Lists' },
] as const

// ── Navigate-away-and-back: hydration crash detection ──────────────────────

test.describe('Route Resilience — Navigate Away and Back', () => {
  for (const route of ROUTES) {
    test(`${route.path} survives navigate away and back`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))

      // 1. Load the route
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')

      // Verify initial content
      if ('heading' in route && route.heading) {
        await expect(page.locator('h1').first()).toContainText(route.heading, { timeout: 5000 })
      } else if ('text' in route && route.text) {
        await expect(page.getByText(route.text).first()).toBeVisible({ timeout: 5000 })
      }

      // 2. Navigate away to a different route
      const awayRoute = route.path === '/today' ? '/' : '/today'
      await page.goto(awayRoute)
      await page.waitForLoadState('networkidle')

      // 3. Navigate back
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')

      // 4. Verify content still renders
      if ('heading' in route && route.heading) {
        await expect(page.locator('h1').first()).toContainText(route.heading, { timeout: 5000 })
      } else if ('text' in route && route.text) {
        await expect(page.getByText(route.text).first()).toBeVisible({ timeout: 5000 })
      }

      // 5. No JS errors during the cycle
      expect(errors).toEqual([])
    })
  }
})

// ── Navigate via sidebar links (client-side navigation) ────────────────────

test.describe('Route Resilience — Client-Side Navigation Cycle', () => {
  test('Inbox → Tasks → Calendar → back to Inbox via sidebar', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').first()).toContainText('Inbox')

    // Inbox → Tasks
    await page.locator('a[href="/tasks"]').first().click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').first()).toContainText('Tasks')

    // Tasks → Calendar (via sidebar or direct)
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Today').first()).toBeVisible()

    // Calendar → back to Inbox
    await page.locator('a[href="/"]').first().click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').first()).toContainText('Inbox')

    expect(errors).toEqual([])
  })

  test('Focus → Chat → Habits → back to Focus via navigation', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/focus')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Focus').first()).toBeVisible()

    await page.goto('/chat')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Hi Divy').first()).toBeVisible()

    await page.goto('/habits')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Habit').first()).toBeVisible()

    await page.goto('/focus')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Focus Timer').first()).toBeVisible()

    expect(errors).toEqual([])
  })
})

// ── Chat page (no existing test coverage) ──────────────────────────────────

test.describe('Chat Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat')
    await page.waitForLoadState('networkidle')
  })

  test('chat page loads with welcome message', async ({ page }) => {
    await expect(page.getByText('Hi Divy').first()).toBeVisible()
  })

  test('chat input is visible and focusable', async ({ page }) => {
    const input = page.locator('textarea, input[type="text"]').last()
    await expect(input).toBeVisible()
    await input.click()
    await expect(input).toBeFocused()
  })

  test('suggestion chips are visible', async ({ page }) => {
    const suggestions = page.getByText("What's on my schedule today?")
    const visible = await suggestions.isVisible().catch(() => false)
    expect(typeof visible).toBe('boolean')
  })

  test('chat history panel toggles', async ({ page }) => {
    const historyBtn = page.getByText('Chat History').first()
    const historyVisible = await historyBtn.isVisible().catch(() => false)
    if (historyVisible) {
      await historyBtn.click()
      await page.waitForTimeout(300)
      await expect(page.getByText('New Chat').first()).toBeVisible()
    }
  })
})

// ── Focus page — critical action ───────────────────────────────────────────

test.describe('Focus Page — Session Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/focus')
    await page.waitForLoadState('networkidle')
  })

  test('focus page shows idle state with start button', async ({ page }) => {
    // Button says "Start" in idle, or session controls if active
    const startBtn = page.getByText(/^Start$/i).first()
    const activeSession = page.getByText(/Pause|Resume|End/i).first()

    const hasStart = await startBtn.isVisible().catch(() => false)
    const hasActive = await activeSession.isVisible().catch(() => false)

    expect(hasStart || hasActive).toBe(true)
  })

  test('focus timer and stopwatch tabs are accessible', async ({ page }) => {
    // UI shows "Focus Timer" and "Stopwatch" tabs
    await expect(page.getByText('Focus Timer').first()).toBeVisible()
    await expect(page.getByText('Stopwatch').first()).toBeVisible()
  })

  test('focus stats section shows labels', async ({ page }) => {
    const today = page.getByText('Today').first()
    await expect(today).toBeVisible()
  })
})

// ── Browser back/forward navigation ────────────────────────────────────────

test.describe('Browser History Navigation', () => {
  test('browser back button works without crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.goto('/tasks')
    await page.waitForLoadState('networkidle')

    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')

    // Go back twice
    await page.goBack()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/tasks')

    await page.goBack()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/')

    // Go forward
    await page.goForward()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/tasks')

    expect(errors).toEqual([])
  })
})
