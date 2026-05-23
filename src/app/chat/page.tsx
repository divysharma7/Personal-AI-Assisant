'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  ListChecks,
  Calendar,
  TrendingUp,
  Brain,
  ArrowUp,
  Loader2,
  ImageIcon,
  Mic,
} from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useHabits } from '@/hooks/useHabits'
import { motionTokens, ease } from '@/lib/motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTIONS = [
  { icon: ListChecks, label: 'Plan my day', color: '#6b66da' },
  { icon: Calendar, label: "What's overdue?", color: '#ef4444' },
  { icon: TrendingUp, label: 'Weekly summary', color: '#34d399' },
  { icon: Brain, label: 'Break down a goal', color: '#f59e0b' },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('there')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef<Message[]>([])

  // Keep ref in sync to avoid stale closure on rapid sends
  useEffect(() => { messagesRef.current = messages }, [messages])
  const { tasks } = useTasks()
  const { habits } = useHabits()

  const hasMessages = messages.length > 0

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.name) setUserName(d.name.split(' ')[0])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    const ta = inputRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }, [input])

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || isLoading) return

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: msg, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    const history = [...messagesRef.current, userMsg].map(m => ({ role: m.role, content: m.content }))

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
            } catch { /* skip */ }
          }
        }
      }

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`, role: 'assistant',
        content: fullReply || "Done! Let me know if you need anything else.",
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`, role: 'assistant',
        content: "Couldn't connect. Check your OpenRouter API key in .env.local.",
        timestamp: new Date(),
      }])
    }
    setIsLoading(false)
  }, [input, isLoading, messages])

  /** Format assistant text — bold **text**, inline `code`, line breaks */
  function renderAssistant(text: string) {
    return text.split('\n').map((line, i) => {
      const parts: (string | JSX.Element)[] = []
      const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g
      let last = 0; let m: RegExpExecArray | null
      while ((m = regex.exec(line)) !== null) {
        if (m.index > last) parts.push(line.slice(last, m.index))
        if (m[2]) parts.push(<strong key={`${i}-${m.index}`} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m[2]}</strong>)
        else if (m[3]) parts.push(<code key={`${i}-${m.index}`} style={{ backgroundColor: 'var(--overlay-2)', borderRadius: 4, padding: '1px 5px', fontSize: 13 }}>{m[3]}</code>)
        last = m.index + m[0].length
      }
      if (last < line.length) parts.push(line.slice(last))
      return <p key={i} style={{ margin: line === '' ? '8px 0' : '2px 0' }}>{parts.length > 0 ? parts : '\u00A0'}</p>
    })
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ── Animated gradient background — Neural Expressive inspired ── */}
      {!hasMessages && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(107,102,218,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(248,79,57,0.05) 0%, transparent 50%)',
          animation: 'chatGradientPulse 8s ease-in-out infinite',
        }} />
      )}

      {/* ── Messages / Empty state ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ position: 'relative', zIndex: 1, scrollBehavior: 'smooth' }}>
        {!hasMessages ? (
          /* ── Empty: centered greeting — Gemini style ── */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', padding: '0 24px', textAlign: 'center',
          }}>
            {/* Animated gradient icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }}
              style={{
                width: 64, height: 64, borderRadius: 20, marginBottom: 20,
                background: 'linear-gradient(135deg, #6b66da 0%, var(--accent) 50%, #f59e0b 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(107,102,218,0.25)',
              }}
            >
              <Sparkles size={32} strokeWidth={1.5} color="#fff" />
            </motion.div>

            {/* Greeting — large, gradient text */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: motionTokens.duration.normal }}
              style={{
                fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 8px',
                background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-muted) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              Hi {userName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: motionTokens.duration.normal }}
              style={{ fontSize: 16, color: 'var(--text-faint)', marginBottom: 36, maxWidth: 380 }}
            >
              I can help plan your day, track tasks, and keep you focused. What&apos;s on your mind?
            </motion.p>

            {/* Suggestion pills — horizontal row */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: motionTokens.duration.normal }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 500 }}
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSend(s.label)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 999, cursor: 'pointer',
                    backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.06))',
                    border: '1px solid var(--overlay-2, rgba(108,108,158,0.1))',
                    color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    transition: 'background-color 150ms ease-out, transform 150ms ease-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--overlay-2, rgba(108,108,158,0.12))'
                    e.currentTarget.style.borderColor = 'var(--overlay-3, rgba(108,108,158,0.2))'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(108,108,158,0.06))'
                    e.currentTarget.style.borderColor = 'var(--overlay-2, rgba(108,108,158,0.1))'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <s.icon size={16} strokeWidth={1.5} style={{ color: s.color }} />
                  {s.label}
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          /* ── Message thread ── */
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 16px' }}>
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
                  style={{ marginBottom: 24 }}
                >
                  {msg.role === 'user' ? (
                    /* User — right-aligned pill */
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{
                        maxWidth: '70%', padding: '12px 18px', borderRadius: 22,
                        borderBottomRightRadius: 6,
                        backgroundColor: 'var(--accent)', color: '#fff',
                        fontSize: 15, fontWeight: 500, lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    /* Assistant — left-aligned, icon + structured text */
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        background: 'linear-gradient(135deg, #6b66da 0%, var(--accent) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 2,
                      }}>
                        <Sparkles size={16} strokeWidth={1.5} color="#fff" />
                      </div>
                      <div style={{
                        flex: 1, fontSize: 15, fontWeight: 400, lineHeight: 1.7,
                        color: 'var(--text-muted)',
                      }}>
                        {renderAssistant(msg.content)}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading — thinking animation */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 24 }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: 'linear-gradient(135deg, #6b66da 0%, var(--accent) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={16} strokeWidth={1.5} color="#fff" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8 }}>
                  {/* Three pulsating dots */}
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: motionTokens.duration.crawl, repeat: Infinity, delay: i * motionTokens.duration.fast }}
                      style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--text-faint)' }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ── Input bar — Gemini pill style, centered ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        padding: hasMessages ? '8px 20px 20px' : '0 20px 28px',
        maxWidth: 680, margin: '0 auto', width: '100%',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          padding: '12px 16px 12px 20px',
          borderRadius: 28,
          backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.06))',
          border: '1px solid var(--overlay-2, rgba(108,108,158,0.1))',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'border-color 200ms ease, box-shadow 200ms ease',
        }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--overlay-3, rgba(108,108,158,0.25))'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--overlay-2, rgba(108,108,158,0.1))'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            disabled={isLoading}
            placeholder="Ask anything about your tasks..."
            data-center={!hasMessages ? 'true' : undefined}
            rows={1}
            style={{
              flex: 1, resize: 'none', background: 'transparent', outline: 'none', border: 'none',
              fontSize: 15, fontWeight: 500, color: 'var(--text-primary)',
              fontFamily: 'Inter, system-ui, sans-serif',
              maxHeight: 140, minHeight: 22, lineHeight: 1.5, padding: 0,
              textAlign: 'left',
            }}
          />

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {/* Image/attach — placeholder */}
            <button
              style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-faint)', cursor: 'pointer',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <ImageIcon size={18} strokeWidth={1.5} />
            </button>

            {/* Mic — placeholder */}
            <button
              style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-faint)', cursor: 'pointer',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Mic size={18} strokeWidth={1.5} />
            </button>

            {/* Send */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: input.trim() ? 'var(--accent)' : 'var(--overlay-2, rgba(108,108,158,0.12))',
                color: input.trim() ? '#fff' : 'var(--text-faint)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                border: 'none', transition: 'background-color 200ms ease-out, color 200ms ease-out',
              }}
            >
              <ArrowUp size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p style={{
          fontSize: 11, color: 'var(--text-faint)', textAlign: 'center',
          marginTop: 8, opacity: 0.5, fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          LAIF AI can access your tasks, habits, and calendar
        </p>
      </div>

      {/* Gradient pulse animation */}
      <style>{`
        @keyframes chatGradientPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
      `}</style>
    </div>
  )
}
