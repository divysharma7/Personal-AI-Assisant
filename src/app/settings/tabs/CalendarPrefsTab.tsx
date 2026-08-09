import { AnimatePresence, motion } from 'framer-motion'
import { ease, fade } from '@/lib/motion'
import CalendarControlsSection from '@/components/calendar/CalendarControlsSection'

interface CalendarPrefsTabProps {
  calSettingsToast: boolean
  calSettingsError: string
  calShowHabitsOverlay: boolean
  calShowFocusOverlay: boolean
  calColorBy: 'list' | 'priority' | 'label'
  calDefaultView: 'day' | 'week' | 'month'
  onShowHabitsOverlayChange: (value: boolean) => void
  onShowFocusOverlayChange: (value: boolean) => void
  onColorByChange: (value: 'list' | 'priority' | 'label') => void
  onDefaultViewChange: (value: 'day' | 'week' | 'month') => void
  persistCalPref: (data: Record<string, unknown>) => void
}

export default function CalendarPrefsTab({
  calSettingsToast,
  calSettingsError,
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
  return (
    <motion.div key="calendar-prefs" {...fade} transition={ease.normal} className="flex flex-col gap-6">
      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence>
          {calSettingsToast && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={ease.fast} className="mb-2 rounded-lg px-3 py-2 text-xs font-medium" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
              Settings updated
            </motion.div>
          )}
        </AnimatePresence>
        {calSettingsError && <p role="alert" className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: 'color-mix(in srgb, var(--priority-high) 35%, var(--border))', color: 'var(--priority-high)' }}>{calSettingsError}</p>}
      </div>

      <section aria-labelledby="calendar-display-title">
        <h3 id="calendar-display-title" className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Display</h3>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Show Habits', value: calShowHabitsOverlay, setter: onShowHabitsOverlayChange, apiKey: 'showHabitsOnCalendar' },
            { label: 'Show Focus Records', value: calShowFocusOverlay, setter: onShowFocusOverlayChange, apiKey: 'showFocusSessionsOnCalendar' },
          ].map((toggle) => (
            <div key={toggle.label} className="flex min-h-11 items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{toggle.label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={toggle.value}
                aria-label={toggle.label}
                onClick={() => { toggle.setter(!toggle.value); persistCalPref({ [toggle.apiKey]: !toggle.value }) }}
                className="relative h-6 w-11 rounded-full transition-colors duration-200"
                style={{ backgroundColor: toggle.value ? 'var(--accent)' : 'var(--border)' }}
              >
                <span className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-transform duration-200" style={{ transform: toggle.value ? 'translateX(22px)' : 'translateX(3px)' }} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

      <section aria-labelledby="calendar-colour-title">
        <h3 id="calendar-colour-title" className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Task Colour</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Task colour source">
          {(['list', 'priority', 'label'] as const).map((mode) => (
            <button
              type="button"
              key={mode}
              aria-pressed={calColorBy === mode}
              onClick={() => { onColorByChange(mode); persistCalPref({ colorCodingMode: mode }) }}
              className="min-h-10 rounded-full px-4 text-xs font-medium transition-colors duration-150"
              style={{ backgroundColor: calColorBy === mode ? 'var(--accent)' : 'var(--bg-hover)', color: calColorBy === mode ? '#fff' : 'var(--text-muted)' }}
            >
              {mode === 'list' ? 'By List' : mode === 'priority' ? 'By Priority' : 'By Label'}
            </button>
          ))}
        </div>
      </section>

      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

      <section className="flex min-h-11 items-center justify-between gap-4" aria-labelledby="calendar-default-view-title">
        <div>
          <h3 id="calendar-default-view-title" className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Default calendar view</h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-faint)' }}>Used when Calendar opens without a shared view link.</p>
        </div>
        <select
          value={calDefaultView}
          onChange={(event) => {
            const value = event.target.value as 'day' | 'week' | 'month'
            onDefaultViewChange(value)
            persistCalPref({ defaultView: value })
          }}
          className="min-h-10 rounded-lg border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{ backgroundColor: 'var(--bg-pane-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </section>

      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />
      <CalendarControlsSection />
    </motion.div>
  )
}
