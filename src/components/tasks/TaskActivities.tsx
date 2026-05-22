'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Edit3,
  Flag,
  Calendar,
  RotateCcw,
  Clock,
  FolderInput,
  Tag,
  PlusCircle,
  X,
} from 'lucide-react'
import { fadeSlideDown, ease, cssTransition } from '@/lib/motion'
import { copy } from '@/lib/copy'

interface Activity {
  action: string
  detail?: string
  timestamp: string
}

interface TaskActivitiesProps {
  activities: Activity[]
  onClose: () => void
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  created: <PlusCircle size={14} strokeWidth={1.5} />,
  title_changed: <Edit3 size={14} strokeWidth={1.5} />,
  status_changed: <RotateCcw size={14} strokeWidth={1.5} />,
  priority_changed: <Flag size={14} strokeWidth={1.5} />,
  due_date_changed: <Calendar size={14} strokeWidth={1.5} />,
  completed: <CheckCircle size={14} strokeWidth={1.5} />,
  reopened: <RotateCcw size={14} strokeWidth={1.5} />,
  scheduled: <Clock size={14} strokeWidth={1.5} />,
  unscheduled: <Clock size={14} strokeWidth={1.5} />,
  moved_to_section: <FolderInput size={14} strokeWidth={1.5} />,
  label_added: <Tag size={14} strokeWidth={1.5} />,
  label_removed: <Tag size={14} strokeWidth={1.5} />,
}

const ACTION_COLORS: Record<string, string> = {
  completed: '#22c55e',
  reopened: '#f59e0b',
  priority_changed: '#ef4444',
}

function formatRelativeTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TaskActivities({ activities, onClose }: TaskActivitiesProps) {
  const sorted = useMemo(
    () => [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [activities]
  )

  return (
    <motion.div
      {...fadeSlideDown}
      transition={ease.normal}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        borderRadius: 12,
        backgroundColor: 'var(--bg-pane-2, var(--bg-pane))',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {copy.tasks.kanban.taskActivities}
        </span>
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: 6,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
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
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Activity list */}
      <div style={{ maxHeight: 300, overflowY: 'auto', padding: '6px 0' }}>
        {sorted.length === 0 && (
          <p
            style={{
              padding: '20px 14px',
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--text-faint)',
            }}
          >
            No activity yet
          </p>
        )}

        {sorted.map((activity, i) => {
          const icon = ACTION_ICONS[activity.action] ?? <Edit3 size={14} strokeWidth={1.5} />
          const iconColor = ACTION_COLORS[activity.action] ?? 'var(--text-muted)'

          return (
            <div
              key={`${activity.action}-${activity.timestamp}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '8px 14px',
                transition: cssTransition.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(255,255,255,0.03))'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  flexShrink: 0,
                  color: iconColor,
                  backgroundColor: 'var(--overlay-1, rgba(255,255,255,0.06))',
                  marginTop: 1,
                }}
              >
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {activity.detail || activity.action.replace(/_/g, ' ')}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--text-faint)',
                    margin: '2px 0 0',
                  }}
                >
                  {formatRelativeTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
