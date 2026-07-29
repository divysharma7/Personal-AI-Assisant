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

      const from = (location.state as { from?: string })?.from || '/onboarding'
      navigate(from)
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
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f15b43]">
          Start with clarity
        </p>
        <h2
          className="text-[44px] font-normal leading-none tracking-[-0.045em]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Make room for what matters.
        </h2>
        <p className="mb-8 mt-4 text-sm leading-6 text-black/50">
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
              className="mb-5 border-l-2 border-[#d9422d] bg-[#d9422d]/[0.06] px-4 py-3 text-sm text-[#9c2c1d]"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-name" className="mb-1 block text-xs font-semibold">
              Your name
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="w-full rounded-none border-0 border-b border-black/20 bg-transparent px-0 py-2.5 text-[15px] text-[#191915] outline-none placeholder:text-black/30 focus:border-[#191915]"
              placeholder="How should Life OS greet you?"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="mb-1 block text-xs font-semibold">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-none border-0 border-b border-black/20 bg-transparent px-0 py-2.5 text-[15px] text-[#191915] outline-none placeholder:text-black/30 focus:border-[#191915]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="mb-1 block text-xs font-semibold">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                className="w-full rounded-none border-0 border-b border-black/20 bg-transparent px-0 py-2.5 pr-11 text-[15px] text-[#191915] outline-none placeholder:text-black/30 focus:border-[#191915]"
                placeholder="Choose a secure password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-black/40 hover:bg-black/[0.06] hover:text-black"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim() || !password}
            className="mt-2 flex w-full items-center justify-center rounded-full bg-[#191915] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#f15b43] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? 'Creating your workspace…' : 'Create my Life OS'}
          </button>
        </form>

        <p className="mt-7 text-sm text-black/50">
          Already have a workspace?{' '}
          <Link
            to="/login"
            state={location.state}
            className="font-semibold text-[#191915] underline decoration-black/25 underline-offset-4 hover:decoration-black"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  )
}
