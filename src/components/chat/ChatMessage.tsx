'use client'

import { motion } from 'framer-motion'
import { Search, CheckCircle2, Plus, AlertCircle } from 'lucide-react'
import { fadeSlideUp, ease } from '@/lib/motion'

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
  const parts: (string | JSX.Element)[] = []
  // Regex: match **bold** or `code`
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    // Push text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    if (match[2]) {
      // Bold
      parts.push(
        <strong key={match.index} className="font-semibold">
          {match[2]}
        </strong>
      )
    } else if (match[3]) {
      // Code
      parts.push(
        <code
          key={match.index}
          className="rounded px-1 py-0.5 text-[13px]"
          style={{ backgroundColor: 'var(--bg-hover)' }}
        >
          {match[3]}
        </code>
      )
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === 'user'

  return (
    <div className="mb-3">
      {/* Tool steps (shown above assistant messages) */}
      {message.steps && message.steps.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5 pl-9">
          {message.steps.map((step, i) => {
            const Icon = STEP_ICONS[step.icon]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...ease.fast, delay: i * 0.2 }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
                style={{
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

      {/* Message bubble */}
      <motion.div
        {...fadeSlideUp}
        transition={ease.normal}
        className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* Avatar */}
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          style={{
            backgroundColor: isUser ? 'var(--accent)' : 'var(--bg-pane-2)',
            color: isUser ? '#fff' : 'var(--text-primary)',
          }}
        >
          {isUser ? 'Y' : 'L'}
        </div>

        <div className={`flex max-w-[80%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              backgroundColor: isUser ? 'var(--accent)' : 'var(--bg-pane-2)',
              color: isUser ? '#fff' : 'var(--text-primary)',
            }}
          >
            {renderContent(message.content)}
          </div>

          {/* Timestamp */}
          <span
            className="mt-1 text-[10px]"
            style={{ color: 'var(--text-faint)' }}
          >
            {formatTime(message.timestamp)}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
