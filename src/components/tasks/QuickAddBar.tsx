'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Send, Mic, MicOff } from 'lucide-react'
import { format } from 'date-fns'
import { parseQuickAdd, type ParsedTask } from '@/lib/nlpParser'
import { useItems } from '@/hooks/useItems'
import { snappy } from '@/shared/design-system'

export default function QuickAddBar() {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ParsedTask>({ title: '', dueDate: null, tags: [], priority: null })
  const [success, setSuccess] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addItem } = useItems()

  // Check if Web Speech API is available
  const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const toggleVoice = useCallback(() => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
      return
    }
    if (!speechSupported) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript || ''
      if (transcript) {
        const combined = input ? `${input} ${transcript}` : transcript
        setInput(combined)
        setParsed(parseQuickAdd(combined))
      }
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setListening(true)
  }, [listening, speechSupported, input])

  // Debounced parse on input change
  const handleChange = useCallback((value: string) => {
    setInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setParsed(parseQuickAdd(value))
    }, 150)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    const result = parseQuickAdd(input)
    if (!result.title.trim()) return

    await addItem('task', {
      title: result.title,
      dueDate: result.dueDate?.toISOString(),
      priority: result.priority ?? 'medium',
      status: 'todo',
      tags: result.tags.length > 0 ? result.tags : undefined,
    } as Record<string, unknown>)

    // Success flash
    setSuccess(true)
    setInput('')
    setParsed({ title: '', dueDate: null, tags: [], priority: null })
    setTimeout(() => setSuccess(false), 200)
    inputRef.current?.focus()
  }, [input, addItem])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const hasPreview = parsed.dueDate || parsed.tags.length > 0 || parsed.priority

  return (
    <div className="w-full">
      {/* Input row */}
      <div className="flex items-center gap-2">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-colors duration-200"
          style={{
            background: 'var(--input-bg)',
            border: success
              ? '1.5px solid #22c55e'
              : '1px solid var(--border)',
          }}
        >
          <Zap
            size={14}
            style={{ color: 'var(--text-3)', flexShrink: 0 }}
          />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Quick add: &quot;Call mom tomorrow 5pm #personal !high&quot;"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-1)' }}
          />
          {speechSupported && (
            <button
              onClick={toggleVoice}
              className="flex items-center justify-center w-6 h-6 rounded-lg transition-all"
              style={{
                background: listening ? '#ef4444' : 'var(--input-bg)',
                color: listening ? '#fff' : 'var(--text-3)',
                border: listening ? 'none' : '1px solid var(--border)',
              }}
              title={listening ? 'Stop listening' : 'Voice input'}
            >
              {listening ? <MicOff size={12} /> : <Mic size={12} />}
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!parsed.title.trim()}
            className="flex items-center justify-center w-6 h-6 rounded-lg transition-opacity disabled:opacity-30"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <Send size={12} />
          </button>
        </div>
      </div>

      {/* Preview chips */}
      <AnimatePresence mode="wait">
        {hasPreview && (
          <motion.div
            className="flex items-center gap-1.5 flex-wrap mt-1.5 px-1"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={snappy}
          >
            {/* Date pill */}
            <AnimatePresence>
              {parsed.dueDate && (
                <motion.span
                  key="date"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={snappy}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'var(--accent-dim, rgba(99,102,241,0.1))',
                    color: 'var(--accent)',
                  }}
                >
                  {format(parsed.dueDate, 'EEE, MMM d h:mm a')}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tag pills */}
            <AnimatePresence>
              {parsed.tags.map((tag) => (
                <motion.span
                  key={`tag-${tag}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={snappy}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'var(--bg-task, rgba(16,185,129,0.1))',
                    color: 'var(--color-task)',
                  }}
                >
                  #{tag}
                </motion.span>
              ))}
            </AnimatePresence>

            {/* Priority indicator */}
            <AnimatePresence>
              {parsed.priority && (
                <motion.span
                  key="priority"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={snappy}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background:
                      parsed.priority === 'high'
                        ? 'rgba(239,68,68,0.1)'
                        : parsed.priority === 'medium'
                        ? 'rgba(245,158,11,0.1)'
                        : 'rgba(59,130,246,0.1)',
                    color:
                      parsed.priority === 'high'
                        ? '#ef4444'
                        : parsed.priority === 'medium'
                        ? '#f59e0b'
                        : '#3b82f6',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background:
                        parsed.priority === 'high'
                          ? '#ef4444'
                          : parsed.priority === 'medium'
                          ? '#f59e0b'
                          : '#3b82f6',
                    }}
                  />
                  {parsed.priority}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
