'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquarePlus } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useHabits } from '@/hooks/useHabits'
import { motionTokens, buttonPress, fadeSlideUp, ease } from '@/lib/motion'
import ChatMessage from '@/components/chat/ChatMessage'
import type { ChatMessageData } from '@/components/chat/ChatMessage'
import ChatInput from '@/components/chat/ChatInput'
import TypingIndicator from '@/components/chat/TypingIndicator'

/* ── Suggestion pills ──────────────────────────────────────── */

const SUGGESTIONS = [
  "What's on my calendar today?",
  'Show my overdue tasks',
  'Create a task',
  'How are my habits?',
]

/* ── Page ───────────────────────────────────────────────────── */

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // hooks for context (kept for future inline cards)
  useTasks()
  useHabits()

  const messagesRef = useRef(messages)
  useEffect(() => { messagesRef.current = messages }, [messages])

  const hasMessages = messages.length > 0

  /* ── Auto-scroll on new messages ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  /* ── Send handler — keeps existing API call pattern ── */
  const handleSend = useCallback(
    async (text: string) => {
      const msg = text.trim()
      if (!msg || isLoading) return

      const userMsg: ChatMessageData = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: msg,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)

      const history = [...messagesRef.current, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            localDate: new Date().toISOString(),
          }),
        })

        if (!res.ok) throw new Error('Failed')

        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let fullReply = ''

        if (reader) {
          let buffer = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''
            for (const line of lines) {
              if (!line.trim()) continue
              try {
                const chunk = JSON.parse(line)
                if (chunk.t === 'd') fullReply += chunk.text
              } catch {
                /* skip */
              }
            }
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: fullReply || 'Done! Let me know if you need anything else.',
            timestamp: new Date(),
          },
        ])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: "Couldn't connect. Check your OpenRouter API key in .env.local.",
            timestamp: new Date(),
          },
        ])
      }
      setIsLoading(false)
    },
    [isLoading]
  )

  /* ── Clear / New chat ── */
  const handleNewChat = useCallback(() => {
    setMessages([])
    setIsLoading(false)
  }, [])

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* ── Scrollable area ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          scrollBehavior: 'smooth',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            width: '100%',
            margin: '0 auto',
            padding: '32px 24px 0',
          }}
        >
          {/* ── Header row ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginBottom: 24,
            }}
          >
            {hasMessages && (
              <motion.button
                {...buttonPress}
                onClick={handleNewChat}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 32,
                  padding: '0 14px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <MessageSquarePlus size={14} strokeWidth={1.5} />
                New chat
              </motion.button>
            )}
          </div>

          {/* ── Title ── */}
          <h1
            style={{
              color: 'var(--text-primary)',
              fontSize: 42,
              fontWeight: 700,
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '-0.02em',
              marginBottom: hasMessages ? 24 : 0,
              margin: 0,
              paddingBottom: hasMessages ? 24 : 8,
            }}
          >
            Chat
          </h1>

          {/* ── Empty state — suggestion pills ── */}
          {!hasMessages && (
            <motion.div
              initial={{ opacity: 0, y: motionTokens.distance.sm }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: motionTokens.duration.normal }}
              style={{ paddingTop: 8, paddingBottom: 24 }}
            >
              <p
                style={{
                  fontSize: 15,
                  color: 'var(--text-faint)',
                  margin: '0 0 20px',
                }}
              >
                Ask about your tasks, habits, calendar, or anything else.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {SUGGESTIONS.map((label) => (
                  <button
                    key={label}
                    onClick={() => handleSend(label)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 16px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.06))',
                      border: '1px solid var(--overlay-2, rgba(108,108,158,0.1))',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: 'Inter, system-ui, sans-serif',
                      transition: 'background-color 150ms ease-out, transform 150ms ease-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'var(--overlay-2, rgba(108,108,158,0.12))'
                      e.currentTarget.style.borderColor =
                        'var(--overlay-3, rgba(108,108,158,0.2))'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'var(--overlay-1, rgba(108,108,158,0.06))'
                      e.currentTarget.style.borderColor =
                        'var(--overlay-2, rgba(108,108,158,0.1))'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Messages ── */}
          {hasMessages && (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <ChatMessage key={msg.id} message={msg} index={i} />
              ))}
            </AnimatePresence>
          )}

          {/* ── Loading indicator ── */}
          {isLoading && <TypingIndicator />}

          {/* Scroll anchor */}
          <div ref={bottomRef} style={{ height: 1 }} />
        </div>
      </div>

      {/* ── Input area — fixed at bottom of chat area ── */}
      <div
        style={{
          flexShrink: 0,
          maxWidth: 720,
          width: '100%',
          margin: '0 auto',
          padding: '12px 24px 24px',
        }}
      >
        {/* Suggestion pills when there are messages */}
        {hasMessages && !isLoading && (
          <motion.div
            {...fadeSlideUp}
            transition={ease.fast}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 10,
            }}
          >
            {SUGGESTIONS.slice(0, 3).map((label) => (
              <button
                key={label}
                onClick={() => handleSend(label)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.06))',
                  border: '1px solid var(--overlay-2, rgba(108,108,158,0.1))',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'background-color 150ms ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--overlay-2, rgba(108,108,158,0.12))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--overlay-1, rgba(108,108,158,0.06))'
                }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}

        <ChatInput onSend={handleSend} disabled={isLoading} />

        <p
          style={{
            fontSize: 11,
            color: 'var(--text-faint)',
            textAlign: 'center',
            marginTop: 8,
            opacity: 0.5,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          LAIF AI can access your tasks, habits, and calendar
        </p>
      </div>
    </div>
  )
}
