'use client'
import { useState, useCallback } from 'react'
import { User, Settings2, CreditCard, Plug, LogOut, Trash2, X, Mail, Github, Slack, Figma, Zap } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import { THEMES } from '@/lib/themes'
import { motion, AnimatePresence } from 'framer-motion'

const ACCENT_RED = '#FF4D3D'

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'features', label: 'Features', icon: Settings2 },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'integrations', label: 'Integrations', icon: Plug },
] as const

type SectionId = typeof SECTIONS[number]['id']

// Integration card data
const FREE_INTEGRATIONS = [
  { id: 'gmail', name: 'Gmail', description: 'Import emails as tasks', icon: Mail, connected: false },
  { id: 'gcal', name: 'Google Calendar', description: 'Sync calendar events', icon: Mail, connected: false },
  { id: 'mstodo', name: 'Microsoft To Do', description: 'Import your tasks', icon: Mail, connected: false },
  { id: 'email-fwd', name: 'Email Forwarding', description: 'Forward emails to create tasks', icon: Mail, connected: false },
]

const PRO_INTEGRATIONS = [
  { id: 'slack', name: 'Slack', description: 'Create tasks from messages', icon: Slack, connected: false },
  { id: 'github', name: 'GitHub', description: 'Link issues and PRs', icon: Github, connected: false },
  { id: 'linear', name: 'Linear', description: 'Sync Linear issues', icon: Mail, connected: false },
  { id: 'figma', name: 'Figma', description: 'Attach Figma designs', icon: Figma, connected: false },
]

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>('profile')
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  // Profile form state
  const [firstName, setFirstName] = useState('Divy')
  const [lastName, setLastName] = useState('Sharma')
  const [recentListsEnabled, setRecentListsEnabled] = useState(true)

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  async function handleDeleteAccount() {
    if (!deleteConfirmed) return
    // Stub — would call API to delete account
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="px-8 md:px-10 py-8 md:py-10">

            {/* Title row with sign out */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-[32px] font-bold"
                style={{ color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Settings
              </h1>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-3)' }}>
                <LogOut size={14} /> Sign out
              </button>
            </div>

            {/* Tab pills */}
            <div className="flex items-center gap-1 mb-8 flex-wrap">
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => setActive(s.id)}
                  className={`pill-interactive ${active === s.id ? 'active' : ''}`}>
                  <s.icon size={14} /> {s.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="max-w-2xl">

              {/* ── Profile Tab ────────────────────────────────── */}
              {active === 'profile' && (
                <div className="space-y-8">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                      style={{ background: 'var(--accent)', color: '#fff' }}>
                      {firstName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>
                        {firstName} {lastName}
                      </p>
                      <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>
                        Change your profile photo
                      </p>
                    </div>
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                        First name
                      </label>
                      <input value={firstName} onChange={e => setFirstName(e.target.value)}
                        className="input-interactive" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                        Last name
                      </label>
                      <input value={lastName} onChange={e => setLastName(e.target.value)}
                        className="input-interactive" />
                    </div>
                  </div>

                  {/* Primary email (read-only) */}
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                      Primary email
                    </label>
                    <input value="divy@laif.app" readOnly
                      className="input-interactive opacity-60 cursor-not-allowed" />
                  </div>

                  {/* Delete account section */}
                  <div className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                    <h3 className="text-[15px] font-semibold mb-2" style={{ color: ACCENT_RED }}>
                      Delete account
                    </h3>
                    <p className="text-[13px] mb-4" style={{ color: 'var(--text-3)' }}>
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
                      style={{ background: `${ACCENT_RED}15`, color: ACCENT_RED, border: `1px solid ${ACCENT_RED}30` }}>
                      <Trash2 size={14} className="inline mr-1.5" />
                      Delete account
                    </button>
                  </div>
                </div>
              )}

              {/* ── Features Tab ──────────────────────────────── */}
              {active === 'features' && (
                <div className="space-y-6">
                  {/* Theme picker */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Theme</h3>
                    <select
                      value={theme}
                      onChange={e => setTheme(e.target.value as import('@/lib/themes').ThemeId)}
                      className="input-interactive"
                    >
                      {THEMES.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Recently viewed lists toggle */}
                  <div className="flex items-center justify-between rounded-2xl p-4"
                    style={{ background: 'var(--bg-overlay)' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
                        Recently viewed lists
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                        Show recently viewed lists in the sidebar
                      </p>
                    </div>
                    <button onClick={() => setRecentListsEnabled(!recentListsEnabled)}
                      className={`toggle ${recentListsEnabled ? 'on' : ''}`}>
                      <div className="thumb" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Subscriptions Tab ─────────────────────────── */}
              {active === 'subscriptions' && (
                <div className="space-y-6">
                  <div className="rounded-2xl p-6" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-1)' }}>
                          Personal Free
                        </h3>
                        <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                          Your current plan
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[12px] font-semibold"
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        Free
                      </span>
                    </div>

                    {/* Usage stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        { label: 'Tasks', value: '47', max: 'Unlimited' },
                        { label: 'Lists', value: '5', max: '10' },
                        { label: 'Integrations', value: '1', max: '4' },
                        { label: 'File uploads', value: '12 MB', max: '100 MB' },
                      ].map(stat => (
                        <div key={stat.label} className="rounded-xl p-3"
                          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                          <p className="text-[12px] font-medium" style={{ color: 'var(--text-3)' }}>
                            {stat.label}
                          </p>
                          <p className="text-[18px] font-bold mt-1" style={{ color: 'var(--text-1)' }}>
                            {stat.value}
                          </p>
                          <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                            of {stat.max}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Upgrade CTA */}
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[14px] font-semibold transition-colors"
                      style={{ background: 'var(--accent)', color: '#fff' }}>
                      <Zap size={16} /> Upgrade to Pro
                    </button>
                  </div>
                </div>
              )}

              {/* ── Integrations Tab ──────────────────────────── */}
              {active === 'integrations' && (
                <div className="space-y-8">
                  {/* Free integrations */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>
                      Free
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {FREE_INTEGRATIONS.map(integration => (
                        <div key={integration.id}
                          className="flex items-center gap-3 rounded-xl p-4"
                          style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                            <integration.icon size={18} style={{ color: 'var(--text-2)' }} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[14px] font-medium" style={{ color: 'var(--text-1)' }}>
                              {integration.name}
                            </p>
                            <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                              {integration.description}
                            </p>
                          </div>
                          <button className="pill-interactive text-[12px]">
                            Connect
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro integrations */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                      Pro
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        Upgrade required
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {PRO_INTEGRATIONS.map(integration => (
                        <div key={integration.id}
                          className="flex items-center gap-3 rounded-xl p-4 opacity-60"
                          style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                            <integration.icon size={18} style={{ color: 'var(--text-2)' }} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[14px] font-medium" style={{ color: 'var(--text-1)' }}>
                              {integration.name}
                            </p>
                            <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                              {integration.description}
                            </p>
                          </div>
                          <button className="pill-interactive text-[12px] flex items-center gap-1" disabled>
                            <Zap size={12} /> Pro
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)' }}
            onClick={() => { setShowDeleteModal(false); setDeleteConfirmed(false) }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="rounded-2xl p-6 w-full max-w-md"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-bold" style={{ color: 'var(--text-1)' }}>
                  Delete account
                </h2>
                <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmed(false) }}
                  className="btn-icon w-8 h-8">
                  <X size={16} />
                </button>
              </div>

              <p className="text-[14px] mb-5" style={{ color: 'var(--text-2)' }}>
                Are you sure? This will permanently delete all your tasks and lists and any Pro subscription will be cancelled.
              </p>

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input type="checkbox" checked={deleteConfirmed}
                  onChange={e => setDeleteConfirmed(e.target.checked)}
                  className="mt-0.5" style={{ accentColor: ACCENT_RED }} />
                <span className="text-[13px]" style={{ color: 'var(--text-1)' }}>
                  Yes, I want to delete this team
                </span>
              </label>

              {/* Action buttons */}
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmed(false) }}
                  className="pill-interactive text-[13px]">
                  Cancel
                </button>
                <button onClick={handleDeleteAccount} disabled={!deleteConfirmed}
                  className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all"
                  style={{
                    background: deleteConfirmed ? ACCENT_RED : `${ACCENT_RED}30`,
                    color: deleteConfirmed ? '#fff' : `${ACCENT_RED}80`,
                    cursor: deleteConfirmed ? 'pointer' : 'not-allowed',
                  }}>
                  Delete team
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
