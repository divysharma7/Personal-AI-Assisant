'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronDown } from 'lucide-react'
import { scaleIn, buttonPress, ease } from '@/lib/motion'

const EMOJI_PRESETS = ['\uD83D\uDCDA', '\uD83C\uDFCB\uFE0F', '\uD83E\uDDD8', '\uD83D\uDCDD', '\uD83C\uDFAF', '\uD83D\uDD25', '\uD83D\uDCA7', '\uD83C\uDF4E']

interface CreateHabitDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateHabitData) => void
}

export interface CreateHabitData {
  name: string
  icon: string
  frequency: 'daily' | 'weekly' | 'custom'
  customDays?: number[]
  goal: 'all' | 'custom'
  goalCount?: number
  section: string
  autoPopup: boolean
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'custom', label: 'Custom days' },
] as const

const SECTION_OPTIONS = ['Personal Habits', 'Health', 'Learning', 'Work']

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function CreateHabitDialog({ open, onClose, onCreate }: CreateHabitDialogProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(EMOJI_PRESETS[0])
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily')
  const [customDays, setCustomDays] = useState<number[]>([0, 1, 2, 3, 4])
  const [goal, setGoal] = useState<'all' | 'custom'>('all')
  const [goalCount, setGoalCount] = useState(1)
  const [section, setSection] = useState(SECTION_OPTIONS[0])
  const [autoPopup, setAutoPopup] = useState(false)
  const [showFreqDropdown, setShowFreqDropdown] = useState(false)

  useEffect(() => {
    if (open) {
      setName('')
      setIcon(EMOJI_PRESETS[0])
      setFrequency('daily')
      setGoal('all')
      setGoalCount(1)
      setSection(SECTION_OPTIONS[0])
      setAutoPopup(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleCreate = useCallback(() => {
    if (!name.trim()) return
    onCreate({
      name: name.trim(),
      icon,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      goal,
      goalCount: goal === 'custom' ? goalCount : undefined,
      section,
      autoPopup,
    })
    onClose()
  }, [name, icon, frequency, customDays, goal, goalCount, section, autoPopup, onCreate, onClose])

  const toggleDay = useCallback((idx: number) => {
    setCustomDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    )
  }, [])

  const freqLabel = FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label ?? 'Every day'

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
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onClick={onClose}
        >
          <motion.div
            {...scaleIn}
            transition={ease.normal}
            style={{
              width: 440,
              borderRadius: 16,
              backgroundColor: 'var(--bg-pane)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-modal)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Create Habit
              </h2>
              <motion.button
                {...buttonPress}
                onClick={onClose}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-faint)',
                }}
              >
                <X size={16} strokeWidth={1.5} />
              </motion.button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px' }}>
              {/* Emoji + Name */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <div style={{ position: 'relative' }}>
                  <button
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--overlay-1, var(--bg-hover))',
                      fontSize: 22,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => {
                      const currentIdx = EMOJI_PRESETS.indexOf(icon)
                      const nextIdx = (currentIdx + 1) % EMOJI_PRESETS.length
                      setIcon(EMOJI_PRESETS[nextIdx])
                    }}
                  >
                    {icon}
                  </button>
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Habit name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                  }}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-pane-2, var(--bg-base))',
                    padding: '0 14px',
                    fontSize: 14,
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Frequency */}
              <DialogRow label="Frequency">
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowFreqDropdown(!showFreqDropdown)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-pane-2, var(--bg-base))',
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    {freqLabel}
                    <ChevronDown size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
                  </button>
                  <AnimatePresence>
                    {showFreqDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={ease.fast}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: 4,
                          width: 160,
                          borderRadius: 10,
                          backgroundColor: 'var(--bg-pane)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-elevated)',
                          zIndex: 10,
                          padding: '4px 0',
                        }}
                      >
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setFrequency(opt.value)
                              setShowFreqDropdown(false)
                            }}
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '8px 14px',
                              fontSize: 13,
                              textAlign: 'left',
                              border: 'none',
                              backgroundColor: frequency === opt.value ? 'var(--accent-soft)' : 'transparent',
                              color: frequency === opt.value ? 'var(--accent)' : 'var(--text-primary)',
                              cursor: 'pointer',
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </DialogRow>

              {/* Custom days (when frequency is custom) */}
              {frequency === 'custom' && (
                <div style={{ marginBottom: 16, paddingLeft: 0 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {WEEKDAY_LABELS.map((label, i) => {
                      const active = customDays.includes(i)
                      return (
                        <button
                          key={label}
                          onClick={() => toggleDay(i)}
                          style={{
                            width: 36,
                            height: 32,
                            borderRadius: 8,
                            border: active ? 'none' : '1px solid var(--border)',
                            backgroundColor: active ? 'var(--accent)' : 'transparent',
                            color: active ? '#fff' : 'var(--text-muted)',
                            fontSize: 11,
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Goal */}
              <DialogRow label="Goal">
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as 'all' | 'custom')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-pane-2, var(--bg-base))',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all">Achieve it all</option>
                  <option value="custom">Custom count</option>
                </select>
              </DialogRow>

              {/* Section */}
              <DialogRow label="Section">
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-pane-2, var(--bg-base))',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {SECTION_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </DialogRow>

              {/* Reminder */}
              <DialogRow label="Reminder">
                <button
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '1.5px solid var(--border)',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-faint)',
                  }}
                >
                  <Plus size={14} strokeWidth={1.5} />
                </button>
              </DialogRow>

              {/* Auto pop-up toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Auto pop-up of habit log
                </span>
                <button
                  onClick={() => setAutoPopup(!autoPopup)}
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    border: 'none',
                    backgroundColor: autoPopup ? 'var(--accent)' : 'var(--overlay-2, var(--bg-hover))',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 150ms ease',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: 2,
                      left: autoPopup ? 20 : 2,
                      transition: 'left 150ms ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
                padding: '12px 20px',
                borderTop: '1px solid var(--border)',
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: '8px 20px',
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
                onClick={handleCreate}
                disabled={!name.trim()}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                  opacity: name.trim() ? 1 : 0.5,
                }}
              >
                OK
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DialogRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderTop: '1px solid var(--border)',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      {children}
    </div>
  )
}
