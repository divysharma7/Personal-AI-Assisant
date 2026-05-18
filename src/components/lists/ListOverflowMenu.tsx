'use client'

import { useEffect, useRef } from 'react'
import { EyeOff, Eye, RotateCcw, Trash2 } from 'lucide-react'

interface ListOverflowMenuProps {
  hideCompleted: boolean
  isInbox: boolean
  anchorRect: { top: number; right: number }
  onToggleHideCompleted: () => void
  onMarkAllIncomplete: () => void
  onDeleteList: () => void
  onClose: () => void
}

export default function ListOverflowMenu({
  hideCompleted,
  isInbox,
  anchorRect,
  onToggleHideCompleted,
  onMarkAllIncomplete,
  onDeleteList,
  onClose,
}: ListOverflowMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="popover"
      style={{
        position: 'fixed',
        top: anchorRect.top + 4,
        right: window.innerWidth - anchorRect.right,
        zIndex: 600,
        minWidth: 220,
        padding: 4,
      }}
    >
      <button
        type="button"
        className="popover-item"
        onClick={() => {
          onToggleHideCompleted()
          onClose()
        }}
        style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
      >
        {hideCompleted ? <Eye size={16} /> : <EyeOff size={16} />}
        <span>{hideCompleted ? 'Show completed tasks' : 'Hide completed tasks'}</span>
      </button>

      <button
        type="button"
        className="popover-item"
        onClick={() => {
          onMarkAllIncomplete()
          onClose()
        }}
        style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
      >
        <RotateCcw size={16} />
        <span>Mark all incomplete</span>
      </button>

      {!isInbox && (
        <button
          type="button"
          className="popover-item"
          onClick={() => {
            onDeleteList()
            onClose()
          }}
          style={{
            width: '100%',
            border: 'none',
            background: 'none',
            textAlign: 'left',
            color: 'var(--color-danger, #FF4D3D)',
          }}
        >
          <Trash2 size={16} />
          <span>Delete list</span>
        </button>
      )}
    </div>
  )
}
