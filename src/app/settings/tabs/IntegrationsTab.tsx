'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { fade, ease } from '@/lib/motion'
import GoogleCalendarSetup from '@/components/integrations/GoogleCalendarSetup'

interface IntegrationsTabProps {
  googleConnected: boolean
}

export default function IntegrationsTab({ googleConnected }: IntegrationsTabProps) {
  const [gcalSetupOpen, setGcalSetupOpen] = useState(false)

  return (
    <>
      <motion.div key="integrations" {...fade} transition={ease.normal} className="flex flex-col gap-4">
        {/* Google Calendar — active */}
        <div
          className="flex flex-col gap-3 rounded-xl p-5"
          style={{
            backgroundColor: 'var(--bg-pane-2)',
            border: googleConnected ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <Calendar size={22} strokeWidth={1.5} style={{ color: 'var(--text-primary)' }} />
            <div className="flex-1">
              <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Google Calendar</span>
              {googleConnected && (
                <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399' }}>Connected</span>
              )}
            </div>
            <button
              onClick={() => setGcalSetupOpen(true)}
              className="rounded-full px-4 py-1.5 text-[13px] font-medium cursor-pointer"
              style={{
                backgroundColor: googleConnected ? 'rgba(52,211,153,0.15)' : 'var(--accent)',
                color: googleConnected ? '#34d399' : '#fff',
                border: 'none', transition: 'opacity 150ms ease',
              }}
            >
              {googleConnected ? 'Manage' : 'Connect'}
            </button>
          </div>
          <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>
            Sync your tasks and events with Google Calendar. See scheduled tasks as calendar blocks.
          </p>
        </div>

        {/* Alexa — coming soon */}
        <div className="flex flex-col gap-3 rounded-xl p-5" style={{ backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">🔵</span>
            <div className="flex-1">
              <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Amazon Alexa</span>
              <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--text-faint)' }}>Coming soon</span>
            </div>
          </div>
          <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>
            Add tasks, check your schedule, and start focus sessions with voice commands. &quot;Alexa, what&apos;s on my LAIF today?&quot;
          </p>
        </div>

        {/* MCP Claude — coming soon */}
        <div className="flex flex-col gap-3 rounded-xl p-5" style={{ backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">🤖</span>
            <div className="flex-1">
              <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>MCP Claude Integration</span>
              <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--text-faint)' }}>Coming soon</span>
            </div>
          </div>
          <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>
            Connect LAIF as an MCP server to Claude Code and Claude Desktop. Manage tasks, query your schedule, and create habits directly from Claude.
          </p>
        </div>

        {/* Hermes Agent — coming soon */}
        <div className="flex flex-col gap-3 rounded-xl p-5" style={{ backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">🧠</span>
            <div className="flex-1">
              <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Hermes Agent</span>
              <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--text-faint)' }}>Coming soon</span>
            </div>
          </div>
          <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>
            Connect Nous Research&apos;s Hermes Agent to LAIF. A self-improving AI that learns your workflow, generates reusable skills from experience, and manages tasks across 20+ platforms including Telegram, Slack, and WhatsApp.
          </p>
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
