'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { copy } from '@/lib/copy'
import { fade, fadeSlideUp, ease } from '@/lib/motion'
import { useHeatmap } from '@/hooks/useHeatmap'

interface ProfileTabProps {
  firstName: string
  lastName: string
  email: string
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onSignOut: () => void
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
  const now = new Date()
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
}: ProfileTabProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)

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
        </div>

        {/* Card 3: App Language */}
        <div style={cardStyle}>
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            App language
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Change the app UI language.
          </p>
          <div className="mt-4 relative" style={{ maxWidth: 240 }}>
            <select
              disabled
              style={{
                ...inputStyle,
                appearance: 'none',
                paddingRight: 36,
                cursor: 'not-allowed',
              }}
            >
              <option>System default</option>
            </select>
            <span
              className="pointer-events-none absolute right-3"
              style={{ top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }}
            >
              &#x25BE;
            </span>
          </div>
        </div>

        {/* Card 4: Export Account Data */}
        <div style={cardStyle} className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Export account data
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Download a .csv file with your account data
            </p>
          </div>
          <button
            className="rounded-full px-4 py-2 text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              border: 'none',
            }}
          >
            Download
          </button>
        </div>

        {/* Card 5: Account Deletion */}
        <div style={cardStyle} className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Account deletion
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              This action is permanent and cannot be undone
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded-full px-4 py-2 text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--priority-high)',
              border: 'none',
            }}
          >
            {copy.settings.profile.deleteAccount}
          </button>
        </div>
      </motion.div>

      {/* ─── Delete Account Modal ─── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            {...fade}
            transition={ease.fast}
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setShowDeleteModal(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowDeleteModal(false) }}
          >
            <motion.div
              {...fadeSlideUp}
              transition={ease.normal}
              role="dialog"
              aria-modal="true"
              aria-label="Delete account confirmation"
              className="w-full max-w-md rounded-2xl p-6"
              style={{
                backgroundColor: 'var(--bg-pane)',
                border: '1px solid var(--border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {copy.settings.profile.deleteAccount}
                </h3>
                <button
                  aria-label="Close"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
                  style={{ color: 'var(--text-faint)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                {copy.settings.profile.deleteWarning}
              </p>
              <label className="mb-5 flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {copy.settings.profile.deleteConfirmCheckbox}
                </span>
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {copy.settings.profile.deleteCancelCta}
                </button>
                <button
                  disabled={!deleteConfirmed}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: 'var(--priority-high)' }}
                >
                  {copy.settings.profile.deleteConfirmCta}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
