'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { fade, ease } from '@/lib/motion'
import GoogleCalendarSetup from '@/components/integrations/GoogleCalendarSetup'

interface IntegrationsTabProps {
  googleConnected: boolean
}

/* ─── Integration definitions ─── */
const INTEGRATIONS = [
  {
    id: 'gmail',
    icon: '\u{1F4E7}',
    name: 'Gmail',
    description: 'Convert emails into tasks',
    badge: 'Basic',
  },
  {
    id: 'google-calendar',
    icon: '\u{1F4C5}',
    name: 'Google Calendar',
    description: 'Create calendar events from tasks with due dates',
    badge: 'Basic',
  },
  {
    id: 'email-forwarding',
    icon: '\u2709\uFE0F',
    name: 'Email forwarding',
    description: 'Forward emails to create tasks',
    badge: 'Basic',
  },
  {
    id: 'slack',
    icon: '\u{1F4AC}',
    name: 'Slack',
    description: 'Create tasks from Slack messages',
    badge: 'Basic',
  },
  {
    id: 'github',
    icon: '\u{1F419}',
    name: 'GitHub',
    description: 'Receive pull requests and issues as tasks',
    badge: 'Basic',
  },
] as const

const badgeStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-hover)',
  color: 'var(--text-faint)',
  borderRadius: 999,
  padding: '2px 8px',
  fontSize: 11,
  fontWeight: 500,
}

export default function IntegrationsTab({ googleConnected }: IntegrationsTabProps) {
  const [gcalSetupOpen, setGcalSetupOpen] = useState(false)

  return (
    <>
      <motion.div key="integrations" {...fade} transition={ease.normal} className="flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Integrations
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Supercharge your workflow and connect the tools you use every day
          </p>
          <a
            href="#"
            className="mt-1 inline-block text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Learn more &#x2197;
          </a>
        </div>

        {/* Integration rows */}
        <div
          style={{
            backgroundColor: 'var(--bg-pane-2)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {INTEGRATIONS.map((integration, idx) => {
            const isGcal = integration.id === 'google-calendar'
            const isConnected = isGcal && googleConnected
            const isLast = idx === INTEGRATIONS.length - 1

            return (
              <div
                key={integration.id}
                className="flex items-center gap-4 transition-colors duration-150 cursor-pointer"
                style={{
                  padding: '16px 24px',
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  minHeight: 64,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                onClick={() => {
                  if (isGcal) setGcalSetupOpen(true)
                }}
              >
                {/* Icon */}
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'var(--bg-hover)', fontSize: 20 }}
                >
                  {integration.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {integration.name}
                    </span>
                    <span style={badgeStyle}>{integration.badge}</span>
                    {isConnected && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399' }}
                      >
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-faint)' }}>
                    {integration.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Google Calendar Setup Panel */}
      <GoogleCalendarSetup
        open={gcalSetupOpen}
        onClose={() => setGcalSetupOpen(false)}
      />
    </>
  )
}
