'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Square, X } from 'lucide-react'
import { snappy, smooth } from '@/shared/design-system'

const MAX_DURATION_MS = 120_000 // 2 minutes
const SILENCE_TIMEOUT_MS = 60_000 // 60 seconds

interface VoiceCaptureProps {
  onTranscript: (text: string) => void
  inline?: boolean // true = inline mic icon, false = global floating pill
}

export default function VoiceCapture({ onTranscript, inline = false }: VoiceCaptureProps) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const maxTimerRef = useRef<NodeJS.Timeout | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const speechSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current)
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    setListening(false)
  }, [])

  const cancelListening = useCallback(() => {
    stopListening()
    setTranscript('')
    setInterimText('')
  }, [stopListening])

  const commitTranscript = useCallback(() => {
    const final = (transcript + ' ' + interimText).trim()
    if (final) onTranscript(final)
    stopListening()
    setTranscript('')
    setInterimText('')
  }, [transcript, interimText, onTranscript, stopListening])

  const startListening = useCallback(() => {
    if (!speechSupported || listening) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = ''
      let interim = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }
      setTranscript(final.trim())
      setInterimText(interim)

      // Reset silence timer on speech activity
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = setTimeout(() => {
        // Auto-stop after silence
        stopListening()
      }, SILENCE_TIMEOUT_MS)
    }

    recognition.onerror = () => {
      stopListening()
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognition.start()
    recognitionRef.current = recognition
    setListening(true)
    setTranscript('')
    setInterimText('')

    // Max duration timer
    maxTimerRef.current = setTimeout(() => {
      stopListening()
    }, MAX_DURATION_MS)

    // Silence timer
    silenceTimerRef.current = setTimeout(() => {
      stopListening()
    }, SILENCE_TIMEOUT_MS)
  }, [speechSupported, listening, stopListening])

  // When listening stops with text, commit
  useEffect(() => {
    if (!listening && (transcript || interimText)) {
      const final = (transcript + ' ' + interimText).trim()
      if (final) onTranscript(final)
      setTranscript('')
      setInterimText('')
    }
  }, [listening, transcript, interimText, onTranscript])

  // Global shortcut: Ctrl+Shift+V
  useEffect(() => {
    if (inline) return // only register global shortcut once
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault()
        if (listening) {
          commitTranscript()
        } else {
          startListening()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [inline, listening, startListening, commitTranscript])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop()
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    }
  }, [])

  if (!speechSupported) return null

  // Inline mode: just the mic icon button
  if (inline && !listening) {
    return (
      <button
        className="btn-icon"
        onClick={startListening}
        title="Voice input (Ctrl+Shift+V)"
        style={{ width: 28, height: 28 }}
      >
        <Mic size={14} style={{ color: 'var(--text-3)' }} />
      </button>
    )
  }

  // Recording pill (shown when listening)
  return (
    <AnimatePresence>
      {listening && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={snappy}
          style={{
            position: inline ? 'relative' : 'fixed',
            bottom: inline ? 'auto' : 80,
            left: inline ? 'auto' : '50%',
            transform: inline ? 'none' : 'translateX(-50%)',
            zIndex: inline ? 1 : 9000,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            borderRadius: 9999,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: inline ? 'none' : '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          {/* Waveform animation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{ height: [4, 16, 4] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
                style={{
                  width: 3,
                  background: 'var(--color-danger)',
                  borderRadius: 2,
                }}
              />
            ))}
          </div>

          {/* Live transcript */}
          <span style={{ fontSize: 13, color: 'var(--text-1)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {transcript || interimText || 'Listening...'}
          </span>

          {/* Stop */}
          <button
            className="btn-icon"
            onClick={commitTranscript}
            style={{ width: 28, height: 28, background: 'var(--color-danger)', borderRadius: '50%', color: '#fff' }}
            title="Stop recording"
          >
            <Square size={12} />
          </button>

          {/* Cancel */}
          <button
            className="btn-icon"
            onClick={cancelListening}
            style={{ width: 28, height: 28 }}
            title="Cancel"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
