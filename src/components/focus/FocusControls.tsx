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

  const btnStyle = {
    backgroundColor: 'var(--overlay-2, rgba(108,108,158,0.12))',
    color: 'var(--text-primary)',
    border: '1px solid var(--overlay-3, rgba(108,108,158,0.2))',
  }
  const btnHoverIn = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--overlay-3, rgba(108,108,158,0.25))'
  }
  const btnHoverOut = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--overlay-2, rgba(108,108,158,0.12))'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
      {/* Pause / Resume */}
      <motion.button
        {...buttonPress}
        onClick={onPauseResume}
        style={{
          ...btnStyle,
          width: 48, height: 48, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background-color 180ms ease-out',
        }}
        onMouseEnter={btnHoverIn}
        onMouseLeave={btnHoverOut}
        title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
        aria-label={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? <Play size={20} strokeWidth={1.5} /> : <Pause size={20} strokeWidth={1.5} />}
      </motion.button>

      {/* +5 min */}
      <motion.button
        {...buttonPress}
        onClick={onExtend}
        style={{
          ...btnStyle,
          height: 48, borderRadius: 999,
          display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px',
          cursor: 'pointer', fontSize: 14, fontWeight: 600,
          fontFamily: 'Inter, system-ui, sans-serif',
          transition: 'background-color 180ms ease-out',
        }}
        onMouseEnter={btnHoverIn}
        onMouseLeave={btnHoverOut}
        title="Extend +5 min (E)"
        aria-label="Extend by 5 minutes"
      >
        <Plus size={16} strokeWidth={1.5} />
        <span>5 min</span>
      </motion.button>

      {/* End */}
      <motion.button
        {...buttonPress}
        onClick={handleEndClick}
        style={{
          width: 48, height: 48, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: showEndConfirm ? 'rgba(239, 68, 68, 0.15)' : btnStyle.backgroundColor,
          color: showEndConfirm ? '#ef4444' : btnStyle.color,
          border: showEndConfirm ? '1px solid rgba(239, 68, 68, 0.3)' : btnStyle.border,
          transition: 'background-color 180ms ease-out, color 180ms ease-out, border-color 180ms ease-out',
        }}
        onMouseEnter={(e) => {
          if (!showEndConfirm) btnHoverIn(e)
        }}
        onMouseLeave={(e) => {
          if (!showEndConfirm) btnHoverOut(e)
          setShowEndConfirm(false)
        }}
        title="End session"
        aria-label={showEndConfirm ? 'Confirm end session' : 'End session'}
      >
        <Square size={18} strokeWidth={1.5} />
      </motion.button>

      {/* Confirm tooltip */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            {...fade}
            transition={ease.fast}
            style={{
              position: 'absolute', top: -36, right: 0,
              padding: '4px 12px', borderRadius: 8,
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Click again to end
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
