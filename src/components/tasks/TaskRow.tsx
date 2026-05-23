'use client'

import { useState, useRef, useCallback, useMemo, memo, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, AlignJustify, Calendar } from 'lucide-react'
import { copy } from '@/lib/copy'
import { checkBounce } from '@/lib/motion'
import type { TaskRecord } from '@/hooks/useTasks'
import DatePopover from '@/components/popovers/DatePopover'
import PriorityPopover from '@/components/popovers/PriorityPopover'

// ── Custom SVG Icons matching Superlist exactly ──

/** Filled priority bars — 3 solid rectangles with varying heights */
function PriorityBarsIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="12" width="3.5" height="6" rx="1" fill={color} />
      <rect x="8.25" y="8" width="3.5" height="10" rx="1" fill={color} />
      <rect x="13.5" y="4" width="3.5" height="14" rx="1" fill={color} />
    </svg>
  )
}

/** Filled calendar icon with grid dots inside */
function CalendarIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2.5" width="14" height="12" rx="2.5" fill={color} />
      <rect x="4" y="0.5" width="1.5" height="3" rx="0.75" fill={color} />
      <rect x="10.5" y="0.5" width="1.5" height="3" rx="0.75" fill={color} />
      {/* Grid dots */}
      <circle cx="5" cy="8" r="1" fill="rgba(255,255,255,0.8)" />
      <circle cx="8" cy="8" r="1" fill="rgba(255,255,255,0.8)" />
      <circle cx="11" cy="8" r="1" fill="rgba(255,255,255,0.8)" />
      <circle cx="5" cy="11" r="1" fill="rgba(255,255,255,0.8)" />
      <circle cx="8" cy="11" r="1" fill="rgba(255,255,255,0.8)" />
      <circle cx="11" cy="11" r="1" fill="rgba(255,255,255,0.8)" />
    </svg>
  )
}

/** Subtask progress ring */
function SubtaskRing({ completed, total, size = 16 }: { completed: number; total: number; size?: number }) {
  const r = 6
  const circumference = 2 * Math.PI * r
  const progress = total > 0 ? completed / total : 0
  const dashOffset = circumference * (1 - progress)
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r={r} fill="none" stroke="var(--overlay-3, #605f6a)" strokeWidth="2" />
      <circle cx="8" cy="8" r={r} fill="none" stroke="var(--text-muted)" strokeWidth="2"
        strokeDasharray={circumference} strokeDashoffset={dashOffset}
        strokeLinecap="round" transform="rotate(-90 8 8)" style={{ transition: 'stroke-dashoffset 300ms ease' }} />
    </svg>
  )
}

/** Drag handle — 6 dots in 2x3 grid */
function DragHandle() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
      <circle cx="3" cy="3" r="1.5" /><circle cx="7" cy="3" r="1.5" />
      <circle cx="3" cy="8" r="1.5" /><circle cx="7" cy="8" r="1.5" />
      <circle cx="3" cy="13" r="1.5" /><circle cx="7" cy="13" r="1.5" />
    </svg>
  )
}

function formatRelativeDate(dateStr: string | null | undefined, stableNow: Date): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date(stableNow); now.setHours(0, 0, 0, 0)
  const target = new Date(d); target.setHours(0, 0, 0, 0)
  const days = Math.round((target.getTime() - now.getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days > 1 && days <= 7) return `in ${days} days`
  if (days < -1) return `${Math.abs(days)} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'var(--priority-high, #ef4444)',
  medium: 'var(--priority-medium, #f59e0b)',
  low: 'var(--priority-low, #6b66da)',
}
const PRIORITY_LABELS: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' }

interface TaskRowProps {
  task: TaskRecord
  onToggle: (id: string) => void
  onOpenDetail: (id: string) => void
  onUpdate?: (id: string, data: Partial<TaskRecord>) => void
  isSelected: boolean
  isDetailOpen: boolean
  subTaskCount?: { completed: number; total: number }
  onTitleChange?: (id: string, title: string) => void
  onSchedule?: () => void
  showScheduleIcon?: boolean
  draggable?: boolean
  isCompleting?: boolean
}

export default memo(forwardRef<HTMLDivElement, TaskRowProps>(function TaskRow({
  task, onToggle, onOpenDetail, onUpdate, isSelected, isDetailOpen,
  subTaskCount, onTitleChange, isCompleting = false,
}: TaskRowProps, ref) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(task.title)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false)
  const [dateHovered, setDateHovered] = useState(false)
  const [priorityHovered, setPriorityHovered] = useState(false)
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const [stableNow] = useState(() => new Date())
  const done = task.status === 'done' || isCompleting
  const dateStr = formatRelativeDate(task.dueDate ?? null, stableNow)
  const overdue = useMemo(() => task.dueDate ? new Date(task.dueDate) < new Date(stableNow.toDateString()) : false, [task.dueDate, stableNow])
  const hasSubs = subTaskCount && subTaskCount.total > 0
  const hasNotes = !!task.description
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low

  const submitTitle = useCallback(() => {
    setEditing(false)
    const t = editVal.trim()
    if (t && t !== task.title && onTitleChange) onTitleChange(task._id, t)
    else setEditVal(task.title)
  }, [editVal, task.title, task._id, onTitleChange])

  return (
    <div
      ref={ref}
      data-task-id={task._id}
      role="listitem"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!editing && !datePopoverOpen && !priorityPopoverOpen) onOpenDetail(task._id) }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !editing) onOpenDetail(task._id)
        if (e.key === ' ' && !editing) { e.preventDefault(); onToggle(task._id) }
      }}
      style={{
        display: 'flex', alignItems: 'flex-start',
        padding: '12px 8px', cursor: 'pointer',
        borderBottom: '1px solid var(--overlay-1, rgba(108,108,158,0.06))',
        backgroundColor: isSelected
          ? 'var(--overlay-2, rgba(108,108,158,0.12))'
          : hovered ? 'var(--overlay-1, rgba(108,108,158,0.05))' : 'transparent',
        transition: 'background-color 180ms ease-out',
      }}
    >
      {/* ── Drag handle — hover only ── */}
      <div style={{
        flexShrink: 0, width: 16, marginRight: 8, marginTop: 4,
        opacity: hovered ? 0.35 : 0, color: 'var(--text-faint)',
        transition: 'opacity 180ms ease-out', cursor: 'grab',
      }}>
        <DragHandle />
      </div>

      {/* ── Checkbox — rounded rectangle, thick border ── */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(task._id) }}
        style={{
          flexShrink: 0, width: 26, height: 26, marginRight: 12,
          borderRadius: 8,
          border: done ? 'none' : '2.5px solid var(--overlay-3, #3a394a)',
          backgroundColor: done ? 'var(--accent)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background-color 150ms ease, border-color 150ms ease',
        }}
      >
        <AnimatePresence>
          {done && (
            <motion.div initial={checkBounce.initial} animate={checkBounce.checked}>
              <Check size={16} strokeWidth={2.5} color="#fff" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* ── Priority bars — custom filled SVG ── */}
      <div style={{ flexShrink: 0, marginTop: 3, marginRight: 10 }}>
        <PriorityBarsIcon color={priorityColor} size={20} />
      </div>

      {/* ── Title + meta ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <input
            ref={inputRef} value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onBlur={submitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); submitTitle() }
              if (e.key === 'Escape') { setEditVal(task.title); setEditing(false) }
            }}
            onClick={(e) => e.stopPropagation()} autoFocus
            style={{
              width: '100%', background: 'transparent', outline: 'none', border: 'none',
              fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
              fontFamily: 'Inter, system-ui, sans-serif', padding: 0,
            }}
          />
        ) : (
          <div
            style={{
              fontSize: 15, fontWeight: 600, lineHeight: 1.4,
              fontFamily: 'Inter, system-ui, sans-serif',
              color: done ? 'var(--text-faint)' : 'var(--text-primary)',
              textDecoration: done ? 'line-through' : 'none',
              textDecorationColor: 'var(--accent)',
            }}
            onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); setEditVal(task.title) }}
          >
            {task.title || copy.list.inlineNewTaskPlaceholder}
          </div>
        )}

        {/* Meta row */}
        {(hasSubs || dateStr) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5, flexWrap: 'wrap' }}>
            {/* Subtask ring + count */}
            {hasSubs && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <SubtaskRing completed={subTaskCount!.completed} total={subTaskCount!.total} />
                {subTaskCount!.completed}/{subTaskCount!.total}
              </span>
            )}

            {/* Date chip — clickable, pill hover, tooltip on hover */}
            {dateStr && (
              <div style={{ position: 'relative' }}
                onMouseEnter={() => setDateHovered(true)}
                onMouseLeave={() => setDateHovered(false)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const rect = e.currentTarget.getBoundingClientRect()
                    setPopoverPos({ x: rect.left, y: rect.bottom + 4 })
                    setDatePopoverOpen(!datePopoverOpen)
                  }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 13, color: overdue ? 'var(--accent)' : 'var(--text-faint)',
                    background: dateHovered ? 'var(--overlay-2, rgba(108,108,158,0.15))' : 'none',
                    border: 'none', cursor: 'pointer',
                    padding: dateHovered ? '3px 8px' : '3px 4px',
                    borderRadius: 999,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 500,
                    transition: 'background-color 150ms ease, border-color 150ms ease',
                  }}
                >
                  <Calendar size={14} strokeWidth={1.5} style={{ color: overdue ? 'var(--accent)' : 'var(--text-faint)' }} />
                  {dateStr}
                </button>

                {/* Tooltip */}
                {dateHovered && !datePopoverOpen && (
                  <div style={{
                    position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)',
                    marginBottom: 6, padding: '4px 10px', borderRadius: 8,
                    backgroundColor: 'var(--bg-pane-2, #2a293b)',
                    border: '1px solid var(--overlay-2, var(--border))',
                    boxShadow: 'var(--shadow-elevated)',
                    fontSize: 12, fontWeight: 500, color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', fontFamily: 'Inter, system-ui, sans-serif',
                    zIndex: 40,
                  }}>
                    Edit due date
                  </div>
                )}

                {datePopoverOpen && (
                  <div style={{ position: 'fixed', left: popoverPos.x, top: popoverPos.y, zIndex: 9999 }} onClick={(e) => e.stopPropagation()}>
                    <DatePopover
                      selected={task.dueDate ? new Date(task.dueDate) : null}
                      onSelect={(date) => {
                        if (onUpdate) onUpdate(task._id, { dueDate: date ? date.toISOString() : null })
                        setDatePopoverOpen(false)
                      }}
                      onClose={() => setDatePopoverOpen(false)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Priority chip — clickable, pill hover, tooltip */}
            {task.priority && (
              <div style={{ position: 'relative' }}
                onMouseEnter={() => setPriorityHovered(true)}
                onMouseLeave={() => setPriorityHovered(false)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const rect = e.currentTarget.getBoundingClientRect()
                    setPopoverPos({ x: rect.left, y: rect.bottom + 4 })
                    setPriorityPopoverOpen(!priorityPopoverOpen)
                  }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 13, color: 'var(--text-faint)',
                    background: priorityHovered ? 'var(--overlay-2, rgba(108,108,158,0.15))' : 'none',
                    border: 'none', cursor: 'pointer',
                    padding: priorityHovered ? '3px 8px' : '3px 4px',
                    borderRadius: 999,
                    fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500,
                    transition: 'background-color 150ms ease, border-color 150ms ease',
                  }}
                >
                  <PriorityBarsIcon color={priorityColor} size={13} />
                  {PRIORITY_LABELS[task.priority]}
                </button>

                {/* Tooltip */}
                {priorityHovered && !priorityPopoverOpen && (
                  <div style={{
                    position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)',
                    marginBottom: 6, padding: '4px 10px', borderRadius: 8,
                    backgroundColor: 'var(--bg-pane-2, #2a293b)',
                    border: '1px solid var(--overlay-2, var(--border))',
                    boxShadow: 'var(--shadow-elevated)',
                    fontSize: 12, fontWeight: 500, color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', fontFamily: 'Inter, system-ui, sans-serif',
                    zIndex: 40,
                  }}>
                    Edit priority
                  </div>
                )}

                {priorityPopoverOpen && (
                  <div style={{ position: 'fixed', left: popoverPos.x, top: popoverPos.y, zIndex: 9999 }} onClick={(e) => e.stopPropagation()}>
                    <PriorityPopover
                      selected={task.priority}
                      onSelect={(p) => { if (onUpdate) onUpdate(task._id, { priority: p || 'medium' }); setPriorityPopoverOpen(false) }}
                      onClose={() => setPriorityPopoverOpen(false)}
                    />
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── Right cluster — fixed positions, no layout shift ── */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16, marginTop: 2 }}>
        {/* Avatar — always in place */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
          backgroundColor: 'var(--avatar-bg, #6b7280)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {task.createdBy ? task.createdBy.charAt(0).toUpperCase() : 'U'}
        </div>

        {/* Arrow / notes icon — fixed 28px slot, content swaps on hover */}
        <div
          onClick={(e) => { e.stopPropagation(); onOpenDetail(task._id) }}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: hovered ? 'var(--overlay-2, rgba(108,108,158,0.12))' : 'transparent',
            cursor: 'pointer',
            transition: 'background-color 180ms ease-out',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-3, rgba(108,108,158,0.25))' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = hovered ? 'var(--overlay-2, rgba(108,108,158,0.12))' : 'transparent' }}
        >
          {hovered ? (
            <ArrowRight size={16} strokeWidth={2} style={{ color: '#fff' }} />
          ) : (hasNotes || hasSubs) ? (
            <AlignJustify size={16} strokeWidth={1.5} style={{ color: 'var(--text-faint)', opacity: 0.4 }} />
          ) : null}
        </div>
      </div>
    </div>
  )
}))
