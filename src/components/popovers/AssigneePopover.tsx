'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { copy } from '@/lib/copy'
import { fadeSlideDown, ease } from '@/lib/motion'

interface AssigneeUser {
  _id: string
  name: string
  avatar?: string
  pending?: boolean
}

interface AssigneePopoverProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
  onClose: () => void
  users?: AssigneeUser[]
}

function getInitialColor(name: string): string {
  // Simple hash-derived color
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
  return colors[Math.abs(hash) % colors.length]
}

// Default mock users for demo
const DEFAULT_USERS: AssigneeUser[] = [
  { _id: 'user-1', name: 'You' },
]

export default function AssigneePopover({
  selectedId,
  onSelect,
  onClose,
  users = DEFAULT_USERS,
}: AssigneePopoverProps) {
  const [query, setQuery] = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return users
    return users.filter((u) =>
      u.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [users, query])

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
      className="w-[260px] rounded-xl"
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-elevated)',
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
          placeholder={copy.popovers.assignee.searchPlaceholder}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* User list */}
      <div className="max-h-[240px] overflow-y-auto py-1">
        {/* Unassign option */}
        {selectedId && (
          <button
            onClick={() => onSelect(null)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Unassign
          </button>
        )}

        {filtered.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              onSelect(user._id)
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100 cursor-pointer"
            style={{
              backgroundColor:
                selectedId === user._id ? 'var(--bg-hover)' : 'transparent',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                selectedId === user._id ? 'var(--bg-hover)' : 'transparent'
            }}
          >
            {/* Avatar */}
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: getInitialColor(user.name) }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Name */}
            <span className="flex-1">{user.name}</span>

            {/* Pending badge */}
            {user.pending && (
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-faint)',
                }}
              >
                {copy.popovers.assignee.pendingLabel}
              </span>
            )}
          </button>
        ))}

        {filtered.length === 0 && (
          <p className="px-3 py-3 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
            No users found
          </p>
        )}
      </div>
    </motion.div>
  )
}
