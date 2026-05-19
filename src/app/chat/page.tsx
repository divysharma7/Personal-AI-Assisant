'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { copy } from '@/lib/copy'
import { fadeSlideUp, ease } from '@/lib/motion'
import ChatInput from '@/components/chat/ChatInput'
import ChatMessage from '@/components/chat/ChatMessage'
import TypingIndicator from '@/components/chat/TypingIndicator'
import type { ChatMessageData } from '@/components/chat/ChatMessage'

const MOCK_RESPONSES = [
  "I've noted that down!",
  'Let me check your schedule...',
  'Task created successfully!',
]

let responseIndex = 0

function nextMockResponse(): string {
  const r = MOCK_RESPONSES[responseIndex % MOCK_RESPONSES.length]
  responseIndex++
  return r
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: copy.chat.welcome,
      timestamp: new Date(),
    },
  ])
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change or thinking state changes
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, isThinking])

  const handleSend = useCallback(
    (text: string) => {
      // Add user message
      const userMsg: ChatMessageData = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsThinking(true)

      // Simulate AI thinking
      setTimeout(() => {
        const response = nextMockResponse()
        const assistantMsg: ChatMessageData = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          steps: [
            { icon: 'search', text: 'Searching tasks...' },
            { icon: 'found', text: 'Found 3 items' },
          ],
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMsg])
        setIsThinking(false)
      }, 1500)
    },
    []
  )

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      handleSend(suggestion)
    },
    [handleSend]
  )

  // Show suggestions only when the chat has just the welcome message
  const showSuggestions = messages.length === 1 && messages[0].id === 'welcome'

  return (
    <div className="flex h-full flex-col px-6 py-5">
      {/* Title area */}
      <div className="mb-4 flex-shrink-0">
        <h1
          className="text-[32px]"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
          }}
        >
          {copy.chat.title}
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {copy.chat.subtitle}
        </p>
      </div>

      {/* Message thread — scrollable */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {/* Suggestion chips */}
        {showSuggestions && (
          <motion.div
            {...fadeSlideUp}
            transition={{ ...ease.normal, delay: 0.3 }}
            className="mb-4 flex flex-wrap gap-2 pl-9"
          >
            {copy.chat.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestionClick(s)}
                className="rounded-full px-4 py-2 text-sm transition-colors duration-150 cursor-pointer"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--accent)'
                }}
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}

        {/* Typing indicator */}
        {isThinking && <TypingIndicator />}
      </div>

      {/* Thinking label */}
      <AnimatePresence>
        {isThinking && (
          <motion.p
            {...fadeSlideUp}
            transition={ease.fast}
            className="mb-2 text-xs"
            style={{ color: 'var(--text-faint)' }}
          >
            {copy.chat.thinking}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Input area — fixed at bottom */}
      <div className="flex-shrink-0 pt-2">
        <ChatInput
          onSend={handleSend}
          disabled={isThinking}
          placeholder={copy.chat.inputPlaceholder}
        />
      </div>
    </div>
  )
}
