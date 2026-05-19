'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, Mic } from 'lucide-react'
import { buttonPress } from '@/lib/motion'

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
    // Max 4 lines (~80px)
    ta.style.height = `${Math.min(ta.scrollHeight, 80)}px`
  }, [])

  useEffect(() => {
    resize()
  }, [value, resize])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    // Reset height
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
      className="flex items-end gap-2 rounded-full px-4 py-2"
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm leading-snug outline-none placeholder:text-[var(--text-faint)]"
        style={{
          color: 'var(--text-primary)',
          maxHeight: 80,
          minHeight: 20,
        }}
      />

      {/* Microphone placeholder */}
      {!hasText && (
        <button
          type="button"
          disabled
          aria-label="Voice input"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full opacity-40 cursor-not-allowed"
          style={{ color: 'var(--text-muted)' }}
        >
          <Mic size={18} strokeWidth={1.5} />
        </button>
      )}

      {/* Send button */}
      {hasText && (
        <motion.button
          {...buttonPress}
          type="button"
          onClick={handleSend}
          disabled={disabled}
          aria-label="Send message"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white transition-colors duration-150 cursor-pointer"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <ArrowUp size={16} strokeWidth={2} />
        </motion.button>
      )}
    </div>
  )
}
