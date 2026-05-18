'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { smooth } from '@/shared/design-system'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Please enter your username and password.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      })
      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Login failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: '#FAF6F1' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={smooth}
        className="w-full max-w-md flex flex-col items-center"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_new.png"
            alt="LAIF"
            width={56}
            height={56}
            className="mb-5 object-contain"
          />
          <h1
            className="text-[36px] md:text-[42px] font-bold text-center"
            style={{ color: '#1a1a2e', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Welcome to LAIF
          </h1>
          <p className="text-base mt-3 text-center" style={{ color: '#6b7280' }}>
            Your intelligent life manager
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <input
              type="text"
              className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
              style={{
                background: '#fff',
                border: '1.5px solid #e5e2dd',
                color: '#1a1a2e',
              }}
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all pr-12"
              style={{
                background: '#fff',
                border: '1.5px solid #e5e2dd',
                color: '#1a1a2e',
              }}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#9ca3af' }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm rounded-xl px-4 py-3"
              style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#1a1a2e', color: '#fff' }}
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        <p className="text-sm mt-8 text-center" style={{ color: '#9ca3af' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold transition-colors" style={{ color: '#1a1a2e' }}>
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
