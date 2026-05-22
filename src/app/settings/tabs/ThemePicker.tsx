'use client'

import { copy } from '@/lib/copy'
import { type Theme } from '@/contexts/ThemeContext'

// Theme definitions with 3-dot color previews
const THEME_DEFS: { id: Theme; label: string; dots: string[] }[] = [
  { id: 'system', label: 'System', dots: ['#6B6B75', '#0f62fe', '#0E0E12'] },
  { id: 'dark', label: 'Dark', dots: ['#17171E', '#0f62fe', '#F2F2F5'] },
  { id: 'light', label: 'Light', dots: ['#F8F6F2', '#0f62fe', '#1A1A1F'] },
]

interface ThemePickerProps {
  theme: Theme
  setTheme: (t: Theme) => void
  soundsEnabled: boolean
  setSoundsEnabled: (v: boolean) => void
  meetingNotesEnabled: boolean
  setMeetingNotesEnabled: (v: boolean) => void
}

export default function ThemePicker({
  theme,
  setTheme,
  soundsEnabled,
  setSoundsEnabled,
  meetingNotesEnabled,
  setMeetingNotesEnabled,
}: ThemePickerProps) {
  return (
    <>
      {/* Appearance — theme grid */}
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {copy.settings.features.themeLabel}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {THEME_DEFS.map((td) => {
            const active = theme === td.id
            return (
              <button
                key={td.id}
                onClick={() => setTheme(td.id)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  border: active ? '2px solid var(--accent)' : '2px solid var(--border)',
                }}
              >
                <div className="flex gap-1">
                  {td.dots.map((color, i) => (
                    <span
                      key={i}
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  {td.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sounds toggle */}
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {copy.settings.features.soundsLabel}
        </h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            role="switch"
            aria-checked={soundsEnabled}
            aria-label="Completion sounds"
            onClick={() => setSoundsEnabled(!soundsEnabled)}
            className="relative h-5 w-9 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: soundsEnabled ? 'var(--accent)' : 'var(--border)',
            }}
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
              style={{
                transform: soundsEnabled ? 'translateX(18px)' : 'translateX(2px)',
              }}
            />
          </button>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {copy.settings.features.soundsToggle}
          </span>
        </label>
      </div>

      {/* Talk language */}
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {copy.settings.features.talkLabel}
        </h2>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {copy.settings.features.talkLanguage}
          </label>
          <select
            disabled
            className="input-field max-w-[200px] cursor-not-allowed opacity-50"
          >
            <option>English</option>
          </select>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-faint)' }}>
            {copy.settings.features.talkComingSoon}
          </span>
        </div>
      </div>

      {/* Meeting notes toggle */}
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {copy.settings.features.meetingNotesLabel}
        </h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            role="switch"
            aria-checked={meetingNotesEnabled}
            aria-label="Meeting notes"
            onClick={() => setMeetingNotesEnabled(!meetingNotesEnabled)}
            className="relative h-5 w-9 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: meetingNotesEnabled ? 'var(--accent)' : 'var(--border)',
            }}
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
              style={{
                transform: meetingNotesEnabled ? 'translateX(18px)' : 'translateX(2px)',
              }}
            />
          </button>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {copy.settings.features.meetingNotesToggle}
          </span>
        </label>
      </div>
    </>
  )
}
