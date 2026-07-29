import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { http, ApiError } from '@/lib/api/client'

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: { username: string; name?: string } }
  | { status: 'anonymous'; user: null }
  | { status: 'error'; user: null; error: Error }

function useSessionAuth() {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading', user: null })

  useEffect(() => {
    http.get<{ username: string; name?: string }>('/api/auth/me')
      .then(user => setAuth({ status: 'authenticated', user }))
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) {
          setAuth({ status: 'anonymous', user: null })
          return
        }
        setAuth({ status: 'error', user: null, error: err instanceof Error ? err : new Error(String(err)) })
      })
  }, [])

  return auth
}

function AppBootstrapScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-canvas)',
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function SessionErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-canvas)',
      gap: 16,
    }}>
      <p style={{ color: 'var(--text-muted)' }}>Unable to connect to server</p>
      <button
        onClick={onRetry}
        style={{
          padding: '8px 24px',
          borderRadius: 8,
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Retry
      </button>
    </div>
  )
}

export default function RequireAuth() {
  const auth = useSessionAuth()
  const location = useLocation()

  if (auth.status === 'loading') {
    return <AppBootstrapScreen />
  }

  if (auth.status === 'error') {
    return <SessionErrorScreen onRetry={() => window.location.reload()} />
  }

  if (auth.status === 'anonymous') {
    const from = location.pathname + location.search + location.hash
    return (
      <Navigate
        to="/login"
        replace
        state={{ from }}
      />
    )
  }

  return <Outlet />
}
