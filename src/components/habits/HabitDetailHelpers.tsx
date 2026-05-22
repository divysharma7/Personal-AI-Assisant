'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { buttonPress, ease } from '@/lib/motion'

export function DropdownItem({
  icon,
  label,
  trailing,
  danger = false,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  trailing?: React.ReactNode
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: 10,
        padding: '7px 12px',
        fontSize: 13,
        fontWeight: 500,
        color: danger ? '#ef4444' : 'var(--text-primary)',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 120ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <span style={{ color: danger ? '#ef4444' : 'var(--text-muted)', display: 'flex' }}>{icon}</span>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      {trailing}
    </button>
  )
}

function formatLogDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`
}

export function HabitLog({
  completions,
  expanded,
  onToggleExpanded,
}: {
  completions: string[]
  expanded: boolean
  onToggleExpanded: () => void
}) {
  const sorted = useMemo(() => [...completions].sort().reverse(), [completions])
  const visible = expanded ? sorted : sorted.slice(0, 10)
  const hasMore = sorted.length > 10

  if (sorted.length === 0) return null

  return (
    <div
      style={{
        padding: '16px 20px',
        borderRadius: 12,
        backgroundColor: 'var(--bg-pane)',
        border: '1px solid var(--border)',
        marginBottom: 20,
      }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, marginTop: 0 }}>
        Habit Log
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {visible.map((dateStr) => (
          <div
            key={dateStr}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              height: 36,
              padding: '0 4px',
              borderBottom: '1px solid var(--overlay-1, rgba(0,0,0,0.04))',
            }}
          >
            <Check size={14} strokeWidth={2.5} style={{ color: '#22c55e', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
              {formatLogDate(dateStr)}
            </span>
          </div>
        ))}
      </div>
      {hasMore && !expanded && (
        <button
          onClick={onToggleExpanded}
          style={{
            marginTop: 8,
            padding: '4px 0',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--accent)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Show more ({sorted.length - 10} more)
        </button>
      )}
      {expanded && hasMore && (
        <button
          onClick={onToggleExpanded}
          style={{
            marginTop: 8,
            padding: '4px 0',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--accent)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Show less
        </button>
      )}
    </div>
  )
}

export function DeleteConfirmDialog({
  open,
  habitName,
  onClose,
  onConfirm,
}: {
  open: boolean
  habitName: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={ease.fast}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={ease.normal}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 340,
              borderRadius: 14,
              backgroundColor: 'var(--bg-pane)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-modal)',
              padding: '24px',
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Delete Habit
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Are you sure you want to delete &ldquo;{habitName}&rdquo;? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <motion.button
                {...buttonPress}
                onClick={onConfirm}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface BarDataItem {
  day: number
  completed: boolean
  isToday: boolean
  isFuture: boolean
}

export function DailyGoalsBarChart({ barData }: { barData: BarDataItem[] }) {
  return (
    <div
      style={{
        padding: '16px 20px',
        borderRadius: 12,
        backgroundColor: 'var(--bg-pane)',
        border: '1px solid var(--border)',
        marginBottom: 20,
      }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, marginTop: 0 }}>
        Daily Goals
      </h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 100 }}>
        {barData.map((bar) => (
          <div
            key={bar.day}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: bar.isFuture ? 0 : bar.completed ? 80 : 8 }}
              transition={ease.normal}
              style={{
                width: '100%',
                maxWidth: 12,
                borderRadius: '3px 3px 0 0',
                backgroundColor: bar.completed ? 'var(--accent)' : bar.isFuture ? 'transparent' : 'var(--overlay-2, var(--bg-hover))',
                opacity: bar.isToday ? 1 : bar.completed ? 0.7 : 0.4,
                border: bar.isToday ? '1px solid var(--accent)' : 'none',
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
        {barData.map((bar) => (
          <div
            key={bar.day}
            style={{ flex: 1, textAlign: 'center', fontSize: 8, color: bar.isToday ? 'var(--accent)' : 'var(--text-faint)', fontWeight: bar.isToday ? 700 : 400 }}
          >
            {bar.day % 5 === 0 || bar.day === 1 || bar.isToday ? bar.day : ''}
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatBlock({
  label,
  value,
  unit,
  accent = false,
}: {
  label: string
  value: string
  unit: string
  accent?: boolean
}) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 4, fontWeight: 500, marginTop: 0 }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: accent ? 'var(--accent)' : 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>{unit}</span>
      </div>
    </div>
  )
}

export function CompletionStatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}
