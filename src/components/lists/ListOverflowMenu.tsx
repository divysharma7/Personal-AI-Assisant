'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeSlideDown, ease } from '@/lib/motion'
import { copy } from '@/lib/copy'

interface ListOverflowMenuProps {
  open: boolean
  onClose: () => void
  hideCompleted: boolean
  onToggleHideCompleted: () => void
  onMarkAllIncomplete: () => void
  onDeleteList: () => void
  isInbox?: boolean
}

export default function ListOverflowMenu({
  open,
  onClose,
  hideCompleted,
  onToggleHideCompleted,
  onMarkAllIncomplete,
  onDeleteList,
  isInbox = false,
}: ListOverflowMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const menuItems = [
    {
      label: hideCompleted
        ? copy.list.overflowMenu.showCompleted
        : copy.list.overflowMenu.hideCompleted,
      onClick: () => {
        onToggleHideCompleted()
        onClose()
      },
      destructive: false,
    },
    {
      label: copy.list.overflowMenu.markAllIncomplete,
      onClick: () => {
        onMarkAllIncomplete()
        onClose()
      },
      destructive: false,
    },
  ]

  if (!isInbox) {
    menuItems.push({
      label: copy.list.overflowMenu.deleteList,
      onClick: () => {
        onDeleteList()
        onClose()
      },
      destructive: true,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...fadeSlideDown}
          transition={ease.fast}
          ref={ref}
          className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl p-1.5 shadow-lg"
          style={{
            backgroundColor: 'var(--bg-pane-2)',
            border: '1px solid var(--border)',
          }}
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 cursor-pointer"
              style={{
                color: item.destructive ? 'var(--accent)' : 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {item.label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
