'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ease } from '@/lib/motion'

interface CalendarSettingsSectionProps {
  calSettingsToast: boolean
  showCalToast: () => void
  calDefaultView: 'day' | 'week' | 'month'
  setCalDefaultView: (v: 'day' | 'week' | 'month') => void
  calWeekStartsOn: 'monday' | 'sunday' | 'saturday'
  setCalWeekStartsOn: (v: 'monday' | 'sunday' | 'saturday') => void
  calTimeFormat: '12' | '24'
  setCalTimeFormat: (v: '12' | '24') => void
  calShowCurrentTime: boolean
  setCalShowCurrentTime: (v: boolean) => void
  calHideHoursFrom: number
  setCalHideHoursFrom: (v: number) => void
  calHideHoursTo: number
  setCalHideHoursTo: (v: number) => void
  calColorBy: 'list' | 'priority' | 'label'
  setCalColorBy: (v: 'list' | 'priority' | 'label') => void
  calDailyCapacity: number
  setCalDailyCapacity: (v: number) => void
  calShowCapacityBar: boolean
  setCalShowCapacityBar: (v: boolean) => void
  calShowWarnings: boolean
  setCalShowWarnings: (v: boolean) => void
  calShowGoogleOverlay: boolean
  setCalShowGoogleOverlay: (v: boolean) => void
  calShowHabitsOverlay: boolean
  setCalShowHabitsOverlay: (v: boolean) => void
  calShowFocusOverlay: boolean
  setCalShowFocusOverlay: (v: boolean) => void
}

export default function CalendarSettingsSection(props: CalendarSettingsSectionProps) {
  const {
    calSettingsToast, showCalToast,
    calDefaultView, setCalDefaultView,
    calWeekStartsOn, setCalWeekStartsOn,
    calTimeFormat, setCalTimeFormat,
    calShowCurrentTime, setCalShowCurrentTime,
    calHideHoursFrom, setCalHideHoursFrom,
    calHideHoursTo, setCalHideHoursTo,
    calColorBy, setCalColorBy,
    calDailyCapacity, setCalDailyCapacity,
    calShowCapacityBar, setCalShowCapacityBar,
    calShowWarnings, setCalShowWarnings,
    calShowGoogleOverlay, setCalShowGoogleOverlay,
    calShowHabitsOverlay, setCalShowHabitsOverlay,
    calShowFocusOverlay, setCalShowFocusOverlay,
  } = props

  return (
    <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
      <h2 className="mb-5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Calendar
      </h2>

      {/* Toast notification */}
      <div aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {calSettingsToast && (
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

      {/* View Preferences */}
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        View Preferences
      </p>
      <div className="mb-5 flex flex-col gap-3">
        {/* Default view */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Default view</span>
          <select
            value={calDefaultView}
            onChange={(e) => { setCalDefaultView(e.target.value as 'day' | 'week' | 'month'); showCalToast() }}
            className="rounded-lg px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 cursor-pointer"
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

        {/* Week starts on */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Week starts on</span>
          <select
            value={calWeekStartsOn}
            onChange={(e) => { setCalWeekStartsOn(e.target.value as 'monday' | 'sunday' | 'saturday'); showCalToast() }}
            className="rounded-lg px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="monday">Monday</option>
            <option value="sunday">Sunday</option>
            <option value="saturday">Saturday</option>
          </select>
        </div>

        {/* Time format */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Time format</span>
          <div className="flex items-center gap-2">
            {(['12', '24'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => { setCalTimeFormat(fmt); showCalToast() }}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                style={{
                  backgroundColor: calTimeFormat === fmt ? 'var(--accent)' : 'var(--bg-hover)',
                  color: calTimeFormat === fmt ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                {fmt}-hour
              </button>
            ))}
          </div>
        </div>

        {/* Show current time */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Show current time</span>
          <button
            role="switch"
            aria-checked={calShowCurrentTime}
            aria-label="Show current time"
            onClick={() => { setCalShowCurrentTime(!calShowCurrentTime); showCalToast() }}
            className="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
            style={{ backgroundColor: calShowCurrentTime ? 'var(--accent)' : 'var(--border)' }}
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
              style={{ transform: calShowCurrentTime ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </button>
        </div>
      </div>

      {/* Display Hours */}
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        Display Hours
      </p>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Hide hours from</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={23}
            value={calHideHoursFrom}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (!isNaN(v) && v >= 0 && v <= 23) { setCalHideHoursFrom(v); showCalToast() }
            }}
            aria-label="Hide hours from"
            className="w-16 rounded-lg px-2 py-1.5 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>to</span>
          <input
            type="number"
            min={0}
            max={23}
            value={calHideHoursTo}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (!isNaN(v) && v >= 0 && v <= 23) { setCalHideHoursTo(v); showCalToast() }
            }}
            aria-label="Hide hours to"
            className="w-16 rounded-lg px-2 py-1.5 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Color Coding */}
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        Color Coding
      </p>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Color tasks by</span>
        <div className="flex items-center gap-2">
          {(['list', 'priority', 'label'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => { setCalColorBy(opt); showCalToast() }}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: calColorBy === opt ? 'var(--accent)' : 'var(--bg-hover)',
                color: calColorBy === opt ? '#FFFFFF' : 'var(--text-muted)',
              }}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Capacity */}
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        Capacity
      </p>
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Daily capacity</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={24}
              value={calDailyCapacity}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v) && v > 0 && v <= 24) { setCalDailyCapacity(v); showCalToast() }
              }}
              aria-label="Daily capacity"
              className="w-16 rounded-lg px-2 py-1.5 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              style={{
                backgroundColor: 'var(--bg-pane-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>hours</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Show capacity bar</span>
          <button
            role="switch"
            aria-checked={calShowCapacityBar}
            aria-label="Show capacity bar"
            onClick={() => { setCalShowCapacityBar(!calShowCapacityBar); showCalToast() }}
            className="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
            style={{ backgroundColor: calShowCapacityBar ? 'var(--accent)' : 'var(--border)' }}
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
              style={{ transform: calShowCapacityBar ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Show warnings</span>
          <button
            role="switch"
            aria-checked={calShowWarnings}
            aria-label="Show warnings"
            onClick={() => { setCalShowWarnings(!calShowWarnings); showCalToast() }}
            className="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
            style={{ backgroundColor: calShowWarnings ? 'var(--accent)' : 'var(--border)' }}
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
              style={{ transform: calShowWarnings ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </button>
        </div>
      </div>

      {/* Overlays */}
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        Overlays
      </p>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Google Calendar</span>
          <button
            role="switch"
            aria-checked={calShowGoogleOverlay}
            aria-label="Google Calendar overlay"
            onClick={() => { setCalShowGoogleOverlay(!calShowGoogleOverlay); showCalToast() }}
            className="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
            style={{ backgroundColor: calShowGoogleOverlay ? 'var(--accent)' : 'var(--border)' }}
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
              style={{ transform: calShowGoogleOverlay ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Habits</span>
          <button
            role="switch"
            aria-checked={calShowHabitsOverlay}
            aria-label="Habits overlay"
            onClick={() => { setCalShowHabitsOverlay(!calShowHabitsOverlay); showCalToast() }}
            className="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
            style={{ backgroundColor: calShowHabitsOverlay ? 'var(--accent)' : 'var(--border)' }}
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
              style={{ transform: calShowHabitsOverlay ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Focus sessions</span>
          <button
            role="switch"
            aria-checked={calShowFocusOverlay}
            aria-label="Focus sessions overlay"
            onClick={() => { setCalShowFocusOverlay(!calShowFocusOverlay); showCalToast() }}
            className="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
            style={{ backgroundColor: calShowFocusOverlay ? 'var(--accent)' : 'var(--border)' }}
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
              style={{ transform: calShowFocusOverlay ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
