'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Check } from 'lucide-react'
import { copy } from '@/lib/copy'

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)

  // Step 1
  const [name, setName] = useState('')

  // Step 2
  const [selectedOptions, setSelectedOptions] = useState<boolean[]>([false, false, false])

  // Step 3
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [emailsOptIn, setEmailsOptIn] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleOptionToggle = useCallback(
    (index: number) => {
      const next = [...selectedOptions]
      if (index === 2) {
        // "Both" — toggle all
        const newVal = !next[2]
        next[0] = newVal
        next[1] = newVal
        next[2] = newVal
      } else {
        next[index] = !next[index]
        // Auto-check "Both" if both 0 and 1 are checked
        next[2] = next[0] && next[1]
      }
      setSelectedOptions(next)
    },
    [selectedOptions]
  )

  const handleComplete = useCallback(async () => {
    setLoading(true)
    try {
      // Update profile with onboarding data
      await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          onboarded: true,
          emailsOptIn,
        }),
      }).catch(() => {})

      router.push('/')
    } catch {
      router.push('/')
    }
  }, [name, emailsOptIn, router])

  const anyOptionSelected = selectedOptions.some(Boolean)

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #7C5E91 0%, #C28BA3 50%, #2A1F35 100%)',
      }}
    >
      {/* LAIF wordmark */}
      <div className="mb-8">
        <span className="text-xl font-bold tracking-tight text-white/90">LAIF</span>
      </div>

      {/* Progress bars */}
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-[3px] rounded-full transition-all duration-300"
            style={{
              width: step >= s ? 32 : 20,
              backgroundColor: step >= s ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md rounded-3xl p-8"
        style={{
          backgroundColor: 'rgba(28, 24, 38, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="flex flex-col">
            <h2 className="mb-2 text-2xl font-bold text-white">
              {copy.onboarding.step1.title}
            </h2>
            <p className="mb-6 text-sm text-white/60">
              {copy.onboarding.step1.body}
            </p>

            <div className="relative mb-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={copy.onboarding.step1.placeholder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) setStep(2)
                }}
                className="w-full rounded-xl px-4 py-3 pr-24 text-sm text-white outline-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                autoFocus
              />
              {name && (
                <button
                  onClick={() => setName('')}
                  className="absolute right-20 top-1/2 -translate-y-1/2 cursor-pointer text-white/40 transition-colors duration-150 hover:text-white/70"
                >
                  <X size={14} />
                </button>
              )}
              <button
                onClick={() => name.trim() && setStep(2)}
                disabled={!name.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  backgroundColor: name.trim() ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white',
                }}
              >
                {copy.onboarding.step1.cta}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Intent */}
        {step === 2 && (
          <div className="flex flex-col">
            <h2 className="mb-2 text-2xl font-bold text-white">
              {copy.onboarding.step2.title}
            </h2>
            <p className="mb-6 text-sm text-white/60">
              {copy.onboarding.step2.body}
            </p>

            <div className="mb-6 flex flex-col gap-3">
              {copy.onboarding.step2.options.map((option, i) => (
                <button
                  key={option}
                  onClick={() => handleOptionToggle(i)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors duration-150 cursor-pointer"
                  style={{
                    backgroundColor: selectedOptions[i]
                      ? 'rgba(255, 77, 61, 0.15)'
                      : 'rgba(255,255,255,0.05)',
                    border: selectedOptions[i]
                      ? '1px solid rgba(255, 77, 61, 0.3)'
                      : '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                >
                  <div
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150"
                    style={{
                      backgroundColor: selectedOptions[i] ? '#FF4D3D' : 'transparent',
                      border: selectedOptions[i]
                        ? '2px solid #FF4D3D'
                        : '2px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    {selectedOptions[i] && (
                      <Check size={12} strokeWidth={2.5} className="text-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => anyOptionSelected && setStep(3)}
              disabled={!anyOptionSelected}
              className="w-full rounded-full py-3 text-sm font-semibold transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                backgroundColor: anyOptionSelected ? 'white' : 'rgba(255,255,255,0.1)',
                color: anyOptionSelected ? '#1A1A1F' : 'white',
              }}
            >
              {copy.onboarding.step2.cta}
            </button>
          </div>
        )}

        {/* Step 3: Terms */}
        {step === 3 && (
          <div className="flex flex-col">
            <h2 className="mb-6 text-2xl font-bold text-white">
              {copy.onboarding.step3.title}
            </h2>

            <div className="mb-6 flex flex-col gap-3">
              {/* Terms checkbox */}
              <button
                onClick={() => setTermsAccepted(!termsAccepted)}
                className="flex items-start gap-3 text-left text-sm cursor-pointer"
              >
                <div
                  className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150"
                  style={{
                    backgroundColor: termsAccepted ? '#FF4D3D' : 'transparent',
                    border: termsAccepted
                      ? '2px solid #FF4D3D'
                      : '2px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {termsAccepted && (
                    <Check size={12} strokeWidth={2.5} className="text-white" />
                  )}
                </div>
                <span className="text-white/80">{copy.onboarding.step3.terms}</span>
              </button>

              {/* Emails checkbox */}
              <button
                onClick={() => setEmailsOptIn(!emailsOptIn)}
                className="flex items-start gap-3 text-left text-sm cursor-pointer"
              >
                <div
                  className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150"
                  style={{
                    backgroundColor: emailsOptIn ? '#FF4D3D' : 'transparent',
                    border: emailsOptIn
                      ? '2px solid #FF4D3D'
                      : '2px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {emailsOptIn && (
                    <Check size={12} strokeWidth={2.5} className="text-white" />
                  )}
                </div>
                <span className="text-white/80">{copy.onboarding.step3.emails}</span>
              </button>
            </div>

            <button
              onClick={handleComplete}
              disabled={!termsAccepted || loading}
              className="w-full rounded-full py-3 text-sm font-semibold transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                backgroundColor: termsAccepted ? 'white' : 'rgba(255,255,255,0.1)',
                color: termsAccepted ? '#1A1A1F' : 'white',
              }}
            >
              {loading ? copy.onboarding.step3.ctaLoading : copy.onboarding.step3.cta}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8">
        <span className="text-xs font-medium tracking-wider text-white/30">LAIF</span>
      </div>
    </div>
  )
}
