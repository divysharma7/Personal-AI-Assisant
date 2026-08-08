import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeSlideUp } from '@/lib/motion'
import { X, Clock, Target } from 'lucide-react'
import TargetSelector from './TargetSelector'
import type { SelectedTarget } from '@/hooks/useFocusTargets'

interface AddRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddRecordFormData) => void
  isSubmitting?: boolean
}

export interface AddRecordFormData {
  targetType: 'TASK' | 'HABIT' | 'NONE'
  targetId?: string | null
  targetTitleSnapshot?: string | null
  startTime: string
  endTime: string
  mode: 'POMO' | 'STOPWATCH'
  pomoCount: number
  note?: string | null
}

export default function AddRecordModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddRecordModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget | null>(null)
  const [mode, setMode] = useState<'POMO' | 'STOPWATCH'>('POMO')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [pomoCount, setPomoCount] = useState(1)
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!startTime) {
      newErrors.startTime = 'Start time is required'
    }
    if (!endTime) {
      newErrors.endTime = 'End time is required'
    }
    if (startTime && endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time'
      }
      const durationSeconds = (end.getTime() - start.getTime()) / 1000
      if (durationSeconds <= 0) {
        newErrors.endTime = 'Duration must be greater than 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [startTime, endTime])

  const handleSubmit = useCallback(() => {
    if (!validate()) return

    onSubmit({
      targetType: selectedTarget?.type || 'NONE',
      targetId: selectedTarget?.id || null,
      targetTitleSnapshot: selectedTarget?.title || null,
      startTime,
      endTime,
      mode,
      pomoCount: mode === 'POMO' ? pomoCount : 0,
      note: note.trim() || null,
    })
  }, [selectedTarget, startTime, endTime, mode, pomoCount, note, validate, onSubmit])

  const handleClose = useCallback(() => {
    // Reset form
    setSelectedTarget(null)
    setMode('POMO')
    setStartTime('')
    setEndTime('')
    setPomoCount(1)
    setNote('')
    setErrors({})
    onClose()
  }, [onClose])

  // Get current datetime for default values
  const now = new Date()
  const defaultDate = now.toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          />

          {/* Modal */}
          <motion.div
            {...fadeSlideUp}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-md rounded-2xl p-6"
              style={{
                backgroundColor: 'var(--bg-pane)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card, 0 4px 24px rgba(0,0,0,0.3))',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock size={20} style={{ color: 'var(--accent)' }} />
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Add Focus Record
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
                  style={{
                    color: 'var(--text-muted)',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Target Selection */}
              <div className="mb-5">
                <label
                  className="block text-xs font-semibold mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Task / Habit
                </label>
                <TargetSelector
                  selected={selectedTarget}
                  onSelect={setSelectedTarget}
                  onClear={() => setSelectedTarget(null)}
                />
              </div>

              {/* Mode Selection */}
              <div className="mb-5">
                <label
                  className="block text-xs font-semibold mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Type
                </label>
                <div className="flex gap-3">
                  {(['POMO', 'STOPWATCH'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer"
                      style={{
                        backgroundColor: mode === m ? 'var(--accent)' : 'var(--overlay-1)',
                        color: mode === m ? '#fff' : 'var(--text-muted)',
                        transition: 'background-color 150ms ease, color 150ms ease',
                      }}
                    >
                      {m === 'POMO' ? 'Pomo' : 'Stopwatch'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Inputs */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-xs font-semibold mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Start Time
                  </label>
                  <input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    max={endTime || defaultDate}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--overlay-1)',
                      border: errors.startTime ? '1px solid var(--error, #ef4444)' : '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--error, #ef4444)' }}>
                      {errors.startTime}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-xs font-semibold mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    End Time
                  </label>
                  <input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    min={startTime}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--overlay-1)',
                      border: errors.endTime ? '1px solid var(--error, #ef4444)' : '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--error, #ef4444)' }}>
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Pomo Count (only for POMO mode) */}
              {mode === 'POMO' && (
                <div className="mb-5">
                  <label
                    htmlFor="pomoCount"
                    className="block text-xs font-semibold mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Pomo Count
                  </label>
                  <input
                    id="pomoCount"
                    type="number"
                    min="1"
                    max="20"
                    value={pomoCount}
                    onChange={(e) => setPomoCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--overlay-1)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              )}

              {/* Note */}
              <div className="mb-6">
                <label
                  htmlFor="note"
                  className="block text-xs font-semibold mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Focus Note (optional)
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 2000))}
                  placeholder="What did you work on?"
                  rows={3}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                  style={{
                    backgroundColor: 'var(--overlay-1)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
                <p
                  className="mt-1 text-xs text-right"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {note.length}/2000
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full px-5 py-2.5 text-sm font-medium cursor-pointer"
                  style={{
                    color: 'var(--text-muted)',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  Close
                </button>
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-full px-6 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                    transition: 'opacity 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                >
                  {isSubmitting ? 'Saving...' : 'OK'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
