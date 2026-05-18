'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { fadeSlideUp, scaleIn, buttonPress, ease } from '@/lib/motion'

// TODO: move to copy.ts
const COPY = {
  title: 'Create Habit',
  steps: [
    'Name & Icon',
    'Goal Type',
    'Target',
    'Frequency',
    'Reminder',
    'List',
  ] as const,
  stepTitles: [
    'What habit do you want to build?',
    'How will you track it?',
    'Set your target',
    'How often?',
    'When should we remind you?',
    'Which list should this live in?',
  ] as const,
  goalTypes: {
    binary: { title: 'Done / not done', desc: 'Simple yes or no tracking' },
    count: { title: 'Reach a number', desc: 'Track a measurable goal' },
  },
  frequencies: {
    daily: 'Daily',
    weekly: 'Weekly',
    interval: 'Every N days',
  },
  weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const,
  back: 'Back',
  next: 'Next',
  create: 'Create',
  namePlaceholder: 'e.g. Read 30 pages',
  unitPlaceholder: 'pages, min, km...',
  targetPlaceholder: '30',
  timesPerWeek: 'times per week',
  everyNDays: 'Every',
  days: 'days',
  reminderHint: 'Reminders deliver via mobile app (coming soon)',
  defaultList: 'Personal Habits',
} as const

const EMOJI_PRESETS = ['\uD83D\uDCDA', '\uD83C\uDFCB\uFE0F', '\uD83E\uDDD8', '\uD83D\uDCDD', '\uD83C\uDFAF', '\uD83D\uDD25']
const COLOR_PRESETS = [
  '#FF4D3D', '#FFB23D', '#34D399', '#38BDF8',
  '#C084FC', '#F472B6', '#5DA8FF', '#6366F1',
]

interface HabitCreationWizardProps {
  open: boolean
  onClose: () => void
  onCreate: (data: HabitFormData) => void
  prefill?: { title?: string; icon?: string; frequency?: string }
}

export interface HabitFormData {
  name: string
  icon: string
  color: string
  goalType: 'binary' | 'count'
  target?: number
  unit?: string
  frequency: 'daily' | 'weekly' | 'interval'
  weekdays?: number[]
  timesPerWeek?: number
  intervalDays?: number
  reminderTime?: string
  listName: string
}

export default function HabitCreationWizard({
  open,
  onClose,
  onCreate,
  prefill,
}: HabitCreationWizardProps) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState(prefill?.title ?? '')
  const [icon, setIcon] = useState(prefill?.icon ?? EMOJI_PRESETS[0])
  const [customIcon, setCustomIcon] = useState('')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [goalType, setGoalType] = useState<'binary' | 'count'>('binary')
  const [target, setTarget] = useState<number>(1)
  const [unit, setUnit] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'interval'>('daily')
  const [weekdays, setWeekdays] = useState<number[]>([0, 1, 2, 3, 4]) // Mon-Fri
  const [timesPerWeek, setTimesPerWeek] = useState(3)
  const [intervalDays, setIntervalDays] = useState(2)
  const [reminderTime, setReminderTime] = useState('20:00')
  const [listName, setListName] = useState<string>(COPY.defaultList)

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(0)
      setName(prefill?.title ?? '')
      setIcon(prefill?.icon ?? EMOJI_PRESETS[0])
      setGoalType('binary')
    }
  }, [open, prefill])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const totalSteps = goalType === 'count' ? 6 : 5
  const actualStep = goalType === 'binary' && step >= 2 ? step + 1 : step

  const canNext = useCallback(() => {
    if (step === 0) return name.trim().length > 0
    return true
  }, [step, name])

  const handleNext = useCallback(() => {
    if (step === 0 && !name.trim()) return
    if (step === totalSteps - 1) {
      onCreate({
        name: name.trim(),
        icon,
        color,
        goalType,
        target: goalType === 'count' ? target : undefined,
        unit: goalType === 'count' ? unit : undefined,
        frequency,
        weekdays: frequency === 'daily' ? weekdays : undefined,
        timesPerWeek: frequency === 'weekly' ? timesPerWeek : undefined,
        intervalDays: frequency === 'interval' ? intervalDays : undefined,
        reminderTime,
        listName,
      })
      onClose()
      return
    }
    setStep((s) => Math.min(s + 1, totalSteps - 1))
  }, [step, totalSteps, name, icon, color, goalType, target, unit, frequency, weekdays, timesPerWeek, intervalDays, reminderTime, listName, onCreate, onClose])

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const toggleWeekday = useCallback((idx: number) => {
    setWeekdays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    )
  }, [])

  const renderStep = () => {
    switch (actualStep) {
      case 0:
        return (
          <motion.div key="step0" {...fadeSlideUp} transition={ease.normal} className="flex flex-col gap-5">
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {COPY.stepTitles[0]}
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={COPY.namePlaceholder}
              className="w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-pane-2)',
              }}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleNext() }}
            />
            {/* Icon picker */}
            <div>
              <p className="mb-2 text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Icon</p>
              <div className="flex items-center gap-2">
                {EMOJI_PRESETS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setIcon(e)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all duration-150 cursor-pointer"
                    style={{
                      border: icon === e ? '2px solid var(--accent)' : '2px solid var(--border)',
                      backgroundColor: icon === e ? 'var(--accent-soft)' : 'transparent',
                    }}
                  >
                    {e}
                  </button>
                ))}
                <input
                  value={customIcon}
                  onChange={(ev) => {
                    setCustomIcon(ev.target.value)
                    if (ev.target.value.trim()) setIcon(ev.target.value.trim())
                  }}
                  placeholder="Custom"
                  className="w-16 rounded-lg bg-transparent px-2 py-2 text-center text-sm outline-none"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
            {/* Color picker */}
            <div>
              <p className="mb-2 text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Color</p>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="h-8 w-8 rounded-full cursor-pointer transition-transform duration-150"
                    style={{
                      backgroundColor: c,
                      border: color === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                      transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )
      case 1:
        return (
          <motion.div key="step1" {...fadeSlideUp} transition={ease.normal} className="flex flex-col gap-4">
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {COPY.stepTitles[1]}
            </p>
            <div className="flex flex-col gap-3">
              {(['binary', 'count'] as const).map((gt) => (
                <button
                  key={gt}
                  onClick={() => setGoalType(gt)}
                  className="flex flex-col gap-1 rounded-xl px-4 py-3 text-left transition-all duration-150 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-pane-2)',
                    border: goalType === gt ? '2px solid var(--accent)' : '2px solid var(--border)',
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {COPY.goalTypes[gt].title}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {COPY.goalTypes[gt].desc}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div key="step2" {...fadeSlideUp} transition={ease.normal} className="flex flex-col gap-4">
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {COPY.stepTitles[2]}
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
                min={1}
                placeholder={COPY.targetPlaceholder}
                className="w-24 rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
                style={{
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-pane-2)',
                }}
              />
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={COPY.unitPlaceholder}
                className="flex-1 rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
                style={{
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-pane-2)',
                }}
              />
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div key="step3" {...fadeSlideUp} transition={ease.normal} className="flex flex-col gap-4">
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {COPY.stepTitles[3]}
            </p>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'interval'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className="rounded-full px-4 py-2 text-xs font-medium transition-all duration-150 cursor-pointer"
                  style={{
                    backgroundColor: frequency === f ? 'var(--accent)' : 'transparent',
                    color: frequency === f ? '#FFFFFF' : 'var(--text-muted)',
                    border: frequency === f ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {COPY.frequencies[f]}
                </button>
              ))}
            </div>
            {frequency === 'daily' && (
              <div className="flex gap-2">
                {COPY.weekdays.map((d, i) => (
                  <button
                    key={d}
                    onClick={() => toggleWeekday(i)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-all duration-150 cursor-pointer"
                    style={{
                      backgroundColor: weekdays.includes(i) ? 'var(--accent)' : 'transparent',
                      color: weekdays.includes(i) ? '#FFFFFF' : 'var(--text-muted)',
                      border: weekdays.includes(i) ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {d.charAt(0)}
                  </button>
                ))}
              </div>
            )}
            {frequency === 'weekly' && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={timesPerWeek}
                  onChange={(e) => setTimesPerWeek(parseInt(e.target.value) || 1)}
                  className="w-16 rounded-xl bg-transparent px-3 py-2 text-sm outline-none"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-pane-2)',
                  }}
                />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {COPY.timesPerWeek}
                </span>
              </div>
            )}
            {frequency === 'interval' && (
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {COPY.everyNDays}
                </span>
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(parseInt(e.target.value) || 2)}
                  className="w-16 rounded-xl bg-transparent px-3 py-2 text-sm outline-none"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-pane-2)',
                  }}
                />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {COPY.days}
                </span>
              </div>
            )}
          </motion.div>
        )
      case 4:
        return (
          <motion.div key="step4" {...fadeSlideUp} transition={ease.normal} className="flex flex-col gap-4">
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {COPY.stepTitles[4]}
            </p>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-40 rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-pane-2)',
              }}
            />
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              {COPY.reminderHint}
            </p>
          </motion.div>
        )
      case 5:
        return (
          <motion.div key="step5" {...fadeSlideUp} transition={ease.normal} className="flex flex-col gap-4">
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {COPY.stepTitles[5]}
            </p>
            <select
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-pane-2)',
              }}
            >
              <option value="Personal Habits">Personal Habits</option>
              <option value="Health">Health</option>
              <option value="Learning">Learning</option>
              <option value="Work">Work</option>
            </select>
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={ease.fast}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={onClose}
        >
          <motion.div
            {...scaleIn}
            transition={ease.normal}
            className="flex w-[480px] flex-col rounded-2xl"
            style={{
              backgroundColor: 'var(--bg-pane)',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {COPY.title}
              </h2>
              <motion.button
                {...buttonPress}
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <X size={16} strokeWidth={1.5} />
              </motion.button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 px-6 py-3">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: i <= step ? 'var(--accent)' : 'var(--border)',
                    transform: i === step ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>

            {/* Step content */}
            <div className="px-6 py-6 min-h-[260px]">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <motion.button
                {...buttonPress}
                onClick={handleBack}
                disabled={step === 0}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { if (step > 0) e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <ChevronLeft size={14} strokeWidth={1.5} />
                {COPY.back}
              </motion.button>
              <motion.button
                {...buttonPress}
                onClick={handleNext}
                disabled={!canNext()}
                className="flex items-center gap-1 rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent)' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                {step === totalSteps - 1 ? COPY.create : COPY.next}
                {step < totalSteps - 1 && <ChevronRight size={14} strokeWidth={1.5} />}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
