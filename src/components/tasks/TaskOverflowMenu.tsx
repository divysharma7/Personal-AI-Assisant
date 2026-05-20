'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  BellOff,
  Printer,
  Link2,
  Copy,
  EyeOff,
  CircleDot,
  Trash2,
  Target,
} from 'lucide-react'
import { fadeSlideDown, ease } from '@/lib/motion'

interface TaskOverflowMenuProps {
  onClose: () => void
  onDelete: () => void
  onMarkAllIncomplete: () => void
  onUnsubscribe?: () => void
  onCopyLink?: () => void
  onDuplicate?: () => void
  onPrint?: () => void
  onHideCompleted?: () => void
  onStartFocus?: () => void
}

export default function TaskOverflowMenu({
  onClose,
  onDelete,
  onMarkAllIncomplete,
  onUnsubscribe,
  onCopyLink,
  onDuplicate,
  onPrint,
  onHideCompleted,
  onStartFocus,
}: TaskOverflowMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  const items = [
    {
      label: 'Unsubscribe',
      icon: <BellOff size={15} strokeWidth={1.5} />,
      onClick: () => { onUnsubscribe?.(); onClose() },
    },
    {
      label: 'Print task',
      icon: <Printer size={15} strokeWidth={1.5} />,
      onClick: () => { onPrint?.(); window.print(); onClose() },
    },
    {
      label: 'Copy link',
      icon: <Link2 size={15} strokeWidth={1.5} />,
      onClick: () => {
        navigator.clipboard?.writeText(window.location.href)
        onCopyLink?.()
        onClose()
      },
    },
    {
      label: 'Duplicate task',
      icon: <Copy size={15} strokeWidth={1.5} />,
      onClick: () => { onDuplicate?.(); onClose() },
    },
    {
      label: 'Hide completed tasks',
      icon: <EyeOff size={15} strokeWidth={1.5} />,
      onClick: () => { onHideCompleted?.(); onClose() },
    },
    {
      label: 'Mark all incomplete',
      icon: <CircleDot size={15} strokeWidth={1.5} />,
      onClick: () => { onMarkAllIncomplete(); onClose() },
    },
    {
      label: 'Start Focus',
      icon: <Target size={15} strokeWidth={1.5} />,
      onClick: () => { onStartFocus?.(); onClose() },
    },
  ]

  return (
    <motion.div
      {...fadeSlideDown}
      transition={ease.fast}
      ref={menuRef}
      className="absolute right-0 top-full z-50 mt-1 w-[220px] rounded-[var(--radius-lg,16px)] py-1.5"
      style={{
        backgroundColor: 'var(--bg-pane-2, var(--bg-pane))',
        border: '1px solid var(--overlay-2, var(--border))',
        boxShadow: 'var(--shadow-elevated)',
      }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="flex w-full items-center gap-3 px-4 py-2 text-[14px] font-medium transition-sl cursor-pointer"
          style={{ color: 'var(--text-primary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}

      {/* Separator */}
      <div className="mx-3 my-1.5 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Delete — destructive */}
      <button
        onClick={() => { onDelete(); onClose() }}
        className="flex w-full items-center gap-3 px-4 py-2 text-[14px] font-medium transition-sl cursor-pointer"
        style={{ color: '#ef4444' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <Trash2 size={15} strokeWidth={1.5} />
        Delete task
      </button>
    </motion.div>
  )
}
