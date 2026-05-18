'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Tag, Check, Plus } from 'lucide-react'
import { copy } from '@/lib/copy'
import { fadeSlideDown, ease } from '@/lib/motion'

export interface LabelItem {
  _id: string
  name: string
  color?: string
  ownerId?: string
}

interface LabelPopoverProps {
  appliedIds: string[]
  allLabels: LabelItem[]
  onToggle: (labelId: string) => void
  onCreate?: (name: string) => void
  onClose: () => void
}

export default function LabelPopover({
  appliedIds,
  allLabels,
  onToggle,
  onCreate,
  onClose,
}: LabelPopoverProps) {
  const [query, setQuery] = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return allLabels
    return allLabels.filter((l) =>
      l.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [allLabels, query])

  const hasExactMatch = useMemo(
    () =>
      allLabels.some(
        (l) => l.name.toLowerCase() === query.trim().toLowerCase()
      ),
    [allLabels, query]
  )

  const showCreateOption = query.trim().length > 0 && !hasExactMatch

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <motion.div
      {...fadeSlideDown}
      transition={ease.fast}
      ref={popoverRef}
      className="w-[240px] rounded-xl shadow-lg"
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Search input */}
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <Search size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={copy.popovers.label.searchPlaceholder}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Label list */}
      <div className="max-h-[220px] overflow-y-auto py-1">
        {/* Create option */}
        {showCreateOption && (
          <button
            onClick={() => {
              if (onCreate) {
                onCreate(query.trim())
                setQuery('')
              }
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100 cursor-pointer"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Plus size={14} strokeWidth={1.5} />
            <span>
              Create &ldquo;{query.trim()}&rdquo;
            </span>
          </button>
        )}

        {filtered.map((label) => {
          const isApplied = appliedIds.includes(label._id)
          return (
            <button
              key={label._id}
              onClick={() => onToggle(label._id)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100 cursor-pointer"
              style={{
                color: 'var(--text-primary)',
                backgroundColor: isApplied ? 'rgba(var(--accent-rgb, 99, 91, 255), 0.06)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isApplied
                  ? 'rgba(var(--accent-rgb, 99, 91, 255), 0.06)'
                  : 'transparent'
              }}
            >
              <Tag size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
              <span className="flex-1 text-left">{label.name}</span>
              {isApplied && (
                <Check size={14} strokeWidth={2} style={{ color: 'var(--accent)' }} />
              )}
            </button>
          )
        })}

        {filtered.length === 0 && !showCreateOption && (
          <p className="px-3 py-3 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
            No labels found
          </p>
        )}
      </div>
    </motion.div>
  )
}
