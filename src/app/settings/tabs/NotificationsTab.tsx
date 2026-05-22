'use client'

import { motion } from 'framer-motion'
import { fade, ease } from '@/lib/motion'

export default function NotificationsTab() {
  return (
    <motion.div key="notifications" {...fade} transition={ease.normal} className="flex flex-col gap-5">
      {/* Coming soon banner */}
      <div
        className="rounded-xl px-4 py-3"
        style={{
          backgroundColor: 'var(--accent-soft)',
          border: '1px solid var(--border)',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Notifications coming soon with the LAIF mobile app.
        </p>
      </div>

      {/* Disabled toggles */}
      {[
        { label: 'Habit reminders', desc: 'Get reminded when habits are due' },
        { label: 'Check-in nudges', desc: 'Daily nudge to complete check-in' },
        { label: 'Streak milestones', desc: 'Celebrate streak achievements' },
        { label: 'Quiet hours', desc: 'Pause all notifications' },
      ].map((toggle) => (
        <div key={toggle.label} className="flex items-center justify-between opacity-50">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {toggle.label}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              {toggle.desc}
            </p>
          </div>
          <button
            disabled
            className="relative h-5 w-9 rounded-full cursor-not-allowed"
            style={{ backgroundColor: 'var(--border)' }}
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white"
              style={{ transform: 'translateX(2px)' }}
            />
          </button>
        </div>
      ))}
    </motion.div>
  )
}
