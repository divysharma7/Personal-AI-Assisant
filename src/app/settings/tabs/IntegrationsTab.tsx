'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fade, ease } from '@/lib/motion'
import GoogleCalendarSetup from '@/components/integrations/GoogleCalendarSetup'
import { MCP_TOOLS } from '@/mcp/tools'

interface IntegrationsTabProps {
  googleConnected: boolean
}

/* --- Integration definitions --- */
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

/* --- MCP Server Card --- */

function McpServerCard() {
  const [mcpEnabled, setMcpEnabled] = useState(false)
  const [mcpApiKey, setMcpApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [copied, setCopied] = useState(false)

  // Fetch current MCP state
  useEffect(() => {
    fetch('/api/users/me/mcp')
      .then((r) => r.json())
      .then((data: { mcpEnabled: boolean; mcpApiKey: string | null }) => {
        setMcpEnabled(data.mcpEnabled)
        setMcpApiKey(data.mcpApiKey)
      })
      .catch(() => {/* silent */})
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = useCallback(async () => {
    setToggling(true)
    try {
      const res = await fetch('/api/users/me/mcp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !mcpEnabled }),
      })
      const data = (await res.json()) as { mcpEnabled: boolean; mcpApiKey: string | null }
      setMcpEnabled(data.mcpEnabled)
      setMcpApiKey(data.mcpApiKey)
    } catch {
      /* silent */
    } finally {
      setToggling(false)
    }
  }, [mcpEnabled])

  const handleCopy = useCallback(() => {
    if (!mcpApiKey) return
    navigator.clipboard.writeText(mcpApiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [mcpApiKey])

  const connectionUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/mcp`
    : 'http://localhost:3000/api/mcp'

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 16,
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-4"
        style={{ padding: '16px 24px', minHeight: 64 }}
      >
        {/* Icon */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'var(--bg-hover)', fontSize: 20 }}
        >
          {'\u{1F916}'}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              MCP Server
            </span>
            <span style={badgeStyle}>API</span>
            {mcpEnabled && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399' }}
              >
                Active
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-faint)' }}>
            Let external AI tools access your tasks and calendar
          </p>
        </div>

        {/* Toggle */}
        <button
          onClick={handleToggle}
          disabled={loading || toggling}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            border: 'none',
            cursor: loading || toggling ? 'wait' : 'pointer',
            backgroundColor: mcpEnabled ? 'var(--accent)' : 'var(--bg-hover)',
            position: 'relative',
            transition: 'background-color 0.2s',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#fff',
              position: 'absolute',
              top: 3,
              left: mcpEnabled ? 23 : 3,
              transition: 'left 0.2s',
            }}
          />
        </button>
      </div>

      {/* Expanded details when enabled */}
      <AnimatePresence>
        {mcpEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* Connection URL */}
              <div>
                <label
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}
                >
                  Connection URL
                </label>
                <div
                  className="text-xs font-mono"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    padding: '8px 12px',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    userSelect: 'all',
                  }}
                >
                  {connectionUrl}
                </div>
              </div>

              {/* API Key */}
              <div>
                <label
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}
                >
                  API Key
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="text-xs font-mono flex-1"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      padding: '8px 12px',
                      borderRadius: 8,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      userSelect: 'all',
                    }}
                  >
                    {mcpApiKey || '...'}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '8px 14px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-pane-2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Exposed tools */}
              <div>
                <label
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}
                >
                  Exposed tools
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  {MCP_TOOLS.map((tool) => (
                    <div key={tool.name} className="flex items-baseline gap-2 text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>{'\u2022'}</span>
                      <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                        {tool.name}
                      </span>
                      <span style={{ color: 'var(--text-faint)' }}>
                        {'\u2014'} {tool.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* --- Main Component --- */

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

        {/* MCP Server Card */}
        <McpServerCard />
      </motion.div>

      {/* Google Calendar Setup Panel */}
      <GoogleCalendarSetup
        open={gcalSetupOpen}
        onClose={() => setGcalSetupOpen(false)}
      />
    </>
  )
}
