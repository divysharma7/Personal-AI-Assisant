'use client'

import { motion } from 'framer-motion'
import { Search, CheckCircle2, Plus, AlertCircle, Bot } from 'lucide-react'
import { fadeSlideUp, ease, motionTokens } from '@/lib/motion'

export interface ChatStep {
  icon: 'search' | 'found' | 'created' | 'warning'
  text: string
}

export interface ChatMessageData {
  id: string
  role: 'user' | 'assistant'
  content: string
  steps?: ChatStep[]
  timestamp: Date
}

const STEP_ICONS = {
  search: Search,
  found: CheckCircle2,
  created: Plus,
  warning: AlertCircle,
} as const

/** Basic inline formatting: **bold** and `code` */
function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    const parts: (string | JSX.Element)[] = []
    const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index))
      }
      if (match[2]) {
        parts.push(
          <strong key={`${i}-${match.index}`} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {match[2]}
          </strong>
        )
      } else if (match[3]) {
        parts.push(
          <code
            key={`${i}-${match.index}`}
            style={{
              backgroundColor: 'var(--overlay-2)',
              borderRadius: 4,
              padding: '1px 5px',
              fontSize: 13,
            }}
          >
            {match[3]}
          </code>
        )
      }
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex))
    }
    return (
      <p key={i} style={{ margin: line === '' ? '8px 0' : '2px 0' }}>
        {parts.length > 0 ? parts : '\u00A0'}
      </p>
    )
  })
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatMessage({ message, index }: { message: ChatMessageData; index: number }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: motionTokens.distance.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth, delay: index * 0.03 }}
      style={{ marginBottom: 20 }}
    >
      {/* Tool steps (shown above assistant messages) */}
      {message.steps && message.steps.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8, paddingLeft: isUser ? 0 : 44 }}>
          {message.steps.map((step, i) => {
            const Icon = STEP_ICONS[step.icon]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...ease.fast, delay: i * 0.2 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 999,
                  padding: '4px 12px',
                  fontSize: 12,
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-muted)',
                }}
              >
                <Icon size={12} strokeWidth={1.5} />
                <span>{step.text}</span>
              </motion.div>
            )
          })}
        </div>
      )}

      {isUser ? (
        /* User message — right-aligned, accent at 10% opacity */
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div
              style={{
                padding: '12px 18px',
                borderRadius: 18,
                borderBottomRightRadius: 6,
                backgroundColor: 'var(--accent-soft, rgba(15, 98, 254, 0.1))',
                color: 'var(--text-primary)',
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
              }}
            >
              {message.content}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      ) : (
        /* Assistant message — left-aligned, bg-pane-2, with AI avatar */
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              flexShrink: 0,
              backgroundColor: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
            }}
          >
            <Bot size={16} strokeWidth={1.5} color="#fff" />
          </div>
          <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div
              style={{
                padding: '12px 18px',
                borderRadius: 18,
                borderBottomLeftRadius: 6,
                backgroundColor: 'var(--bg-pane-2)',
                color: 'var(--text-muted)',
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.7,
              }}
            >
              {renderContent(message.content)}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
