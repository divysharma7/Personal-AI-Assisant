'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { smooth } from '@/shared/design-system'
import Link from 'next/link'

const STEPS = ['Account', 'Password', 'Confirm']

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    // Step 0: validate name + email
    if (step === 0) {
      if (!email.trim()) {
        setError('Please enter your email.')
        return
      }
      setStep(1)
      return
    }

    // Step 1: validate password
    if (step === 1) {
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      setStep(2)
      return
    }

    // Step 2: submit
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
        }),
      })
      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Signup failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 70%, #1a1a2e 100%)',
      }}
    >
      {/* Atmospheric glow effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 80%, rgba(139,92,246,0.15) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 70% 20%, rgba(245,158,11,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Progress indicator - thin lines */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="h-[2px] w-10 rounded-full transition-all duration-500"
              style={{
                background: i <= step ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Frosted glass card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={smooth}
        className="w-full max-w-md relative z-10 rounded-3xl p-8 md:p-10"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(40px) saturate(150%)',
          WebkitBackdropFilter: 'blur(40px) saturate(150%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_new.png"
            alt="LAIF"
            width={48}
            height={48}
            className="mb-4 object-contain"
            style={{ filter: 'brightness(1.2)' }}
          />
          <h1
            className="text-[28px] md:text-[32px] font-bold text-center"
            style={{ color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            {step === 0 ? 'Create your account' : step === 1 ? 'Set a password' : 'Ready to go'}
          </h1>
          <p className="text-sm mt-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {step === 0 ? 'Start your personal life OS' : step === 1 ? 'Keep your account secure' : 'Confirm and join LAIF'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 0 && (
            <>
              <input
                type="text"
                className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                }}
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                autoFocus
                disabled={loading}
              />
              <input
                type="email"
                className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                }}
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </>
          )}

          {step === 1 && (
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all pr-12"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                }}
                placeholder="Choose a password (6+ characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                autoFocus
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Name</span>
                <span className="text-sm font-medium" style={{ color: '#fff' }}>{name || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Email</span>
                <span className="text-sm font-medium" style={{ color: '#fff' }}>{email}</span>
              </div>
            </div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm rounded-xl px-4 py-3"
              style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {error}
            </motion.p>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => { setStep(s => s - 1); setError('') }}
                className="px-5 py-3.5 rounded-full text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#fff', color: '#1a1a2e' }}
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#1a1a2e] border-t-transparent animate-spin" />
              ) : (
                <span>{step < 2 ? 'Continue' : 'Create account'}</span>
              )}
            </button>
          </div>
        </form>

        <p className="text-sm mt-6 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold transition-colors" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
