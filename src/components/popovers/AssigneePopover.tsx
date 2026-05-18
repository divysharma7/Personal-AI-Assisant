'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User } from 'lucide-react'
import { snappy } from '@/shared/design-system'

export interface AssigneeUser {
  _id: string
  name: string
  avatarUrl?: string
  pending?: boolean
}

interface AssigneePopoverProps {
  open: boolean
  onClose: () => void
  users: AssigneeUser[]
  onSelect: (userId: string) => void
  currentAssigneeId?: string | null
  anchorRect?: DOMRect | null
}

function UserAvatar({ user, size = 32 }: { user: AssigneeUser; size?: number }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    )
  }
  // Generate color from name hash
  const hash = user.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const colors = ['#FF4D3D', '#FFB23D', '#5DA8FF', '#22c55e', '#8B7DFF', '#f472b6']
  const bg = colors[hash % colors.length]
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 600,
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

export default function AssigneePopover({
  open,
  onClose,
  users,
  onSelect,
  currentAssigneeId,
  anchorRect,
}: AssigneePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(0)

  useEffect(() => {
    if (open) {
      setQuery('')
      setHighlightIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const filtered = useMemo(() => {
    if (!query) return users
    const lower = query.toLowerCase()
    return users.filter(u => u.name.toLowerCase().includes(lower))
  }, [users, query])

  useEffect(() => {
    setHighlightIndex(0)
  }, [filtered.length])

  // Click outside
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  // Keyboard
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightIndex(prev => (prev + 1) % filtered.length)
      }
      else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightIndex(prev => (prev - 1 + filtered.length) % filtered.length)
      }
      else if (e.key === 'Enter') {
        e.preventDefault()
        const user = filtered[highlightIndex]
        if (user) { onSelect(user._id); onClose() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose, filtered, highlightIndex, onSelect])

  const top = anchorRect ? anchorRect.bottom + 4 : 0
  const left = anchorRect ? anchorRect.left : 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          className="popover"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={snappy}
          style={{
            position: 'fixed',
            top,
            left,
            width: 260,
            zIndex: 'var(--z-popover)' as unknown as number,
          }}
        >
          {/* Search */}
          <div style={{ padding: '8px 8px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              <Search size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for name"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 13,
                  color: 'var(--text-1)',
                }}
              />
            </div>
          </div>

          {/* User list */}
          <div style={{ maxHeight: 280, overflowY: 'auto', padding: '2px 4px 4px' }}>
            {filtered.map((user, idx) => (
              <button
                key={user._id}
                className={`popover-item ${idx === highlightIndex ? 'selected' : ''}`}
                onClick={() => { onSelect(user._id); onClose() }}
                style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8, justifyContent: 'space-between' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserAvatar user={user} size={28} />
                  <span>{user.name}</span>
                </span>
                {user.pending && (
                  <span style={{ fontSize: 11, color: 'var(--text-3)', padding: '2px 6px', borderRadius: 4, background: 'var(--input-bg)' }}>
                    Pending
                  </span>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
                No users found
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { UserAvatar }
