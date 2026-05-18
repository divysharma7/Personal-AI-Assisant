'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Trash2,
  Plus,
  X,
  Mail,
  Calendar,
  ListChecks,
  Send,
  MessageSquare,
  Github,
  Layers,
  Figma,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { useTheme, type Theme } from '@/contexts/ThemeContext'
import { useLabels } from '@/hooks/useLabels'
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar'
import { fade, buttonPress, fadeSlideUp, ease } from '@/lib/motion'
import GoogleCalendarSetup from '@/components/integrations/GoogleCalendarSetup'

type SettingsTab = 'profile' | 'features' | 'subscriptions' | 'integrations' | 'notifications' | 'labels' | 'collaborators'

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'profile', label: copy.settings.tabs.profile },
  { key: 'features', label: copy.settings.tabs.features },
  { key: 'subscriptions', label: copy.settings.tabs.subscriptions },
  { key: 'integrations', label: copy.settings.tabs.integrations },
  { key: 'notifications', label: copy.settings.tabs.notifications },
  { key: 'labels', label: copy.settings.tabs.labels },
  { key: 'collaborators', label: copy.settings.tabs.collaborators },
]

// Theme definitions with 3-dot color previews
const THEME_DEFS: { id: Theme; label: string; dots: string[] }[] = [
  { id: 'system', label: 'System', dots: ['#6B6B75', '#F2F2F5', '#0E0E12'] },
  { id: 'light', label: 'Light', dots: ['#F8F6F2', '#FF4D3D', '#1A1A1F'] },
  { id: 'dark', label: 'Dark', dots: ['#17171E', '#FF4D3D', '#F2F2F5'] },
  { id: 'blackout', label: 'Blackout', dots: ['#000000', '#FF4D3D', '#F2F2F5'] },
  { id: 'ocean', label: 'Ocean', dots: ['#0F1F35', '#38BDF8', '#E8F4FC'] },
  { id: 'berry', label: 'Berry', dots: ['#221133', '#C084FC', '#F3E8FF'] },
  { id: 'forest', label: 'Forest', dots: ['#0F241A', '#34D399', '#E8FCF1'] },
  { id: 'sunset', label: 'Sunset', dots: ['#28180C', '#FB923C', '#FFF5E8'] },
  { id: 'blossom', label: 'Blossom', dots: ['#FFF5F7', '#F472B6', '#1A1A1F'] },
  { id: 'blue-white', label: 'Blue & White', dots: ['#F5F7FF', '#6366F1', '#1E1B4B'] },
  { id: 'black-yellow', label: 'Black & Yellow', dots: ['#111111', '#FACC15', '#FAFAFA'] },
  { id: 'blue-red', label: 'Blue & Red', dots: ['#0F1F35', '#EF4444', '#E8F4FC'] },
  { id: 'red-white', label: 'Red & White', dots: ['#FFF5F5', '#EF4444', '#1A1A1F'] },
]

// Integration icons — use `typeof Mail` to match Lucide's type
const INTEGRATION_ICONS: Record<string, typeof Mail> = {
  Gmail: Mail,
  'Google Calendar': Calendar,
  'Microsoft To Do': ListChecks,
  'Email forwarding': Send,
  Slack: MessageSquare,
  GitHub: Github,
  Linear: Layers,
  Figma: Figma,
}

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { labels, createLabel } = useLabels()
  const { connected: googleConnected } = useGoogleCalendar()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)
  const [soundsEnabled, setSoundsEnabled] = useState(true)
  const [meetingNotesEnabled, setMeetingNotesEnabled] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [gcalSetupOpen, setGcalSetupOpen] = useState(false)

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

  const handleSignOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }, [router])

  const handleCreateLabel = useCallback(async () => {
    const name = newLabelName.trim()
    if (!name) return
    await createLabel(name)
    setNewLabelName('')
  }, [newLabelName, createLabel])

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
        className="mb-6 text-[32px] font-bold"
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
          {/* ─── Profile ─── */}
          {activeTab === 'profile' && (
            <motion.div key="profile" {...fade} transition={ease.normal} className="flex flex-col gap-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white cursor-pointer"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {firstName} {lastName}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    Click avatar to change (coming soon)
                  </p>
                </div>
              </div>

              {/* Name fields */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {copy.settings.profile.firstName}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {copy.settings.profile.lastName}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {copy.settings.profile.email}
                </label>
                <input
                  type="text"
                  value={email}
                  readOnly
                  className="input-field cursor-not-allowed opacity-60"
                />
              </div>

              {/* Delete account */}
              <div className="mt-4 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer"
                  style={{
                    color: 'var(--priority-high)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--priority-high)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 77, 61, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {copy.settings.profile.deleteAccount}
                </button>
                <p className="mt-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                  {copy.settings.profile.deleteWarning}
                </p>
              </div>
            </motion.div>
          )}

          {/* ─── Features ─── */}
          {activeTab === 'features' && (
            <motion.div key="features" {...fade} transition={ease.normal} className="flex flex-col gap-8">
              {/* Appearance — theme grid */}
              <div>
                <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {copy.settings.features.themeLabel}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_DEFS.map((td) => {
                    const active = theme === td.id
                    return (
                      <button
                        key={td.id}
                        onClick={() => setTheme(td.id)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 cursor-pointer"
                        style={{
                          backgroundColor: 'var(--bg-pane-2)',
                          border: active ? '2px solid var(--accent)' : '2px solid var(--border)',
                        }}
                      >
                        <div className="flex gap-1">
                          {td.dots.map((color, i) => (
                            <span
                              key={i}
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span
                          className="text-xs font-medium"
                          style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
                        >
                          {td.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sounds toggle */}
              <div>
                <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {copy.settings.features.soundsLabel}
                </h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    onClick={() => setSoundsEnabled(!soundsEnabled)}
                    className="relative h-5 w-9 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: soundsEnabled ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    <span
                      className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
                      style={{
                        transform: soundsEnabled ? 'translateX(18px)' : 'translateX(2px)',
                      }}
                    />
                  </button>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {copy.settings.features.soundsToggle}
                  </span>
                </label>
              </div>

              {/* Talk language */}
              <div>
                <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {copy.settings.features.talkLabel}
                </h2>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {copy.settings.features.talkLanguage}
                  </label>
                  <select
                    disabled
                    className="input-field max-w-[200px] cursor-not-allowed opacity-50"
                  >
                    <option>English</option>
                  </select>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-faint)' }}>
                    {copy.settings.features.talkComingSoon}
                  </span>
                </div>
              </div>

              {/* Meeting notes toggle */}
              <div>
                <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {copy.settings.features.meetingNotesLabel}
                </h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    onClick={() => setMeetingNotesEnabled(!meetingNotesEnabled)}
                    className="relative h-5 w-9 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: meetingNotesEnabled ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    <span
                      className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
                      style={{
                        transform: meetingNotesEnabled ? 'translateX(18px)' : 'translateX(2px)',
                      }}
                    />
                  </button>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {copy.settings.features.meetingNotesToggle}
                  </span>
                </label>
              </div>
            </motion.div>
          )}

          {/* ─── Subscriptions ─── */}
          {activeTab === 'subscriptions' && (
            <motion.div key="subscriptions" {...fade} transition={ease.normal} className="flex flex-col gap-5">
              <div
                className="rounded-xl p-5"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {copy.settings.subscriptions.planName}
                </h3>
                <ul className="mb-5 flex flex-col gap-1.5">
                  {copy.settings.subscriptions.planFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 cursor-pointer"
                  style={{ backgroundColor: 'var(--accent)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                >
                  {copy.settings.subscriptions.upgradeCta}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── Integrations ─── */}
          {activeTab === 'integrations' && (
            <motion.div key="integrations" {...fade} transition={ease.normal} className="flex flex-col gap-5">
              {/* Free integrations */}
              <div className="grid grid-cols-2 gap-3">
                {copy.settings.integrations.free.map((integration) => {
                  const Icon = INTEGRATION_ICONS[integration.name] || Layers
                  const isGoogleCalendar = integration.name === 'Google Calendar'
                  const isConnected = isGoogleCalendar && googleConnected
                  return (
                    <div
                      key={integration.name}
                      className="flex flex-col gap-2 rounded-xl p-4"
                      style={{
                        backgroundColor: 'var(--bg-pane-2)',
                        border: isConnected
                          ? '1px solid rgba(52, 211, 153, 0.4)'
                          : '1px solid var(--border)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={20} strokeWidth={1.5} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {integration.name}
                        </span>
                        {isConnected && (
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: 'rgba(52, 211, 153, 0.15)',
                              color: '#34d399',
                            }}
                          >
                            {copy.calendar.connectedBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                        {integration.description}
                      </p>
                      <button
                        onClick={() => {
                          if (isGoogleCalendar) {
                            setGcalSetupOpen(true)
                          }
                        }}
                        className="mt-1 self-start rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 cursor-pointer"
                        style={{
                          backgroundColor: isConnected
                            ? 'rgba(52, 211, 153, 0.15)'
                            : 'var(--bg-hover)',
                          color: isConnected ? '#34d399' : 'var(--text-muted)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isConnected) {
                            e.currentTarget.style.backgroundColor = 'var(--accent)'
                            e.currentTarget.style.color = '#FFFFFF'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isConnected) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                            e.currentTarget.style.color = 'var(--text-muted)'
                          }
                        }}
                      >
                        {isConnected
                          ? copy.calendar.connectedBadge
                          : copy.settings.integrations.connectCta}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Pro integrations */}
              <div className="grid grid-cols-2 gap-3">
                {copy.settings.integrations.pro.map((integration) => {
                  const Icon = INTEGRATION_ICONS[integration.name] || Layers
                  return (
                    <div
                      key={integration.name}
                      className="flex flex-col gap-2 rounded-xl p-4 opacity-60"
                      style={{
                        backgroundColor: 'var(--bg-pane-2)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={20} strokeWidth={1.5} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {integration.name}
                        </span>
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{
                            backgroundColor: 'var(--accent-soft)',
                            color: 'var(--accent)',
                          }}
                        >
                          {copy.settings.integrations.proBadge}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                        {integration.description}
                      </p>
                      <button
                        disabled
                        className="mt-1 cursor-not-allowed self-start rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--bg-hover)',
                          color: 'var(--text-faint)',
                        }}
                      >
                        {copy.settings.integrations.connectCta}
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ─── Notifications ─── */}
          {activeTab === 'notifications' && (
            <motion.div key="notifications" {...fade} transition={ease.normal}>
              <p className="py-8 text-sm" style={{ color: 'var(--text-faint)' }}>
                {copy.settings.notifications.comingSoon}
              </p>
            </motion.div>
          )}

          {/* ─── Labels ─── */}
          {activeTab === 'labels' && (
            <motion.div key="labels" {...fade} transition={ease.normal} className="flex flex-col gap-4">
              {/* Create new label */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateLabel()
                  }}
                  placeholder={copy.settings.labels.createPlaceholder}
                  className="input-field flex-1"
                />
                <motion.button
                  {...buttonPress}
                  onClick={handleCreateLabel}
                  className="flex items-center gap-1 rounded-full px-3 py-2.5 text-xs font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <Plus size={14} strokeWidth={2} />
                  {copy.settings.labels.createCta}
                </motion.button>
              </div>

              {/* Label list */}
              <div className="flex flex-col gap-1">
                {labels.map((label) => (
                  <div
                    key={label._id}
                    className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ backgroundColor: 'var(--bg-pane-2)' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {label.name}
                    </span>
                    <button
                      onClick={() => handleDeleteLabel(label._id)}
                      className="flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
                      style={{ color: 'var(--text-faint)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--priority-high)'
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-faint)'
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
                {labels.length === 0 && (
                  <p className="py-4 text-sm" style={{ color: 'var(--text-faint)' }}>
                    {copy.settings.labels.emptyState}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── Collaborators ─── */}
          {activeTab === 'collaborators' && (
            <motion.div key="collaborators" {...fade} transition={ease.normal}>
              <p className="py-8 text-sm" style={{ color: 'var(--text-faint)' }}>
                {copy.settings.collaborators.comingSoon}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Delete Account Modal ─── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            {...fade}
            transition={ease.fast}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              {...fadeSlideUp}
              transition={ease.normal}
              className="w-full max-w-md rounded-2xl p-6"
              style={{
                backgroundColor: 'var(--bg-pane)',
                border: '1px solid var(--border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {copy.settings.profile.deleteAccount}
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
                  style={{ color: 'var(--text-faint)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                {copy.settings.profile.deleteWarning}
              </p>
              <label className="mb-5 flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {copy.settings.profile.deleteConfirmCheckbox}
                </span>
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {copy.settings.profile.deleteCancelCta}
                </button>
                <button
                  disabled={!deleteConfirmed}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: 'var(--priority-high)' }}
                >
                  {copy.settings.profile.deleteConfirmCta}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Calendar Setup Panel */}
      <GoogleCalendarSetup
        open={gcalSetupOpen}
        onClose={() => setGcalSetupOpen(false)}
      />
    </div>
  )
}
