import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { ease, fade } from '@/lib/motion'
import GoogleCalendarSetup from '@/components/integrations/GoogleCalendarSetup'
import GoogleCalendarAccountCard from '@/components/integrations/GoogleCalendarAccountCard'
import { useGoogleCalendarAccounts } from '@/hooks/useGoogleCalendarAccounts'

interface IntegrationsTabProps {
  googleConnected: boolean
}

export default function IntegrationsTab({ googleConnected }: IntegrationsTabProps) {
  const [setupOpen, setSetupOpen] = useState(false)
  const { accounts, syncingIds, syncNow, retry, reconnect, disconnect, toggleCalendar } = useGoogleCalendarAccounts()

  return (
    <>
      <motion.section key="integrations" {...fade} transition={ease.normal} aria-labelledby="integrations-title">
        <header className="mb-6">
          <h2 id="integrations-title" className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Integrations</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Connect services that are ready for reliable, end-to-end use.
          </p>
        </header>

        <button
          type="button"
          onClick={() => setSetupOpen(true)}
          className="flex min-h-16 w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{ backgroundColor: 'var(--bg-pane-2)', borderColor: 'var(--border)' }}
          aria-describedby="google-calendar-description"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent)' }}>
            <CalendarDays size={20} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Google Calendar</span>
              {googleConnected && <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Connected</span>}
            </span>
            <span id="google-calendar-description" className="mt-1 block text-xs" style={{ color: 'var(--text-faint)' }}>
              Sync calendar events and schedule tasks with due dates.
            </span>
          </span>
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{googleConnected ? 'Manage' : 'Connect'}</span>
        </button>

        {googleConnected && accounts.length > 0 && (
          <section className="mt-6" aria-labelledby="connected-accounts-title">
            <h3 id="connected-accounts-title" className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
              Connected accounts
            </h3>
            <div className="flex flex-col gap-3">
              {accounts.map((account) => (
                <GoogleCalendarAccountCard
                  key={account.id}
                  account={account}
                  syncing={syncingIds.has(account.id)}
                  onSyncNow={syncNow}
                  onRetry={retry}
                  onReconnect={reconnect}
                  onDisconnect={disconnect}
                  onToggleCalendar={toggleCalendar}
                />
              ))}
            </div>
          </section>
        )}

        <p className="mt-5 text-xs text-pretty" style={{ color: 'var(--text-faint)' }}>
          Additional integrations appear here only after their connection and security checks pass.
        </p>
      </motion.section>

      <GoogleCalendarSetup open={setupOpen} onClose={() => setSetupOpen(false)} />
    </>
  )
}
