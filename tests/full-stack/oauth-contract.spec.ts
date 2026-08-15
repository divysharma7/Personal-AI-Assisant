import { expect, test } from '@playwright/test'

const apiUrl = process.env.E2E_API_URL ?? 'http://127.0.0.1:4174'
const frontendUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173'

test('@critical Google OAuth starts from the UI contract', async ({ page }) => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const signup = await page.context().request.post(`${apiUrl}/api/auth/signup`, {
    data: {
      name: 'OAuth Journey',
      email: `oauth-${suffix}@example.test`,
      password: 'E2e-only-password-42',
    },
    headers: { Origin: frontendUrl },
  })
  expect(signup.status()).toBe(200)
  const onboarding = await page.context().request.patch(`${apiUrl}/api/users/me/onboarding`, {
    data: {
      name: 'OAuth Journey',
      termsAccepted: true,
      termsVersion: '2026-08-16',
      completed: true,
    },
    headers: { Origin: frontendUrl },
  })
  expect(onboarding.status()).toBe(200)

  const providerUrl = `https://accounts.google.com/o/oauth2/v2/auth?state=e2e-${suffix}`
  await page.route(`${apiUrl}/api/integrations/google/auth`, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ url: providerUrl }),
  }))
  await page.route('https://accounts.google.com/**', route => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<main><h1>Google authorization reached</h1></main>',
  }))

  const sessionResponsePromise = page.waitForResponse(response => (
    response.url() === `${apiUrl}/api/auth/me`
    && response.request().method() === 'GET'
  ))
  await page.goto('/settings?section=integrations')
  expect((await sessionResponsePromise).status()).toBe(200)
  await expect(page).toHaveURL(/\/settings\?section=integrations$/)
  await page.getByRole('button', { name: /Google Calendar/ }).click()

  const authResponsePromise = page.waitForResponse(response => (
    response.url() === `${apiUrl}/api/integrations/google/auth`
    && response.request().method() === 'GET'
  ))
  await page.getByRole('button', { name: 'Connect Google Calendar' }).click()

  expect((await authResponsePromise).status()).toBe(200)
  await expect(page).toHaveURL(/^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth/)
  await expect(page.getByRole('heading', { name: 'Google authorization reached' })).toBeVisible()
})
