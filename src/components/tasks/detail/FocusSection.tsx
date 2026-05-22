'use client'

import { motion } from 'framer-motion'
import { Target, Play } from 'lucide-react'

// ── Placeholder focus data for a task ──
const PLACEHOLDER_FOCUS_SESSIONS = [
  { date: '2026-05-17', duration: 1500, note: 'Deep work on initial draft' },
  { date: '2026-05-16', duration: 2700, note: 'Research phase' },
  { date: '2026-05-15', duration: 1500, note: '' },
  { date: '2026-05-14', duration: 3600, note: 'Final review and edits' },
  { date: '2026-05-12', duration: 900, note: 'Quick brainstorm' },
]

const PLACEHOLDER_WEEK_BARS = [0, 25, 45, 0, 60, 30, 15] // minutes per day, last 7 days

export default function FocusSection({ taskId, taskTitle }: { taskId: string; taskTitle: string }) {
  const totalMinutes = PLACEHOLDER_FOCUS_SESSIONS.reduce((s, sess) => s + sess.duration, 0) / 60
  const totalHours = (totalMinutes / 60).toFixed(1)
  const sessionCount = PLACEHOLDER_FOCUS_SESSIONS.length
  const maxBar = Math.max(...PLACEHOLDER_WEEK_BARS, 1)
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div
      className="mb-6 rounded-xl p-4"
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Section header */}
      <div className="mb-3 flex items-center gap-2">
        <Target size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Focus
        </span>
      </div>

      {/* Total focus time */}
      <p className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        {totalHours} hours across {sessionCount} sessions
      </p>

      {/* Mini bar chart: last 7 days */}
      <div className="mb-4 flex items-end gap-1" style={{ height: 40 }}>
        {PLACEHOLDER_WEEK_BARS.map((minutes, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
            <div className="relative w-full flex justify-center" style={{ height: 28 }}>
              <div
                className="w-3 rounded-t-sm"
                style={{
                  backgroundColor: minutes > 0 ? 'var(--accent)' : 'var(--bg-hover)',
                  height: `${Math.max((minutes / maxBar) * 100, minutes > 0 ? 10 : 4)}%`,
                  position: 'absolute',
                  bottom: 0,
                  opacity: minutes > 0 ? 0.8 : 0.3,
                }}
              />
            </div>
            <span className="text-[8px]" style={{ color: 'var(--text-faint)' }}>
              {dayLabels[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Start button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent('laif:start-focus', {
              detail: { taskId, taskTitle },
            })
          )
        }}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white transition-opacity duration-150 cursor-pointer"
        style={{ backgroundColor: 'var(--accent)' }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
      >
        <Play size={12} strokeWidth={2} />
        Start a focus session
      </motion.button>

      {/* Recent sessions */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
          Recent sessions
        </p>
        {PLACEHOLDER_FOCUS_SESSIONS.map((sess, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                {new Date(sess.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {Math.round(sess.duration / 60)}m
              </span>
            </div>
            {sess.note && (
              <span className="max-w-[180px] truncate text-[10px]" style={{ color: 'var(--text-faint)' }}>
                {sess.note}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
