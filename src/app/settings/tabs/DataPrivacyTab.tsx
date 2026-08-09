import { useRef, useState, type FormEvent } from 'react'
import { Download, ShieldAlert, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { http } from '@/lib/api/client'

export default function DataPrivacyTab() {
  const navigate = useNavigate()
  const passwordRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const exportData = async () => {
    setExporting(true)
    setExportStatus('')
    try {
      const payload = await http.get<Record<string, unknown>>('/api/users/me/export')
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `life-os-export-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      setExportStatus('Your export is ready in Downloads.')
    } catch (cause) {
      setExportStatus(cause instanceof Error ? cause.message : 'Data could not be exported. Try again.')
    } finally {
      setExporting(false)
    }
  }

  const deleteAccount = async (event: FormEvent) => {
    event.preventDefault()
    if (confirmation !== 'DELETE') {
      setDeleteError('Type DELETE exactly to confirm permanent account deletion.')
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      await http.post('/api/users/me/delete-account', { password })
      navigate('/login', { replace: true })
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : 'Account could not be deleted. Check your password and try again.')
      passwordRef.current?.focus()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="surface-card p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <Download size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-pretty" style={{ color: 'var(--text-primary)' }}>Export Your Data</h3>
            <p className="mt-1 text-xs text-pretty" style={{ color: 'var(--text-muted)' }}>
              Download your tasks, habits, calendar data, focus records, settings, and chat history as JSON.
            </p>
            <button
              type="button"
              onClick={exportData}
              disabled={exporting}
              className="mt-4 h-10 rounded-xl border px-4 text-sm font-semibold transition-colors hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-wait disabled:opacity-60"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {exporting ? 'Preparing Export…' : 'Export All Data'}
            </button>
            <p className="mt-2 min-h-4 text-xs" aria-live="polite" style={{ color: 'var(--text-muted)' }}>{exportStatus}</p>
          </div>
        </div>
      </section>

      <section className="surface-card p-4" style={{ borderColor: 'var(--danger-border)' }}>
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--priority-high) 12%, transparent)', color: 'var(--priority-high)' }}>
            <ShieldAlert size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--priority-high)' }}>Delete Account</h3>
            <p className="mt-1 text-xs text-pretty" style={{ color: 'var(--text-muted)' }}>
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            {!confirmOpen ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="mt-4 flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--priority-high)]"
                style={{ borderColor: 'var(--priority-high)', color: 'var(--priority-high)' }}
              >
                <Trash2 size={15} aria-hidden="true" /> Delete Account…
              </button>
            ) : (
              <form onSubmit={deleteAccount} className="mt-5 space-y-4" aria-label="Confirm account deletion">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Current Password</span>
                  <input
                    ref={passwordRef}
                    type="password"
                    name="current-password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 w-full rounded-xl border bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--priority-high)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Type DELETE to Confirm</span>
                  <input
                    type="text"
                    name="delete-confirmation"
                    autoComplete="off"
                    spellCheck={false}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    className="h-11 w-full rounded-xl border bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--priority-high)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </label>
                <p role="alert" className="min-h-4 text-xs" style={{ color: 'var(--priority-high)' }}>{deleteError}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setConfirmOpen(false); setPassword(''); setConfirmation(''); setDeleteError('') }}
                    disabled={deleting}
                    className="h-10 rounded-xl px-4 text-sm font-medium hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deleting || !password || confirmation !== 'DELETE'}
                    className="h-10 rounded-xl px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--priority-high)] disabled:cursor-not-allowed disabled:opacity-45"
                    style={{ backgroundColor: 'var(--priority-high)' }}
                  >
                    {deleting ? 'Deleting Account…' : 'Permanently Delete Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
