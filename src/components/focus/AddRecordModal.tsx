import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scaleIn, ease, buttonPress } from '@/lib/motion'
import { X, ChevronDown, Search, Check } from 'lucide-react'
import { useFocusTargets, type SelectedTarget, type FocusTarget, type TargetType } from '@/hooks/useFocusTargets'
import { useFocusSettings } from '@/hooks/useFocusSettings'

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

/* ── Inline style tokens (dark reference-matching) ── */

const FIELD_BG = '#262626'
const FIELD_BORDER = '#484848'
const FIELD_BORDER_FOCUS = '#686868'
const FIELD_RADIUS = '10px'
const FIELD_HEIGHT = '42px'
const FIELD_TEXT = '#E5E5E5'
const FIELD_PLACEHOLDER = '#999'
const FIELD_PADDING = '0 14px'
const MODAL_BG = '#252525'
const MODAL_BORDER = '#444'
const MODAL_RADIUS = '20px'

/* ── Helper: compute today's date string ── */

function todayDateStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function defaultStartTime(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - 30, 0, 0)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function defaultEndTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/* ── Helper: time string → full ISO datetime ── */

function timeToISO(time: string, dateStr: string): string {
  return `${dateStr}T${time}:00`
}

/* ── Helper: compute duration respecting midnight crossing ── */

function computeDurationSeconds(start: string, end: string, dateStr: string): number {
  const startDT = new Date(`${dateStr}T${start}:00`)
  let endDT = new Date(`${dateStr}T${end}:00`)
  // If end <= start, assume next day
  if (endDT <= startDT) {
    endDT = new Date(endDT.getTime() + 86400000)
  }
  return Math.max(0, Math.round((endDT.getTime() - startDT.getTime()) / 1000))
}

/* ── Helper: format duration for display ── */

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

/* ── Task Dropdown ── */

function TaskDropdown({ selected, onSelect, onClear }: {
  selected: SelectedTarget | null
  onSelect: (target: SelectedTarget) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<TargetType>('TASK')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: targets = [], isLoading } = useFocusTargets(tab, query)

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleSelect = useCallback((target: FocusTarget) => {
    onSelect({ type: tab, id: target.id, title: target.title })
    setOpen(false)
    setQuery('')
  }, [tab, onSelect])

  const hasSelection = selected && selected.type !== 'NONE'

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-[13px] cursor-pointer"
        style={{
          height: FIELD_HEIGHT,
          background: FIELD_BG,
          border: `1px solid ${FIELD_BORDER}`,
          borderRadius: FIELD_RADIUS,
          padding: FIELD_PADDING,
          color: hasSelection ? FIELD_TEXT : FIELD_PLACEHOLDER,
        }}
      >
        <span className="truncate">{hasSelection ? selected!.title : 'Set Task'}</span>
        <ChevronDown size={14} style={{ color: FIELD_PLACEHOLDER, flexShrink: 0 }} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            {...scaleIn}
            transition={ease.fast}
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden"
            style={{
              background: '#2a2a2a',
              border: `1px solid ${FIELD_BORDER}`,
              borderRadius: '12px',
              boxShadow: '0 14px 34px rgba(0,0,0,0.5)',
            }}
          >
            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: FIELD_BORDER }}>
              {(['TASK', 'HABIT'] as TargetType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setQuery('') }}
                  className="flex-1 py-2 text-[11px] font-semibold cursor-pointer"
                  style={{
                    color: tab === t ? 'var(--accent)' : FIELD_PLACEHOLDER,
                    borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                    background: 'transparent',
                  }}
                >
                  {t === 'TASK' ? 'Tasks' : 'Habits'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="p-2.5">
              <div className="flex items-center gap-2 rounded-lg px-2.5 py-2" style={{ background: '#1f1f1f' }}>
                <Search size={13} style={{ color: FIELD_PLACEHOLDER, flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${tab === 'TASK' ? 'tasks' : 'habits'}...`}
                  className="w-full bg-transparent text-[12px] outline-none"
                  style={{ color: FIELD_TEXT }}
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-48 overflow-y-auto px-1.5 pb-1.5">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="h-4 w-4 animate-spin rounded-full border-2" style={{ borderColor: FIELD_BORDER, borderTopColor: 'var(--accent)' }} />
                </div>
              ) : targets.length === 0 ? (
                <p className="py-6 text-center text-[12px]" style={{ color: FIELD_PLACEHOLDER }}>
                  {query ? 'No results found' : `No ${tab === 'TASK' ? 'tasks' : 'habits'} available`}
                </p>
              ) : (
                targets.map((target) => (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => handleSelect(target)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] cursor-pointer"
                    style={{ color: FIELD_TEXT, background: 'transparent', transition: 'background-color 120ms' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#333' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <span className="truncate flex-1">{target.title}</span>
                    {selected?.id === target.id && <Check size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Time Picker Input ── */

function TimeInput({ value, onChange, error, placeholder = 'Set Time', id }: {
  value: string; onChange: (v: string) => void; error?: string; placeholder?: string; id?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative w-full">
      <div
        className="flex items-center justify-between w-full cursor-pointer"
        style={{
          height: FIELD_HEIGHT,
          background: FIELD_BG,
          border: `1px solid ${error ? '#ef4444' : focused ? FIELD_BORDER_FOCUS : FIELD_BORDER}`,
          borderRadius: FIELD_RADIUS,
          padding: FIELD_PADDING,
          transition: 'border-color 150ms',
        }}
        onClick={() => inputRef.current?.showPicker?.() || inputRef.current?.click()}
      >
        <span className="text-[13px]" style={{ color: value ? FIELD_TEXT : FIELD_PLACEHOLDER }}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} style={{ color: FIELD_PLACEHOLDER, flexShrink: 0 }} />
      </div>
      <input
        ref={inputRef}
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

/* ── Type Selector ── */

function TypeSelector({ mode, pomoCount, durationSeconds, onChange }: {
  mode: 'POMO' | 'STOPWATCH'; pomoCount: number; durationSeconds: number
  onChange: (mode: 'POMO' | 'STOPWATCH') => void
}) {
  const displayLabel = mode === 'POMO'
    ? `Pomo · ${pomoCount} Pomo`
    : 'Stopwatch / Focus'

  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className="flex items-center justify-between flex-1 text-[13px]"
        style={{
          height: FIELD_HEIGHT,
          background: FIELD_BG,
          border: `1px solid ${FIELD_BORDER}`,
          borderRadius: FIELD_RADIUS,
          padding: FIELD_PADDING,
          color: FIELD_TEXT,
        }}
      >
        <span>{displayLabel}</span>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        {(['POMO', 'STOPWATCH'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className="px-3 text-[11px] font-semibold cursor-pointer"
            style={{
              height: FIELD_HEIGHT,
              borderRadius: FIELD_RADIUS,
              background: mode === m ? 'var(--accent)' : FIELD_BG,
              border: `1px solid ${mode === m ? 'var(--accent)' : FIELD_BORDER}`,
              color: mode === m ? '#fff' : FIELD_PLACEHOLDER,
              transition: 'background-color 150ms, border-color 150ms, color 150ms',
            }}
          >
            {m === 'POMO' ? 'Pomo' : 'Focus'}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   Main Modal
   ═══════════════════════════════════════ */

export default function AddRecordModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddRecordModalProps) {
  const { data: settings } = useFocusSettings()
  const pomoDurationSeconds = settings?.pomoDurationSeconds ?? 1500

  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget | null>(null)
  const [mode, setMode] = useState<'POMO' | 'STOPWATCH'>('POMO')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dateStr] = useState(todayDateStr)

  // Auto-compute pomo count from duration
  const durationSeconds = useMemo(() => {
    if (!startTime || !endTime) return 0
    return computeDurationSeconds(startTime, endTime, dateStr)
  }, [startTime, endTime, dateStr])

  const pomoCount = useMemo(() => {
    if (mode !== 'POMO' || durationSeconds <= 0) return 1
    return Math.max(1, Math.round(durationSeconds / pomoDurationSeconds))
  }, [mode, durationSeconds, pomoDurationSeconds])

  // Set defaults when opening
  useEffect(() => {
    if (isOpen && !startTime && !endTime) {
      setStartTime(defaultStartTime())
      setEndTime(defaultEndTime())
    }
  }, [isOpen, startTime, endTime])

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedTarget || selectedTarget.type === 'NONE') {
      newErrors.target = 'Task is required'
    }
    if (!startTime) {
      newErrors.startTime = 'Start time is required'
    }
    if (!endTime) {
      newErrors.endTime = 'End time is required'
    }
    if (startTime && endTime) {
      const dur = computeDurationSeconds(startTime, endTime, dateStr)
      if (dur <= 0) {
        newErrors.endTime = 'End time must be later than start time'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [selectedTarget, startTime, endTime, dateStr])

  const handleSubmit = useCallback(() => {
    if (!validate()) return

    onSubmit({
      targetType: selectedTarget!.type as 'TASK' | 'HABIT' | 'NONE',
      targetId: selectedTarget!.id || null,
      targetTitleSnapshot: selectedTarget!.title || null,
      startTime: timeToISO(startTime, dateStr),
      endTime: timeToISO(endTime, dateStr),
      mode,
      pomoCount: mode === 'POMO' ? pomoCount : 0,
      note: note.trim() || null,
    })
  }, [selectedTarget, startTime, endTime, mode, pomoCount, note, dateStr, validate, onSubmit])

  const handleClose = useCallback(() => {
    setSelectedTarget(null)
    setMode('POMO')
    setStartTime('')
    setEndTime('')
    setNote('')
    setErrors({})
    onClose()
  }, [onClose])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, handleClose])

  const durationLabel = durationSeconds > 0 ? formatDuration(durationSeconds) : null

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
            onClick={handleClose}
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              {...scaleIn}
              transition={ease.normal}
              className="pointer-events-auto w-full max-w-[550px] overflow-hidden flex flex-col"
              style={{
                background: MODAL_BG,
                border: `1px solid ${MODAL_BORDER}`,
                borderRadius: MODAL_RADIUS,
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                maxHeight: 'min(88vh, 760px)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <h2 className="text-[22px] font-semibold" style={{ color: '#fff' }}>
                  Add Focus Record
                </h2>
                <motion.button
                  {...buttonPress}
                  type="button"
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
                  style={{ color: '#999', transition: 'color 150ms' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#999' }}
                  aria-label="Close"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Form body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="flex flex-col gap-3">

                  {/* Task */}
                  <div className="flex items-start gap-4">
                    <label className="flex-shrink-0 pt-2.5 text-[13px] font-medium" style={{ color: '#bbb', width: 110 }}>
                      Task
                    </label>
                    <div className="flex-1 min-w-0">
                      <TaskDropdown
                        selected={selectedTarget}
                        onSelect={setSelectedTarget}
                        onClear={() => setSelectedTarget(null)}
                      />
                      {errors.target && <p className="mt-1 text-[11px]" style={{ color: '#ef4444' }}>{errors.target}</p>}
                    </div>
                  </div>

                  {/* Start Time */}
                  <div className="flex items-start gap-4">
                    <label className="flex-shrink-0 pt-2.5 text-[13px] font-medium" style={{ color: '#bbb', width: 110 }}>
                      Start Time
                    </label>
                    <div className="flex-1 min-w-0">
                      <TimeInput
                        value={startTime}
                        onChange={setStartTime}
                        error={errors.startTime}
                        placeholder="Set Time"
                        id="add-record-start"
                      />
                      {errors.startTime && <p className="mt-1 text-[11px]" style={{ color: '#ef4444' }}>{errors.startTime}</p>}
                    </div>
                  </div>

                  {/* End Time */}
                  <div className="flex items-start gap-4">
                    <label className="flex-shrink-0 pt-2.5 text-[13px] font-medium" style={{ color: '#bbb', width: 110 }}>
                      End Time
                    </label>
                    <div className="flex-1 min-w-0">
                      <TimeInput
                        value={endTime}
                        onChange={setEndTime}
                        error={errors.endTime}
                        placeholder="Set Time"
                        id="add-record-end"
                      />
                      {errors.endTime && <p className="mt-1 text-[11px]" style={{ color: '#ef4444' }}>{errors.endTime}</p>}
                      {durationLabel && !errors.endTime && (
                        <p className="mt-1 text-[11px]" style={{ color: '#888' }}>
                          Duration: {durationLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Type */}
                  <div className="flex items-start gap-4">
                    <label className="flex-shrink-0 pt-2.5 text-[13px] font-medium" style={{ color: '#bbb', width: 110 }}>
                      Type
                    </label>
                    <div className="flex-1 min-w-0">
                      <TypeSelector
                        mode={mode}
                        pomoCount={pomoCount}
                        durationSeconds={durationSeconds}
                        onChange={setMode}
                      />
                    </div>
                  </div>

                  {/* Focus Note */}
                  <div className="flex items-start gap-4">
                    <label className="flex-shrink-0 pt-2.5 text-[13px] font-medium" style={{ color: '#bbb', width: 110 }}>
                      Focus Note
                    </label>
                    <div className="flex-1 min-w-0">
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value.slice(0, 2000))}
                        placeholder="What do you have in mind?"
                        rows={5}
                        className="w-full text-[13px] outline-none resize-y"
                        style={{
                          minHeight: 140,
                          background: FIELD_BG,
                          border: `1px solid ${FIELD_BORDER}`,
                          borderRadius: FIELD_RADIUS,
                          padding: '12px 14px',
                          color: FIELD_TEXT,
                          lineHeight: 1.5,
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = FIELD_BORDER_FOCUS }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = FIELD_BORDER }}
                      />
                      <p className="mt-1 text-right text-[10px]" style={{ color: '#666' }}>
                        {note.length}/2000
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
                <motion.button
                  {...buttonPress}
                  type="button"
                  onClick={handleClose}
                  className="text-[13px] font-medium cursor-pointer"
                  style={{
                    width: 120,
                    height: 40,
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
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="text-[13px] font-semibold cursor-pointer disabled:opacity-50"
                  style={{
                    width: 120,
                    height: 40,
                    borderRadius: '9px',
                    background: '#4259A4',
                    border: 'none',
                    color: '#fff',
                    transition: 'opacity 150ms, filter 150ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
                >
                  {isSubmitting ? 'Saving...' : 'OK'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
