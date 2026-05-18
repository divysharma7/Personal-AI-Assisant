'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { copy } from '@/lib/copy'
import { useTheme, type Theme } from '@/contexts/ThemeContext'

type SettingsTab = 'profile' | 'features' | 'subscriptions' | 'integrations'

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'profile', label: copy.settings.tabs.profile },
  { key: 'features', label: copy.settings.tabs.features },
  { key: 'subscriptions', label: copy.settings.tabs.subscriptions },
  { key: 'integrations', label: copy.settings.tabs.integrations },
]

const THEME_MAP: Record<string, Theme> = {
  Light: 'light',
  Dark: 'dark',
  Blackout: 'blackout',
  System: 'system',
}

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

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

  const currentThemeLabel =
    copy.settings.features.themeOptions.find(
      (o) => THEME_MAP[o] === theme
    ) || 'Dark'

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
      <div
        className="mb-6 flex items-center gap-0.5 border-b pb-px"
        style={{ borderColor: 'var(--border)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative px-4 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer"
            style={{
              color:
                activeTab === tab.key
                  ? 'var(--text-primary)'
                  : 'var(--text-muted)',
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-w-lg">
        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-5">
            <div className="flex gap-4">
              <div className="flex-1">
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
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
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
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

            <div>
              <label
                className="mb-1.5 block text-xs font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {copy.settings.profile.email}
              </label>
              <input
                type="text"
                value={email}
                readOnly
                className="input-field cursor-not-allowed opacity-60"
              />
            </div>

            <div
              className="mt-4 border-t pt-6"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
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
              <p
                className="mt-2 text-xs"
                style={{ color: 'var(--text-faint)' }}
              >
                {copy.settings.profile.deleteWarning}
              </p>
            </div>
          </div>
        )}

        {/* Features tab */}
        {activeTab === 'features' && (
          <div className="flex flex-col gap-5">
            <div>
              <label
                className="mb-1.5 block text-xs font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {copy.settings.features.themeLabel}
              </label>
              <select
                value={currentThemeLabel}
                onChange={(e) => {
                  const t = THEME_MAP[e.target.value]
                  if (t) setTheme(t)
                }}
                className="input-field cursor-pointer"
              >
                {copy.settings.features.themeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Subscriptions tab */}
        {activeTab === 'subscriptions' && (
          <p className="py-8 text-sm" style={{ color: 'var(--text-faint)' }}>
            No active subscriptions.
          </p>
        )}

        {/* Integrations tab */}
        {activeTab === 'integrations' && (
          <p className="py-8 text-sm" style={{ color: 'var(--text-faint)' }}>
            No integrations connected.
          </p>
        )}
      </div>
    </div>
  )
}
