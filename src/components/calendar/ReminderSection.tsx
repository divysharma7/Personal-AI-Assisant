'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Plus, X, Clock } from 'lucide-react'
import { motionTokens, ease } from '@/lib/motion'

export interface Reminder {
  id: string
  type: 'before-start' | 'on-day-at' | 'absolute'
  offsetMinutes?: number
  timeOfDay?: string | null
  absoluteTime?: string | null
  sent?: boolean
}

interface ReminderSectionProps {
  reminders: Reminder[]
  onChange: (reminders: Reminder[]) => void
  maxReminders?: number
}

const QUICK_PRESETS = [
  { label: '5 min before', offset: 5 },
  { label: '15 min before', offset: 15 },
  { label: '30 min before', offset: 30 },
  { label: '1 hour before', offset: 60 },
  { label: '1 day before', offset: 1440 },
] as const

function formatReminder(r: Reminder): string {
  if (r.type === 'before-start') {
    const mins = r.offsetMinutes || 0
    if (mins < 60) return `${mins} min before`
    if (mins === 60) return '1 hour before'
    if (mins < 1440) return `${Math.round(mins / 60)} hours before`
    if (mins === 1440) return '1 day before'
    return `${Math.round(mins / 1440)} days before`
  }
  if (r.type === 'on-day-at') return `On the day at ${r.timeOfDay || '09:00'}`
  if (r.type === 'absolute' && r.absoluteTime) {
    const d = new Date(r.absoluteTime)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }
  return 'Reminder'
}

export default function ReminderSection({ reminders, onChange, maxReminders = 5 }: ReminderSectionProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [customTime, setCustomTime] = useState('09:00')

  const addReminder = useCallback((type: Reminder['type'], offsetMinutes?: number, timeOfDay?: string) => {
    if (reminders.length >= maxReminders) return
    const r: Reminder = {
      id: crypto.randomUUID(),
      type,
      offsetMinutes: type === 'before-start' ? (offsetMinutes || 15) : undefined,
      timeOfDay: type === 'on-day-at' ? (timeOfDay || '09:00') : null,
      absoluteTime: null,
    }
    onChange([...reminders, r])
    setShowPicker(false)
  }, [reminders, onChange, maxReminders])

  const removeReminder = useCallback((id: string) => {
    onChange(reminders.filter(r => r.id !== id))
  }, [reminders, onChange])

  return (
    <div style={{ padding: '12px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
          <Bell size={14} strokeWidth={1.5} />
          Reminders
        </div>
        {reminders.length < maxReminders && (
          <button
            onClick={() => setShowPicker(!showPicker)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer',
              backgroundColor: 'transparent', color: 'var(--text-faint)',
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
            aria-label="Add reminder"
          >
            <Plus size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Existing reminders as chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 4px' }}>
        <AnimatePresence>
          {reminders.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: motionTokens.duration.fast }}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 8px 4px 10px',
                borderRadius: 999,
                fontSize: 12, fontWeight: 500,
                backgroundColor: 'var(--overlay-2, var(--bg-pane-2))',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              <Clock size={11} strokeWidth={1.5} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>{formatReminder(r)}</span>
              <button
                onClick={() => removeReminder(r.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 16, height: 16, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  backgroundColor: 'transparent', color: 'var(--text-faint)',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)' }}
                aria-label="Remove reminder"
              >
                <X size={10} strokeWidth={2} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {reminders.length === 0 && !showPicker && (
          <span style={{ fontSize: 12, color: 'var(--text-faint)', padding: '4px 0' }}>No reminders set</span>
        )}
      </div>

      {/* Max reached */}
      {reminders.length >= maxReminders && (
        <p style={{ fontSize: 11, color: 'var(--text-faint)', padding: '4px', marginTop: 4 }}>Maximum {maxReminders} reminders</p>
      )}

      {/* Picker popover */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={ease.fast}
            style={{
              marginTop: 8,
              padding: 12,
              borderRadius: 12,
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Quick presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {QUICK_PRESETS.map(p => (
                <button
                  key={p.offset}
                  onClick={() => addReminder('before-start', p.offset)}
                  style={{
                    padding: '5px 10px', borderRadius: 999, border: '1px solid var(--border)',
                    backgroundColor: 'transparent', color: 'var(--text-primary)',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* On the day at */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>On the day at</span>
              <input
                type="time"
                value={customTime}
                onChange={e => setCustomTime(e.target.value)}
                style={{
                  flex: 1, height: 30, borderRadius: 8, border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)',
                  fontSize: 12, padding: '0 8px',
                }}
              />
              <button
                onClick={() => addReminder('on-day-at', undefined, customTime)}
                style={{
                  height: 30, padding: '0 12px', borderRadius: 8, border: 'none',
                  backgroundColor: 'var(--accent)', color: '#fff',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
