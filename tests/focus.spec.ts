import { expect, test, type Page } from '@playwright/test'

interface FocusApiState {
  starts: Array<Record<string, unknown>>
  completions: number
}

async function mockFocusApi(page: Page, state: FocusApiState) {
  await page.route('**/api/focus/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname

    if (path.endsWith('/dashboard')) {
      await route.fulfill({ json: {
        activeSession: null,
        overview: {
          todayPomo: 2,
          todayFocusSeconds: 3000,
          totalPomo: 8,
          totalFocusSeconds: 12000,
        },
        records: [],
        nextCursor: null,
        hasMore: false,
      } })
      return
    }

    if (path.endsWith('/settings') && request.method() === 'GET') {
      await route.fulfill({ json: {
        userId: 'test-user',
        pomoDurationSeconds: 1,
        shortBreakDurationSeconds: 300,
        longBreakDurationSeconds: 900,
        longBreakAfterPomos: 4,
        autoStartBreak: false,
        autoStartPomo: false,
        notificationsEnabled: false,
        soundEnabled: false,
      } })
      return
    }

    if (path.endsWith('/records') && request.method() === 'GET') {
      await route.fulfill({ json: { items: [], nextCursor: null, hasMore: false } })
      return
    }

    if (path.endsWith('/targets')) {
      const type = url.searchParams.get('type')
      await route.fulfill({ json: type === 'HABIT'
        ? [{ id: 'habit-1', title: 'Read' }]
        : [{ id: 'task-1', title: 'Write Focus tests' }],
      })
      return
    }

    if (path.endsWith('/sessions') && request.method() === 'POST') {
      state.starts.push(request.postDataJSON())
      await route.fulfill({ status: 201, json: {
        _id: `session-${state.starts.length}`,
        ...request.postDataJSON(),
        status: 'active',
      } })
      return
    }

    if (path.endsWith('/sessions/active/complete') && request.method() === 'POST') {
      state.completions += 1
      await route.fulfill({ json: { _id: 'session-1', status: 'completed' } })
      return
    }

    if (path.includes('/sessions/') && request.method() === 'PATCH') {
      await route.fulfill({ json: { _id: 'session-1', status: 'active' } })
      return
    }

    await route.fulfill({ status: 404, json: { error: 'Unhandled Focus test route' } })
  })
}

test.describe('Focus feature acceptance', () => {
  let apiState: FocusApiState

  test.beforeEach(async ({ page }) => {
    apiState = { starts: [], completions: 0 }
    await mockFocusApi(page, apiState)
    await page.goto('/focus')
    await expect(page.getByRole('heading', { name: 'Do one thing well.' })).toBeVisible()
  })

  test('shows configured timer, overview, and Task/Habit target selection', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Pomo' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText("Today's focus")).toBeVisible()
    await expect(page.getByText('Total Pomos')).toBeVisible()

    await page.getByRole('button', { name: 'What are you working on?' }).click()
    await expect(page.getByRole('button', { name: 'Tasks' })).toBeVisible()
    await expect(page.getByText('Write Focus tests')).toBeVisible()
    await page.getByRole('button', { name: 'Habits' }).click()
    await expect(page.getByText('Read')).toBeVisible()
  })

  test('starts and explicitly finishes a Stopwatch record', async ({ page }) => {
    await page.getByRole('button', { name: 'Stopwatch' }).click()
    await page.getByRole('button', { name: 'Start' }).click()

    await expect.poll(() => apiState.starts.length).toBe(1)
    expect(apiState.starts[0]).toMatchObject({ mode: 'STOPWATCH', targetType: 'NONE' })

    await page.getByRole('button', { name: 'Finish session' }).click()
    await expect.poll(() => apiState.completions).toBe(1)
    await expect(page.getByText('Session recorded.')).toBeVisible()
  })

  test('automatically persists a Pomo when its countdown expires', async ({ page }) => {
    await page.getByRole('button', { name: 'Begin focus' }).click()

    await expect.poll(() => apiState.starts.length).toBe(1)
    await expect.poll(() => apiState.completions, { timeout: 5_000 }).toBe(1)
    await expect(page.getByText('Session complete. Take a real reset.')).toBeVisible()
  })

  test('blocks an invalid manual record and exposes settings/statistics navigation', async ({ page }) => {
    await page.getByRole('button', { name: 'Add focus record' }).click()
    await page.getByRole('button', { name: 'OK' }).click()
    await expect(page.getByText('Start time is required')).toBeVisible()
    await expect(page.getByText('End time is required')).toBeVisible()
    await page.getByRole('button', { name: 'Close' }).click()

    await page.getByRole('button', { name: 'More options' }).click()
    await expect(page.getByRole('button', { name: 'Statistics' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Focus Settings' })).toBeVisible()
  })
})
