import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scaleIn, ease, buttonPress } from '@/lib/motion'
import { X } from 'lucide-react'
import { useCreatePreset } from '@/hooks/useFocusPresets'

interface AddTimerModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
}

/* ── Style tokens ── */
const FIELD_BG = '#262626'
const FIELD_BORDER = '#4A4A4A'
const FIELD_BORDER_FOCUS = '#5965e8'
const FIELD_RADIUS = '10px'
const FIELD_TEXT = '#E5E5E5'
const FIELD_PLACEHOLDER = '#999'
const MODAL_BG = '#252525'
const MODAL_BORDER = '#444'
const MODAL_RADIUS = '18px'
const ICON_BG = '#303030'
const RADIO_BORDER = '#555'
const RADIO_ACTIVE_BG = 'rgba(89,101,232,0.15)'
const RADIO_ACTIVE_BORDER = '#5965e8'

export default function AddTimerModal({ isOpen, onClose, onCreated }: AddTimerModalProps) {
  const createPreset = useCreatePreset()

  const [name, setName] = useState('')
  const [icon] = useState('🙂')
  const [mode, setMode] = useState<'pomo' | 'stopwatch'>('pomo')
  const [durationMinutes, setDurationMinutes] = useState('25')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)

  // Focus name input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameRef.current?.focus(), 80)
    }
  }, [isOpen])

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setName('')
      setMode('pomo')
      setDurationMinutes('25')
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (mode === 'pomo') {
      const mins = parseInt(durationMinutes, 10)
      if (!durationMinutes || isNaN(mins) || mins < 1) {
        newErrors.duration = 'Duration must be at least 1 minute'
      } else if (mins > 180) {
        newErrors.duration = 'Duration cannot exceed 180 minutes'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [name, mode, durationMinutes])

  const handleSave = useCallback(async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await createPreset.mutateAsync({
        name: name.trim(),
        icon,
        mode,
        ...(mode === 'pomo' ? { durationMinutes: parseInt(durationMinutes, 10) } : {}),
      })
      onCreated?.()
      onClose()
    } catch {
      setErrors({ submit: 'Failed to save timer. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }, [name, icon, mode, durationMinutes, validate, createPreset, onCreated, onClose])

  const handleDurationChange = useCallback((value: string) => {
    // Only allow digits
    const cleaned = value.replace(/[^0-9]/g, '')
    setDurationMinutes(cleaned)
  }, [])

  const isSaveDisabled = !name.trim() || (mode === 'pomo' && (!durationMinutes || parseInt(durationMinutes, 10) < 1))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              {...scaleIn}
              transition={ease.normal}
              className="pointer-events-auto w-full max-w-[660px] overflow-hidden flex flex-col"
              style={{
                background: MODAL_BG,
                border: `1px solid ${MODAL_BORDER}`,
                borderRadius: MODAL_RADIUS,
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                padding: '28px 32px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-[22px] font-semibold"
                  style={{ color: '#fff', fontWeight: 600 }}
                >
                  Add Timer
                </h2>
                <motion.button
                  {...buttonPress}
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
                  style={{ color: '#999', transition: 'color 150ms' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#999' }}
                  aria-label="Close"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Identity row: Icon + Name */}
              <div className="flex items-center gap-4 mb-6">
                {/* Timer icon */}
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: ICON_BG,
                    fontSize: 24,
                    border: `1px solid ${FIELD_BORDER}`,
                  }}
                >
                  {icon}
                </div>

                {/* Name input */}
                <div className="flex-1 min-w-0">
                  <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    maxLength={100}
                    className="w-full text-[15px] font-medium outline-none"
                    style={{
                      height: 48,
                      background: FIELD_BG,
                      border: `1px solid ${errors.name ? '#ef4444' : FIELD_BORDER}`,
                      borderRadius: FIELD_RADIUS,
                      padding: '0 16px',
                      color: FIELD_TEXT,
                      transition: 'border-color 150ms',
                    }}
                    onFocus={(e) => { if (!errors.name) e.currentTarget.style.borderColor = FIELD_BORDER_FOCUS }}
                    onBlur={(e) => { if (!errors.name) e.currentTarget.style.borderColor = FIELD_BORDER }}
                  />
                  {errors.name && (
                    <p className="mt-1 text-[11px]" style={{ color: '#ef4444' }}>{errors.name}</p>
                  )}
                </div>
              </div>

              {/* Timer Mode */}
              <div className="mb-4">
                <label
                  className="block text-[13px] font-medium mb-3"
                  style={{ color: '#bbb' }}
                >
                  Timer Mode
                </label>
                <div className="flex flex-col gap-2.5">
                  {/* Pomo option */}
                  <label
                    className="flex items-center gap-3 cursor-pointer"
                    style={{ minHeight: 42 }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: `2px solid ${mode === 'pomo' ? RADIO_ACTIVE_BORDER : RADIO_BORDER}`,
                        background: mode === 'pomo' ? RADIO_ACTIVE_BG : 'transparent',
                        transition: 'border-color 150ms, background 150ms',
                      }}
                    >
                      {mode === 'pomo' && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: RADIO_ACTIVE_BORDER,
                          }}
                        />
                      )}
                    </div>
                    <span
                      className="text-[14px] font-medium"
                      style={{ color: mode === 'pomo' ? '#ddd' : '#888' }}
                    >
                      Pomo
                    </span>

                    {/* Duration input (inline for Pomo) */}
                    {mode === 'pomo' && (
                      <div className="flex items-center gap-2 ml-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={durationMinutes}
                          onChange={(e) => handleDurationChange(e.target.value)}
                          className="text-[14px] font-medium text-center outline-none"
                          style={{
                            width: 64,
                            height: 38,
                            background: FIELD_BG,
                            border: `1px solid ${errors.duration ? '#ef4444' : FIELD_BORDER}`,
                            borderRadius: '8px',
                            color: FIELD_TEXT,
                            transition: 'border-color 150ms',
                          }}
                          onFocus={(e) => { if (!errors.duration) e.currentTarget.style.borderColor = FIELD_BORDER_FOCUS }}
                          onBlur={(e) => { if (!errors.duration) e.currentTarget.style.borderColor = FIELD_BORDER }}
                        />
                        <span className="text-[13px]" style={{ color: '#888' }}>mins</span>
                      </div>
                    )}
                  </label>
                  {errors.duration && mode === 'pomo' && (
                    <p className="text-[11px] ml-8" style={{ color: '#ef4444' }}>{errors.duration}</p>
                  )}

                  {/* Stopwatch option */}
                  <label
                    className="flex items-center gap-3 cursor-pointer"
                    style={{ minHeight: 42 }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: `2px solid ${mode === 'stopwatch' ? RADIO_ACTIVE_BORDER : RADIO_BORDER}`,
                        background: mode === 'stopwatch' ? RADIO_ACTIVE_BG : 'transparent',
                        transition: 'border-color 150ms, background 150ms',
                      }}
                    >
                      {mode === 'stopwatch' && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: RADIO_ACTIVE_BORDER,
                          }}
                        />
                      )}
                    </div>
                    <span
                      className="text-[14px] font-medium"
                      style={{ color: mode === 'stopwatch' ? '#ddd' : '#888' }}
                    >
                      Stopwatch
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit error */}
              {errors.submit && (
                <p className="mb-4 text-[12px] text-center" style={{ color: '#ef4444' }}>{errors.submit}</p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <motion.button
                  {...buttonPress}
                  type="button"
                  onClick={onClose}
                  className="text-[14px] font-medium cursor-pointer"
                  style={{
                    width: 145,
                    height: 44,
                    borderRadius: '9px',
                    background: 'transparent',
                    border: `1px solid ${FIELD_BORDER}`,
                    color: '#aaa',
                    transition: 'color 150ms, border-color 150ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#666' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = FIELD_BORDER }}
                >
                  Close
                </motion.button>
                <motion.button
                  {...buttonPress}
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={isSaveDisabled || isSubmitting}
                  className="text-[14px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    width: 145,
                    height: 44,
                    borderRadius: '9px',
                    background: isSaveDisabled ? '#3a3a5c' : '#4259A4',
                    border: 'none',
                    color: '#fff',
                    transition: 'opacity 150ms, filter 150ms, background 150ms',
                  }}
                  onMouseEnter={(e) => { if (!isSaveDisabled) e.currentTarget.style.filter = 'brightness(1.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
