'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, X } from 'lucide-react'
import { fadeSlideUp, buttonPress, ease } from '@/lib/motion'

interface VoiceCaptureProps {
  onTranscript: (text: string) => void
  inline?: boolean
}

const MAX_DURATION_MS = 120000 // 2 min
const SILENCE_TIMEOUT_MS = 60000 // 60s silence

export default function VoiceCapture({
  onTranscript,
  inline = false,
}: VoiceCaptureProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasShownTooltip = useRef(false)

  const cleanup = useCallback(() => {
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current)
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Already stopped
      }
    }
    recognitionRef.current = null
  }, [])

  const stopRecording = useCallback(
    (submit: boolean) => {
      cleanup()
      if (submit && transcript.trim()) {
        onTranscript(transcript.trim())
      }
      setIsRecording(false)
      setTranscript('')
    },
    [cleanup, onTranscript, transcript]
  )

  const startRecording = useCallback(() => {
    const SpeechRecognitionCtor =
      (window as Window & typeof globalThis).SpeechRecognition ||
      (window as Window & typeof globalThis).webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let text = ''
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript
      }
      setTranscript(text)

      // Reset silence timer on new results
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = setTimeout(() => {
        stopRecording(true)
      }, SILENCE_TIMEOUT_MS)
    }

    recognition.onerror = () => {
      stopRecording(false)
    }

    recognition.onend = () => {
      // Auto-restart unless explicitly stopped
      if (recognitionRef.current === recognition) {
        setIsRecording(false)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    setTranscript('')

    // Max duration timer
    maxTimerRef.current = setTimeout(() => {
      stopRecording(true)
    }, MAX_DURATION_MS)

    // Silence timer
    silenceTimerRef.current = setTimeout(() => {
      stopRecording(true)
    }, SILENCE_TIMEOUT_MS)
  }, [stopRecording])

  // Global shortcut: Ctrl+Shift+V
  useEffect(() => {
    function handleGlobalShortcut(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault()
        if (isRecording) {
          stopRecording(true)
        } else {
          startRecording()
        }
      }
    }
    window.addEventListener('keydown', handleGlobalShortcut)
    return () => window.removeEventListener('keydown', handleGlobalShortcut)
  }, [isRecording, startRecording, stopRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  return (
    <div className="relative inline-flex items-center">
      {/* Mic button */}
      {!isRecording && (
        <div
          className="relative"
          onMouseEnter={() => {
            if (!hasShownTooltip.current) {
              setShowTooltip(true)
              hasShownTooltip.current = true
            }
          }}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <motion.button
            {...buttonPress}
            onClick={startRecording}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-faint)'
            }}
          >
            <Mic size={15} strokeWidth={1.5} />
          </motion.button>

          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                {...fadeSlideUp}
                transition={ease.fast}
                className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-medium"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                Click to add a task by voice
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Recording pill */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            {...fadeSlideUp}
            transition={ease.fast}
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--accent)',
            }}
          >
            {/* Waveform indicator */}
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                  animate={{
                    height: [4, 12, 4],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Live transcript */}
            <span
              className="max-w-[200px] truncate text-xs"
              style={{ color: 'var(--text-primary)' }}
            >
              {transcript || 'Listening...'}
            </span>

            {/* Stop button */}
            <motion.button
              {...buttonPress}
              onClick={() => stopRecording(true)}
              className="flex h-5 w-5 items-center justify-center rounded-full cursor-pointer"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Square size={8} strokeWidth={2} className="text-white" />
            </motion.button>

            {/* Cancel button */}
            <motion.button
              {...buttonPress}
              onClick={() => stopRecording(false)}
              className="flex h-5 w-5 items-center justify-center rounded-full cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-faint)'
              }}
            >
              <X size={10} strokeWidth={2} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
