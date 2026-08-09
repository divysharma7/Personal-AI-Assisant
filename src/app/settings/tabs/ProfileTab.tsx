
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { copy } from '@/lib/copy'
import { fade, ease } from '@/lib/motion'
import { useHeatmap } from '@/hooks/useHeatmap'

interface ProfileTabProps {
  firstName: string
  lastName: string
  email: string
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onSave: () => void
  saving: boolean
  saveStatus: string
}

/* ─── Shared card style ─── */
const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-pane-2)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: 24,
}

/* ─── Heatmap helpers ─── */
function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.getFullYear(), d.getMonth(), diff)
}

function formatMonthLabel(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const shortYear = String(d.getFullYear()).slice(2)
  return `${months[d.getMonth()]} '${shortYear}`
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function intensityColor(count: number): string {
  if (count === 0) return 'var(--bg-hover)'
  if (count <= 1) return 'rgba(52,211,153,0.25)'
  if (count <= 3) return 'rgba(52,211,153,0.5)'
  if (count <= 5) return 'rgba(52,211,153,0.75)'
  return '#34d399'
}

/* ─── TaskActivityHeatmap ─── */
function TaskActivityHeatmap() {
  const now = useMemo(() => new Date(), [])
  const currentYear = now.getFullYear()
  const prevYear = currentYear - 1

  const { data: currentData } = useHeatmap(currentYear)
  const { data: prevData } = useHeatmap(prevYear)

  const mergedData = useMemo(() => ({ ...prevData, ...currentData }), [prevData, currentData])

  const { weeks, monthLabels, total } = useMemo(() => {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const start = new Date(end)
    start.setFullYear(start.getFullYear() - 1)
    start.setDate(start.getDate() + 1)

    const weekStart = getMonday(start)
    const wks: Date[][] = []
    const mLabels: { label: string; col: number }[] = []
    let lastMonth = -1
    const cursor = new Date(weekStart)

    while (cursor <= end) {
      const week: Date[] = []
      for (let d = 0; d < 7; d++) {
        const day = new Date(cursor)
        day.setDate(day.getDate() + d)
        week.push(day)
      }
      if (week[0].getMonth() !== lastMonth) {
        lastMonth = week[0].getMonth()
        mLabels.push({ label: formatMonthLabel(week[0]), col: wks.length })
      }
      wks.push(week)
      cursor.setDate(cursor.getDate() + 7)
    }

    let t = 0
    if (mergedData) {
      Object.entries(mergedData).forEach(([key, val]) => {
        const d = new Date(key)
        if (d >= start && d <= end) t += val
      })
    }

    return { weeks: wks, monthLabels: mLabels, total: t }
  }, [mergedData, now])

  const cellSize = 12
  const gap = 3

  return (
    <div style={cardStyle}>
      <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
        Task activity
      </h3>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
        {total} completed tasks in the last 12 months
      </p>
      <div className="mt-4 overflow-x-auto">
        <svg
          width={weeks.length * (cellSize + gap) + 30}
          height={7 * (cellSize + gap) + 20}
          style={{ display: 'block' }}
        >
          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={m.col * (cellSize + gap) + 30}
              y={10}
              fill="var(--text-faint)"
              fontSize={10}
            >
              {m.label}
            </text>
          ))}
          {/* Day labels */}
          {['Mon', '', 'Wed', '', 'Fri', '', ''].map((label, i) => (
            label ? (
              <text
                key={i}
                x={0}
                y={20 + i * (cellSize + gap) + cellSize - 2}
                fill="var(--text-faint)"
                fontSize={9}
              >
                {label}
              </text>
            ) : null
          ))}
          {/* Grid */}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              const key = dateKey(day)
              const count = mergedData?.[key] ?? 0
              const today = new Date()
              if (day > today) return null
              return (
                <rect
                  key={`${wi}-${di}`}
                  x={wi * (cellSize + gap) + 30}
                  y={di * (cellSize + gap) + 16}
                  width={cellSize}
                  height={cellSize}
                  rx={3}
                  fill={intensityColor(count)}
                >
                  <title>{`${key}: ${count} tasks`}</title>
                </rect>
              )
            })
          )}
        </svg>
      </div>
    </div>
  )
}

/* ─── Toggle ─── */
const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-hover)',
  color: 'var(--text-primary)',
  borderRadius: 999,
  padding: '12px 16px',
  border: 'none',
  outline: 'none',
  width: '100%',
  fontSize: 14,
}

export default function ProfileTab({
  firstName,
  lastName,
  email,
  onFirstNameChange,
  onLastNameChange,
  onSave,
  saving,
  saveStatus,
}: ProfileTabProps) {
  return (
    <>
      <motion.div key="profile" {...fade} transition={ease.normal} className="flex flex-col" style={{ gap: 16 }}>
        {/* Card 1: Task Activity */}
        <TaskActivityHeatmap />

        {/* Card 2: Personal Info */}
        <div style={cardStyle}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Personal info
              </h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                Update your photo and personal details here
              </p>
            </div>
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          <div className="mt-5 flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {copy.settings.profile.firstName}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                autoComplete="given-name"
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {copy.settings.profile.lastName}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                autoComplete="family-name"
                style={inputStyle}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Primary email
            </label>
            <input
              type="text"
              value={email}
              readOnly
              style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !`${firstName} ${lastName}`.trim()}
              className="h-10 rounded-xl px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {saving ? 'Savingâ€¦' : 'Save Profile'}
            </button>
            <p className="text-xs" aria-live="polite" style={{ color: saveStatus.startsWith('Could') ? 'var(--priority-high)' : 'var(--text-muted)' }}>
              {saveStatus}
            </p>
          </div>
        </div>

        {/* Card 3: App Language */}
        <div style={cardStyle}>
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            App language
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Life OS follows your browser language and regional formatting.
          </p>
          <p className="mt-4 inline-flex rounded-full px-3 py-2 text-xs font-medium" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
            System default
          </p>
        </div>

      </motion.div>

      {/* ─── Delete Account Modal ─── */}
    </>
  )
}
