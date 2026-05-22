'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ease } from '@/lib/motion'

interface FocusSettingsProps {
  focusWorkDuration: number
  setFocusWorkDuration: (v: number) => void
  focusShortBreak: number
  setFocusShortBreak: (v: number) => void
  focusLongBreak: number
  setFocusLongBreak: (v: number) => void
  focusLongBreakEvery: number
  setFocusLongBreakEvery: (v: number) => void
  focusClockTheme: 'aurora' | 'minimal' | 'liquid'
  setFocusClockTheme: (v: 'aurora' | 'minimal' | 'liquid') => void
  focusSoundOnComplete: boolean
  setFocusSoundOnComplete: (v: boolean) => void
  focusKeyboardShortcuts: boolean
  setFocusKeyboardShortcuts: (v: boolean) => void
  focusShowActiveSession: boolean
  setFocusShowActiveSession: (v: boolean) => void
  focusSettingsToast: boolean
  showFocusToast: () => void
}

export default function FocusSettings(props: FocusSettingsProps) {
  const {
    focusWorkDuration, setFocusWorkDuration,
    focusShortBreak, setFocusShortBreak,
    focusLongBreak, setFocusLongBreak,
    focusLongBreakEvery, setFocusLongBreakEvery,
    focusClockTheme, setFocusClockTheme,
    focusSoundOnComplete, setFocusSoundOnComplete,
    focusKeyboardShortcuts, setFocusKeyboardShortcuts,
    focusShowActiveSession, setFocusShowActiveSession,
    focusSettingsToast, showFocusToast,
  } = props

  return (
    <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
      <h2 className="mb-5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Focus
      </h2>

      {/* Toast notification */}
      <div aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {focusSettingsToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={ease.fast}
            className="mb-4 rounded-lg px-3 py-2 text-xs font-medium"
            style={{
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent)',
            }}
          >
            Settings updated
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Default durations */}
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        Default Durations
      </p>
      <div className="mb-5 flex flex-col gap-3">
        {[
          { label: 'Work session', value: focusWorkDuration, set: setFocusWorkDuration, unit: 'minutes' },
          { label: 'Short break', value: focusShortBreak, set: setFocusShortBreak, unit: 'minutes' },
          { label: 'Long break', value: focusLongBreak, set: setFocusLongBreak, unit: 'minutes' },
          { label: 'Long break every', value: focusLongBreakEvery, set: setFocusLongBreakEvery, unit: 'sessions' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={120}
                value={item.value}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!isNaN(v) && v > 0) {
                    item.set(v)
                    showFocusToast()
                  }
                }}
                aria-label={item.label}
                className="w-16 rounded-lg px-2 py-1.5 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                {item.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Appearance */}
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        Appearance
      </p>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Clock theme</span>
        <div className="flex items-center gap-2">
          {(['aurora', 'minimal', 'liquid'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setFocusClockTheme(t); showFocusToast() }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: focusClockTheme === t ? 'var(--accent)' : 'var(--bg-hover)',
                color: focusClockTheme === t ? '#FFFFFF' : 'var(--text-muted)',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sound */}
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        Sound
      </p>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Sound on complete</span>
        <button
          role="switch"
          aria-checked={focusSoundOnComplete}
          aria-label="Sound on complete"
          onClick={() => { setFocusSoundOnComplete(!focusSoundOnComplete); showFocusToast() }}
          className="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
          style={{
            backgroundColor: focusSoundOnComplete ? 'var(--accent)' : 'var(--border)',
          }}
        >
          <span
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
            style={{
              transform: focusSoundOnComplete ? 'translateX(18px)' : 'translateX(2px)',
            }}
          />
        </button>
      </div>

      {/* Shortcuts */}
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        Shortcuts
      </p>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Keyboard shortcuts</span>
        <button
          role="switch"
          aria-checked={focusKeyboardShortcuts}
          aria-label="Keyboard shortcuts"
          onClick={() => { setFocusKeyboardShortcuts(!focusKeyboardShortcuts); showFocusToast() }}
          className="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
          style={{
            backgroundColor: focusKeyboardShortcuts ? 'var(--accent)' : 'var(--border)',
          }}
        >
          <span
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
            style={{
              transform: focusKeyboardShortcuts ? 'translateX(18px)' : 'translateX(2px)',
            }}
          />
        </button>
      </div>

      {/* Sidebar */}
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        Sidebar
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Show active session</span>
        <button
          role="switch"
          aria-checked={focusShowActiveSession}
          aria-label="Show active session in sidebar"
          onClick={() => { setFocusShowActiveSession(!focusShowActiveSession); showFocusToast() }}
          className="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
          style={{
            backgroundColor: focusShowActiveSession ? 'var(--accent)' : 'var(--border)',
          }}
        >
          <span
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
            style={{
              transform: focusShowActiveSession ? 'translateX(18px)' : 'translateX(2px)',
            }}
          />
        </button>
      </div>
    </div>
  )
}
