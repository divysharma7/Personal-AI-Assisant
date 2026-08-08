import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeSlideUp } from '@/lib/motion'
import { Search, X, Check, Target, ChevronRight } from 'lucide-react'
import { useFocusTargets, type TargetType, type SelectedTarget, type FocusTarget } from '@/hooks/useFocusTargets'

interface TargetSelectorProps {
  selected: SelectedTarget | null
  onSelect: (target: SelectedTarget) => void
  onClear: () => void
  disabled?: boolean
  variant?: 'card' | 'minimal'
}

export default function TargetSelector({
  selected,
  onSelect,
  onClear,
  disabled = false,
  variant = 'card',
}: TargetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TargetType>('TASK')
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: targets = [], isLoading } = useFocusTargets(activeTab, searchQuery)

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback((target: FocusTarget) => {
    onSelect({
      type: activeTab,
      id: target.id,
      title: target.title,
    })
    setIsOpen(false)
    setSearchQuery('')
  }, [activeTab, onSelect])

  const handleClear = useCallback(() => {
    onClear()
    setSearchQuery('')
  }, [onClear])

  const hasSelection = selected && selected.type !== 'NONE'

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-md ${variant === 'minimal' ? 'focus-target-selector' : ''}`}
    >
      {/* Selected Target Display / Trigger */}
      {variant === 'minimal' ? (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(true)}
            disabled={disabled}
            aria-label="Choose focus target"
            className="focus-target-trigger flex max-w-[280px] items-center gap-1 rounded-full px-2 py-1 text-[12px] font-medium disabled:cursor-default"
          >
            <span className="truncate">{hasSelection ? selected.title || 'Focus' : 'Focus'}</span>
            {!disabled && <ChevronRight size={13} aria-hidden="true" />}
          </button>
          {hasSelection && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear selection"
              className="focus-target-clear grid h-6 w-6 place-items-center rounded-full"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ) : hasSelection ? (
        <div
          className="flex items-center justify-between gap-2 rounded-xl px-4 py-3"
          style={{
            backgroundColor: 'var(--overlay-1)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Target size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div className="min-w-0">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: 'var(--text-faint)' }}
              >
                {selected.type === 'TASK' ? 'Task' : 'Habit'}
              </p>
              <p
                className="text-sm font-medium truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {selected.title}
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="flex h-6 w-6 items-center justify-center rounded-full cursor-pointer"
              style={{
                color: 'var(--text-muted)',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              aria-label="Clear selection"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            border: '1px dashed var(--border)',
            color: 'var(--text-muted)',
            transition: 'border-color 150ms ease, color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <Target size={16} />
          <span>What are you working on?</span>
        </button>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...fadeSlideUp}
            className={`focus-target-popover absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl ${variant === 'minimal' ? 'mx-auto w-[min(340px,calc(100vw-32px))]' : ''}`}
            style={{
              backgroundColor: 'var(--focus-surface-raised, var(--bg-pane))',
              border: '1px solid var(--focus-border, var(--border))',
              boxShadow: 'var(--shadow-card, 0 4px 24px rgba(0,0,0,0.2))',
            }}
          >
            {/* Tabs */}
            <div
              className="flex border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              {(['TASK', 'HABIT'] as TargetType[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab)
                    setSearchQuery('')
                  }}
                  className="flex-1 py-2.5 text-xs font-semibold cursor-pointer"
                  style={{
                    color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                    borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'color 150ms ease, border-color 150ms ease',
                  }}
                >
                  {tab === 'TASK' ? 'Tasks' : 'Habits'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="p-3">
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ backgroundColor: 'var(--overlay-1)' }}
              >
                <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab === 'TASK' ? 'tasks' : 'habits'}...`}
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-60 overflow-y-auto px-2 pb-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div
                    className="h-5 w-5 animate-spin rounded-full border-2"
                    style={{
                      borderColor: 'var(--border)',
                      borderTopColor: 'var(--accent)',
                    }}
                  />
                </div>
              ) : targets.length === 0 ? (
                <p
                  className="py-8 text-center text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {searchQuery ? 'No results found' : `No ${activeTab === 'TASK' ? 'tasks' : 'habits'} available`}
                </p>
              ) : (
                targets.map((target) => (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => handleSelect(target)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm cursor-pointer"
                    style={{
                      color: 'var(--text-primary)',
                      transition: 'background-color 150ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <span className="truncate">{target.title}</span>
                    {selected?.id === target.id && (
                      <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    )}
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
