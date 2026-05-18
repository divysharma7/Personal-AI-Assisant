'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Loader2 } from 'lucide-react'
import { copy } from '@/lib/copy'

// ── Step indicator ───────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 32 : 8,
            opacity: i === current ? 1 : 0.3,
          }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="h-1 rounded-full"
          style={{ background: '#FFFFFF' }}
        />
      ))}
    </div>
  )
}

// ── Checkbox row ─────────────────────────────────────────────
function CheckboxRow({
  label,
  checked,
  onChange,
  linkify,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  linkify?: boolean
}) {
  // If linkify, make "Terms of Use" and "Privacy Policy" blue links
  let labelContent: React.ReactNode = label
  if (linkify) {
    const parts = label.split(/(Terms of Use|Privacy Policy)/g)
    labelContent = parts.map((part, i) =>
      part === 'Terms of Use' || part === 'Privacy Policy' ? (
        <a key={i} href="#" className="underline" style={{ color: '#5DA8FF' }} onClick={e => e.preventDefault()}>
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      ),
    )
  }

  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full text-left py-3 px-1 rounded-lg transition-colors hover:bg-white/5"
    >
      <div
        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors"
        style={{
          background: checked ? '#FF4D3D' : 'transparent',
          border: checked ? 'none' : '2px solid rgba(255,255,255,0.3)',
        }}
      >
        {checked && <Check size={12} color="#fff" strokeWidth={3} />}
      </div>
      <span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
        {labelContent}
      </span>
    </button>
  )
}

// ── Main Onboarding Page ─────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [intents, setIntents] = useState<boolean[]>([false, false, false])
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [emailsOptIn, setEmailsOptIn] = useState(false)
  const [loading, setLoading] = useState(false)

  // ── Intent logic ────────────────────────────────────────────
  const handleIntentChange = useCallback((index: number, value: boolean) => {
    setIntents(prev => {
      const next = [...prev]
      if (index === 2) {
        // "Both" — toggle all
        return [value, value, value]
      }
      next[index] = value
      // If both 0 and 1 are checked, also check "Both"
      if (next[0] && next[1]) {
        next[2] = true
      } else {
        next[2] = false
      }
      return next
    })
  }, [])

  const hasSelectedIntent = intents.some(Boolean)

  // ── Submit ──────────────────────────────────────────────────
  const handleFinish = useCallback(async () => {
    setLoading(true)
    try {
      // Create Getting Started list (simulate — API calls)
      await new Promise(resolve => setTimeout(resolve, 1200))
      router.push('/')
    } catch {
      setLoading(false)
    }
  }, [router])

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col">
      {/* Background: dramatic dusk gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #3D2B55 0%, #7C5E91 30%, #C28BA3 60%, #D4A9B0 80%, #2A1F3D 100%)',
        }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6">
        {/* Wordmark */}
        <div className="mb-6">
          <span className="text-[28px] font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
            LAIF
          </span>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} total={3} />

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[480px]"
            style={{
              background: 'rgba(28, 24, 38, 0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 24,
              padding: 32,
            }}
          >
            {/* Step 1: Name */}
            {step === 0 && (
              <div>
                <h2 className="text-[24px] font-bold mb-2" style={{ color: '#F2F2F5' }}>
                  {copy.onboarding.step1.title}
                </h2>
                <p className="text-[14px] mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {copy.onboarding.step1.body}
                </p>
                <div className="relative">
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && name.trim()) setStep(1) }}
                    placeholder={copy.onboarding.step1.placeholder}
                    autoFocus
                    className="w-full py-3 px-4 pr-24 rounded-xl text-[15px] outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#F2F2F5',
                    }}
                  />
                  {name.length > 0 && (
                    <button
                      onClick={() => setName('')}
                      className="absolute right-20 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => { if (name.trim()) setStep(1) }}
                    disabled={!name.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all"
                    style={{
                      background: name.trim() ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                      color: name.trim() ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                      cursor: name.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {copy.onboarding.step1.cta}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Intent */}
            {step === 1 && (
              <div>
                <h2 className="text-[24px] font-bold mb-2" style={{ color: '#F2F2F5' }}>
                  {copy.onboarding.step2.title}
                </h2>
                <p className="text-[14px] mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {copy.onboarding.step2.body}
                </p>
                <div className="space-y-1 mb-6">
                  {copy.onboarding.step2.options.map((opt, i) => (
                    <CheckboxRow
                      key={i}
                      label={opt}
                      checked={intents[i]}
                      onChange={v => handleIntentChange(i, v)}
                    />
                  ))}
                </div>
                <button
                  onClick={() => { if (hasSelectedIntent) setStep(2) }}
                  disabled={!hasSelectedIntent}
                  className="w-full py-3 rounded-full text-[14px] font-semibold transition-all"
                  style={{
                    background: hasSelectedIntent ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.12)',
                    color: hasSelectedIntent ? '#1A1A1F' : 'rgba(255,255,255,0.3)',
                    cursor: hasSelectedIntent ? 'pointer' : 'not-allowed',
                  }}
                >
                  {copy.onboarding.step2.cta}
                </button>
              </div>
            )}

            {/* Step 3: Terms */}
            {step === 2 && (
              <div>
                <h2 className="text-[24px] font-bold mb-6" style={{ color: '#F2F2F5' }}>
                  {copy.onboarding.step3.title}
                </h2>
                <div className="space-y-1 mb-6">
                  <CheckboxRow
                    label={copy.onboarding.step3.terms}
                    checked={termsAccepted}
                    onChange={setTermsAccepted}
                    linkify
                  />
                  <CheckboxRow
                    label={copy.onboarding.step3.emails}
                    checked={emailsOptIn}
                    onChange={setEmailsOptIn}
                  />
                </div>
                <button
                  onClick={handleFinish}
                  disabled={!termsAccepted || loading}
                  className="w-full py-3 rounded-full text-[14px] font-semibold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: termsAccepted && !loading ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.12)',
                    color: termsAccepted && !loading ? '#1A1A1F' : 'rgba(255,255,255,0.3)',
                    cursor: termsAccepted && !loading ? 'pointer' : 'not-allowed',
                  }}
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? copy.onboarding.step3.ctaLoading : copy.onboarding.step3.cta}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer strip */}
      <div
        className="relative z-10 flex items-center px-6 flex-shrink-0"
        style={{
          height: 56,
          background: 'rgba(20, 16, 32, 0.8)',
        }}
      >
        <span className="text-[14px] font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.5)' }}>
          LAIF
        </span>
      </div>
    </div>
  )
}
