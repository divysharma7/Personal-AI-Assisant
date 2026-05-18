'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Link2, CircleDot, Trash2 } from 'lucide-react'
import { copy } from '@/lib/copy'
import { fadeSlideDown, ease } from '@/lib/motion'

interface TaskOverflowMenuProps {
  onClose: () => void
  onDelete: () => void
  onMarkAllIncomplete: () => void
  onUnsubscribe?: () => void
  onCopyLink?: () => void
}

export default function TaskOverflowMenu({
  onClose,
  onDelete,
  onMarkAllIncomplete,
  onUnsubscribe,
  onCopyLink,
}: TaskOverflowMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  const items = [
    {
      label: copy.task.overflowMenu.unsubscribe,
      icon: <ArrowRight size={14} strokeWidth={1.5} />,
      onClick: onUnsubscribe || onClose,
      isDestructive: false,
    },
    {
      label: copy.task.overflowMenu.copyLink,
      icon: <Link2 size={14} strokeWidth={1.5} />,
      onClick: () => {
        if (onCopyLink) onCopyLink()
        else {
          navigator.clipboard?.writeText(window.location.href)
        }
        onClose()
      },
      isDestructive: false,
    },
    {
      label: copy.task.overflowMenu.markAllIncomplete,
      icon: <CircleDot size={14} strokeWidth={1.5} />,
      onClick: onMarkAllIncomplete,
      isDestructive: false,
    },
    {
      label: copy.task.overflowMenu.deleteTask,
      icon: <Trash2 size={14} strokeWidth={1.5} />,
      onClick: onDelete,
      isDestructive: true,
    },
  ]

  return (
    <motion.div
      {...fadeSlideDown}
      transition={ease.fast}
      ref={menuRef}
      className="absolute right-0 top-full z-50 mt-1 w-[200px] rounded-xl p-1.5 shadow-lg"
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
      }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-100 cursor-pointer"
          style={{
            color: item.isDestructive ? '#ef4444' : 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <span style={{ color: item.isDestructive ? '#ef4444' : 'var(--text-muted)' }}>
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </motion.div>
  )
}
