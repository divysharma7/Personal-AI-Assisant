import { useState } from 'react'
import { Bell, BellOff, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

type PermissionState = NotificationPermission | 'unsupported'

function readPermission(): PermissionState {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
}

export default function NotificationsTab() {
  const [permission, setPermission] = useState<PermissionState>(readPermission)
  const [requesting, setRequesting] = useState(false)

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return
    setRequesting(true)
    try {
      setPermission(await Notification.requestPermission())
    } finally {
      setRequesting(false)
    }
  }

  const labels: Record<PermissionState, { title: string; body: string }> = {
    granted: { title: 'Browser Alerts Allowed', body: 'Life OS can notify you when a Focus session ends.' },
    denied: { title: 'Browser Alerts Blocked', body: 'Allow notifications in your browser site settings, then reload Life OS.' },
    default: { title: 'Browser Alerts Not Set', body: 'Choose whether Life OS may notify you after a Focus session.' },
    unsupported: { title: 'Browser Alerts Unsupported', body: 'This browser does not support desktop notifications.' },
  }
  const status = labels[permission]

  return (
    <div className="space-y-5">
      <section className="surface-card p-4">
        <div className="flex items-start gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl"
            style={{ backgroundColor: 'var(--accent-soft)', color: permission === 'denied' ? 'var(--priority-high)' : 'var(--accent)' }}
          >
            {permission === 'denied' || permission === 'unsupported'
              ? <BellOff size={18} aria-hidden="true" />
              : <Bell size={18} aria-hidden="true" />}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{status.title}</h3>
            <p className="mt-1 text-xs text-pretty" style={{ color: 'var(--text-muted)' }}>{status.body}</p>
            {permission === 'default' ? (
              <button
                type="button"
                onClick={requestPermission}
                disabled={requesting}
                className="mt-4 h-10 rounded-xl px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-wait disabled:opacity-60"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {requesting ? 'Requesting Permission…' : 'Allow Browser Alerts'}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="surface-card p-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Focus Notifications</h3>
        <p className="mt-1 text-xs text-pretty" style={{ color: 'var(--text-muted)' }}>
          Browser permission controls whether alerts can be delivered. Focus settings control whether Life OS should send them.
        </p>
        <Link
          to="/focus/settings"
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold no-underline hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          Configure Focus Notifications <ExternalLink size={14} aria-hidden="true" />
        </Link>
      </section>

      <p className="text-xs text-pretty" style={{ color: 'var(--text-faint)' }}>
        Task and habit reminder delivery is not enabled yet. Existing reminder fields are saved, but Life OS will not claim an alert was scheduled until delivery is available.
      </p>
    </div>
  )
}
