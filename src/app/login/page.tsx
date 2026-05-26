'use client'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''


import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { copy } from '@/lib/copy'
import { ease } from '@/lib/motion'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Invalid credentials')
        setLoading(false)
        return
      }

      router.push('/')
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── LEFT: Branding half ── */}
      <div
        className="relative flex w-1/2 flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0E0E12, #1a0a2e, #0E0E12)',
        }}
      >
        {/* Aurora glow */}
        <div
          className="login-aurora-glow absolute"
          style={{
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
            filter: 'blur(80px)',
            opacity: 0.5,
          }}
        />

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <span
            style={{
              fontFamily: 'var(--font-display), serif',
              fontSize: 80,
              letterSpacing: '0.15em',
              color: 'var(--accent)',
              lineHeight: 1,
            }}
          >
            LAIF
          </span>
          <span
            className="text-base"
            style={{ color: 'var(--text-primary)', opacity: 0.4 }}
          >
            Your intelligent life manager
          </span>
        </motion.div>
      </div>

      {/* ── RIGHT: Form half ── */}
      <div
        className="flex w-1/2 items-center justify-center"
        style={{ backgroundColor: '#0E0E12' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-md rounded-2xl p-10"
          style={{
            backgroundColor: 'var(--bg-pane)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {/* Heading */}
          <h1
            className="mb-2 text-center text-[28px]"
            style={{ color: 'var(--text-primary)' }}
          >
            {copy.auth.login.title}
          </h1>
          <p
            className="mb-8 text-center text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {copy.auth.login.subtitle}
          </p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={ease.fast}
                role="alert"
                aria-live="assertive"
                className="mb-4 rounded-xl px-4 py-3 text-sm"
                style={{
                  backgroundColor: 'rgba(255, 77, 61, 0.1)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(255, 77, 61, 0.2)',
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={copy.auth.login.usernamePlaceholder}
                aria-label="Username"
                className="w-full rounded-xl px-4 py-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-colors duration-150"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                autoComplete="username"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="relative"
            >
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={copy.auth.login.passwordPlaceholder}
                aria-label="Password"
                className="w-full rounded-xl px-4 py-4 pr-11 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-colors duration-150"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: 'var(--text-faint)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.button
                type="submit"
                disabled={loading || !username.trim() || !password}
                whileTap={{ scale: 0.97 }}
                className="mt-2 w-full rounded-full py-3.5 text-sm font-semibold text-white transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {loading ? 'Signing in...' : copy.auth.login.cta}
              </motion.button>
            </motion.div>
          </form>

          {/* Sign up link */}
          <p
            className="mt-6 text-center text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {copy.auth.login.signupPrompt}{' '}
            <button
              onClick={() => router.push('/signup')}
              className="cursor-pointer font-medium underline transition-colors duration-150"
              style={{ color: 'var(--info)' }}
            >
              {copy.auth.login.signupLink}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Aurora animation styles */}
      <style jsx>{`
        .login-aurora-glow {
          animation: login-aurora-float 6s ease-in-out infinite;
        }
        @keyframes login-aurora-float {
          0%, 100% { transform: translate(-10%, -10%) scale(1); }
          50% { transform: translate(10%, 10%) scale(1.15); }
        }
      `}</style>
    </div>
  )
}
