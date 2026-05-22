'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, Plus } from 'lucide-react'
import { buttonPress, motionTokens } from '@/lib/motion'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasText = value.trim().length > 0

  // Auto-resize textarea
  const resize = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [])

  useEffect(() => {
    resize()
  }, [value, resize])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
      if (e.key === 'Escape') {
        textareaRef.current?.blur()
      }
    },
    [handleSend]
  )

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 10,
        padding: '10px 10px 10px 16px',
        borderRadius: 999,
        backgroundColor: 'var(--bg-hover)',
        border: '1px solid var(--overlay-2, rgba(108,108,158,0.1))',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--overlay-3, rgba(108,108,158,0.25))'
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--overlay-2, rgba(108,108,158,0.1))'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Plus icon — matches Today new-task style */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          flexShrink: 0,
          color: 'var(--text-faint)',
        }}
      >
        <Plus size={18} strokeWidth={1.5} />
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder || 'Ask anything about your tasks...'}
        rows={1}
        style={{
          flex: 1,
          resize: 'none',
          background: 'transparent',
          outline: 'none',
          border: 'none',
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--text-primary)',
          fontFamily: 'Inter, system-ui, sans-serif',
          maxHeight: 120,
          minHeight: 22,
          lineHeight: 1.5,
          padding: 0,
        }}
      />

      {/* Send button — accent circle with arrow */}
      <motion.button
        {...buttonPress}
        type="button"
        onClick={handleSend}
        disabled={!hasText || disabled}
        aria-label="Send message"
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: hasText ? 'pointer' : 'default',
          backgroundColor: hasText ? 'var(--accent)' : 'var(--overlay-2, rgba(108,108,158,0.12))',
          color: hasText ? '#fff' : 'var(--text-faint)',
          transition: `background-color ${motionTokens.duration.fast * 1000}ms ease, color ${motionTokens.duration.fast * 1000}ms ease`,
        }}
      >
        <ArrowUp size={16} strokeWidth={2} />
      </motion.button>
    </div>
  )
}
