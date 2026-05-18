'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { copy } from '@/lib/copy'
import { fadeSlideUp, buttonPress, ease } from '@/lib/motion'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }

      router.push('/onboarding')
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: '#0E0E12' }}
    >
      <motion.div
        {...fadeSlideUp}
        transition={ease.normal}
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          backgroundColor: '#17171E',
          border: '1px solid #2A2A33',
        }}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#FF4D3D' }}
          >
            LAIF
          </span>
        </div>

        {/* Heading */}
        <h1
          className="mb-2 text-center text-[28px] font-bold"
          style={{ color: '#F2F2F5' }}
        >
          {copy.auth.signup.title}
        </h1>
        <p
          className="mb-8 text-center text-sm"
          style={{ color: '#A0A0AA' }}
        >
          {copy.auth.signup.subtitle}
        </p>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              {...fadeSlideUp}
              transition={ease.fast}
              role="alert"
              aria-live="assertive"
              className="mb-4 rounded-xl px-4 py-3 text-sm"
              style={{
                backgroundColor: 'rgba(255, 77, 61, 0.1)',
                color: '#FF4D3D',
                border: '1px solid rgba(255, 77, 61, 0.2)',
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.auth.signup.namePlaceholder}
            aria-label="Full name"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-colors duration-150"
            style={{
              backgroundColor: '#1E1E26',
              border: '1px solid #2A2A33',
              color: '#F2F2F5',
            }}
            autoComplete="name"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={copy.auth.signup.emailPlaceholder}
            aria-label="Email"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-colors duration-150"
            style={{
              backgroundColor: '#1E1E26',
              border: '1px solid #2A2A33',
              color: '#F2F2F5',
            }}
            autoComplete="email"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={copy.auth.signup.passwordPlaceholder}
              aria-label="Password"
              className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-colors duration-150"
              style={{
                backgroundColor: '#1E1E26',
                border: '1px solid #2A2A33',
                color: '#F2F2F5',
              }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              style={{ color: '#6B6B75' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={loading || !email.trim() || !password}
            whileTap={{ scale: 0.97 }}
            className="mt-2 w-full rounded-full py-3 text-sm font-semibold text-white transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: '#FF4D3D' }}
          >
            {loading ? 'Creating account...' : copy.auth.signup.cta}
          </motion.button>
        </form>

        {/* Login link */}
        <p
          className="mt-6 text-center text-sm"
          style={{ color: '#A0A0AA' }}
        >
          {copy.auth.signup.loginPrompt}{' '}
          <button
            onClick={() => router.push('/login')}
            className="cursor-pointer font-medium underline transition-colors duration-150"
            style={{ color: '#5DA8FF' }}
          >
            {copy.auth.signup.loginLink}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
