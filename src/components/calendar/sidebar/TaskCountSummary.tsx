'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun,
  Sunrise,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  ChevronDown,
} from 'lucide-react'

// -- Smart List Row --
function SmartListRow({
  icon,
  label,
  count,
  filterKey,
  active,
  accent,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  count: number
  filterKey: string
  active: boolean
  accent?: string
  onClick: (key: string) => void
}) {
  return (
    <button
      onClick={() => onClick(filterKey)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '6px 10px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: active ? 'var(--overlay-2, rgba(108,108,158,0.1))' : 'transparent',
        color: accent || 'var(--text-primary)',
        transition: 'background-color 150ms ease-out',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(108,108,158,0.06))'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: active ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </span>
      {count > 0 && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '1px 7px',
            borderRadius: 999,
            backgroundColor: accent ? `color-mix(in srgb, ${accent} 15%, transparent)` : 'var(--overlay-2, rgba(108,108,158,0.1))',
            color: accent || 'var(--text-muted)',
            flexShrink: 0,
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

// -- Section Header --
function SectionHeader({ label, expanded, onToggle }: { label: string; expanded: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 10px 4px',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
          color: 'var(--text-muted)',
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <motion.span
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.15 }}
          style={{ display: 'flex' }}
        >
          <ChevronDown size={12} strokeWidth={2} />
        </motion.span>
        {label}
      </button>
    </div>
  )
}

interface TaskCountSummaryProps {
  taskCounts: { today: number; tomorrow: number; week: number; overdue: number; completed: number; total: number }
}

export default function TaskCountSummary({ taskCounts }: TaskCountSummaryProps) {
  const [smartListsExpanded, setSmartListsExpanded] = useState(true)
  const [activeSmartList, setActiveSmartList] = useState<string | null>(null)

  const handleSmartListClick = useCallback((filterKey: string) => {
    setActiveSmartList((prev) => (prev === filterKey ? null : filterKey))
    window.dispatchEvent(new CustomEvent('laif:calendar-filter', { detail: { filter: filterKey } }))
  }, [])

  return (
    <>
      <SectionHeader label="Smart Lists" expanded={smartListsExpanded} onToggle={() => setSmartListsExpanded((v) => !v)} />
      <AnimatePresence>
        {smartListsExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingBottom: 4 }}>
              <SmartListRow
                icon={<Sun size={15} strokeWidth={1.5} />}
                label="Today"
                count={taskCounts.today}
                filterKey="today"
                active={activeSmartList === 'today'}
                accent="var(--accent)"
                onClick={handleSmartListClick}
              />
              <SmartListRow
                icon={<Sunrise size={15} strokeWidth={1.5} />}
                label="Tomorrow"
                count={taskCounts.tomorrow}
                filterKey="tomorrow"
                active={activeSmartList === 'tomorrow'}
                onClick={handleSmartListClick}
              />
              <SmartListRow
                icon={<Calendar size={15} strokeWidth={1.5} />}
                label="Next 7 Days"
                count={taskCounts.week}
                filterKey="week"
                active={activeSmartList === 'week'}
                onClick={handleSmartListClick}
              />
              <SmartListRow
                icon={<AlertCircle size={15} strokeWidth={1.5} />}
                label="Overdue"
                count={taskCounts.overdue}
                filterKey="overdue"
                active={activeSmartList === 'overdue'}
                accent="#ef4444"
                onClick={handleSmartListClick}
              />
              <SmartListRow
                icon={<CheckCircle2 size={15} strokeWidth={1.5} />}
                label="Completed"
                count={taskCounts.completed}
                filterKey="completed"
                active={activeSmartList === 'completed'}
                accent="#34d399"
                onClick={handleSmartListClick}
              />
              <SmartListRow
                icon={<ListTodo size={15} strokeWidth={1.5} />}
                label="All Tasks"
                count={taskCounts.total}
                filterKey="all"
                active={activeSmartList === 'all'}
                onClick={handleSmartListClick}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
