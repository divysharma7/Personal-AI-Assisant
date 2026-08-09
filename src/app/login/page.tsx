import { env } from '@/config/env'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '@/components/auth/AuthShell'

const API_BASE = env.VITE_API_URL

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'We could not sign you in with those details.')
        setLoading(false)
        return
      }

      const from = (location.state as { from?: string })?.from || '/'
      navigate(from)
    } catch {
      setError('Life OS could not reach the server. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="Welcome back">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="auth-eyebrow mb-3">
          Continue your day
        </p>
        <h2 className="auth-heading">
          Pick up where you left off.
        </h2>
        <p className="auth-body mb-9 mt-4">
          Your agenda, priorities, and focus sessions are waiting.
        </p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              aria-live="assertive"
              className="auth-error mb-5"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-username" className="auth-label">
              Email or username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              className="auth-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="auth-label">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="auth-input pr-11"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--brand-text-muted)] hover:bg-white/[0.05] hover:text-[var(--brand-text)]"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="auth-primary-button w-full"
          >
            {loading ? 'Opening Life OS…' : 'Enter Life OS'}
          </button>
        </form>

        <p className="mt-7 text-sm text-[var(--brand-text-secondary)]">
          New here?{' '}
          <Link
            to="/signup"
            state={location.state}
            className="auth-link"
          >
            Create your workspace
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  )
}
