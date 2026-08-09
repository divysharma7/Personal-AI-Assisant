
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
  Activity,
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
  onShowActivities?: () => void
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
  onShowActivities,
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
    {
      label: 'Task Activities',
      icon: <Activity size={15} strokeWidth={1.5} />,
      onClick: () => { onShowActivities?.(); onClose() },
    },
  ]

  return (
    <motion.div
      {...fadeSlideDown}
      transition={ease.fast}
      ref={menuRef}
      className="popover-shell absolute right-0 top-full z-50 mt-1 w-[220px]"
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="menu-item cursor-pointer"
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
        className="menu-item is-destructive cursor-pointer"
      >
        <Trash2 size={15} strokeWidth={1.5} />
        Delete task
      </button>
    </motion.div>
  )
}
