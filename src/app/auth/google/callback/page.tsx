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
    const state = searchParams.get('state')

    if (!state) {
      setStatus('error')
      setMessage('Missing OAuth state. Please start the connection again.')
      setTimeout(() => navigate('/settings?section=integrations'), 3000)
      return
    }

    // The documented redirect URI points directly to the API. This fallback
    // keeps older frontend callback registrations working while ensuring the
    // backend consumes the single-use OAuth state for success and denial.
    window.location.replace(`${API_BASE}/api/integrations/google/callback?${searchParams.toString()}`)
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
