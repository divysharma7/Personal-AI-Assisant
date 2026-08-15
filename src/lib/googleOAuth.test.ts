import { afterEach, describe, expect, it, vi } from 'vitest'
import { getGoogleOAuthUrl } from './googleOAuth'

describe('Google OAuth start contract', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the Google authorization URL provided by the API', async () => {
    const googleUrl = 'https://accounts.google.com/o/oauth2/v2/auth?state=single-use-state'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ url: googleUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    await expect(getGoogleOAuthUrl()).resolves.toBe(googleUrl)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/integrations/google/auth'),
      { credentials: 'include' },
    )
  })

  it('rejects a non-Google redirect supplied by the API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      url: 'https://example.test/not-google',
    }), { status: 200 }))

    await expect(getGoogleOAuthUrl()).rejects.toThrow('invalid connection URL')
  })

  it('surfaces the API error when Google integration is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      error: 'Google integration not configured',
    }), { status: 501 }))

    await expect(getGoogleOAuthUrl()).rejects.toThrow('Google integration not configured')
  })
})
