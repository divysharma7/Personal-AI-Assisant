'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Columns3, MoreHorizontal } from 'lucide-react'
import { buttonPress, cssTransition } from '@/lib/motion'
import { copy } from '@/lib/copy'

/* ── Types ── */

interface WorkflowHeaderProps {
  workflow: {
    _id: string
    name: string
    icon: string
    color: string
    templateType: string
  }
  onEditName: (name: string) => void
  onOpenViewOptions: () => void
}

/* ── Component ── */

export default function WorkflowHeader({
  workflow,
  onEditName,
  onOpenViewOptions,
}: WorkflowHeaderProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(workflow.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(workflow.name)
  }, [workflow.name])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const commitEdit = useCallback(() => {
    const trimmed = editValue.trim()
    setIsEditing(false)
    if (trimmed && trimmed !== workflow.name) {
      onEditName(trimmed)
    } else {
      setEditValue(workflow.name)
    }
  }, [editValue, workflow.name, onEditName])

  const handleManageColumns = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('laif:manage-workflow-columns', {
        detail: { workflowId: workflow._id },
      })
    )
  }, [workflow._id])

  const iconBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: cssTransition.fast,
  }

  return (
    <div
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        backgroundColor: 'var(--bg-pane)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* Left: Back + Icon + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <motion.button
          {...buttonPress}
          onClick={() => router.push('/tasks')}
          style={iconBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
          aria-label={copy.tasks.workflow.backToTasks}
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </motion.button>

        <span style={{ fontSize: 16, lineHeight: 1 }}>{workflow.icon}</span>

        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') {
                setEditValue(workflow.name)
                setIsEditing(false)
              }
            }}
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid var(--accent, #6366f1)',
              outline: 'none',
              padding: '2px 0',
              lineHeight: 1.2,
              fontFamily: 'inherit',
              minWidth: 80,
            }}
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'text',
              userSelect: 'none',
              lineHeight: 1.2,
            }}
          >
            {workflow.name}
          </span>
        )}
      </div>

      {/* Right: Manage Columns + View Options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <motion.button
          {...buttonPress}
          onClick={handleManageColumns}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-muted)',
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 8,
            cursor: 'pointer',
            transition: cssTransition.fast,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Columns3 size={14} strokeWidth={1.5} />
          {copy.tasks.workflow.manageColumns}
        </motion.button>

        <motion.button
          {...buttonPress}
          onClick={onOpenViewOptions}
          style={iconBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
          aria-label={copy.tasks.workflow.viewOptions}
        >
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </motion.button>
      </div>
    </div>
  )
}
