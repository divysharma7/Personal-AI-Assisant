'use client'

import { motion } from 'framer-motion'
import { slideFromBottom, ease, buttonPress } from '@/lib/motion'

type SessionAction = 'break' | 'extend15' | 'extend25' | 'done'

interface SessionCompletePromptProps {
  onAction: (action: SessionAction) => void
}

export default function SessionCompletePrompt({ onAction }: SessionCompletePromptProps) {
  return (
    <motion.div
      {...slideFromBottom}
      transition={ease.slow}
      className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 rounded-t-2xl px-6 py-8"
      style={{
        backgroundColor: 'rgba(10, 10, 20, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <p
        className="mb-2 text-lg font-semibold"
        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
      >
        Session complete
      </p>

      {/* Primary: Take a break */}
      <motion.button
        {...buttonPress}
        onClick={() => onAction('break')}
        className="w-full max-w-xs rounded-full px-6 py-3 text-sm font-semibold cursor-pointer transition-opacity duration-150"
        style={{
          backgroundColor: 'var(--accent, #FF4D3D)',
          color: '#ffffff',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
      >
        Take a 5-min break
      </motion.button>

      {/* Extend options */}
      <motion.button
        {...buttonPress}
        onClick={() => onAction('extend15')}
        className="w-full max-w-xs rounded-full px-6 py-3 text-sm font-medium cursor-pointer transition-colors duration-150"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          color: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)' }}
      >
        Extend +15 min — I&apos;m in flow
      </motion.button>

      <motion.button
        {...buttonPress}
        onClick={() => onAction('extend25')}
        className="w-full max-w-xs rounded-full px-6 py-3 text-sm font-medium cursor-pointer transition-colors duration-150"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          color: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)' }}
      >
        Extend +25 min — keep going
      </motion.button>

      {/* Ghost: Done */}
      <motion.button
        {...buttonPress}
        onClick={() => onAction('done')}
        className="w-full max-w-xs rounded-full px-6 py-3 text-sm font-medium cursor-pointer transition-colors duration-150"
        style={{
          backgroundColor: 'transparent',
          color: 'rgba(255, 255, 255, 0.5)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        Done for now
      </motion.button>
    </motion.div>
  )
}
