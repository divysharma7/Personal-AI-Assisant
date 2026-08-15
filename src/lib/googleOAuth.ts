import { env } from '@/config/env'

const API_BASE = env.VITE_API_URL
const GOOGLE_ACCOUNTS_ORIGIN = 'https://accounts.google.com'

export async function getGoogleOAuthUrl(): Promise<string> {
  const response = await fetch(`${API_BASE}/api/integrations/google/auth`, {
    credentials: 'include',
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error || 'Google Calendar connection could not be started')
  }

  const body = await response.json() as { url?: string }
  if (!body.url) throw new Error('Google Calendar connection URL was missing')

  const url = new URL(body.url)
  if (url.origin !== GOOGLE_ACCOUNTS_ORIGIN) {
    throw new Error('Google Calendar returned an invalid connection URL')
  }
  return url.toString()
}

export async function beginGoogleOAuth(): Promise<void> {
  window.location.assign(await getGoogleOAuthUrl())
}
