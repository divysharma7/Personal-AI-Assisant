'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, Plus, Square } from 'lucide-react'
import { buttonPress, fade, ease } from '@/lib/motion'

interface FocusControlsProps {
  isPaused: boolean
  onPauseResume: () => void
  onExtend: () => void
  onEnd: () => void
}

export default function FocusControls({
  isPaused,
  onPauseResume,
  onExtend,
  onEnd,
}: FocusControlsProps) {
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const handleEndClick = () => {
    if (showEndConfirm) {
      onEnd()
      setShowEndConfirm(false)
    } else {
      setShowEndConfirm(true)
    }
  }

  return (
    <div className="flex items-center gap-4 relative">
      {/* Pause / Resume */}
      <motion.button
        {...buttonPress}
        onClick={onPauseResume}
        className="flex h-12 w-12 items-center justify-center rounded-full cursor-pointer transition-colors duration-150"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          color: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
        }}
        title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
        aria-label={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? <Play size={20} strokeWidth={1.5} /> : <Pause size={20} strokeWidth={1.5} />}
      </motion.button>

      {/* +5 min */}
      <motion.button
        {...buttonPress}
        onClick={onExtend}
        className="flex h-12 items-center gap-1.5 rounded-full px-4 cursor-pointer transition-colors duration-150"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          color: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
        }}
        title="Extend +5 min (E)"
        aria-label="Extend by 5 minutes"
      >
        <Plus size={16} strokeWidth={1.5} />
        <span className="text-sm font-medium">5 min</span>
      </motion.button>

      {/* End */}
      <motion.button
        {...buttonPress}
        onClick={handleEndClick}
        className="flex h-12 w-12 items-center justify-center rounded-full cursor-pointer transition-colors duration-150"
        style={{
          backgroundColor: showEndConfirm ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
          color: showEndConfirm ? '#ef4444' : 'rgba(255, 255, 255, 0.9)',
          border: showEndConfirm ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onMouseEnter={(e) => {
          if (!showEndConfirm) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
          }
        }}
        onMouseLeave={(e) => {
          if (!showEndConfirm) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
          }
          setShowEndConfirm(false)
        }}
        title="End session (Esc)"
        aria-label={showEndConfirm ? 'Confirm end session' : 'End session'}
      >
        <Square size={18} strokeWidth={1.5} />
      </motion.button>

      {/* End confirm tooltip */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            {...fade}
            transition={ease.fast}
            className="absolute -top-10 right-0 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            Click again to end
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
