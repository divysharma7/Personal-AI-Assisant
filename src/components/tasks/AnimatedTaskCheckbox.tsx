'use client'
import { motion } from 'framer-motion'
import { taskCompletion } from '@/shared/design-system'

interface AnimatedTaskCheckboxProps {
  checked: boolean
  onToggle: () => void
  size?: number
  color?: string
}

export default function AnimatedTaskCheckbox({
  checked,
  onToggle,
  size = 18,
  color = 'var(--color-task)',
}: AnimatedTaskCheckboxProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if ('vibrate' in navigator) navigator.vibrate(10)
    onToggle()
  }

  return (
    <motion.button
      variants={taskCompletion.checkbox}
      animate={checked ? 'checked' : 'unchecked'}
      onClick={handleClick}
      className="flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
      title={checked ? 'Mark as todo' : 'Mark as done'}
    >
      {/* Circle border */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        style={{ position: 'absolute' }}
      >
        <circle
          cx="10"
          cy="10"
          r="8.5"
          stroke={checked ? color : 'var(--text-3)'}
          strokeWidth="1.5"
          fill={checked ? color : 'none'}
          style={{ transition: 'fill 0.15s cubic-bezier(0.16,1,0.3,1), stroke 0.15s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>

      {/* Checkmark */}
      <motion.svg
        variants={taskCompletion.checkmark}
        animate={checked ? 'checked' : 'unchecked'}
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 12 12"
        fill="none"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <path
          d="M2.5 6.5L5 9L9.5 3.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.button>
  )
}
