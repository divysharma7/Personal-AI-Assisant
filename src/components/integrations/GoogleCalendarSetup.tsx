'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Check, X } from 'lucide-react'
import { copy } from '@/lib/copy'
import { slideFromRight, buttonPress, ease } from '@/lib/motion'
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar'

interface GoogleCalendarSetupProps {
  open: boolean
  onClose: () => void
}

export default function GoogleCalendarSetup({ open, onClose }: GoogleCalendarSetupProps) {
  const { connected, disconnect } = useGoogleCalendar()
  const [autoSync, setAutoSync] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const handleConnect = () => {
    window.location.href = '/api/integrations/google/auth'
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await disconnect()
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={ease.fast}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            {...slideFromRight}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-pane)',
              borderLeft: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-2">
                <Calendar size={20} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {copy.calendar.setupTitle}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 px-6">
              {!connected ? (
                <>
                  {/* Setup steps */}
                  <div className="mb-8 flex flex-col gap-4">
                    {copy.calendar.setupSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: 'var(--accent)' }}
                        >
                          {i + 1}
                        </div>
                        <p className="text-sm pt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Connect button */}
                  <motion.button
                    {...buttonPress}
                    onClick={handleConnect}
                    className="w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition-opacity duration-150 cursor-pointer"
                    style={{ backgroundColor: 'var(--accent)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    {copy.calendar.connectCta}
                  </motion.button>
                </>
              ) : (
                <>
                  {/* Connected state */}
                  <div
                    className="mb-6 flex items-center gap-3 rounded-xl p-4"
                    style={{
                      backgroundColor: 'rgba(52, 211, 153, 0.1)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                    }}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: '#34d399' }}
                    >
                      <Check size={16} strokeWidth={2.5} className="text-white" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#34d399' }}>
                      {copy.calendar.connectedLabel}
                    </span>
                  </div>

                  {/* Calendar selection */}
                  <div className="mb-6">
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {copy.calendar.calendarLabel}
                    </label>
                    <select
                      defaultValue="primary"
                      className="w-full rounded-lg px-3 py-2 text-sm cursor-pointer"
                      style={{
                        backgroundColor: 'var(--bg-pane-2)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <option value="primary">{copy.calendar.primaryCalendar}</option>
                    </select>
                  </div>

                  {/* Auto-sync toggle */}
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {copy.calendar.autoSyncLabel}
                    </span>
                    <button
                      onClick={() => setAutoSync(!autoSync)}
                      className="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
                      style={{
                        backgroundColor: autoSync ? 'var(--accent)' : 'var(--border)',
                      }}
                    >
                      <span
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
                        style={{
                          transform: autoSync ? 'translateX(18px)' : 'translateX(2px)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Disconnect */}
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer disabled:opacity-50"
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
                    {copy.calendar.disconnectCta}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
