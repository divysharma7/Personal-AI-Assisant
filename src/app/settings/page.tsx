
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { copy } from '@/lib/copy'
import { useTheme } from '@/contexts/ThemeContext'
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar'
import { buttonPress, fade, ease } from '@/lib/motion'
import { useSettings, useUpdateSettings, useUserProfile } from '@/hooks/useSettings'
import { http } from '@/lib/api/client'

import ProfileTab from './tabs/ProfileTab'
import DateTimeTab from './tabs/DateTimeTab'
import CalendarPrefsTab from './tabs/CalendarPrefsTab'
import ShortcutsTab from './tabs/ShortcutsTab'
import FeaturesTab from './tabs/FeaturesTab'
import IntegrationsTab from './tabs/IntegrationsTab'
import NotificationsTab from './tabs/NotificationsTab'
import HabitsTab from './tabs/HabitsTab'

type SettingsTab = 'profile' | 'datetime' | 'calendar-prefs' | 'shortcuts' | 'features' | 'integrations' | 'notifications' | 'collaborators' | 'habits'

const TABS: {
  key: SettingsTab
  label: string
  group: 'Personal' | 'System' | 'Workspace'
  description: string
}[] = [
  { key: 'profile', label: copy.settings.tabs.profile, group: 'Personal', description: 'Identity and account details' },
  { key: 'datetime', label: 'Date & Time', group: 'Personal', description: 'Timezone, week, and clock preferences' },
  { key: 'calendar-prefs', label: 'Calendar', group: 'Personal', description: 'How time appears across Life OS' },
  { key: 'habits', label: 'Habits', group: 'Personal', description: 'Create and maintain your rhythms' },
  { key: 'features', label: 'Appearance & features', group: 'System', description: 'Theme, sound, and optional tools' },
  { key: 'integrations', label: copy.settings.tabs.integrations, group: 'System', description: 'Connected calendars and services' },
  { key: 'notifications', label: copy.settings.tabs.notifications, group: 'System', description: 'Choose what can interrupt you' },
  { key: 'shortcuts', label: 'Shortcuts', group: 'System', description: 'Keyboard controls for faster work' },
  { key: 'collaborators', label: copy.settings.tabs.collaborators, group: 'Workspace', description: 'People with workspace access' },
]

const GROUPS = ['Personal', 'System', 'Workspace'] as const

export default function SettingsPage() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
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
  const [calColorBy, setCalColorBy] = useState<'list' | 'priority' | 'label'>('priority')
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

  useEffect(() => {
    http.get<{ name?: string; username?: string }>('/api/auth/me')
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
    setCalColorBy(apiPrefs.colorCodingMode || 'priority')
    setCalShowHabitsOverlay(apiPrefs.showHabitsOnCalendar ?? false)
    setCalShowFocusOverlay(apiPrefs.showFocusSessionsOnCalendar ?? false)
  }, [apiPrefs])

  const handleSignOut = useCallback(async () => {
    await http.post('/api/auth/logout')
    navigate('/login')
  }, [navigate])

  const activeTabMeta = TABS.find((tab) => tab.key === activeTab) ?? TABS[0]

  return (
    <div className="grid min-h-full grid-cols-[220px_minmax(0,1fr)]">
      <aside
        className="flex flex-col border-r px-5 py-7"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-pane-2)' }}
      >
        <h1 className="mb-8 text-[26px]" style={{ color: 'var(--text-primary)' }}>
          {copy.settings.title}
        </h1>

        <nav aria-label="Settings">
          {GROUPS.map((group) => (
            <div key={group} className="mb-6">
              <p
                className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ color: 'var(--text-faint)' }}
              >
                {group}
              </p>
              <div className="space-y-0.5">
                {TABS.filter((tab) => tab.group === group).map((tab) => {
                  const active = activeTab === tab.key
                  return (
                    <motion.button
                      key={tab.key}
                      {...buttonPress}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      aria-current={active ? 'page' : undefined}
                      className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors duration-150"
                      style={{
                        backgroundColor: active ? 'var(--bg-selected)' : 'transparent',
                        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}
                    >
                      {tab.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-auto rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors duration-150 hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--priority-high)' }}
        >
          {copy.settings.signOut}
        </button>
      </aside>

      <section className="min-w-0 px-8 py-9 lg:px-12">
        <header className="mb-8 max-w-2xl border-b pb-6" style={{ borderColor: 'var(--border)' }}>
          <p
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ color: 'var(--text-faint)' }}
          >
            {activeTabMeta.group}
          </p>
          <h2 className="text-[28px]" style={{ color: 'var(--text-primary)' }}>
            {activeTabMeta.label}
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {activeTabMeta.description}
          </p>
        </header>

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
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsTab googleConnected={googleConnected} />
          )}

          {activeTab === 'notifications' && <NotificationsTab />}

          {activeTab === 'collaborators' && (
            <motion.div key="collaborators" {...fade} transition={ease.normal}>
              <p className="py-8 text-sm" style={{ color: 'var(--text-faint)' }}>
                {copy.settings.collaborators.comingSoon}
              </p>
            </motion.div>
          )}

          {activeTab === 'habits' && <HabitsTab />}
        </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
