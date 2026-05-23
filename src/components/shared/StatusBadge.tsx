'use client'

import { memo, useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { hexToRgba } from '@/lib/colorUtils'
import { motionTokens, springs } from '@/lib/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ── Types ────────────────────────────────────────────────────────

interface StatusBadgeColumn { id: string; title: string }

interface StatusBadgeProps {
  workflowName: string
  workflowIcon: string
  workflowColor: string
  columnName?: string
  columnId?: string
  size?: 'sm' | 'md'
  compact?: boolean
  interactive?: boolean
  onClick?: () => void
  onColumnChange?: (columnId: string) => void
  columns?: StatusBadgeColumn[]
}

// ── Column text crossfade (shared) ───────────────────────────────

function ColumnLabel({ name, color, reduced }: { name: string; color?: string; reduced: boolean }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={name}
        initial={reduced ? undefined : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: 4 }}
        transition={{ duration: motionTokens.duration.fast }}
        style={color ? { color, fontWeight: 600 } : undefined}
      >
        {name}
      </motion.span>
    </AnimatePresence>
  )
}

// ── Dropdown ─────────────────────────────────────────────────────

function ColumnDropdown({ columns, activeColumnId, workflowColor, onSelect, onClose }: {
  columns: StatusBadgeColumn[]
  activeColumnId?: string
  workflowColor: string
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey) }
  }, [onClose])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.sharp }}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: 180,
        padding: 4, borderRadius: 'var(--radius-md, 12px)',
        backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-elevated)', zIndex: 50,
      }}
    >
      {columns.map((col) => {
        const active = col.id === activeColumnId
        return (
          <button
            key={col.id}
            onClick={(e) => { e.stopPropagation(); onSelect(col.id) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '8px 10px', borderRadius: 'var(--radius-sm, 6px)', border: 'none',
              background: active ? hexToRgba(workflowColor, 0.1) : 'transparent',
              color: active ? workflowColor : 'var(--text-primary)',
              fontSize: 13, fontWeight: active ? 600 : 400,
              fontFamily: 'Inter, system-ui, sans-serif', cursor: 'pointer',
              transitionProperty: 'background-color',
              transitionDuration: `${motionTokens.duration.fast * 1000}ms`,
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = active ? hexToRgba(workflowColor, 0.1) : 'transparent' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: hexToRgba(workflowColor, active ? 1 : 0.4), flexShrink: 0 }} />
            <span style={{ flex: 1, textAlign: 'left' }}>{col.title}</span>
            {active && <Check size={14} strokeWidth={2.5} />}
          </button>
        )
      })}
    </motion.div>
  )
}

// ── StatusBadge ──────────────────────────────────────────────────

const StatusBadge = memo(function StatusBadge({
  workflowName, workflowIcon, workflowColor, columnName, columnId,
  size = 'sm', compact = false, interactive = false, onClick, onColumnChange, columns,
}: StatusBadgeProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const reduced = useReducedMotion()

  const isMd = size === 'md'
  const isClickable = interactive || !!onClick

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (interactive && columns && columns.length > 0) setDropdownOpen((p) => !p)
    onClick?.()
  }, [interactive, columns, onClick])

  const handleColumnSelect = useCallback((id: string) => {
    onColumnChange?.(id)
    setDropdownOpen(false)
  }, [onColumnChange])

  const handleDropdownClose = useCallback(() => setDropdownOpen(false), [])

  // Derived colors
  const bgColor = hexToRgba(workflowColor, compact ? 0.06 : 0.08)
  const bgHover = hexToRgba(workflowColor, 0.15)
  const accentColor = workflowColor

  // Entry animation
  const entry = reduced
    ? { initial: { opacity: 0 } as const, animate: { opacity: 1 } as const }
    : { initial: { opacity: 0, scale: 0.9 } as const, animate: { opacity: 1, scale: 1 } as const }
  const entryTransition = reduced ? { duration: motionTokens.duration.fast } : { ...springs.snappy }

  // ── Compact mode: just column name with dot ──
  if (compact) {
    return (
      <motion.span
        {...entry} transition={entryTransition}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 6px', borderRadius: 'var(--radius-sm, 6px)',
          backgroundColor: bgColor, fontSize: 11, fontWeight: 500,
          fontFamily: 'Inter, system-ui, sans-serif', color: accentColor,
          whiteSpace: 'nowrap', lineHeight: 1.2,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: accentColor, flexShrink: 0 }} />
        <ColumnLabel name={columnName || 'No status'} reduced={reduced} />
      </motion.span>
    )
  }

  // ── Full badge (sm or md) ──
  const Tag = isClickable ? motion.button : motion.span
  const interactiveMotion = isClickable
    ? { onClick: handleClick, whileHover: reduced ? undefined : { backgroundColor: bgHover }, whileTap: reduced ? undefined : { scale: 0.97 } }
    : {}

  const padding = isMd ? '6px 12px' : '4px 8px'
  const fontSize = isMd ? 13 : 11

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <Tag
        {...entry} transition={entryTransition} {...interactiveMotion}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: isMd ? 6 : 4,
          padding, borderRadius: 'var(--radius-sm, 6px)',
          backgroundColor: bgColor,
          borderTop: 'none', borderRight: 'none', borderBottom: 'none',
          borderLeft: `2px solid ${hexToRgba(workflowColor, 0.3)}`,
          fontSize, fontWeight: 500, fontFamily: 'Inter, system-ui, sans-serif',
          cursor: isClickable ? 'pointer' : 'default',
          minHeight: isClickable ? 44 : undefined,
          whiteSpace: 'nowrap' as const, lineHeight: 1.2,
          transitionProperty: 'background-color, transform, box-shadow',
          transitionDuration: `${motionTokens.duration.fast * 1000}ms`,
          color: 'var(--text-muted)',
        }}
      >
        {/* Workflow icon + name */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: isMd ? 14 : 12 }}>{workflowIcon}</span>
          <span>{workflowName}</span>
        </span>

        {/* Separator + column name */}
        {columnName && (
          <>
            <span style={{ color: 'var(--text-faint)', fontSize: isMd ? 12 : 10 }}>·</span>
            <ColumnLabel name={columnName} color={accentColor} reduced={reduced} />
          </>
        )}

        {/* Chevron */}
        {interactive && (
          <ChevronDown
            size={isMd ? 14 : 12} strokeWidth={2}
            style={{
              color: 'var(--text-faint)', marginLeft: 2,
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transitionProperty: 'transform',
              transitionDuration: `${motionTokens.duration.fast * 1000}ms`,
            }}
          />
        )}
      </Tag>

      {/* Column dropdown */}
      <AnimatePresence>
        {dropdownOpen && interactive && columns && (
          <ColumnDropdown
            columns={columns} activeColumnId={columnId}
            workflowColor={workflowColor} onSelect={handleColumnSelect} onClose={handleDropdownClose}
          />
        )}
      </AnimatePresence>
    </div>
  )
})

export default StatusBadge
