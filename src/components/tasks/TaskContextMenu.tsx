
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  UserMinus,
  Calendar,
  CalendarOff,
  BarChart3,
  Tag,
  FolderInput,
  Link2,
  Copy,
  Trash2,
} from 'lucide-react'
import { fadeSlideDown, ease } from '@/lib/motion'
import type { TaskRecord } from '@/hooks/useTasks'

interface TaskContextMenuProps {
  task: TaskRecord
  position: { x: number; y: number }
  onClose: () => void
  onEditAssignee?: () => void
  onRemoveAssignee?: () => void
  onEditDueDate?: () => void
  onRemoveDueDate?: () => void
  onEditPriority?: () => void
  onRemovePriority?: () => void
  onAddLabels?: () => void
  onMoveToList?: () => void
  onCopyLink?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
}

interface MenuItem {
  label: string
  shortcut?: string
  icon: React.ReactNode
  onClick?: () => void
  destructive?: boolean
  dividerAfter?: boolean
}

export default function TaskContextMenu({
  task,
  position,
  onClose,
  onEditAssignee,
  onRemoveAssignee,
  onEditDueDate,
  onRemoveDueDate,
  onEditPriority,
  onRemovePriority,
  onAddLabels,
  onMoveToList,
  onCopyLink: _onCopyLink,
  onDuplicate,
  onDelete,
}: TaskContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
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

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const el = menuRef.current
    if (rect.right > window.innerWidth) {
      el.style.left = `${position.x - rect.width}px`
    }
    if (rect.bottom > window.innerHeight) {
      el.style.top = `${position.y - rect.height}px`
    }
  }, [position])

  const items: MenuItem[] = [
    {
      label: 'Edit assignee',
      shortcut: '⌃A',
      icon: <User size={14} strokeWidth={1.5} />,
      onClick: onEditAssignee,
    },
    {
      label: 'Remove assignee',
      shortcut: '⌃⇧A',
      icon: <UserMinus size={14} strokeWidth={1.5} />,
      onClick: onRemoveAssignee,
      dividerAfter: true,
    },
    {
      label: 'Edit due date',
      shortcut: '⌃D',
      icon: <Calendar size={14} strokeWidth={1.5} />,
      onClick: onEditDueDate,
    },
    {
      label: 'Remove due date',
      shortcut: '⌃⇧D',
      icon: <CalendarOff size={14} strokeWidth={1.5} />,
      onClick: onRemoveDueDate,
      dividerAfter: true,
    },
    {
      label: 'Edit priority',
      shortcut: '⌃P',
      icon: <BarChart3 size={14} strokeWidth={1.5} />,
      onClick: onEditPriority,
    },
    {
      label: 'Remove priority',
      shortcut: '⌃⇧P',
      icon: <BarChart3 size={14} strokeWidth={1.5} />,
      onClick: onRemovePriority,
      dividerAfter: true,
    },
    {
      label: 'Add labels',
      shortcut: '⌃L',
      icon: <Tag size={14} strokeWidth={1.5} />,
      onClick: onAddLabels,
    },
    {
      label: 'Move to list\u2026',
      icon: <FolderInput size={14} strokeWidth={1.5} />,
      onClick: onMoveToList,
      dividerAfter: true,
    },
    {
      label: 'Copy link',
      icon: <Link2 size={14} strokeWidth={1.5} />,
      onClick: () => {
        navigator.clipboard?.writeText(`${window.location.origin}/today/tasks/${task._id}`)
        onClose()
      },
    },
    {
      label: 'Duplicate task',
      icon: <Copy size={14} strokeWidth={1.5} />,
      onClick: onDuplicate,
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} strokeWidth={1.5} />,
      onClick: onDelete,
      destructive: true,
    },
  ]

  return (
    <motion.div
      {...fadeSlideDown}
      transition={ease.fast}
      ref={menuRef}
      className="popover-shell fixed z-[9999] w-[220px]"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {items.map((item, _i) => (
        <div key={item.label}>
          <button
            onClick={() => {
              item.onClick?.()
              if (!item.onClick) onClose()
            }}
            className={`menu-item cursor-pointer ${item.destructive ? 'is-destructive' : ''}`}
            style={{
              color: item.destructive ? 'var(--danger)' : undefined,
            }}
          >
            <span style={{ color: item.destructive ? 'var(--danger)' : 'var(--text-muted)' }}>
              {item.icon}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <span
                className="text-[11px]"
                style={{ color: 'var(--text-faint)' }}
              >
                {item.shortcut}
              </span>
            )}
          </button>
          {item.dividerAfter && (
            <div
              className="mx-2 my-1 h-px"
              style={{ backgroundColor: 'var(--border)' }}
            />
          )}
        </div>
      ))}
    </motion.div>
  )
}
