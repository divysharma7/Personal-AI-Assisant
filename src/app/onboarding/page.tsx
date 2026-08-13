import { env } from '@/config/env'
import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { trackEvent } from '@/lib/analytics'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Compass,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '@/components/auth/auth-brand.css'
import LifeOSMark from '@/components/brand/LifeOSMark'

const API_BASE = env.VITE_API_URL

type Step = 1 | 2 | 3
type Priority = 'plan' | 'focus' | 'habits'

const priorities: Array<{
  id: Priority
  icon: typeof Compass
  title: string
  description: string
}> = [
  {
    id: 'plan',
    icon: Compass,
    title: 'Plan calmer days',
    description: 'See commitments and priorities together in one agenda.',
  },
  {
    id: 'focus',
    icon: Target,
    title: 'Protect deep work',
    description: 'Turn the next important thing into a focused session.',
  },
  {
    id: 'habits',
    icon: Sparkles,
    title: 'Build steady rhythms',
    description: 'Keep routines visible without turning them into pressure.',
  },
]

const stepLabels = ['Make it yours', 'Set your rhythm', 'Connect your day']

const stepMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const },
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [name, setName] = useState('')
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>(['plan', 'focus'])
  const [connectCalendar, setConnectCalendar] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [emailsOptIn, setEmailsOptIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const togglePriority = useCallback((priority: Priority) => {
    setSelectedPriorities((current) => (
      current.includes(priority)
        ? current.filter((item) => item !== priority)
        : [...current, priority]
    ))
  }, [])

  const handleComplete = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
        }),
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Profile setup failed')

      localStorage.setItem('life-os-onboarding-priorities', JSON.stringify(selectedPriorities))
      trackEvent('onboarding_completed', {
        has_selected_priorities: selectedPriorities.length > 0,
        chose_calendar: connectCalendar,
      })

      if (connectCalendar) {
        window.location.assign(`${API_BASE}/api/integrations/google/auth`)
        return
      }

      navigate(`/today?welcome=${selectedPriorities[0] ?? 'plan'}`)
    } catch {
      setError('We could not save your setup. Please try again.')
      setLoading(false)
    }
  }, [connectCalendar, name, navigate, selectedPriorities])

  return (
    <div className="auth-brand-shell lg:grid lg:grid-cols-[320px_1fr]">
      <aside className="auth-brand-aside flex border-b border-[var(--brand-line)] px-5 py-5 lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r lg:p-8">
        <LifeOSMark tone="paper" size="lg" />

        <div className="ml-auto flex items-center lg:ml-0 lg:mt-20 lg:block">
          <p className="hidden max-w-[220px] text-[26px] font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--brand-text)] lg:block">
            One calm system for the life you&apos;re building.
          </p>
          <nav aria-label="Onboarding progress" className="lg:mt-12">
            <ol className="flex items-center gap-2 lg:flex-col lg:items-stretch lg:gap-1">
              {stepLabels.map((label, index) => {
                const number = (index + 1) as Step
                const active = step === number
                const complete = step > number
                return (
                  <li key={label} aria-current={active ? 'step' : undefined}>
                    <button
                      type="button"
                      disabled={!complete}
                      onClick={() => complete && setStep(number)}
                      className={`flex min-h-11 items-center gap-3 rounded-lg px-2 text-left transition-colors ${active ? 'bg-white/[0.055]' : ''} ${complete ? 'cursor-pointer hover:bg-white/[0.035]' : 'cursor-default'}`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-[11px] font-semibold ${active ? 'border-[var(--brand-indigo)] bg-[var(--brand-indigo)] text-white' : complete ? 'border-[var(--brand-line-strong)] bg-[var(--brand-panel-raised)] text-[var(--brand-text)]' : 'border-[var(--brand-line)] text-[var(--brand-text-muted)]'}`}
                      >
                        {complete ? <Check size={13} strokeWidth={2.5} /> : number}
                      </span>
                      <span className={`hidden text-[12px] font-medium lg:block ${active ? 'text-[var(--brand-text)]' : 'text-[var(--brand-text-muted)]'}`}>
                        {label}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>

        <div className="mt-auto hidden rounded-xl border border-[var(--brand-line)] bg-black/10 p-4 lg:block">
          <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--brand-text-secondary)]">
            <ShieldCheck size={14} className="text-[var(--brand-indigo-hover)]" />
            Your setup stays yours
          </div>
          <p className="mt-2 text-[11px] leading-5 text-[var(--brand-text-muted)]">
            Every choice can be changed later in Settings.
          </p>
        </div>
        <div aria-hidden="true" className="auth-orbit-watermark hidden lg:block" />
      </aside>

      <main className="relative flex min-h-[calc(100vh-82px)] items-center justify-center px-5 py-10 sm:px-10 lg:min-h-screen lg:px-16">
        <div className="w-full max-w-[680px]">
          <div className="mb-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => step > 1 && setStep((step - 1) as Step)}
              disabled={step === 1}
              className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-[12px] font-medium text-[var(--brand-text-muted)] hover:bg-white/[0.04] hover:text-[var(--brand-text)] disabled:invisible"
            >
              <ArrowLeft size={15} />
              Back
            </button>
            <span className="text-[11px] tabular-nums text-[var(--brand-text-muted)]">0{step} / 03</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section key="identity" {...stepMotion}>
                <p className="auth-eyebrow mb-3">Welcome to your Life OS</p>
                <h1 className="auth-heading max-w-[560px]">Build your day around you.</h1>
                <p className="auth-body mt-4 max-w-[520px]">
                  A name is all we need to make planning, progress, and daily reflection feel personal.
                </p>

                <div className="mt-10 max-w-[520px] rounded-xl border border-[var(--brand-line)] bg-black/10 p-5 sm:p-6">
                  <label htmlFor="onboarding-name" className="auth-label">What should we call you?</label>
                  <input
                    id="onboarding-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && name.trim()) setStep(2)
                    }}
                    autoComplete="name"
                    autoFocus
                    placeholder="Your first name"
                    className="auth-input text-[15px]"
                  />
                  <p className="mt-3 text-[11px] leading-5 text-[var(--brand-text-muted)]">
                    Used only inside your workspace—not for noisy notifications.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!name.trim()}
                    className="auth-primary-button mt-6"
                  >
                    Continue
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section key="priorities" {...stepMotion}>
                <p className="auth-eyebrow mb-3">Set your starting rhythm</p>
                <h1 className="auth-heading max-w-[620px]">What should feel lighter first?</h1>
                <p className="auth-body mt-4">Choose one or more. This shapes your starting workspace, not your limits.</p>

                <fieldset className="mt-9 grid gap-3" aria-label="Life OS priorities">
                  {priorities.map((priority) => {
                    const selected = selectedPriorities.includes(priority.id)
                    const Icon = priority.icon
                    return (
                      <label
                        key={priority.id}
                        className={`group flex min-h-[82px] cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${selected ? 'border-[var(--brand-indigo)] bg-[var(--brand-indigo-soft)]' : 'border-[var(--brand-line)] bg-[var(--brand-panel)] hover:border-[var(--brand-line-strong)] hover:bg-[var(--brand-panel-raised)]'}`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selected}
                          onChange={() => togglePriority(priority.id)}
                        />
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${selected ? 'border-[var(--brand-indigo)] bg-[var(--brand-indigo)] text-white' : 'border-[var(--brand-line)] bg-black/10 text-[var(--brand-text-secondary)]'}`}>
                          <Icon size={18} strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold text-[var(--brand-text)]">{priority.title}</span>
                          <span className="mt-1 block text-[12px] leading-5 text-[var(--brand-text-muted)]">{priority.description}</span>
                        </span>
                        <span aria-hidden="true" className={`grid h-6 w-6 place-items-center rounded-full border ${selected ? 'border-[var(--brand-indigo)] bg-[var(--brand-indigo)] text-white' : 'border-[var(--brand-line-strong)]'}`}>
                          {selected && <Check size={13} strokeWidth={2.5} />}
                        </span>
                      </label>
                    )
                  })}
                </fieldset>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={selectedPriorities.length === 0}
                  className="auth-primary-button mt-7"
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              </motion.section>
            )}

            {step === 3 && (
              <motion.section key="calendar" {...stepMotion}>
                <p className="auth-eyebrow mb-3">Connect your real day</p>
                <h1 className="auth-heading max-w-[620px]">Bring your commitments with you.</h1>
                <p className="auth-body mt-4 max-w-[580px]">
                  Your calendar gives Life OS the shape of your day. We never change an event unless you ask.
                </p>

                <div className="mt-9 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setConnectCalendar(true)}
                    aria-pressed={connectCalendar}
                    className={`min-h-[168px] rounded-xl border p-5 text-left transition-colors ${connectCalendar ? 'border-[var(--brand-indigo)] bg-[var(--brand-indigo-soft)]' : 'border-[var(--brand-line)] bg-[var(--brand-panel)] hover:border-[var(--brand-line-strong)]'}`}
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${connectCalendar ? 'bg-[var(--brand-indigo)] text-white' : 'bg-[var(--brand-panel-soft)] text-[var(--brand-text-secondary)]'}`}>
                      <CalendarDays size={19} strokeWidth={1.8} />
                    </span>
                    <span className="mt-7 block text-[13px] font-semibold text-[var(--brand-text)]">Connect Google Calendar</span>
                    <span className="mt-1 block text-[11px] leading-5 text-[var(--brand-text-muted)]">See meetings beside tasks in your agenda.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConnectCalendar(false)}
                    aria-pressed={!connectCalendar}
                    className={`min-h-[168px] rounded-xl border p-5 text-left transition-colors ${!connectCalendar ? 'border-[var(--brand-indigo)] bg-[var(--brand-indigo-soft)]' : 'border-[var(--brand-line)] bg-[var(--brand-panel)] hover:border-[var(--brand-line-strong)]'}`}
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${!connectCalendar ? 'bg-[var(--brand-indigo)] text-white' : 'bg-[var(--brand-panel-soft)] text-[var(--brand-text-secondary)]'}`}>
                      <Compass size={19} strokeWidth={1.8} />
                    </span>
                    <span className="mt-7 block text-[13px] font-semibold text-[var(--brand-text)]">Start with a clean slate</span>
                    <span className="mt-1 block text-[11px] leading-5 text-[var(--brand-text-muted)]">Connect a calendar later from Settings.</span>
                  </button>
                </div>

                <div className="mt-6 space-y-3 rounded-xl border border-[var(--brand-line)] bg-black/10 p-4">
                  <label className="flex cursor-pointer items-start gap-3 text-[12px] leading-5 text-[var(--brand-text-secondary)]">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[var(--brand-indigo)]"
                    />
                    <span>I agree to the Life OS Terms of Use and Privacy Policy.</span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 text-[12px] leading-5 text-[var(--brand-text-secondary)]">
                    <input
                      type="checkbox"
                      checked={emailsOptIn}
                      onChange={(event) => setEmailsOptIn(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[var(--brand-indigo)]"
                    />
                    <span>Send me occasional product tips. No daily guilt emails.</span>
                  </label>
                </div>

                {error && <p role="alert" aria-live="assertive" className="auth-error mt-5">{error}</p>}

                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={!termsAccepted || loading}
                  className="auth-primary-button mt-6"
                >
                  {loading ? 'Saving your setup…' : connectCalendar ? 'Save and connect calendar' : 'Open Life OS'}
                  {!loading && <ChevronRight size={16} />}
                </button>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
