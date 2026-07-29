
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fade, ease } from '@/lib/motion'
import CalendarControlsSection from '@/components/calendar/CalendarControlsSection'
import { useCalendarControls } from '@/hooks/useCalendarControls'

interface CalendarPrefsTabProps {
  calSettingsToast: boolean
  calShowHabitsOverlay: boolean
  calShowFocusOverlay: boolean
  calColorBy: 'list' | 'priority' | 'label'
  calDefaultView: 'day' | 'week' | 'month'
  onShowHabitsOverlayChange: (v: boolean) => void
  onShowFocusOverlayChange: (v: boolean) => void
  onColorByChange: (v: 'list' | 'priority' | 'label') => void
  onDefaultViewChange: (v: 'day' | 'week' | 'month') => void
  persistCalPref: (data: Record<string, unknown>) => void
}

export default function CalendarPrefsTab({
  calSettingsToast,
  calShowHabitsOverlay,
  calShowFocusOverlay,
  calColorBy,
  calDefaultView,
  onShowHabitsOverlayChange,
  onShowFocusOverlayChange,
  onColorByChange,
  onDefaultViewChange,
  persistCalPref,
}: CalendarPrefsTabProps) {
  // ── Calendar data from API ────────────────────────────────
  const { activeCalendars, passiveCalendars, isLoading: calendarsLoading } = useCalendarControls()
  const allCalendars = [...activeCalendars, ...passiveCalendars]

  // ── Default write calendar (LOS-304) ─────────────────────────

  const writableCalendars = useMemo(
    () => allCalendars.filter((c) => !c.readOnly),
    [allCalendars],
  )

  const readOnlyCalendars = useMemo(
    () => allCalendars.filter((c) => c.readOnly),
    [allCalendars],
  )

  // Auto-select the sole writable calendar; otherwise leave empty
  const [defaultWriteId, setDefaultWriteId] = useState<string>(() =>
    writableCalendars.length === 1 ? writableCalendars[0].id : '',
  )

  const selectedWritable = writableCalendars.find((c) => c.id === defaultWriteId)
  const currentUnavailable = defaultWriteId !== '' && !selectedWritable

  return (
    <motion.div key="calendar-prefs" {...fade} transition={ease.normal} className="flex flex-col gap-6">
      {/* Toast */}
      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence>
          {calSettingsToast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={ease.fast}
              className="mb-2 rounded-lg px-3 py-2 text-xs font-medium"
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

      {/* Display Toggles */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
          Display
        </p>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Show Completed', key: 'showCompleted' as const, value: false },
            { label: 'Show Habits', key: 'showHabitsOnCalendar' as const, value: calShowHabitsOverlay, setter: onShowHabitsOverlayChange, apiKey: 'showHabitsOnCalendar' },
            { label: 'Show Focus Records', key: 'showFocusSessionsOnCalendar' as const, value: calShowFocusOverlay, setter: onShowFocusOverlayChange, apiKey: 'showFocusSessionsOnCalendar' },
          ].map((toggle) => (
            <div key={toggle.label} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{toggle.label}</span>
              <button
                role="switch"
                aria-checked={toggle.value}
                aria-label={toggle.label}
                onClick={() => {
                  if (toggle.setter) {
                    toggle.setter(!toggle.value)
                    persistCalPref({ [toggle.apiKey!]: !toggle.value })
                  }
                }}
                className="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
                style={{ backgroundColor: toggle.value ? 'var(--accent)' : 'var(--border)' }}
              >
                <span
                  className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
                  style={{ transform: toggle.value ? 'translateX(18px)' : 'translateX(2px)' }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Task Color Mode */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
          Task Color
        </p>
        <div className="flex items-center gap-2">
          {(['list', 'priority', 'label'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                onColorByChange(mode)
                persistCalPref({ colorCodingMode: mode })
              }}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: calColorBy === mode ? 'var(--accent)' : 'var(--bg-hover)',
                color: calColorBy === mode ? '#FFFFFF' : 'var(--text-muted)',
              }}
            >
              {mode === 'list' ? 'By List' : mode === 'priority' ? 'By Priority' : 'By Label'}
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Calendar Style */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
          Calendar Style
        </p>
        <div className="flex items-center gap-3">
          {(['modern', 'classic'] as const).map((style) => (
            <button
              key={style}
              className="flex-1 rounded-xl p-3 text-center cursor-pointer transition-all duration-150"
              style={{
                border: '2px solid var(--border)',
                backgroundColor: 'var(--bg-pane-2)',
              }}
            >
              <div
                style={{
                  marginBottom: 6,
                  height: 20,
                  borderRadius: 6,
                  backgroundColor: style === 'modern' ? 'var(--accent)' : 'transparent',
                  border: style === 'classic' ? '1px solid var(--overlay-2, var(--border))' : 'none',
                  borderLeft: style === 'classic' ? '3px solid var(--accent)' : undefined,
                }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                {style}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Default View */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
          Default View
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Default calendar view</span>
          <select
            value={calDefaultView}
            onChange={(e) => {
              const v = e.target.value as 'day' | 'week' | 'month'
              onDefaultViewChange(v)
              persistCalPref({ defaultView: v })
            }}
            className="rounded-lg px-2 py-1.5 text-sm outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Default Write Calendar (LOS-304) */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
          Event Destination
        </p>

        {/* Unavailable warning */}
        <AnimatePresence>
          {currentUnavailable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 rounded-lg px-3 py-2 text-xs font-medium"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
              }}
              role="alert"
            >
              Your previous event destination is no longer available.{' '}
              <strong>Choose a new event destination</strong> to continue creating events.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selector label + dropdown */}
        <div className="flex items-center justify-between">
          <label
            htmlFor="default-write-calendar"
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            New event destination
          </label>
          <select
            id="default-write-calendar"
            value={defaultWriteId}
            onChange={(e) => setDefaultWriteId(e.target.value)}
            aria-label="Select default calendar for new events"
            className="rounded-lg px-2 py-1.5 text-sm outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              maxWidth: 260,
            }}
          >
            <option value="" disabled>
              Choose a calendar…
            </option>
            {writableCalendars.map((cal) => (
              <option key={cal.id} value={cal.id}>
                {cal.name} — {cal.accountLabel} ({cal.accountEmail})
              </option>
            ))}
          </select>
        </div>

        {/* Selected calendar identity */}
        {selectedWritable && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ease.fast}
            className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2.5"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--border)',
            }}
          >
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full"
              style={{ backgroundColor: selectedWritable.color }}
              aria-hidden
            />
            <div className="flex min-w-0 flex-col">
              <span
                className="truncate text-[13px] font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {selectedWritable.name}
              </span>
              <span
                className="truncate text-[11px]"
                style={{ color: 'var(--text-faint)' }}
              >
                {selectedWritable.accountLabel}
                <span className="mx-1 opacity-50">{'\u00B7'}</span>
                {selectedWritable.accountEmail}
              </span>
            </div>
          </motion.div>
        )}

        {/* Read-only calendars note */}
        {readOnlyCalendars.length > 0 && (
          <p className="mt-3 text-[11px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
            {readOnlyCalendars.length === 1
              ? `${readOnlyCalendars[0].name} (${readOnlyCalendars[0].accountEmail}) is read-only and not available as an event destination.`
              : `${readOnlyCalendars.map((c) => c.name).join(', ')} are read-only and not available as event destinations.`}
          </p>
        )}
      </div>

      {/* Separator */}
      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Calendar Controls — Active / Passive */}
      <CalendarControlsSection />
    </motion.div>
  )
}
