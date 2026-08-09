import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { type Theme } from '@/contexts/ThemeContext'
import { copy } from '@/lib/copy'
import { fade, ease } from '@/lib/motion'

interface FeaturesTabProps {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-pane-2)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: 24,
}

export default function FeaturesTab({ theme, setTheme }: FeaturesTabProps) {
  return (
    <motion.div key="features" {...fade} transition={ease.normal} className="flex flex-col gap-4">
      <section style={cardStyle}>
        <h3 className="type-section-title">
          {copy.settings.features.themeLabel}
        </h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Choose how Life OS appears across every workspace.
        </p>
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Active Theme</span>
          <select
            aria-label="Active theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value as Theme)}
            className="h-10 min-w-40 rounded-full border px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
          >
            <option value="system">System Preference</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </section>

      <section style={cardStyle}>
        <h3 className="type-section-title">
          Focus Sound & Alerts
        </h3>
        <p className="mt-1 text-sm text-pretty" style={{ color: 'var(--text-muted)' }}>
          Completion sounds and browser notifications use the same saved settings as the Focus timer.
        </p>
        <Link
          to="/focus/settings"
          className="mt-4 inline-flex h-10 items-center rounded-xl border px-4 text-sm font-semibold no-underline transition-colors hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          Configure Focus Alerts
        </Link>
      </section>
    </motion.div>
  )
}
