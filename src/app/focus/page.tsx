'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pause, Play, SkipForward, Maximize, CloudRain,
  Music, StickyNote, Clock, X, Volume2, Timer,
} from 'lucide-react'
import { motionTokens } from '@/lib/motion'

// ── Scenes ──
const SCENES = [
  { id: 'mountains', label: 'Mountains', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&h=1080&fit=crop' },
  { id: 'ocean', label: 'Ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop' },
  { id: 'forest', label: 'Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&h=1080&fit=crop' },
  { id: 'night', label: 'Night Sky', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&h=1080&fit=crop' },
  { id: 'desert', label: 'Desert', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&h=1080&fit=crop' },
  { id: 'rain', label: 'Rainy City', url: 'https://images.unsplash.com/photo-1501999635878-71cb5379c2d6?w=1920&h=1080&fit=crop' },
]

// ── Ambient sounds ──
const SOUNDS = [
  { emoji: '🌧️', label: 'Rain' }, { emoji: '🐦', label: 'Birds' },
  { emoji: '🫧', label: 'Bubbles' }, { emoji: '🔥', label: 'Fire' },
  { emoji: '🌊', label: 'Waves' }, { emoji: '⚡', label: 'Thunder' },
  { emoji: '💨', label: 'Wind' }, { emoji: '☕', label: 'Café' },
  { emoji: '🌘', label: 'Night' }, { emoji: '✏️', label: 'Pencil' },
  { emoji: '⌨️', label: 'Keyboard' }, { emoji: '🚂', label: 'Train' },
]

// ── Sound frequency configs for Web Audio API ──
const SOUND_CONFIGS: Record<string, { freq: number; type: OscillatorType; gain: number }> = {
  Rain:     { freq: 200, type: 'triangle', gain: 0.04 },
  Birds:    { freq: 800, type: 'sine',     gain: 0.03 },
  Bubbles:  { freq: 400, type: 'sine',     gain: 0.03 },
  Fire:     { freq: 150, type: 'triangle', gain: 0.04 },
  Waves:    { freq: 180, type: 'sine',     gain: 0.05 },
  Thunder:  { freq: 100, type: 'triangle', gain: 0.05 },
  Wind:     { freq: 250, type: 'triangle', gain: 0.04 },
  'Café':   { freq: 350, type: 'sine',     gain: 0.03 },
  Night:    { freq: 120, type: 'sine',     gain: 0.03 },
  Pencil:   { freq: 600, type: 'triangle', gain: 0.03 },
  Keyboard: { freq: 500, type: 'square',   gain: 0.02 },
  Train:    { freq: 160, type: 'triangle', gain: 0.04 },
}

// ── Quotes ──
const QUOTES = [
  'Push yourself, because no one else is going to do it for you.',
  'Great things never come from comfort zones.',
  'The secret of getting ahead is getting started.',
  'Focus on being productive instead of busy.',
  "Don't watch the clock; do what it does. Keep going.",
  "It always seems impossible until it's done.",
]

// ── Presets ──
const PRESETS = [
  { name: 'Classic Pomodoro', focus: 25, short: 5, long: 15 },
  { name: 'Extended Focus', focus: 50, short: 10, long: 30 },
  { name: 'Quick Sessions', focus: 15, short: 3, long: 10 },
  { name: 'Deep Work', focus: 90, short: 15, long: 45 },
]

// ── Tags ──
const TAGS = ['Study', 'Work', 'Exercise', 'Reading', 'Creative', 'Personal']

type Mode = 'focus' | 'shortBreak' | 'longBreak'

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/** Play a pleasant ascending completion tone via Web Audio API */
function playCompletionSound() {
  try {
    const ctx = new AudioContext()
    const notes = [
      { freq: 523, startAt: 0, dur: 0.1 },    // C5
      { freq: 659, startAt: 0.1, dur: 0.1 },   // E5
      { freq: 784, startAt: 0.2, dur: 0.2 },   // G5
    ]
    notes.forEach(({ freq, startAt, dur }) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt)
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime + startAt)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startAt + dur)
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      osc.start(ctx.currentTime + startAt)
      osc.stop(ctx.currentTime + startAt + dur + 0.05)
    })
    setTimeout(() => ctx.close(), 1000)
  } catch {
    // Web Audio API not available
  }
}

export default function FocusPage() {
  // Timer state
  const [mode, setMode] = useState<Mode>('focus')
  const [preset, setPreset] = useState(PRESETS[0])
  const [remaining, setRemaining] = useState(25 * 60)
  const [total, setTotal] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [taskInput, setTaskInput] = useState('')
  const [focusCount, setFocusCount] = useState(0)

  // Timer mode: pomodoro (countdown) or stopwatch (count up)
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const stopwatchStartRef = useRef(0)
  const [completedSessions, setCompletedSessions] = useState<{ duration: number; completedAt: Date }[]>([])

  // UI state
  const [scene, setScene] = useState(SCENES[0])
  const [showSounds, setShowSounds] = useState(false)
  const [showScenes, setShowScenes] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set())
  const [autoStart, setAutoStart] = useState(false)
  const [autoStartMsg, setAutoStartMsg] = useState('')
  const [quote, setQuote] = useState(QUOTES[0])
  const [now, setNow] = useState<Date | null>(null)

  // Timer refs
  const startTimeRef = useRef(0)
  const pausedAtRef = useRef(0)
  const targetRef = useRef(25 * 60)
  const rafRef = useRef(0)
  const prevRemainingRef = useRef(remaining)
  const oscillatorsRef = useRef<Map<string, { osc: OscillatorNode; gain: GainNode; ctx: AudioContext }>>(new Map())
  const notifPermissionRef = useRef(false)

  // Live clock + random quote (client-only to avoid hydration mismatch)
  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Browser tab title
  useEffect(() => {
    if (timerMode === 'stopwatch') {
      document.title = isRunning ? `${formatTime(elapsedSeconds)} — Stopwatch` : 'LAIF Focus'
    } else {
      const label = mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'
      document.title = isRunning ? `${formatTime(remaining)} — ${label}` : 'LAIF Focus'
    }
    return () => { document.title = 'LAIF' }
  }, [remaining, isRunning, mode, timerMode, elapsedSeconds])

  // rAF tick
  const tick = useCallback(() => {
    if (timerMode === 'stopwatch') {
      const elapsed = (performance.now() - stopwatchStartRef.current) / 1000
      setElapsedSeconds(Math.floor(elapsed))
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    const elapsed = (performance.now() - startTimeRef.current) / 1000
    const r = Math.max(0, targetRef.current - elapsed)
    const rounded = Math.ceil(r)
    setRemaining(rounded)

    if (r <= 0) {
      setIsRunning(false)
      setIsPaused(false)
      if (mode === 'focus') {
        setFocusCount(c => c + 1)
        setCompletedSessions(prev => [...prev, { duration: targetRef.current, completedAt: new Date() }])
      }
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [mode, timerMode])

  const start = useCallback(() => {
    if (timerMode === 'stopwatch') {
      stopwatchStartRef.current = performance.now()
      setElapsedSeconds(0)
      setIsRunning(true)
      setIsPaused(false)
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(tick)
      return
    }
    const dur = mode === 'focus' ? preset.focus * 60 : mode === 'shortBreak' ? preset.short * 60 : preset.long * 60
    targetRef.current = dur
    startTimeRef.current = performance.now()
    setTotal(dur)
    setRemaining(dur)
    setIsRunning(true)
    setIsPaused(false)
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
  }, [mode, preset, tick, timerMode])

  const pause = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    pausedAtRef.current = performance.now()
    setIsPaused(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerMode])

  const resume = useCallback(() => {
    const pauseDuration = performance.now() - pausedAtRef.current
    if (timerMode === 'stopwatch') {
      stopwatchStartRef.current += pauseDuration
    } else {
      startTimeRef.current += pauseDuration
    }
    setIsPaused(false)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick, timerMode])

  const extend = useCallback((mins: number) => {
    targetRef.current += mins * 60
    setTotal(t => t + mins * 60)
  }, [])

  const skip = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setIsRunning(false)
    setIsPaused(false)
    if (mode === 'focus') {
      setMode(focusCount > 0 && focusCount % 4 === 3 ? 'longBreak' : 'shortBreak')
    } else {
      setMode('focus')
    }
  }, [mode, focusCount])

  const switchMode = useCallback((m: Mode) => {
    cancelAnimationFrame(rafRef.current)
    setMode(m)
    setIsRunning(false)
    setIsPaused(false)
    const dur = m === 'focus' ? preset.focus * 60 : m === 'shortBreak' ? preset.short * 60 : preset.long * 60
    setRemaining(dur)
    setTotal(dur)
  }, [preset])

  const toggleSound = useCallback((label: string) => {
    setActiveSounds(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label); else next.add(label)
      return next
    })
  }, [])

  useEffect(() => { return () => cancelAnimationFrame(rafRef.current) }, [])

  // ── Ambient sound playback via Web Audio API ──
  useEffect(() => {
    const map = oscillatorsRef.current
    // Start oscillators for newly active sounds
    activeSounds.forEach(label => {
      if (!map.has(label)) {
        const config = SOUND_CONFIGS[label] || { freq: 300, type: 'sine' as OscillatorType, gain: 0.03 }
        try {
          const ctx = new AudioContext()
          const osc = ctx.createOscillator()
          const gainNode = ctx.createGain()
          osc.type = config.type
          osc.frequency.setValueAtTime(config.freq, ctx.currentTime)
          // Slow frequency drift for organic ambient feel
          osc.frequency.linearRampToValueAtTime(config.freq * 1.02, ctx.currentTime + 2)
          osc.frequency.linearRampToValueAtTime(config.freq * 0.98, ctx.currentTime + 4)
          osc.frequency.setValueAtTime(config.freq, ctx.currentTime + 6)
          gainNode.gain.setValueAtTime(config.gain, ctx.currentTime)
          osc.connect(gainNode)
          gainNode.connect(ctx.destination)
          osc.start()
          map.set(label, { osc, gain: gainNode, ctx })
        } catch {
          // Web Audio API not available
        }
      }
    })
    // Stop oscillators for deactivated sounds
    map.forEach((entry, label) => {
      if (!activeSounds.has(label)) {
        try {
          entry.osc.stop()
          entry.osc.disconnect()
          entry.gain.disconnect()
          entry.ctx.close()
        } catch {
          // already stopped
        }
        map.delete(label)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSounds])

  // Cleanup all oscillators on unmount
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(entry => {
        try {
          entry.osc.stop()
          entry.osc.disconnect()
          entry.gain.disconnect()
          entry.ctx.close()
        } catch {
          // noop
        }
      })
      oscillatorsRef.current.clear()
    }
  }, [])

  // ── Timer completion: notification sound + browser notification + auto-start ──
  useEffect(() => {
    const prev = prevRemainingRef.current
    prevRemainingRef.current = remaining

    // Detect the tick where remaining just hit 0 (prev was positive, timer just stopped)
    if (prev > 0 && remaining === 0 && !isRunning) {
      // Play ascending completion tone
      playCompletionSound()

      // Browser notification
      if (notifPermissionRef.current) {
        const modeLabel = mode === 'focus' ? 'Focus session' : mode === 'shortBreak' ? 'Short break' : 'Long break'
        try {
          new Notification('LAIF Focus', { body: `${modeLabel} complete!` })
        } catch {
          // Notification not available
        }
      }

      // Auto-start next session after 3 seconds
      if (autoStart) {
        setAutoStartMsg('Starting next session...')
        const nextMode: Mode = mode === 'focus'
          ? (focusCount > 0 && focusCount % 4 === 0 ? 'longBreak' : 'shortBreak')
          : 'focus'
        const timer = setTimeout(() => {
          setAutoStartMsg('')
          setMode(nextMode)
          // Start the new session after mode switch settles
          setTimeout(() => {
            const dur = nextMode === 'focus' ? preset.focus * 60 : nextMode === 'shortBreak' ? preset.short * 60 : preset.long * 60
            targetRef.current = dur
            startTimeRef.current = performance.now()
            setTotal(dur)
            setRemaining(dur)
            setIsRunning(true)
            setIsPaused(false)
            cancelAnimationFrame(rafRef.current)
            rafRef.current = requestAnimationFrame(tick)
          }, 50)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, isRunning])

  // Request notification permission on first timer start
  const startWithNotifPermission = useCallback(() => {
    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(p => {
          notifPermissionRef.current = p === 'granted'
        })
      } else if (Notification.permission === 'granted') {
        notifPermissionRef.current = true
      }
    }
    start()
  }, [start])

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === ' ') {
        e.preventDefault()
        if (isRunning) {
          if (isPaused) resume(); else pause()
        } else {
          startWithNotifPermission()
        }
      }
      if (e.key === 'Escape') {
        cancelAnimationFrame(rafRef.current)
        setIsRunning(false)
        setIsPaused(false)
        if (timerMode === 'stopwatch') setElapsedSeconds(0)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isRunning, isPaused, startWithNotifPermission, pause, resume, timerMode])

  const progress = total > 0 ? (total - remaining) / total : 0

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#fff', overflow: 'hidden',
    }}>
      {/* Background scene */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${scene.url})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        transition: 'background-image 1s ease',
      }} />
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />

      {/* Progress bar (top) */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 10 }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          backgroundColor: mode === 'focus' ? '#34d399' : '#60a5fa',
          transition: 'width 1s linear',
        }} />
      </div>

      {/* Top bar */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', padding: '20px 28px' }}>
        <p style={{ fontSize: 14, fontWeight: 500, maxWidth: 300, lineHeight: 1.5, opacity: 0.8 }}>
          {quote}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.8 }}>
            {now ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </span>
          <button
            onClick={() => document.documentElement.requestFullscreen?.()}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6 }}
          >
            <Maximize size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => window.history.back()}
            style={{
              background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6,
              display: 'flex',
            }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Center: Timer */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 10, gap: 16,
      }}>
        {/* Timer mode toggle */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12, padding: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
          <button
            onClick={() => { if (isRunning) return; setTimerMode('pomodoro') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 999, cursor: isRunning ? 'default' : 'pointer',
              border: 'none', fontSize: 13, fontWeight: 600,
              fontFamily: 'Inter, system-ui, sans-serif',
              backgroundColor: timerMode === 'pomodoro' ? 'rgba(255,255,255,0.9)' : 'transparent',
              color: timerMode === 'pomodoro' ? '#1a1a1a' : 'rgba(255,255,255,0.6)',
              transition: 'background-color 200ms ease, color 200ms ease, transform 200ms ease',
            }}
          >
            <Clock size={14} strokeWidth={2} />
            Focus Timer
          </button>
          <button
            onClick={() => { if (isRunning) return; setTimerMode('stopwatch'); cancelAnimationFrame(rafRef.current); setIsRunning(false); setIsPaused(false); setElapsedSeconds(0) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 999, cursor: isRunning ? 'default' : 'pointer',
              border: 'none', fontSize: 13, fontWeight: 600,
              fontFamily: 'Inter, system-ui, sans-serif',
              backgroundColor: timerMode === 'stopwatch' ? 'rgba(255,255,255,0.9)' : 'transparent',
              color: timerMode === 'stopwatch' ? '#1a1a1a' : 'rgba(255,255,255,0.6)',
              transition: 'background-color 200ms ease, color 200ms ease, transform 200ms ease',
            }}
          >
            <Timer size={14} strokeWidth={2} />
            Stopwatch
          </button>
        </div>

        {/* Mode dots (pomodoro only) */}
        {timerMode === 'pomodoro' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          {(['focus', 'shortBreak', 'longBreak'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                width: 12, height: 12, borderRadius: '50%', cursor: 'pointer',
                border: 'none',
                backgroundColor: mode === m ? '#fff' : 'rgba(255,255,255,0.35)',
                transition: 'background-color 200ms ease',
              }}
            />
          ))}
        </div>
        )}

        {/* Timer display */}
        <motion.div
          key={timerMode === 'stopwatch' ? elapsedSeconds : remaining}
          style={{
            fontSize: 'clamp(80px, 15vw, 160px)',
            fontWeight: 800, letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 4px 40px rgba(0,0,0,0.3)',
            lineHeight: 1,
          }}
        >
          {timerMode === 'stopwatch' ? formatTime(elapsedSeconds) : formatTime(remaining)}
        </motion.div>

        {/* Auto-start message */}
        <AnimatePresence>
          {autoStartMsg && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                fontSize: 14, fontWeight: 600,
                color: '#34d399',
                textShadow: '0 2px 12px rgba(0,0,0,0.3)',
              }}
            >
              {autoStartMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Extend buttons (pomodoro only) */}
        {isRunning && timerMode === 'pomodoro' && (
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 5, 10].map(n => (
              <button
                key={n}
                onClick={() => extend(n)}
                style={{
                  padding: '4px 12px', borderRadius: 999, cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)' }}
              >
                +{n}
              </button>
            ))}
          </div>
        )}

        {/* Task input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <input
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
            placeholder="What are you working on?"
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 500,
              fontFamily: 'Inter, system-ui, sans-serif',
              textAlign: 'center', width: 260,
            }}
          />
        </div>
      </div>

      {/* Session stats strip */}
      {completedSessions.length > 0 && (
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 24, padding: '0 28px 12px',
        }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>
            Sessions today: {completedSessions.length}
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>
            Total focus: {(() => {
              const totalSec = completedSessions.reduce((sum, s) => sum + s.duration, 0)
              const h = Math.floor(totalSec / 3600)
              const m = Math.floor((totalSec % 3600) / 60)
              return h > 0 ? `${h}h ${m}m` : `${m}m`
            })()}
          </span>
        </div>
      )}

      {/* Bottom controls */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 28px 28px', gap: 12,
      }}>
        {/* Left: ambient tools */}
        <div style={{ position: 'absolute', left: 28, bottom: 28, display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowSounds(!showSounds)}
            style={{
              width: 40, height: 40, borderRadius: '50%', cursor: 'pointer',
              backgroundColor: showSounds ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 180ms ease-out',
            }}
          >
            <CloudRain size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setShowScenes(!showScenes)}
            style={{
              width: 40, height: 40, borderRadius: '50%', cursor: 'pointer',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 180ms ease-out',
            }}
          >
            <Music size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Right: auto-start toggle */}
        <div style={{ position: 'absolute', right: 28, bottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.6 }}>Auto-start</span>
          <button
            onClick={() => setAutoStart(prev => !prev)}
            style={{
              width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
              backgroundColor: autoStart ? '#34d399' : 'rgba(255,255,255,0.15)',
              border: 'none', position: 'relative',
              transition: 'background-color 200ms ease',
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              backgroundColor: '#fff',
              position: 'absolute', top: 3,
              left: autoStart ? 21 : 3,
              transition: 'left 200ms ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>

        {/* Center: main controls */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            if (!isRunning) startWithNotifPermission()
            else if (isPaused) resume()
            else pause()
          }}
          style={{
            padding: '14px 48px', borderRadius: 999, cursor: 'pointer',
            backgroundColor: 'rgba(255,255,255,0.95)', color: '#1a1a1a',
            fontSize: 16, fontWeight: 700, border: 'none',
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            transition: 'transform 100ms ease',
          }}
        >
          {!isRunning ? 'Start' : isPaused ? 'Resume' : 'Pause'}
        </motion.button>

        {isRunning && timerMode === 'pomodoro' && (
          <button
            onClick={skip}
            style={{
              width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
              backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 180ms ease-out',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)' }}
          >
            <SkipForward size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Ambient sounds panel */}
      <AnimatePresence>
        {showSounds && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: motionTokens.duration.normal }}
            style={{
              position: 'absolute', left: 28, bottom: 80, zIndex: 20,
              width: 320, padding: 20, borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>White Noises</h3>
              <button onClick={() => setShowSounds(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {SOUNDS.map(s => {
                const active = activeSounds.has(s.label)
                return (
                  <button
                    key={s.label}
                    onClick={() => toggleSound(s.label)}
                    title={s.label}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      padding: 10, borderRadius: 12, cursor: 'pointer',
                      backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                      border: active ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                      transition: 'background-color 150ms ease, border-color 150ms ease',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <span style={{ fontSize: 28 }}>{s.emoji}</span>
                    <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 500 }}>{s.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene picker */}
      <AnimatePresence>
        {showScenes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: motionTokens.duration.normal }}
            style={{
              position: 'absolute', left: 80, bottom: 80, zIndex: 20,
              width: 340, padding: 20, borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Scenes</h3>
              <button onClick={() => setShowScenes(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {SCENES.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setScene(s); setShowScenes(false) }}
                  style={{
                    aspectRatio: '16/10', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                    backgroundImage: `url(${s.url})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    border: scene.id === s.id ? '2px solid #fff' : '2px solid transparent',
                    position: 'relative', transition: 'border-color 150ms ease',
                  }}
                >
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '16px 8px 6px', fontSize: 11, fontWeight: 600,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                    textAlign: 'center',
                  }}>
                    {s.label}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
