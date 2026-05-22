'use client'

import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import { motionTokens } from '@/lib/motion'

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: motionTokens.duration.fast }}
      style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}
    >
      {/* AI Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          flexShrink: 0,
          backgroundColor: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Bot size={16} strokeWidth={1.5} color="#fff" />
      </div>

      {/* Bouncing dots */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '14px 18px',
          borderRadius: 18,
          borderBottomLeftRadius: 6,
          backgroundColor: 'var(--bg-pane-2)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: motionTokens.duration.crawl,
              repeat: Infinity,
              delay: i * motionTokens.duration.fast,
            }}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
