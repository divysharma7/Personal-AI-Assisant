'use client'

import { motion } from 'framer-motion'
import { type Theme } from '@/contexts/ThemeContext'
import { copy } from '@/lib/copy'
import { fade, ease } from '@/lib/motion'

interface FeaturesTabProps {
  theme: Theme
  setTheme: (t: Theme) => void
  soundsEnabled: boolean
  setSoundsEnabled: (v: boolean) => void
  meetingNotesEnabled: boolean
  setMeetingNotesEnabled: (v: boolean) => void
}

/* ─── Shared card style ─── */
const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-pane-2)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: 24,
}

/* ─── Toggle switch ─── */
function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="relative flex-shrink-0 transition-colors duration-200 cursor-pointer"
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: on ? '#34d399' : 'var(--border)',
        border: 'none',
      }}
    >
      <span
        className="absolute rounded-full bg-white transition-transform duration-200"
        style={{
          width: 18,
          height: 18,
          top: 3,
          left: 3,
          transform: on ? 'translateX(20px)' : 'translateX(0)',
        }}
      />
    </button>
  )
}

/* ─── Dropdown select ─── */
const selectStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-hover)',
  color: 'var(--text-primary)',
  borderRadius: 999,
  padding: '10px 36px 10px 16px',
  border: 'none',
  outline: 'none',
  fontSize: 14,
  appearance: 'none',
  cursor: 'pointer',
}

function themeToLabel(t: Theme): string {
  if (t === 'system') return 'System preference'
  if (t === 'dark') return 'Dark'
  return 'Light'
}

export default function FeaturesTab({
  theme,
  setTheme,
  soundsEnabled,
  setSoundsEnabled,
  meetingNotesEnabled,
  setMeetingNotesEnabled,
}: FeaturesTabProps) {
  return (
    <motion.div key="features" {...fade} transition={ease.normal} className="flex flex-col" style={{ gap: 16 }}>
      {/* Card 1: Appearance */}
      <div style={cardStyle}>
        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          {copy.settings.features.themeLabel}
        </h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Customize your app interface
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18 }}>&#x1F313;</span>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Active theme</span>
          </div>
          <div className="relative">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              style={selectStyle}
            >
              <option value="system">System preference</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <span
              className="pointer-events-none absolute right-3"
              style={{ top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }}
            >
              &#x25BE;
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Sounds */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {copy.settings.features.soundsLabel}
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              {copy.settings.features.soundsToggle}
            </p>
          </div>
          <Toggle on={soundsEnabled} onToggle={() => setSoundsEnabled(!soundsEnabled)} label="Sounds" />
        </div>
      </div>

      {/* Card 3: Talk Voice AI */}
      <div style={cardStyle}>
        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          Talk voice AI
        </h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Settings related to voice input and processing
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {copy.settings.features.talkLanguage}
          </span>
          <div className="relative">
            <select disabled style={{ ...selectStyle, cursor: 'not-allowed', opacity: 0.7 }}>
              <option>English</option>
            </select>
            <span
              className="pointer-events-none absolute right-3"
              style={{ top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }}
            >
              &#x25BE;
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: Meeting Notes */}
      <div style={cardStyle}>
        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          {copy.settings.features.meetingNotesLabel}
        </h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Settings related to meeting notes
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {copy.settings.features.meetingNotesToggle}
          </span>
          <Toggle
            on={meetingNotesEnabled}
            onToggle={() => setMeetingNotesEnabled(!meetingNotesEnabled)}
            label="Meeting notes"
          />
        </div>
      </div>
    </motion.div>
  )
}
