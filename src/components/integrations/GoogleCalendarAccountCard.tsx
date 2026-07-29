import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreHorizontal,
  RefreshCw,
  AlertTriangle,
  Unplug,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { fadeSlideDown, fadeSlideUp, buttonPress, ease, springs, motionTokens, cssTransition } from '@/lib/motion'
import type { ConnectedAccount, ConnectionStatus } from '@/hooks/useGoogleCalendarAccounts'

// ── Relative time formatter ────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'Synced just now'
  const min = Math.floor(sec / 60)
  if (min === 1) return 'Synced 1 minute ago'
  if (min < 60) return `Synced ${min} minutes ago`
  const hr = Math.floor(min / 60)
  if (hr === 1) return 'Synced 1 hour ago'
  if (hr < 24) return `Synced ${hr} hours ago`
  const day = Math.floor(hr / 24)
  if (day === 1) return 'Synced yesterday'
  return `Synced ${day} days ago`
}

// ── Status config ──────────────────────────────────────────────

interface StatusConfig {
  label: string
  bg: string
  color: string
  border: string
  icon: typeof CheckCircle2
}

const STATUS_MAP: Record<ConnectionStatus, StatusConfig> = {
  healthy: {
    label: 'Healthy',
    bg: 'rgba(52, 211, 153, 0.1)',
    color: '#34d399',
    border: 'rgba(52, 211, 153, 0.3)',
    icon: CheckCircle2,
  },
  syncing: {
    label: 'Syncing',
    bg: 'rgba(96, 165, 250, 0.1)',
    color: '#60a5fa',
    border: 'rgba(96, 165, 250, 0.3)',
    icon: Loader2,
  },
  delayed: {
    label: 'Delayed',
    bg: 'rgba(251, 191, 36, 0.1)',
    color: '#fbbf24',
    border: 'rgba(251, 191, 36, 0.3)',
    icon: Clock,
  },
  needs_attention: {
    label: 'Needs attention',
    bg: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: 'rgba(239, 68, 68, 0.3)',
    icon: AlertCircle,
  },
}

// ── Status badge ───────────────────────────────────────────────

function StatusIndicator({ status, syncing }: { status: ConnectionStatus; syncing: boolean }) {
  const effectiveStatus = syncing ? 'syncing' : status
  const cfg = STATUS_MAP[effectiveStatus]
  const Icon = cfg.icon
  const isSyncing = effectiveStatus === 'syncing'

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
      role="status"
      aria-label={`Connection status: ${cfg.label}`}
    >
      <Icon
        size={12}
        strokeWidth={2}
        style={isSyncing ? { animation: 'spin 1s linear infinite' } : undefined}
        aria-hidden
      />
      {cfg.label}
    </span>
  )
}

// ── Overflow menu ──────────────────────────────────────────────

interface OverflowMenuProps {
  onDisconnect: () => void
  onClose: () => void
}

function OverflowMenu({ onDisconnect, onClose }: OverflowMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <motion.div
      {...fadeSlideDown}
      transition={ease.fast}
      ref={ref}
      role="menu"
      aria-label="Account actions"
      className="absolute right-0 top-full z-50 mt-1 w-[200px] rounded-[var(--radius-lg,16px)] py-1.5"
      style={{
        backgroundColor: 'var(--bg-pane-2, var(--bg-pane))',
        border: '1px solid var(--overlay-2, var(--border))',
        boxShadow: 'var(--shadow-elevated)',
      }}
    >
      <div className="mx-3 my-1.5 h-px" style={{ backgroundColor: 'var(--border)' }} />
      <button
        role="menuitem"
        onClick={() => { onDisconnect(); onClose() }}
        className="flex w-full items-center gap-3 px-4 py-2 text-[14px] font-medium cursor-pointer"
        style={{ color: '#ef4444', background: 'none', border: 'none', transition: cssTransition.bg }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <Unplug size={15} strokeWidth={1.5} aria-hidden />
        Disconnect
      </button>
    </motion.div>
  )
}

// ── Disconnect confirmation dialog ─────────────────────────────

interface DisconnectDialogProps {
  accountDisplayName: string
  accountEmail: string
  onConfirm: () => void
  onCancel: () => void
}

function DisconnectDialog({ accountDisplayName, accountEmail, onConfirm, onCancel }: DisconnectDialogProps) {
  // Trap focus + escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={ease.fast}
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        onClick={onCancel}
        aria-hidden
      />

      {/* Dialog */}
      <motion.div
        {...fadeSlideUp}
        transition={springs.snappy}
        role="alertdialog"
        aria-modal="true"
        aria-label={`Disconnect ${accountDisplayName}`}
        className="fixed left-1/2 top-1/2 z-50 w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6"
        style={{
          backgroundColor: 'var(--bg-pane)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg cursor-pointer"
          style={{ color: 'var(--text-faint)', background: 'none', border: 'none', transition: cssTransition.bg }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        {/* Icon */}
        <div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
        >
          <AlertTriangle size={20} strokeWidth={1.5} style={{ color: '#ef4444' }} aria-hidden />
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          Disconnect {accountDisplayName}?
        </h3>

        {/* Body */}
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Cached calendar events from <strong style={{ color: 'var(--text-primary)' }}>{accountEmail}</strong> will be
          removed from Life OS. Nothing will be deleted from your Google Calendar — your events stay untouched.
        </p>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-faint)' }}>
          You can reconnect this account at any time.
        </p>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <motion.button
            {...buttonPress}
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium cursor-pointer"
            style={{
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              transition: cssTransition.bg,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-pane-2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
          >
            Cancel
          </motion.button>
          <motion.button
            {...buttonPress}
            onClick={onConfirm}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white cursor-pointer"
            style={{
              backgroundColor: '#ef4444',
              border: 'none',
              transition: cssTransition.bg,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            Disconnect
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}

// ── Manage calendars popover ───────────────────────────────────

interface ManageCalendarsProps {
  calendars: ConnectedAccount['calendars']
  onToggle: (calendarId: string) => void
  onClose: () => void
}

function ManageCalendars({ calendars, onToggle, onClose }: ManageCalendarsProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <motion.div
      {...fadeSlideUp}
      transition={springs.snappy}
      ref={ref}
      role="dialog"
      aria-label="Manage calendars"
      className="absolute left-0 bottom-full z-50 mb-2 w-[280px] rounded-2xl p-4"
      style={{
        backgroundColor: 'var(--bg-pane)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-elevated)',
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          Calendars
        </span>
        <button
          onClick={onClose}
          aria-label="Close calendar picker"
          className="flex h-6 w-6 items-center justify-center rounded-md cursor-pointer"
          style={{ color: 'var(--text-faint)', background: 'none', border: 'none' }}
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {calendars.map((cal) => (
          <label
            key={cal.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm cursor-pointer"
            style={{
              color: 'var(--text-primary)',
              transition: cssTransition.bg,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <input
              type="checkbox"
              checked={cal.selected}
              onChange={() => onToggle(cal.id)}
              className="h-4 w-4 rounded accent-[var(--accent)]"
              style={{ accentColor: 'var(--accent)' }}
            />
            <span className="font-medium">{cal.name}</span>
          </label>
        ))}
      </div>
    </motion.div>
  )
}

// ── Google icon SVG ────────────────────────────────────────────

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// ── Main card component ────────────────────────────────────────

interface GoogleCalendarAccountCardProps {
  account: ConnectedAccount
  syncing: boolean
  onSyncNow: (id: string) => void
  onRetry: (id: string) => void
  onReconnect: (id: string) => void
  onDisconnect: (id: string) => void
  onToggleCalendar: (accountId: string, calendarId: string) => void
}

export default function GoogleCalendarAccountCard({
  account,
  syncing,
  onSyncNow,
  onRetry,
  onReconnect,
  onDisconnect,
  onToggleCalendar,
}: GoogleCalendarAccountCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [disconnectOpen, setDisconnectOpen] = useState(false)
  const [calendarsOpen, setCalendarsOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const calRef = useRef<HTMLDivElement>(null)

  const effectiveStatus: ConnectionStatus = syncing ? 'syncing' : account.status
  const selectedCount = account.calendars.filter((c) => c.selected).length

  const handleDisconnectConfirm = useCallback(() => {
    onDisconnect(account.id)
    setDisconnectOpen(false)
  }, [account.id, onDisconnect])

  const needsAction = effectiveStatus === 'delayed' || effectiveStatus === 'needs_attention'

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: motionTokens.distance.sm }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.snappy}
        style={{
          backgroundColor: 'var(--bg-pane-2)',
          border: `1px solid ${needsAction
            ? STATUS_MAP[effectiveStatus].border
            : 'var(--border)'
          }`,
          borderRadius: 16,
          overflow: 'visible',
          position: 'relative',
        }}
      >
        {/* ── Top section: icon, identity, status, actions ──── */}
        <div
          className="flex items-center gap-4"
          style={{ padding: '16px 20px', minHeight: 64 }}
        >
          {/* Google icon */}
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'var(--bg-hover)' }}
            aria-hidden
          >
            <GoogleIcon size={22} />
          </div>

          {/* Identity + sync time */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {account.displayName}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                {account.email}
              </span>
            </div>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-faint)' }}>
              {relativeTime(account.lastSyncAt)}
              {selectedCount > 0 && (
                <span style={{ marginLeft: 6, opacity: 0.7 }}>
                  {'\u00B7'} {selectedCount} calendar{selectedCount !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>

          {/* Status badge */}
          <StatusIndicator status={account.status} syncing={syncing} />

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status-specific action */}
            {effectiveStatus === 'delayed' && !syncing && (
              <motion.button
                {...buttonPress}
                onClick={() => onRetry(account.id)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer"
                style={{
                  color: '#fbbf24',
                  backgroundColor: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  transition: cssTransition.bg,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.18)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.1)' }}
                aria-label="Retry sync"
              >
                <RefreshCw size={12} strokeWidth={2} aria-hidden />
                Retry
              </motion.button>
            )}
            {effectiveStatus === 'needs_attention' && !syncing && (
              <motion.button
                {...buttonPress}
                onClick={() => onReconnect(account.id)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer"
                style={{
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  transition: cssTransition.bg,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.18)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)' }}
                aria-label="Reconnect account"
              >
                <Unplug size={12} strokeWidth={2} aria-hidden />
                Reconnect
              </motion.button>
            )}

            {/* Overflow menu trigger */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen((p) => !p)}
                aria-label="More actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer"
                style={{ color: 'var(--text-faint)', background: 'none', border: 'none', transition: cssTransition.bg }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <MoreHorizontal size={18} strokeWidth={1.5} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <OverflowMenu
                    onDisconnect={() => setDisconnectOpen(true)}
                    onClose={() => setMenuOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Bottom action bar ──────────────────────────────── */}
        <div
          className="flex items-center gap-2"
          style={{
            padding: '0 20px 14px 76px',
          }}
        >
          {/* Manage calendars */}
          <div ref={calRef} style={{ position: 'relative' }}>
            <motion.button
              {...buttonPress}
              onClick={() => setCalendarsOpen((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer"
              style={{
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                transition: cssTransition.bg,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-pane-2)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
              aria-haspopup="dialog"
              aria-expanded={calendarsOpen}
            >
              <CalendarClock size={13} strokeWidth={1.5} aria-hidden />
              Manage calendars
              {calendarsOpen ? (
                <ChevronUp size={12} strokeWidth={2} aria-hidden />
              ) : (
                <ChevronDown size={12} strokeWidth={2} aria-hidden />
              )}
            </motion.button>
            <AnimatePresence>
              {calendarsOpen && (
                <ManageCalendars
                  calendars={account.calendars}
                  onToggle={(calId) => onToggleCalendar(account.id, calId)}
                  onClose={() => setCalendarsOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Sync now */}
          <motion.button
            {...buttonPress}
            onClick={() => onSyncNow(account.id)}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              color: 'var(--accent)',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              transition: cssTransition.bg,
            }}
            onMouseEnter={(e) => { if (!syncing) e.currentTarget.style.backgroundColor = 'var(--bg-pane-2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
            aria-label={syncing ? 'Syncing now' : 'Sync now'}
          >
            <RefreshCw
              size={13}
              strokeWidth={1.5}
              aria-hidden
              style={syncing ? { animation: 'spin 1s linear infinite' } : undefined}
            />
            {syncing ? 'Syncing\u2026' : 'Sync now'}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Disconnect confirmation dialog ────────────────────── */}
      <AnimatePresence>
        {disconnectOpen && (
          <DisconnectDialog
            accountDisplayName={account.displayName}
            accountEmail={account.email}
            onConfirm={handleDisconnectConfirm}
            onCancel={() => setDisconnectOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Global keyframes for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
