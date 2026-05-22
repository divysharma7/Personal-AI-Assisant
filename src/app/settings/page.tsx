'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { copy } from '@/lib/copy'
import { useTheme } from '@/contexts/ThemeContext'
import { useLabels } from '@/hooks/useLabels'
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar'
import { buttonPress, fade, ease } from '@/lib/motion'
import { useSettings, useUpdateSettings, useUserProfile } from '@/hooks/useSettings'

import ProfileTab from './tabs/ProfileTab'
import DateTimeTab from './tabs/DateTimeTab'
import CalendarPrefsTab from './tabs/CalendarPrefsTab'
import ShortcutsTab from './tabs/ShortcutsTab'
import FeaturesTab from './tabs/FeaturesTab'
import IntegrationsTab from './tabs/IntegrationsTab'
import NotificationsTab from './tabs/NotificationsTab'
import LabelsTab from './tabs/LabelsTab'

type SettingsTab = 'profile' | 'datetime' | 'calendar-prefs' | 'shortcuts' | 'features' | 'integrations' | 'notifications' | 'labels' | 'collaborators'

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'profile', label: copy.settings.tabs.profile },
  { key: 'datetime', label: 'Date & Time' },
  { key: 'calendar-prefs', label: 'Calendar' },
  { key: 'shortcuts', label: 'Shortcuts' },
  { key: 'features', label: copy.settings.tabs.features },
  { key: 'integrations', label: copy.settings.tabs.integrations },
  { key: 'notifications', label: copy.settings.tabs.notifications },
  { key: 'labels', label: copy.settings.tabs.labels },
  { key: 'collaborators', label: copy.settings.tabs.collaborators },
]

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { labels, createLabel } = useLabels()
  const { connected: googleConnected } = useGoogleCalendar()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [soundsEnabled, setSoundsEnabled] = useState(true)
  const [meetingNotesEnabled, setMeetingNotesEnabled] = useState(false)

  // Calendar preferences from API
  const { preferences: apiPrefs } = useSettings()
  const { updateSettings: updateApiSettings } = useUpdateSettings()
  const { user: userProfile } = useUserProfile()
  const [detectedTz, setDetectedTz] = useState('')

  useEffect(() => {
    setDetectedTz(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  // Calendar settings
  const [calDefaultView, setCalDefaultView] = useState<'day' | 'week' | 'month'>('week')
  const [calWeekStartsOn, setCalWeekStartsOn] = useState<'monday' | 'sunday' | 'saturday'>('monday')
  const [calTimeFormat, setCalTimeFormat] = useState<'12' | '24'>('12')
  const [calShowCurrentTime, setCalShowCurrentTime] = useState(true)
  const [calHideHoursFrom, setCalHideHoursFrom] = useState(21)
  const [calHideHoursTo, setCalHideHoursTo] = useState(7)
  const [calColorBy, setCalColorBy] = useState<'list' | 'priority' | 'label'>('priority')
  const [calDailyCapacity, setCalDailyCapacity] = useState(8)
  const [calShowCapacityBar, setCalShowCapacityBar] = useState(true)
  const [calShowWarnings, setCalShowWarnings] = useState(true)
  const [calShowGoogleOverlay, setCalShowGoogleOverlay] = useState(true)
  const [calShowHabitsOverlay, setCalShowHabitsOverlay] = useState(false)
  const [calShowFocusOverlay, setCalShowFocusOverlay] = useState(false)
  const [calSettingsToast, setCalSettingsToast] = useState(false)
  const calToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showCalToast = useCallback(() => {
    setCalSettingsToast(true)
    if (calToastTimerRef.current) clearTimeout(calToastTimerRef.current)
    calToastTimerRef.current = setTimeout(() => setCalSettingsToast(false), 2000)
  }, [])

  // Persist calendar preferences to API
  const persistCalPref = useCallback((data: Record<string, unknown>) => {
    showCalToast()
    updateApiSettings(data as Parameters<typeof updateApiSettings>[0]).catch(() => {})
  }, [showCalToast, updateApiSettings])

  // Focus settings
  const [focusWorkDuration, setFocusWorkDuration] = useState(25)
  const [focusShortBreak, setFocusShortBreak] = useState(5)
  const [focusLongBreak, setFocusLongBreak] = useState(15)
  const [focusLongBreakEvery, setFocusLongBreakEvery] = useState(4)
  const [focusClockTheme, setFocusClockTheme] = useState<'aurora' | 'minimal' | 'liquid'>('aurora')
  const [focusSoundOnComplete, setFocusSoundOnComplete] = useState(true)
  const [focusKeyboardShortcuts, setFocusKeyboardShortcuts] = useState(true)
  const [focusShowActiveSession, setFocusShowActiveSession] = useState(true)
  const [focusSettingsToast, setFocusSettingsToast] = useState(false)
  const focusToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showFocusToast = useCallback(() => {
    setFocusSettingsToast(true)
    if (focusToastTimerRef.current) clearTimeout(focusToastTimerRef.current)
    focusToastTimerRef.current = setTimeout(() => setFocusSettingsToast(false), 2000)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name) {
          const parts = data.name.split(' ')
          setFirstName(parts[0] || '')
          setLastName(parts.slice(1).join(' ') || '')
        }
        if (data?.username) setEmail(data.username)
      })
      .catch(() => {})
  }, [])

  // Sync local calendar state with API preferences once loaded
  useEffect(() => {
    if (!apiPrefs) return
    setCalDefaultView(apiPrefs.defaultView || 'week')
    const wsMap: Record<number, 'monday' | 'sunday' | 'saturday'> = { 0: 'sunday', 1: 'monday', 6: 'saturday' }
    setCalWeekStartsOn(wsMap[apiPrefs.weekStartsOn] || 'monday')
    setCalTimeFormat(apiPrefs.timeFormat === '24h' ? '24' : '12')
    setCalShowCurrentTime(apiPrefs.showCurrentTimeIndicator ?? true)
    setCalHideHoursFrom(apiPrefs.hiddenHoursStart ?? 21)
    setCalHideHoursTo(apiPrefs.hiddenHoursEnd ?? 7)
    setCalColorBy(apiPrefs.colorCodingMode || 'priority')
    setCalDailyCapacity(apiPrefs.dailyCapacityHours ?? 8)
    setCalShowGoogleOverlay(apiPrefs.showGoogleEventsOnCalendar ?? true)
    setCalShowHabitsOverlay(apiPrefs.showHabitsOnCalendar ?? false)
    setCalShowFocusOverlay(apiPrefs.showFocusSessionsOnCalendar ?? false)
  }, [apiPrefs])

  const handleSignOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }, [router])

  const handleDeleteLabel = useCallback(async (labelId: string) => {
    await fetch('/api/labels', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: labelId }),
    })
  }, [])

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <div />
        <button
          onClick={handleSignOut}
          className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {copy.settings.signOut}
        </button>
      </div>

      {/* Title */}
      <h1
        className="mb-6 text-[32px]"
        style={{ color: 'var(--text-primary)' }}
      >
        {copy.settings.title}
      </h1>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.key
          return (
            <motion.button
              key={tab.key}
              {...buttonPress}
              onClick={() => setActiveTab(tab.key)}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: active ? 'var(--accent)' : 'transparent',
                color: active ? '#FFFFFF' : 'var(--text-muted)',
                border: active ? 'none' : '1px solid var(--border)',
              }}
            >
              {tab.label}
            </motion.button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="max-w-2xl">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <ProfileTab
              firstName={firstName}
              lastName={lastName}
              email={email}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onSignOut={handleSignOut}
            />
          )}

          {activeTab === 'datetime' && (
            <DateTimeTab
              calWeekStartsOn={calWeekStartsOn}
              calTimeFormat={calTimeFormat}
              detectedTz={detectedTz}
              userTimezone={userProfile?.timezone}
              onWeekStartChange={setCalWeekStartsOn}
              onTimeFormatChange={setCalTimeFormat}
              persistCalPref={persistCalPref}
            />
          )}

          {activeTab === 'calendar-prefs' && (
            <CalendarPrefsTab
              calSettingsToast={calSettingsToast}
              calShowHabitsOverlay={calShowHabitsOverlay}
              calShowFocusOverlay={calShowFocusOverlay}
              calColorBy={calColorBy}
              calDefaultView={calDefaultView}
              onShowHabitsOverlayChange={setCalShowHabitsOverlay}
              onShowFocusOverlayChange={setCalShowFocusOverlay}
              onColorByChange={setCalColorBy}
              onDefaultViewChange={setCalDefaultView}
              persistCalPref={persistCalPref}
            />
          )}

          {activeTab === 'shortcuts' && <ShortcutsTab />}

          {activeTab === 'features' && (
            <FeaturesTab
              theme={theme}
              setTheme={setTheme}
              soundsEnabled={soundsEnabled}
              setSoundsEnabled={setSoundsEnabled}
              meetingNotesEnabled={meetingNotesEnabled}
              setMeetingNotesEnabled={setMeetingNotesEnabled}
              focusWorkDuration={focusWorkDuration}
              setFocusWorkDuration={setFocusWorkDuration}
              focusShortBreak={focusShortBreak}
              setFocusShortBreak={setFocusShortBreak}
              focusLongBreak={focusLongBreak}
              setFocusLongBreak={setFocusLongBreak}
              focusLongBreakEvery={focusLongBreakEvery}
              setFocusLongBreakEvery={setFocusLongBreakEvery}
              focusClockTheme={focusClockTheme}
              setFocusClockTheme={setFocusClockTheme}
              focusSoundOnComplete={focusSoundOnComplete}
              setFocusSoundOnComplete={setFocusSoundOnComplete}
              focusKeyboardShortcuts={focusKeyboardShortcuts}
              setFocusKeyboardShortcuts={setFocusKeyboardShortcuts}
              focusShowActiveSession={focusShowActiveSession}
              setFocusShowActiveSession={setFocusShowActiveSession}
              focusSettingsToast={focusSettingsToast}
              showFocusToast={showFocusToast}
              calSettingsToast={calSettingsToast}
              showCalToast={showCalToast}
              calDefaultView={calDefaultView}
              setCalDefaultView={setCalDefaultView}
              calWeekStartsOn={calWeekStartsOn}
              setCalWeekStartsOn={setCalWeekStartsOn}
              calTimeFormat={calTimeFormat}
              setCalTimeFormat={setCalTimeFormat}
              calShowCurrentTime={calShowCurrentTime}
              setCalShowCurrentTime={setCalShowCurrentTime}
              calHideHoursFrom={calHideHoursFrom}
              setCalHideHoursFrom={setCalHideHoursFrom}
              calHideHoursTo={calHideHoursTo}
              setCalHideHoursTo={setCalHideHoursTo}
              calColorBy={calColorBy}
              setCalColorBy={setCalColorBy}
              calDailyCapacity={calDailyCapacity}
              setCalDailyCapacity={setCalDailyCapacity}
              calShowCapacityBar={calShowCapacityBar}
              setCalShowCapacityBar={setCalShowCapacityBar}
              calShowWarnings={calShowWarnings}
              setCalShowWarnings={setCalShowWarnings}
              calShowGoogleOverlay={calShowGoogleOverlay}
              setCalShowGoogleOverlay={setCalShowGoogleOverlay}
              calShowHabitsOverlay={calShowHabitsOverlay}
              setCalShowHabitsOverlay={setCalShowHabitsOverlay}
              calShowFocusOverlay={calShowFocusOverlay}
              setCalShowFocusOverlay={setCalShowFocusOverlay}
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsTab googleConnected={googleConnected} />
          )}

          {activeTab === 'notifications' && <NotificationsTab />}

          {activeTab === 'labels' && (
            <LabelsTab
              labels={labels}
              onCreateLabel={createLabel}
              onDeleteLabel={handleDeleteLabel}
            />
          )}

          {activeTab === 'collaborators' && (
            <motion.div key="collaborators" {...fade} transition={ease.normal}>
              <p className="py-8 text-sm" style={{ color: 'var(--text-faint)' }}>
                {copy.settings.collaborators.comingSoon}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
