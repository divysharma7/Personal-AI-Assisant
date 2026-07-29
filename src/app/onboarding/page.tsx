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
  Sparkles,
  Target,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
    description: 'See commitments and priorities in one agenda.',
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
    description: 'Keep habits visible without making them feel like chores.',
  },
]

const stepLabels = ['Meet your OS', 'Choose your rhythm', 'Bring in your day']

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
          onboarded: true,
          emailsOptIn,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Profile setup failed')
      }

      localStorage.setItem('life-os-onboarding-priorities', JSON.stringify(selectedPriorities))

      // Privacy-safe milestone tracking — only fires once per day.
      trackEvent('onboarding_completed', {
        has_selected_priorities: selectedPriorities.length > 0,
        chose_calendar: connectCalendar,
      })

      if (connectCalendar) {
        window.location.assign(`${API_BASE}/api/integrations/google/auth`)
        return
      }

      navigate('/')
    } catch {
      setError('We could not save your setup. Please try again.')
      setLoading(false)
    }
  }, [connectCalendar, emailsOptIn, name, navigate, selectedPriorities])

  return (
    <div className="min-h-screen bg-[#f3efe6] text-[#191915] lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-black/10 bg-[#191915] px-6 py-5 text-[#f7f3ea] lg:min-h-screen lg:border-b-0 lg:border-r lg:border-white/10 lg:p-8">
        <LifeOSMark tone="paper" />

        <nav aria-label="Onboarding progress" className="mt-8 lg:mt-24">
          <ol className="flex gap-2 lg:flex-col lg:gap-0">
            {stepLabels.map((label, index) => {
              const number = index + 1
              const active = step === number
              const complete = step > number
              return (
                <li
                  key={label}
                  className="flex flex-1 items-center gap-3 border-white/10 py-3 lg:border-b"
                  aria-current={active ? 'step' : undefined}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{
                      backgroundColor: active ? '#c8ee72' : complete ? '#f15b43' : 'rgba(255,255,255,0.08)',
                      color: active ? '#191915' : '#f7f3ea',
                    }}
                  >
                    {complete ? <Check size={13} strokeWidth={2.5} /> : number}
                  </span>
                  <span className={`hidden text-xs font-semibold lg:block ${active ? 'text-white' : 'text-white/40'}`}>
                    {label}
                  </span>
                </li>
              )
            })}
          </ol>
        </nav>

        <p className="mt-auto hidden max-w-[180px] text-xs leading-5 text-white/35 lg:block">
          You can change every preference later in Settings.
        </p>
      </aside>

      <main className="relative flex min-h-[calc(100vh-78px)] items-center justify-center overflow-hidden px-5 py-12 lg:min-h-screen lg:px-12">
        <div
          aria-hidden="true"
          className="absolute -right-28 -top-28 h-72 w-72 rounded-full border-[58px] border-[#c8ee72]/60"
        />
        <div className="relative z-10 w-full max-w-[720px]">
          <div className="mb-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => step > 1 && setStep((step - 1) as Step)}
              disabled={step === 1}
              className="flex items-center gap-2 text-xs font-semibold text-black/50 hover:text-black disabled:invisible"
            >
              <ArrowLeft size={15} />
              Back
            </button>
            <span className="text-xs tabular-nums text-black/35">{step} / 3</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section
                key="identity"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f15b43]">
                  First, make it yours
                </p>
                <h1
                  className="max-w-xl text-[clamp(44px,7vw,72px)] font-normal leading-[0.94] tracking-[-0.05em]"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  What should your day call you?
                </h1>
                <p className="mt-5 max-w-md text-[15px] leading-7 text-black/50">
                  Life OS uses your name in daily planning and progress moments—not in noisy notifications.
                </p>

                <div className="mt-12 max-w-lg">
                  <label htmlFor="onboarding-name" className="mb-2 block text-xs font-semibold">
                    Your name
                  </label>
                  <input
                    id="onboarding-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && name.trim()) setStep(2)
                    }}
                    autoComplete="name"
                    placeholder="e.g. Divy"
                    className="w-full rounded-none border-0 border-b-2 border-black/20 bg-transparent px-0 py-4 text-2xl text-[#191915] outline-none placeholder:text-black/20 focus:border-[#191915]"
                  />
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!name.trim()}
                    className="mt-8 flex items-center gap-2 rounded-full bg-[#191915] px-6 py-3 text-sm font-semibold text-white hover:bg-[#f15b43] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Build my rhythm
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section
                key="priorities"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f15b43]">
                  Choose your starting point
                </p>
                <h1
                  className="max-w-xl text-[clamp(42px,6vw,66px)] font-normal leading-[0.96] tracking-[-0.05em]"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  What should feel easier first?
                </h1>
                <p className="mt-5 text-sm text-black/50">Choose one or more. This only shapes your starting experience.</p>

                <fieldset className="mt-10 grid gap-3" aria-label="Life OS priorities">
                  {priorities.map((priority) => {
                    const selected = selectedPriorities.includes(priority.id)
                    const Icon = priority.icon
                    return (
                      <label
                        key={priority.id}
                        className="flex cursor-pointer items-center gap-4 border border-black/15 bg-white/30 p-4 hover:bg-white/60"
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selected}
                          onChange={() => togglePriority(priority.id)}
                        />
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: selected ? '#191915' : 'rgba(25,25,21,0.06)' }}
                        >
                          <Icon size={18} color={selected ? '#f7f3ea' : '#191915'} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{priority.title}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-black/45">{priority.description}</span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="flex h-6 w-6 items-center justify-center rounded-full border"
                          style={{
                            borderColor: selected ? '#f15b43' : 'rgba(25,25,21,0.2)',
                            backgroundColor: selected ? '#f15b43' : 'transparent',
                          }}
                        >
                          {selected && <Check size={13} color="white" strokeWidth={2.5} />}
                        </span>
                      </label>
                    )
                  })}
                </fieldset>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={selectedPriorities.length === 0}
                  className="mt-8 flex items-center gap-2 rounded-full bg-[#191915] px-6 py-3 text-sm font-semibold text-white hover:bg-[#f15b43] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              </motion.section>
            )}

            {step === 3 && (
              <motion.section
                key="calendar"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f15b43]">
                  One useful connection
                </p>
                <h1
                  className="max-w-xl text-[clamp(42px,6vw,66px)] font-normal leading-[0.96] tracking-[-0.05em]"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Let your calendar shape the day.
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-6 text-black/50">
                  Connect Google Calendar so your agenda reflects real commitments. Life OS will not change events unless you ask it to.
                </p>

                <div className="mt-9 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setConnectCalendar(true)}
                    aria-pressed={connectCalendar}
                    className="min-h-40 border p-5 text-left"
                    style={{
                      borderColor: connectCalendar ? '#191915' : 'rgba(25,25,21,0.15)',
                      backgroundColor: connectCalendar ? '#191915' : 'rgba(255,255,255,0.3)',
                      color: connectCalendar ? '#f7f3ea' : '#191915',
                    }}
                  >
                    <CalendarDays size={22} />
                    <span className="mt-7 block text-sm font-semibold">Connect Google Calendar</span>
                    <span className={`mt-1 block text-xs leading-5 ${connectCalendar ? 'text-white/50' : 'text-black/45'}`}>
                      See meetings beside tasks in your daily agenda.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConnectCalendar(false)}
                    aria-pressed={!connectCalendar}
                    className="min-h-40 border p-5 text-left"
                    style={{
                      borderColor: !connectCalendar ? '#191915' : 'rgba(25,25,21,0.15)',
                      backgroundColor: !connectCalendar ? '#c8ee72' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <ArrowLeft size={22} className="rotate-180" />
                    <span className="mt-7 block text-sm font-semibold">Start with a clean slate</span>
                    <span className="mt-1 block text-xs leading-5 text-black/45">
                      Connect a calendar later from Settings.
                    </span>
                  </button>
                </div>

                <div className="mt-7 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-black/60">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#191915]"
                    />
                    <span>I agree to the Life OS Terms of Use and Privacy Policy.</span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-black/60">
                    <input
                      type="checkbox"
                      checked={emailsOptIn}
                      onChange={(event) => setEmailsOptIn(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#191915]"
                    />
                    <span>Send me occasional product tips. No daily guilt emails.</span>
                  </label>
                </div>

                {error && (
                  <p role="alert" aria-live="assertive" className="mt-5 text-sm text-[#a72f20]">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={!termsAccepted || loading}
                  className="mt-7 flex items-center gap-2 rounded-full bg-[#191915] px-6 py-3 text-sm font-semibold text-white hover:bg-[#f15b43] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {loading
                    ? 'Saving your setup…'
                    : connectCalendar
                      ? 'Save and connect calendar'
                      : 'Open Life OS'}
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
