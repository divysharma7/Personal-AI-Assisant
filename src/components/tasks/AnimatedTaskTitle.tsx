'use client'
import { motion } from 'framer-motion'
import { taskCompletion } from '@/shared/design-system'

interface AnimatedTaskTitleProps {
  title: string
  completed: boolean
  className?: string
  style?: React.CSSProperties
}

export default function AnimatedTaskTitle({
  title,
  completed,
  className = '',
  style,
}: AnimatedTaskTitleProps) {
  return (
    <span
      className={`relative inline-block ${className}`}
      style={{
        ...style,
        color: completed ? 'var(--text-3)' : (style?.color ?? 'var(--text-1)'),
        transition: 'color 0.2s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {title}
      {/* Animated strikethrough line */}
      <motion.span
        aria-hidden
        variants={taskCompletion.strikethrough}
        animate={completed ? 'checked' : 'unchecked'}
        className="absolute left-0 top-1/2 h-[1.5px] w-full bg-current origin-left pointer-events-none"
        style={{ opacity: 0.6 }}
      />
    </span>
  )
}
