import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { env } from '@/config/env'

const API_BASE = env.VITE_API_URL

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Connecting your Google account...')

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage(error === 'access_denied'
        ? 'Google Calendar was not connected. Nothing changed.'
        : 'Something went wrong connecting Google Calendar.')
      setTimeout(() => navigate('/settings?section=integrations'), 3000)
      return
    }

    if (!code || !state) {
      setStatus('error')
      setMessage('Missing authorization code.')
      setTimeout(() => navigate('/settings?section=integrations'), 3000)
      return
    }

    // Forward the OAuth callback to the backend
    fetch(`${API_BASE}/api/integrations/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
      credentials: 'include',
      redirect: 'manual', // Don't follow the backend's redirect
    })
      .then((res) => {
        if (res.ok || res.status === 302 || res.type === 'opaqueredirect') {
          setStatus('success')
          setMessage('Google Calendar connected!')
          setTimeout(() => navigate('/settings?section=integrations'), 1500)
        } else {
          return res.json().catch(() => ({ error: 'Connection failed' })).then((data) => {
            throw new Error(data.error || 'Connection failed')
          })
        }
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'Something went wrong.')
        setTimeout(() => navigate('/settings?section=integrations'), 3000)
      })
  }, [searchParams, navigate])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 16,
        background: 'var(--bg-canvas)',
      }}
    >
      {status === 'processing' && (
        <>
          <div
            style={{
              width: 32,
              height: 32,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{message}</p>
        </>
      )}
      {status === 'success' && (
        <p style={{ color: '#34d399', fontSize: 14, fontWeight: 500 }}>{message}</p>
      )}
      {status === 'error' && (
        <p style={{ color: '#ef4444', fontSize: 14, fontWeight: 500 }}>{message}</p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
