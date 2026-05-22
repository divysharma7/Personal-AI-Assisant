'use client'

import { useState } from 'react'
import { Check, Calendar, ArrowRight } from 'lucide-react'
import DatePopover from '@/components/popovers/DatePopover'
import PriorityPopover from '@/components/popovers/PriorityPopover'
import PriorityBars from './PriorityBars'
import type { TaskRecord } from '@/hooks/useTasks'

interface SubTaskRowProps {
  sub: TaskRecord
  subDone: boolean
  subDateStr: string | null
  subOverdue: boolean
  subPriorityColor: string
  onToggle: () => void
  onOpen: () => void
  onUpdate: (id: string, data: Partial<TaskRecord>) => void
}

/** Subtask row with same UX as main TaskRow */
export default function SubTaskRow({ sub, subDone, subDateStr, subOverdue, subPriorityColor, onToggle, onOpen, onUpdate }: SubTaskRowProps) {
  const [hovered, setHovered] = useState(false)
  const [dateHovered, setDateHovered] = useState(false)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [priHovered, setPriHovered] = useState(false)
  const [priPopoverOpen, setPriPopoverOpen] = useState(false)
  const priLabel = sub.priority === 'high' ? 'High' : sub.priority === 'low' ? 'Low' : 'Medium'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!datePopoverOpen && !priPopoverOpen) onOpen() }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 8px', cursor: 'pointer',
        borderBottom: '1px solid var(--overlay-1, rgba(108,108,158,0.06))',
        backgroundColor: hovered ? 'var(--overlay-1, rgba(108,108,158,0.05))' : 'transparent',
        transition: 'background-color 150ms ease',
      }}
    >
      {/* Checkbox — rectangle */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        style={{
          flexShrink: 0, width: 22, height: 22, borderRadius: 6,
          border: subDone ? 'none' : '2px solid var(--overlay-3, #3a394a)',
          backgroundColor: subDone ? 'var(--accent)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background-color 180ms ease-out, border-color 180ms ease-out',
        }}
      >
        {subDone && <Check size={13} strokeWidth={2.5} color="#fff" />}
      </button>

      {/* Priority bars */}
      <div style={{ flexShrink: 0, marginTop: 3 }}>
        <PriorityBars color={subPriorityColor} size={16} />
      </div>

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, lineHeight: 1.4,
          fontFamily: 'Inter, system-ui, sans-serif',
          color: subDone ? 'var(--text-faint)' : 'var(--text-primary)',
          textDecoration: subDone ? 'line-through' : 'none',
          textDecorationColor: 'var(--accent)',
        }}>
          {sub.title}
        </div>

        {(subDateStr || sub.priority) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {/* Date chip — clickable pill hover + tooltip */}
            {subDateStr && (
              <div style={{ position: 'relative' }}
                onMouseEnter={() => setDateHovered(true)} onMouseLeave={() => setDateHovered(false)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setDatePopoverOpen(!datePopoverOpen) }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: subOverdue ? 'var(--accent)' : 'var(--text-faint)',
                    background: dateHovered ? 'var(--overlay-2, rgba(108,108,158,0.15))' : 'none',
                    border: 'none', cursor: 'pointer',
                    padding: dateHovered ? '2px 7px' : '2px 3px',
                    borderRadius: 999, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500,
                    transition: 'background-color 180ms ease-out, border-color 180ms ease-out',
                  }}
                >
                  <Calendar size={12} strokeWidth={1.5} />
                  {subDateStr}
                </button>
                {dateHovered && !datePopoverOpen && (
                  <div style={{
                    position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)',
                    marginBottom: 5, padding: '3px 8px', borderRadius: 6,
                    backgroundColor: 'var(--bg-pane-2, #2a293b)',
                    border: '1px solid var(--overlay-2, var(--border))', boxShadow: 'var(--shadow-elevated)',
                    fontSize: 11, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap',
                    fontFamily: 'Inter, system-ui, sans-serif', zIndex: 40,
                  }}>
                    Edit due date
                  </div>
                )}
                {datePopoverOpen && (
                  <div style={{ position: 'absolute', left: 0, top: '100%', zIndex: 50, marginTop: 4 }} onClick={(e) => e.stopPropagation()}>
                    <DatePopover
                      selected={sub.dueDate ? new Date(sub.dueDate) : null}
                      onSelect={(date) => { onUpdate(sub._id, { dueDate: date ? date.toISOString() : null }); setDatePopoverOpen(false) }}
                      onClose={() => setDatePopoverOpen(false)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Priority chip — clickable pill hover + tooltip */}
            {sub.priority && (
              <div style={{ position: 'relative' }}
                onMouseEnter={() => setPriHovered(true)} onMouseLeave={() => setPriHovered(false)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setPriPopoverOpen(!priPopoverOpen) }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: 'var(--text-faint)',
                    background: priHovered ? 'var(--overlay-2, rgba(108,108,158,0.15))' : 'none',
                    border: 'none', cursor: 'pointer',
                    padding: priHovered ? '2px 7px' : '2px 3px',
                    borderRadius: 999, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500,
                    transition: 'background-color 180ms ease-out, border-color 180ms ease-out',
                  }}
                >
                  <PriorityBars color={subPriorityColor} size={11} />
                  {priLabel}
                </button>
                {priHovered && !priPopoverOpen && (
                  <div style={{
                    position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)',
                    marginBottom: 5, padding: '3px 8px', borderRadius: 6,
                    backgroundColor: 'var(--bg-pane-2, #2a293b)',
                    border: '1px solid var(--overlay-2, var(--border))', boxShadow: 'var(--shadow-elevated)',
                    fontSize: 11, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap',
                    fontFamily: 'Inter, system-ui, sans-serif', zIndex: 40,
                  }}>
                    Edit priority
                  </div>
                )}
                {priPopoverOpen && (
                  <div style={{ position: 'absolute', left: 0, top: '100%', zIndex: 50, marginTop: 4 }} onClick={(e) => e.stopPropagation()}>
                    <PriorityPopover
                      selected={sub.priority}
                      onSelect={(p) => { onUpdate(sub._id, { priority: p || 'medium' }); setPriPopoverOpen(false) }}
                      onClose={() => setPriPopoverOpen(false)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: avatar + arrow on hover */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--avatar-bg, #6b7280)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {sub.createdBy ? sub.createdBy.charAt(0).toUpperCase() : 'U'}
        </div>
        {hovered && (
          <div
            onClick={(e) => { e.stopPropagation(); onOpen() }}
            style={{
              width: 24, height: 24, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'var(--overlay-2, rgba(108,108,158,0.12))',
              color: 'var(--accent)', cursor: 'pointer',
            }}
          >
            <ArrowRight size={14} strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  )
}
