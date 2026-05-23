'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare } from 'lucide-react'
import { useChatSessions, useDeleteChatSession, type ChatSessionSummary } from '@/hooks/useChatSessions'
import { motionTokens, slideFromLeft, fade, stagger } from '@/lib/motion'
import { copy } from '@/lib/copy'

interface ChatSessionsPanelProps {
  open: boolean
  onClose: () => void
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewChat: () => void
}

type DateGroup = 'today' | 'yesterday' | 'previous7Days' | 'older'

function getDateGroup(dateStr: string): DateGroup {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  if (date >= today) return 'today'
  if (date >= yesterday) return 'yesterday'
  if (date >= weekAgo) return 'previous7Days'
  return 'older'
}

function groupSessions(sessions: ChatSessionSummary[]): Record<DateGroup, ChatSessionSummary[]> {
  const groups: Record<DateGroup, ChatSessionSummary[]> = {
    today: [],
    yesterday: [],
    previous7Days: [],
    older: [],
  }
  for (const session of sessions) {
    groups[getDateGroup(session.updatedAt)].push(session)
  }
  return groups
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const GROUP_ORDER: DateGroup[] = ['today', 'yesterday', 'previous7Days', 'older']

const c = copy.chat.history

export default function ChatSessionsPanel({
  open,
  onClose,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: ChatSessionsPanelProps) {
  const { sessions = [] } = useChatSessions()
  const deleteSession = useDeleteChatSession()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const grouped = groupSessions(sessions)
  const isEmpty = sessions.length === 0

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      deleteSession.mutate(id)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
    }
  }

  return (
    <motion.div
      variants={slideFromLeft}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
      style={{
        width: 280,
        height: '100%',
        flexShrink: 0,
        backgroundColor: 'var(--bg-pane-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 16px 12px',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
          {c.title}
        </span>
        <button
          onClick={onClose}
          aria-label="Close history"
          style={{
            width: 28, height: 28, borderRadius: 8, border: 'none',
            backgroundColor: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
            transition: 'background-color 150ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* New Chat button */}
      <div style={{ padding: '12px 16px 8px' }}>
        <button
          onClick={onNewChat}
          style={{
            width: '100%',
            padding: '8px 16px',
            borderRadius: 999,
            border: 'none',
            backgroundColor: 'var(--accent)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          {c.newChat}
        </button>
      </div>

      {/* Session list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {isEmpty ? (
          /* Empty state */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', padding: '0 24px',
            textAlign: 'center', gap: 12,
          }}>
            <MessageSquare size={32} strokeWidth={1.2} style={{ color: 'var(--text-faint)', opacity: 0.5 }} />
            <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
              {c.empty}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
              {c.emptyHint}
            </span>
          </div>
        ) : (
          <motion.div variants={stagger(0.03)} initial="initial" animate="animate">
            {GROUP_ORDER.map((groupKey) => {
              const items = grouped[groupKey]
              if (items.length === 0) return null
              return (
                <div key={groupKey}>
                  {/* Group header */}
                  <div style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                    color: 'var(--text-faint)',
                    padding: '12px 16px 4px',
                    textTransform: 'uppercase',
                  }}>
                    {c.groups[groupKey]}
                  </div>

                  {/* Session rows */}
                  <AnimatePresence>
                    {items.map((session) => {
                      const isActive = session._id === activeSessionId
                      const isHovered = session._id === hoveredId
                      const isConfirming = session._id === confirmDeleteId
                      return (
                        <motion.div
                          key={session._id}
                          variants={fade}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          layout
                          onMouseEnter={() => setHoveredId(session._id)}
                          onMouseLeave={() => { setHoveredId(null); setConfirmDeleteId(null) }}
                          onClick={() => onSelectSession(session._id)}
                          style={{
                            height: 52,
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 16px',
                            cursor: 'pointer',
                            position: 'relative',
                            borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                            backgroundColor: isActive
                              ? 'var(--overlay-1)'
                              : isHovered
                                ? 'var(--overlay-1)'
                                : 'transparent',
                            transition: 'background-color 150ms ease',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 14,
                              fontWeight: isActive ? 600 : 500,
                              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.3,
                            }}>
                              {session.title}
                            </div>
                            <div style={{
                              fontSize: 12,
                              color: 'var(--text-faint)',
                              marginTop: 2,
                            }}>
                              {formatRelativeDate(session.updatedAt)}
                            </div>
                          </div>

                          {/* Delete button — visible on hover */}
                          {(isHovered || isConfirming) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(session._id) }}
                              aria-label={isConfirming ? c.deleteConfirm : 'Delete chat'}
                              title={isConfirming ? c.deleteConfirm : undefined}
                              style={{
                                width: 24, height: 24, borderRadius: 6,
                                border: 'none', flexShrink: 0, marginLeft: 8,
                                backgroundColor: isConfirming ? 'var(--danger, #ef4444)' : 'transparent',
                                color: isConfirming ? '#fff' : 'var(--text-faint)',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background-color 150ms ease, color 150ms ease',
                              }}
                              onMouseEnter={(e) => {
                                if (!isConfirming) {
                                  e.currentTarget.style.backgroundColor = 'var(--overlay-2)'
                                  e.currentTarget.style.color = 'var(--text-primary)'
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isConfirming) {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                  e.currentTarget.style.color = 'var(--text-faint)'
                                }
                              }}
                            >
                              <X size={14} strokeWidth={1.5} />
                            </button>
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
