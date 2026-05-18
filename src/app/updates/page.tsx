'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
import { copy } from '@/lib/copy'
import { fadeSlideUp, buttonPress, fade, ease } from '@/lib/motion'
import InfoBanner from '@/components/shared/InfoBanner'

type UpdateTab = 'all' | 'tasks' | 'messages' | 'lists'

const TABS: { key: UpdateTab; label: string }[] = [
  { key: 'all', label: copy.updates.tabs.all },
  { key: 'tasks', label: copy.updates.tabs.tasks },
  { key: 'messages', label: copy.updates.tabs.messages },
  { key: 'lists', label: copy.updates.tabs.lists },
]

export default function UpdatesPage() {
  const [activeTab, setActiveTab] = useState<UpdateTab>('all')
  const [tipDismissed, setTipDismissed] = useState(false)

  const emptyText = (() => {
    switch (activeTab) {
      case 'all':
        return copy.updates.emptyStates.all
      case 'tasks':
        return copy.updates.emptyStates.tasks
      case 'messages':
        return copy.updates.emptyStates.messages
      case 'lists':
        return copy.updates.emptyStates.lists
      default:
        return ''
    }
  })()

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Title */}
      <h1
        className="mb-5 text-[32px]"
        style={{ color: 'var(--text-primary)' }}
      >
        {copy.updates.title}
      </h1>

      {/* Tip banner */}
      <div className="mb-5">
        <InfoBanner
          message={copy.updates.tipBanner}
          onDismiss={() => setTipDismissed(true)}
          visible={!tipDismissed}
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.key
          return (
            <motion.button
              key={tab.key}
              {...buttonPress}
              onClick={() => setActiveTab(tab.key)}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: active ? 'var(--accent)' : 'transparent',
                color: active ? '#FFFFFF' : 'var(--text-muted)',
                border: active ? 'none' : '1px solid var(--border)',
              }}
            >
              {tab.label}
            </motion.button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          {...fadeSlideUp}
          transition={ease.normal}
          className="flex flex-1 flex-col items-center justify-center py-20"
        >
          <Bell
            size={40}
            strokeWidth={1}
            className="mb-4"
            style={{ color: 'var(--text-faint)' }}
          />
          <p className="max-w-sm text-center text-sm" style={{ color: 'var(--text-faint)' }}>
            {emptyText}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
