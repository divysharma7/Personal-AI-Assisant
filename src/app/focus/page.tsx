import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { fadeSlideUp, buttonPress, ease } from '@/lib/motion'
import { ArrowLeft, Maximize, Plus, Settings, BarChart3, MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LifeOSMark from '@/components/brand/LifeOSMark'
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

const API_BASE = env.VITE_API_URL

export default function FocusPage() {
  const navigate = useNavigate()

  // Data fetching
  const { data: dashboard, isLoading: isLoadingDashboard } = useFocusDashboard()
  const { data: settings } = useFocusSettings()
  const { data: recordsData, loadMore, hasMore, isLoading: isLoadingRecords } = useInfiniteFocusRecords()
  const addRecordMutation = useAddFocusRecord()
  const refreshDashboard = useRefreshDashboard()

  // Local state
  const [mode, setMode] = useState<TimerMode>('POMO')
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget | null>(null)
  const [intention, setIntention] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const sessionIdRef = useRef<string | null>(null)

  // Timer duration from settings
  const pomoDuration = settings?.pomoDurationSeconds || 1500

  // Handle timer completion
  const handleComplete = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/focus/sessions/active/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        credentials: 'include',
        body: JSON.stringify({
          postSessionNote: intention.trim() || undefined,
        }),
      })

      if (response.ok) {
        sessionIdRef.current = null
        setStatusMessage(mode === 'POMO'
          ? 'Session complete. Take a real reset.'
          : 'Session recorded.')
        refreshDashboard()
        if (mode === 'POMO') trackEvent('first_focus_session')

        // Play sound if enabled
        if (mode === 'POMO' && settings?.soundEnabled !== false) {
          playCompletionSound()
        }

        // Show notification if enabled
        if (mode === 'POMO' && settings?.notificationsEnabled !== false) {
          showNotification()
        }
      }
    } catch (err) {
      console.error('Failed to complete session:', err)
    }
  }, [mode, intention, settings, refreshDashboard])

  const timer = useFocusTimer({
    mode,
    durationSeconds: mode === 'POMO' ? pomoDuration : 0,
    onComplete: () => { void handleComplete() },
  })

  const updateSession = useCallback(async (
    action: 'pause' | 'resume' | 'cancel',
  ) => {
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

  // Start session
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

      if (response.ok) {
        const session = await response.json()
        sessionIdRef.current = session._id
        timer.start()
        setStatusMessage('')
      }
    } catch (err) {
      console.error('Failed to start session:', err)
    }
  }, [mode, selectedTarget, intention, pomoDuration, timer])

  // Finish stopwatch session
  const handleFinish = useCallback(() => {
    timer.finish()
  }, [timer])

  const handlePause = useCallback(() => {
    timer.pause()
    void updateSession('pause').catch((err) => console.error(err))
  }, [timer, updateSession])

  const handleResume = useCallback(() => {
    timer.resume()
    void updateSession('resume').catch((err) => console.error(err))
  }, [timer, updateSession])

  const handleReset = useCallback(() => {
    timer.reset()
    void updateSession('cancel').catch((err) => console.error(err))
  }, [timer, updateSession])

  // Add manual record
  const handleAddRecord = useCallback((data: AddRecordFormData) => {
    addRecordMutation.mutate(data, {
      onSuccess: () => {
        setShowAddModal(false)
        setStatusMessage('Record added.')
        setTimeout(() => setStatusMessage(''), 3000)
      },
    })
  }, [addRecordMutation])

  // Restore active session on mount
  useEffect(() => {
    if (dashboard?.activeSession) {
      const session = dashboard.activeSession
      sessionIdRef.current = session._id
      setMode(session.mode as TimerMode)

      const endedForElapsedAt = session.pausedAt
        ? new Date(session.pausedAt).getTime()
        : Date.now()
      const elapsedSeconds = Math.max(0, Math.floor(
        (endedForElapsedAt - new Date(session.startedAt).getTime() - (session.totalPausedMs || 0)) / 1000,
      ))
      const plannedSeconds = ((session.plannedDurationMin || 25) + (session.extendedByMin || 0)) * 60

      if (session.mode === 'POMO' && elapsedSeconds >= plannedSeconds) {
        timer.reset()
        void handleComplete()
      } else {
        timer.restore(elapsedSeconds, session.pausedAt ? 'PAUSED' : 'RUNNING')
      }

      if (session.taskTitleSnapshot) {
        setIntention(session.taskTitleSnapshot)
      }

      if (session.targetType && session.targetType !== 'NONE') {
        setSelectedTarget({
          type: session.targetType,
          id: session.taskId || session.habitId || undefined,
          title: session.taskTitleSnapshot || undefined,
        })
      }
    }
  }, [dashboard?.activeSession, handleComplete, timer.reset, timer.restore])

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
    >
      {/* Loading State */}
      {isLoadingDashboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-canvas)' }}>
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-8 w-8 animate-spin rounded-full border-3"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading Focus...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-4 sm:px-8"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <LifeOSMark />
        <div className="flex items-center gap-2">
          {/* Add Record Button */}
          <motion.button
            {...buttonPress}
            type="button"
            onClick={() => setShowAddModal(true)}
            aria-label="Add focus record"
            className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer"
            style={{
              color: 'var(--text-muted)',
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--overlay-1)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            <Plus size={17} />
          </motion.button>

          {/* Fullscreen Button */}
          <motion.button
            {...buttonPress}
            type="button"
            onClick={() => document.documentElement.requestFullscreen?.()}
            aria-label="Enter full screen"
            className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer"
            style={{
              color: 'var(--text-muted)',
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--overlay-1)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            <Maximize size={17} />
          </motion.button>

          {/* Menu */}
          <div className="relative">
            <motion.button
              {...buttonPress}
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="More options"
              className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer"
              style={{
                color: 'var(--text-muted)',
                transition: 'background-color 150ms ease, color 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--overlay-1)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              <MoreHorizontal size={17} />
            </motion.button>

            {/* Dropdown Menu */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 z-50 rounded-xl overflow-hidden min-w-48"
                style={{
                  backgroundColor: 'var(--bg-pane)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-card, 0 4px 24px rgba(0,0,0,0.2))',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    navigate('/focus/statistics')
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm cursor-pointer"
                  style={{ color: 'var(--text-primary)', transition: 'background-color 150ms ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <BarChart3 size={16} style={{ color: 'var(--text-muted)' }} />
                  Statistics
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/focus/settings')
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm cursor-pointer"
                  style={{
                    color: 'var(--text-primary)',
                    borderTop: '1px solid var(--border)',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <Settings size={16} style={{ color: 'var(--text-muted)' }} />
                  Focus Settings
                </button>
              </motion.div>
            )}
          </div>

          {/* Back Button */}
          <motion.button
            {...buttonPress}
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold cursor-pointer"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <ArrowLeft size={15} />
            Leave focus
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto grid w-full max-w-[1180px] gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8 lg:py-10">
        {/* Timer Section */}
        <motion.section
          {...fadeSlideUp}
          transition={ease.normal}
          className="relative overflow-hidden p-5 sm:p-8 lg:min-h-[690px] rounded-[16px]"
          style={{
            backgroundColor: 'var(--bg-pane)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Progress Bar */}
          {mode === 'POMO' && (
            <div
              className="absolute left-0 top-0 h-1 w-full"
              style={{ backgroundColor: 'var(--overlay-1)' }}
            >
              <div
                className="h-full"
                style={{
                  backgroundColor: 'var(--accent)',
                  width: `${timer.progress * 100}%`,
                  transition: 'width 250ms linear',
                }}
              />
            </div>
          )}

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: 'var(--text-faint)' }}
              >
                Focus protocol
              </p>
              <h1
                className="mt-2 text-[38px] leading-none"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                Do one thing well.
              </h1>
            </div>

            <ModeSelector
              mode={mode}
              status={timer.status}
              onChange={setMode}
            />
          </div>

          {/* Timer */}
          <div className="mx-auto mt-7 flex max-w-[520px] flex-col items-center">
            <TimerDisplay
              mode={mode}
              remainingSeconds={timer.remainingSeconds}
              elapsedSeconds={timer.elapsedSeconds}
              status={timer.status}
              progress={timer.progress}
            />

            {/* Target Selector or Intention */}
            {mode === 'POMO' ? (
              <div className="w-full max-w-md mt-6">
                <TargetSelector
                  selected={selectedTarget}
                  onSelect={setSelectedTarget}
                  onClear={() => setSelectedTarget(null)}
                  disabled={timer.status !== 'IDLE'}
                />
                <div className="mt-4">
                  <label
                    htmlFor="focus-intention"
                    className="mb-2 block text-center text-[10px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    Session intention
                  </label>
                  <input
                    id="focus-intention"
                    value={intention}
                    onChange={(event) => setIntention(event.target.value)}
                    placeholder="What will be true when this session ends?"
                    className="w-full border-0 border-b bg-transparent px-2 py-3 text-center text-[15px] outline-none focus:ring-0"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md mt-6">
                <TargetSelector
                  selected={selectedTarget}
                  onSelect={setSelectedTarget}
                  onClear={() => setSelectedTarget(null)}
                  disabled={timer.status !== 'IDLE'}
                />
                <p
                  className="max-w-sm text-center text-sm leading-6 mt-4"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Focus on your work. Click finish when done.
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="mt-8">
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

            {/* Status Message */}
            {statusMessage && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                role="status"
                aria-live="polite"
                className="mt-5 flex items-center gap-2 text-sm font-semibold"
                style={{ color: 'var(--success)' }}
              >
                {statusMessage}
              </motion.p>
            )}
          </div>
        </motion.section>

        {/* Sidebar */}
        <motion.aside {...fadeSlideUp} transition={ease.normal} className="space-y-5">
          {/* Overview */}
          <OverviewPanel
            overview={dashboard?.overview || {
              todayPomo: 0,
              todayFocusSeconds: 0,
              totalPomo: 0,
              totalFocusSeconds: 0,
            }}
          />

          {/* Focus Records */}
          <section
            className="p-5 rounded-[16px]"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              border: '1px solid var(--border)',
            }}
          >
            <h2
              className="text-sm font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Focus Records
            </h2>
            <RecordTimeline
              records={recordsData?.records || []}
              onLoadMore={loadMore}
              hasMore={recordsData?.hasMore || false}
              isLoading={isLoadingRecords}
            />
          </section>

          {/* Keyboard Shortcuts */}
          <p
            className="px-1 text-[11px] leading-5"
            style={{ color: 'var(--text-faint)' }}
          >
            Space starts or pauses · R resets
          </p>
        </motion.aside>
      </main>

      {/* Add Record Modal */}
      <AddRecordModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRecord}
        isSubmitting={addRecordMutation.isPending}
      />

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}

// Helper functions
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
