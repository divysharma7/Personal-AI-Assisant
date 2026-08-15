import { env } from '@/config/env'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '@/components/auth/AuthShell'

const API_BASE = env.VITE_API_URL

export default function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'We could not create your workspace.')
        setLoading(false)
        return
      }

      const from = (location.state as { from?: string })?.from
      navigate('/onboarding', { state: from ? { from } : undefined })
    } catch {
      setError('Life OS could not reach the server. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="Create workspace">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="auth-eyebrow mb-3">
          Start with clarity
        </p>
        <h2 className="auth-heading">
          Make room for what matters.
        </h2>
        <p className="auth-body mb-8 mt-4">
          Set up your personal workspace. It takes about a minute.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-name" className="auth-label">
              Your name
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="auth-input"
              placeholder="How should Life OS greet you?"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="auth-label">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="auth-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="auth-label">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                className="auth-input pr-11"
                placeholder="Choose a secure password"
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
            disabled={loading || !name.trim() || !email.trim() || !password}
            className="auth-primary-button mt-2 w-full"
          >
            {loading ? 'Creating your workspace…' : 'Create my Life OS'}
          </button>
        </form>

        <p className="mt-7 text-sm text-[var(--brand-text-secondary)]">
          Already have a workspace?{' '}
          <Link
            to="/login"
            state={location.state}
            className="auth-link"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  )
}
