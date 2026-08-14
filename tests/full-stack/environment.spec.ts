import { expect, test } from '@playwright/test'

const apiUrl = process.env.E2E_API_URL ?? 'http://127.0.0.1:4174'

test.describe('@critical hermetic environment', () => {
  test('serves the built frontend and a database-ready API', async ({ page, request }) => {
    const ready = await request.get(`${apiUrl}/ready`)
    expect(ready.status()).toBe(200)
    await expect(ready.json()).resolves.toMatchObject({
      status: 'ok',
      database: 'connected',
    })

    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Pick up where you left off.' })).toBeVisible()
  })

  test('keeps the authentication boundary enabled', async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/tasks`)

    expect(response.status()).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ error: 'Unauthorized' })
  })
})
