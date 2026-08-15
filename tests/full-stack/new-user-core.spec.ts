import { expect, test, type Page } from '@playwright/test'

const apiUrl = process.env.E2E_API_URL ?? 'http://127.0.0.1:4174'
const frontendUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173'

test.setTimeout(180_000)

function recordBrowserErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on('response', response => {
    if (response.url().startsWith(apiUrl) && response.status() >= 500) {
      errors.push(`response: ${response.status()} ${response.request().method()} ${response.url()}`)
    }
  })
  page.on('requestfailed', request => {
    if (request.url().startsWith(apiUrl)) {
      errors.push(`requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText ?? 'unknown error'}`)
    }
  })
  return errors
}

test('@critical new user can complete the durable core loop', async ({ page }) => {
  const browserErrors = recordBrowserErrors(page)
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const email = `e2e-${suffix}@example.test`
  const password = 'E2e-only-password-42'
  const taskTitle = `First durable task ${suffix}`

  await page.goto('/signup')
  await page.getByLabel('Your name').fill('Core Journey')
  await page.getByLabel('Email').fill(email)
  await page.locator('#signup-password').fill(password)

  const signupResponsePromise = page.waitForResponse(response => (
    response.url() === `${apiUrl}/api/auth/signup`
    && response.request().method() === 'POST'
  ))
  await page.getByRole('button', { name: 'Create my Life OS' }).click()
  const signupResponse = await signupResponsePromise
  expect(signupResponse.status()).toBe(200)
  expect((await signupResponse.allHeaders())['set-cookie']).toContain('pim_token=')
  await expect(page).toHaveURL(/\/onboarding$/)

  await expect(page.getByLabel('What should we call you?')).toHaveValue('Core Journey')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: 'What should feel lighter first?' })).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: /Start with a clean slate/ }).click()
  await page.getByText('I agree to the Life OS Terms of Use and Privacy Policy.').click()

  const onboardingResponsePromise = page.waitForResponse(response => (
    response.url() === `${apiUrl}/api/users/me/onboarding`
    && response.request().method() === 'PATCH'
  ))
  await page.getByRole('button', { name: 'Open Life OS' }).click()
  const onboardingResponse = await onboardingResponsePromise
  expect(onboardingResponse.status()).toBe(200)
  await expect(onboardingResponse.json()).resolves.toMatchObject({ name: 'Core Journey' })
  await expect(page).toHaveURL(/\/today\?welcome=/)

  await page.reload()
  await expect(page).toHaveURL(/\/today\?welcome=/)
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()

  await page.getByRole('button', { name: 'Add a task' }).click()
  await page.getByPlaceholder('What needs to be done?').fill(taskTitle)
  const taskResponsePromise = page.waitForResponse(response => (
    response.url() === `${apiUrl}/api/tasks`
    && response.request().method() === 'POST'
  ))
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  const taskResponse = await taskResponsePromise
  expect(taskResponse.status()).toBe(201)
  expect(taskResponse.request().postDataJSON()).toMatchObject({ priority: 'none' })
  await expect(taskResponse.json()).resolves.toMatchObject({ title: taskTitle, priority: null })
  await expect(page.getByText(taskTitle)).toBeVisible()

  await page.reload()
  await expect(page.getByText(taskTitle)).toBeVisible()

  const settingsResponse = await page.context().request.patch(`${apiUrl}/api/focus/settings`, {
    data: { pomoDurationSeconds: 60, notificationsEnabled: false, soundEnabled: false },
    headers: { Origin: frontendUrl },
  })
  expect(settingsResponse.status()).toBe(200)
  await expect(settingsResponse.json()).resolves.toMatchObject({ pomoDurationSeconds: 60 })

  const settingsGetResponsePromise = page.waitForResponse(response => (
    response.url() === `${apiUrl}/api/focus/settings`
    && response.request().method() === 'GET'
  ))
  await page.goto('/focus')
  const settingsGetResponse = await settingsGetResponsePromise
  expect(settingsGetResponse.status()).toBe(200)
  await expect(settingsGetResponse.json()).resolves.toMatchObject({ pomoDurationSeconds: 60 })
  await expect(page.getByRole('heading', { name: 'Pomodoro' })).toBeVisible()

  const startResponsePromise = page.waitForResponse(response => (
    response.url() === `${apiUrl}/api/focus/sessions`
    && response.request().method() === 'POST'
  ))
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  const startResponse = await startResponsePromise
  expect(startResponse.status()).toBe(201)
  expect(startResponse.request().postDataJSON()).toMatchObject({
    mode: 'POMO',
    targetType: 'NONE',
    plannedDurationMin: 1,
  })

  const completeResponsePromise = Promise.race([
    page.waitForResponse(
      response => (
        response.url() === `${apiUrl}/api/focus/sessions/active/complete`
        && response.request().method() === 'POST'
      ),
      { timeout: 75_000 },
    ),
    page.waitForEvent('requestfailed', {
      predicate: request => (
        request.url() === `${apiUrl}/api/focus/sessions/active/complete`
        && request.method() === 'POST'
      ),
    }).then(request => {
      throw new Error(`Focus completion request failed: ${request.failure()?.errorText ?? 'unknown error'}`)
    }),
  ])
  const completeResponse = await completeResponsePromise
  expect(completeResponse.status()).toBe(200)
  await expect(page.getByText('Session complete. Take a real reset.')).toBeVisible()

  const recordsResponse = await page.context().request.get(`${apiUrl}/api/focus/records`)
  expect(recordsResponse.status()).toBe(200)
  const records = await recordsResponse.json() as { items: Array<{ mode: string; pomoCount: number }> }
  expect(records.items).toHaveLength(1)
  expect(records.items[0]).toMatchObject({ mode: 'POMO', pomoCount: 1 })

  const settingsSessionPromise = page.waitForResponse(response => (
    response.url() === `${apiUrl}/api/auth/me`
    && response.request().method() === 'GET'
  ))
  await page.goto('/settings')
  expect((await settingsSessionPromise).status()).toBe(200)
  const logoutResponsePromise = page.waitForResponse(response => (
    response.url() === `${apiUrl}/api/auth/logout`
    && response.request().method() === 'POST'
  ))
  await page.getByRole('button', { name: 'Sign out' }).click()
  expect((await logoutResponsePromise).status()).toBe(200)
  await expect(page).toHaveURL(/\/login$/)

  await page.goto('/focus')
  await expect(page).toHaveURL(/\/login$/)

  await page.getByLabel('Email or username').fill(email)
  await page.locator('#login-password').fill(password)
  const loginResponsePromise = page.waitForResponse(response => (
    response.url() === `${apiUrl}/api/auth/login`
    && response.request().method() === 'POST'
  ))
  await page.getByRole('button', { name: 'Enter Life OS' }).click()
  expect((await loginResponsePromise).status()).toBe(200)
  await expect(page).toHaveURL(/\/focus$/)

  await page.goto('/today')
  await expect(page.getByText(taskTitle)).toBeVisible()
  expect(browserErrors).toEqual([])
})
