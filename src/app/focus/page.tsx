import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { buttonPress } from '@/lib/motion'
import { ArrowLeft, Plus, Settings, BarChart3, MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TimerDisplay from '@/components/focus/TimerDisplay'
import TimerControls from '@/components/focus/TimerControls'
import ModeSelector from '@/components/focus/ModeSelector'
import TargetSelector from '@/components/focus/TargetSelector'
import OverviewPanel from '@/components/focus/OverviewPanel'
import RecordTimeline from '@/components/focus/RecordTimeline'
import AddRecordModal, { type AddRecordFormData } from '@/components/focus/AddRecordModal'
import { useFocusTimer, type TimerMode } from '@/hooks/useFocusTimer'
import { useFocusDashboard, useRefreshDashboard, useInfiniteFocusRecords } from '@/hooks/useFocusDashboard'
import { useAddFocusRecord } from '@/hooks/useAddFocusRecord'
import { useFocusSettings, secondsToMinutes } from '@/hooks/useFocusSettings'
import type { SelectedTarget } from '@/hooks/useFocusTargets'
import { env } from '@/config/env'
import { trackEvent } from '@/lib/analytics'
import './focus.css'

const API_BASE = env.VITE_API_URL

export default function FocusPage() {
  const navigate = useNavigate()
  const { data: dashboard, isLoading: isLoadingDashboard } = useFocusDashboard()
  const { data: settings } = useFocusSettings()
  const { data: recordsData, loadMore, isLoading: isLoadingRecords } = useInfiniteFocusRecords()
  const addRecordMutation = useAddFocusRecord()
  const refreshDashboard = useRefreshDashboard()

  const [mode, setMode] = useState<TimerMode>('POMO')
  const [activeDurationSeconds, setActiveDurationSeconds] = useState<number | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget | null>(null)
  const [intention, setIntention] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const sessionIdRef = useRef<string | null>(null)

  const pomoDuration = activeDurationSeconds ?? settings?.pomoDurationSeconds ?? 1500

  const handleComplete = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/focus/sessions/active/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        credentials: 'include',
        body: JSON.stringify({ postSessionNote: intention.trim() || undefined }),
      })

      if (!response.ok) throw new Error('Failed to complete focus session')

      sessionIdRef.current = null
      setActiveDurationSeconds(null)
      setIntention('')
      setStatusMessage(mode === 'POMO' ? 'Session complete. Take a real reset.' : 'Session recorded.')
      refreshDashboard()
      if (mode === 'POMO') trackEvent('first_focus_session')

      if (mode === 'POMO' && settings?.soundEnabled !== false) playCompletionSound()
      if (mode === 'POMO' && settings?.notificationsEnabled !== false) showNotification()
    } catch (error) {
      console.error('Failed to complete session:', error)
      setStatusMessage('Could not save this session. Please try again.')
    }
  }, [mode, intention, settings, refreshDashboard])

  const timer = useFocusTimer({
    mode,
    durationSeconds: mode === 'POMO' ? pomoDuration : 0,
    onComplete: () => { void handleComplete() },
  })
  const { reset: resetTimer, restore: restoreTimer } = timer

  const updateSession = useCallback(async (action: 'pause' | 'resume' | 'cancel') => {
    const sessionId = sessionIdRef.current
    if (!sessionId) return

    const response = await fetch(`${API_BASE}/api/focus/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action,
        ...(action === 'cancel' ? { endedReason: 'user_cancelled' } : {}),
      }),
    })
    if (!response.ok) throw new Error(`Failed to ${action} focus session`)
    if (action === 'cancel') sessionIdRef.current = null
  }, [])

  const handleStart = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/focus/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode,
          targetType: selectedTarget?.type || 'NONE',
          targetId: selectedTarget?.id || null,
          taskTitle: selectedTarget?.title || undefined,
          plannedDurationMin: mode === 'POMO' ? secondsToMinutes(pomoDuration) : undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to start focus session')

      const session = await response.json()
      sessionIdRef.current = session._id
      if (mode === 'POMO') setActiveDurationSeconds(pomoDuration)
      timer.start()
      setStatusMessage('')
    } catch (error) {
      console.error('Failed to start session:', error)
      setStatusMessage('Could not start a session. Please try again.')
    }
  }, [mode, selectedTarget, pomoDuration, timer])

  const handleFinish = useCallback(() => timer.finish(), [timer])

  const handlePause = useCallback(() => {
    timer.pause()
    void updateSession('pause').catch((error) => console.error(error))
  }, [timer, updateSession])

  const handleResume = useCallback(() => {
    timer.resume()
    void updateSession('resume').catch((error) => console.error(error))
  }, [timer, updateSession])

  const handleReset = useCallback(() => {
    timer.reset()
    setActiveDurationSeconds(null)
    void updateSession('cancel').catch((error) => console.error(error))
  }, [timer, updateSession])

  const handleModeChange = useCallback((nextMode: TimerMode) => {
    setActiveDurationSeconds(null)
    setMode(nextMode)
  }, [])

  const handleAddRecord = useCallback((data: AddRecordFormData) => {
    addRecordMutation.mutate(data, {
      onSuccess: () => {
        setShowAddModal(false)
        setStatusMessage('Record added.')
        setTimeout(() => setStatusMessage(''), 3000)
      },
    })
  }, [addRecordMutation])

  useEffect(() => {
    if (!dashboard?.activeSession) return

    const session = dashboard.activeSession
    sessionIdRef.current = session._id
    setMode(session.mode as TimerMode)

    const endedForElapsedAt = session.pausedAt ? new Date(session.pausedAt).getTime() : Date.now()
    const elapsedSeconds = Math.max(0, Math.floor(
      (endedForElapsedAt - new Date(session.startedAt).getTime() - (session.totalPausedMs || 0)) / 1000,
    ))
    const plannedSeconds = ((session.plannedDurationMin || 25) + (session.extendedByMin || 0)) * 60
    setActiveDurationSeconds(session.mode === 'POMO' ? plannedSeconds : null)

    if (session.mode === 'POMO' && elapsedSeconds >= plannedSeconds) {
      resetTimer()
      void handleComplete()
    } else {
      restoreTimer(elapsedSeconds, session.pausedAt ? 'PAUSED' : 'RUNNING')
    }

    if (session.targetType && session.targetType !== 'NONE') {
      setSelectedTarget({
        type: session.targetType,
        id: session.taskId || session.habitId || undefined,
        title: session.taskTitleSnapshot || undefined,
      })
    }
  }, [dashboard?.activeSession, handleComplete, resetTimer, restoreTimer])

  const overview = dashboard?.overview || {
    todayPomo: 0,
    todayFocusSeconds: 0,
    totalPomo: 0,
    totalFocusSeconds: 0,
  }

  return (
    <div className="focus-shell">
      {isLoadingDashboard && (
        <div className="focus-loading" role="status">
          <div className="focus-spinner" />
          <span>Loading focus…</span>
        </div>
      )}

      <section className="focus-primary" aria-label="Focus timer">
        <header className="focus-header">
          <h1 className="focus-title">Pomodoro</h1>

          <div className="focus-mode-slot">
            <ModeSelector mode={mode} status={timer.status} onChange={handleModeChange} />
          </div>

          <div className="focus-header-actions">
            <motion.button
              {...buttonPress}
              type="button"
              onClick={() => setShowAddModal(true)}
              aria-label="Add focus record"
              className="focus-icon-button"
            >
              <Plus size={17} />
            </motion.button>

            <div className="relative">
              <motion.button
                {...buttonPress}
                type="button"
                onClick={() => setShowMenu((open) => !open)}
                aria-label="More options"
                aria-expanded={showMenu}
                className="focus-icon-button"
              >
                <MoreHorizontal size={18} />
              </motion.button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="focus-dropdown absolute right-0 top-full z-50 mt-2 min-w-[240px] overflow-hidden rounded-xl"
                >
                  <MenuButton icon={<BarChart3 size={15} />} onClick={() => navigate('/focus/statistics')}>
                    Statistics
                  </MenuButton>
                  <MenuButton icon={<Settings size={15} />} onClick={() => navigate('/focus/settings')}>
                    Focus settings
                  </MenuButton>
                  <MenuButton icon={<ArrowLeft size={15} />} onClick={() => navigate('/')}>
                    Back to app
                  </MenuButton>
                  <div className="focus-note-block">
                    <label htmlFor="focus-intention">Session note</label>
                    <input
                      id="focus-intention"
                      value={intention}
                      onChange={(event) => setIntention(event.target.value)}
                      placeholder="What are you focusing on?"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        <main className="focus-stage">
          <div className="focus-target-wrap">
            <TargetSelector
              selected={selectedTarget}
              onSelect={setSelectedTarget}
              onClear={() => setSelectedTarget(null)}
              disabled={timer.status !== 'IDLE'}
              variant="minimal"
            />
          </div>

          <TimerDisplay
            mode={mode}
            remainingSeconds={timer.remainingSeconds}
            elapsedSeconds={timer.elapsedSeconds}
            status={timer.status}
            progress={timer.progress}
          />

          <div className="focus-timer-controls">
            <TimerControls
              status={timer.status}
              mode={mode}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onFinish={handleFinish}
              onReset={handleReset}
            />
          </div>

          {statusMessage && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              aria-live="polite"
              className="focus-status-message"
            >
              {statusMessage}
            </motion.p>
          )}
        </main>
      </section>

      <aside className="focus-insights" aria-label="Focus overview and records">
        <div className="focus-overview-section">
          <OverviewPanel overview={overview} />
        </div>

        <section className="focus-history-section">
          <div className="focus-history-header">
            <h2 className="focus-panel-heading">Focus Record</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="focus-icon-button"
                aria-label="Add focus record"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/focus/statistics')}
                className="focus-icon-button"
                aria-label="View focus statistics"
              >
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>

          <RecordTimeline
            records={recordsData?.records || []}
            onLoadMore={loadMore}
            hasMore={recordsData?.hasMore || false}
            isLoading={isLoadingRecords}
          />
        </section>
      </aside>

      <AddRecordModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRecord}
        isSubmitting={addRecordMutation.isPending}
      />

      {showMenu && <button className="focus-menu-backdrop" onClick={() => setShowMenu(false)} aria-label="Close menu" />}
    </div>
  )
}

interface MenuButtonProps {
  icon: ReactNode
  children: ReactNode
  onClick: () => void
}

function MenuButton({ icon, children, onClick }: MenuButtonProps) {
  return (
    <button type="button" onClick={onClick} className="focus-menu-item">
      {icon}
      <span>{children}</span>
    </button>
  )
}

function playCompletionSound() {
  try {
    const context = new AudioContext()
    const notes = [523, 659, 784]

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const start = context.currentTime + index * 0.1

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, start)
      gain.gain.setValueAtTime(0.12, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.24)
    })

    window.setTimeout(() => context.close(), 900)
  } catch {
    // Sound is a progressive enhancement.
  }
}

function showNotification() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

  try {
    new Notification('Life OS', { body: 'Focus session complete.' })
  } catch {
    // Notifications are optional.
  }
}
