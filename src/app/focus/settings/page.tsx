import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fadeSlideUp } from '@/lib/motion'
import { ArrowLeft, Settings, Bell, Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  useFocusSettings,
  useUpdateFocusSettings,
  secondsToMinutes,
  minutesToSeconds,
  type FocusSettings,
} from '@/hooks/useFocusSettings'

export default function FocusSettingsPage() {
  const navigate = useNavigate()
  const { data: settings, isLoading } = useFocusSettings()
  const updateMutation = useUpdateFocusSettings()

  // Local state for form
  const [formState, setFormState] = useState<Partial<FocusSettings>>({})
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  )

  // Initialize form with settings
  useEffect(() => {
    if (settings) {
      setFormState({
        pomoDurationSeconds: settings.pomoDurationSeconds,
        shortBreakDurationSeconds: settings.shortBreakDurationSeconds,
        longBreakDurationSeconds: settings.longBreakDurationSeconds,
        longBreakAfterPomos: settings.longBreakAfterPomos,
        autoStartBreak: settings.autoStartBreak,
        autoStartPomo: settings.autoStartPomo,
        notificationsEnabled: settings.notificationsEnabled,
        soundEnabled: settings.soundEnabled,
      })
    }
  }, [settings])

  const handleNumberChange = (field: keyof FocusSettings, value: number) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleToggle = async (field: keyof FocusSettings) => {
    if (field === 'notificationsEnabled' && !formState.notificationsEnabled) {
      if (typeof Notification === 'undefined') {
        setNotificationPermission('unsupported')
        return
      }
      const permission = Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission
      setNotificationPermission(permission)
      if (permission !== 'granted') return
    }
    setFormState((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSave = () => {
    updateMutation.mutate(formState)
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-canvas)' }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-3"
          style={{
            borderColor: 'var(--border)',
            borderTopColor: 'var(--accent)',
          }}
        />
      </div>
    )
  }

  return (
    <div className="workspace-page">
      {/* Header */}
      <header
        className="workspace-header"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/focus')}
          className="control-icon"
            aria-label="Back to Focus"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Settings size={20} style={{ color: 'var(--accent)' }} />
            <h1 className="type-page-title">Focus Settings</h1>
          </div>
        </div>
        <motion.button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Saving…' : 'Save Settings'}
        </motion.button>
      </header>

      {/* Content */}
      <main className="w-full max-w-[720px] px-5 py-6 sm:px-8">
        <p aria-live="polite" className="type-meta mb-3 min-h-[18px]" style={{ color: updateMutation.isError ? 'var(--danger)' : 'var(--success)' }}>
          {updateMutation.isSuccess ? 'Focus settings saved.' : updateMutation.isError ? 'Focus settings could not be saved. Try again.' : ''}
        </p>
        <motion.div {...fadeSlideUp} className="space-y-3">
          {/* Timer Durations */}
          <section
            className="surface-card p-4"
          >
            <h2 className="type-section-title mb-4">Timer Durations</h2>

            <div className="space-y-5">
              {/* Pomo Duration */}
              <div>
                <label
                  htmlFor="pomoDuration"
                  className="flex items-center justify-between mb-2"
                >
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Focus duration
                  </span>
                  <span
                    className="text-sm font-medium tabular-nums"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {secondsToMinutes(formState.pomoDurationSeconds || 1500)} min
                  </span>
                </label>
                <input
                  id="pomoDuration"
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={secondsToMinutes(formState.pomoDurationSeconds || 1500)}
                  onChange={(e) =>
                    handleNumberChange('pomoDurationSeconds', minutesToSeconds(parseInt(e.target.value)))
                  }
                  className="w-full"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>

              {/* Short Break */}
              <div>
                <label
                  htmlFor="shortBreak"
                  className="flex items-center justify-between mb-2"
                >
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Short break
                  </span>
                  <span
                    className="text-sm font-medium tabular-nums"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {secondsToMinutes(formState.shortBreakDurationSeconds || 300)} min
                  </span>
                </label>
                <input
                  id="shortBreak"
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={secondsToMinutes(formState.shortBreakDurationSeconds || 300)}
                  onChange={(e) =>
                    handleNumberChange('shortBreakDurationSeconds', minutesToSeconds(parseInt(e.target.value)))
                  }
                  className="w-full"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>

              {/* Long Break */}
              <div>
                <label
                  htmlFor="longBreak"
                  className="flex items-center justify-between mb-2"
                >
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Long break
                  </span>
                  <span
                    className="text-sm font-medium tabular-nums"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {secondsToMinutes(formState.longBreakDurationSeconds || 900)} min
                  </span>
                </label>
                <input
                  id="longBreak"
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={secondsToMinutes(formState.longBreakDurationSeconds || 900)}
                  onChange={(e) =>
                    handleNumberChange('longBreakDurationSeconds', minutesToSeconds(parseInt(e.target.value)))
                  }
                  className="w-full"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>

              {/* Long Break Interval */}
              <div>
                <label
                  htmlFor="longBreakInterval"
                  className="flex items-center justify-between mb-2"
                >
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Long break after
                  </span>
                  <span
                    className="text-sm font-medium tabular-nums"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formState.longBreakAfterPomos || 4} pomos
                  </span>
                </label>
                <input
                  id="longBreakInterval"
                  type="range"
                  min={2}
                  max={10}
                  step={1}
                  value={formState.longBreakAfterPomos || 4}
                  onChange={(e) =>
                    handleNumberChange('longBreakAfterPomos', parseInt(e.target.value))
                  }
                  className="w-full"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>
            </div>
          </section>

          {/* Automation */}
          <section
            className="surface-card p-4"
          >
            <h2 className="type-section-title mb-4">Automation</h2>

            <div className="space-y-4">
              {/* Auto-start Break */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Auto-start break</p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    Start break automatically after focus session
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-label="Browser notifications"
                  aria-checked={formState.autoStartBreak || false}
                  onClick={() => handleToggle('autoStartBreak')}
                  className="switch-control"
                />
              </div>

              {/* Auto-start Pomo */}
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Auto-start next focus</p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    Start next focus session after break ends
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formState.autoStartPomo || false}
                  onClick={() => handleToggle('autoStartPomo')}
                  className="switch-control"
                />
              </label>
            </div>
          </section>

          {/* Notifications */}
          <section
            className="surface-card p-4"
          >
            <h2 className="type-section-title mb-4">Notifications</h2>

            <div className="space-y-4">
              {/* Notifications */}
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell size={18} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-sm font-medium">Browser notifications</p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      Get notified when focus session ends
                      <span className="mt-1 block text-xs" style={{ color: 'var(--text-faint)' }}>
                        Browser permission: {notificationPermission}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formState.notificationsEnabled ?? true}
                  onClick={() => handleToggle('notificationsEnabled')}
                  className="switch-control"
                />
              </label>

              {/* Sound */}
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Volume2 size={18} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-sm font-medium">Completion sound</p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      Play a sound when focus session ends
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formState.soundEnabled ?? true}
                  onClick={() => handleToggle('soundEnabled')}
                  className="switch-control"
                />
              </label>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  )
}
