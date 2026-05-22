'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { scaleIn, fade, buttonPress, ease } from '@/lib/motion'
import { copy } from '@/lib/copy'

const COPY = copy.habitGallery

interface GalleryHabit {
  icon: string
  title: string
  frequency: string
}

const GALLERY_DATA: Record<string, GalleryHabit[]> = {
  'Content & Creative': [
    { icon: '\u270D\uFE0F', title: 'Write 500 words', frequency: 'Daily' },
    { icon: '\uD83C\uDFA8', title: 'Sketch for 15 min', frequency: 'Daily' },
    { icon: '\uD83D\uDCF8', title: 'Post on social media', frequency: '3x per week' },
    { icon: '\uD83C\uDFB5', title: 'Practice instrument', frequency: 'Daily' },
    { icon: '\uD83D\uDCDD', title: 'Journal entry', frequency: 'Daily' },
  ],
  'Learning': [
    { icon: '\uD83D\uDCDA', title: 'Read 30 pages', frequency: 'Daily' },
    { icon: '\uD83C\uDF10', title: 'Learn new language', frequency: 'Daily' },
    { icon: '\uD83D\uDCBB', title: 'Code challenge', frequency: 'Daily' },
    { icon: '\uD83C\uDF93', title: 'Online course lesson', frequency: '3x per week' },
    { icon: '\uD83E\uDDE0', title: 'Brain training puzzle', frequency: 'Daily' },
  ],
  'Health & Fitness': [
    { icon: '\uD83C\uDFCB\uFE0F', title: 'Workout', frequency: '5x per week' },
    { icon: '\uD83E\uDDD8', title: 'Meditate 10 min', frequency: 'Daily' },
    { icon: '\uD83D\uDCA7', title: 'Drink 8 glasses water', frequency: 'Daily' },
    { icon: '\uD83C\uDF4E', title: 'Eat vegetables', frequency: 'Daily' },
    { icon: '\uD83D\uDE34', title: 'Sleep by 11 PM', frequency: 'Daily' },
  ],
  'Networking & Career': [
    { icon: '\uD83E\uDD1D', title: 'Reach out to contact', frequency: '2x per week' },
    { icon: '\uD83D\uDCE7', title: 'Inbox zero', frequency: 'Daily' },
    { icon: '\uD83C\uDFAF', title: 'Review weekly goals', frequency: 'Weekly' },
    { icon: '\uD83D\uDCC8', title: 'Track expenses', frequency: 'Daily' },
    { icon: '\uD83D\uDCBE', title: 'Back up work', frequency: 'Weekly' },
  ],
}

interface HabitGalleryProps {
  open: boolean
  onClose: () => void
  onAdd: (habit: GalleryHabit) => void
}

export default function HabitGallery({ open, onClose, onAdd }: HabitGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>(COPY.categories[0])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleAdd = useCallback(
    (habit: GalleryHabit) => {
      onAdd(habit)
    },
    [onAdd]
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={ease.fast}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={onClose}
        >
          <motion.div
            {...scaleIn}
            transition={ease.normal}
            className="flex w-[560px] max-h-[80vh] flex-col rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-pane)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-modal)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {COPY.title}
              </h2>
              <motion.button
                {...buttonPress}
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <X size={16} strokeWidth={1.5} />
              </motion.button>
            </div>

            {/* Category tabs */}
            <div
              className="flex flex-wrap gap-1 px-6 py-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              {COPY.categories.map((cat) => {
                const active = activeCategory === cat
                return (
                  <motion.button
                    key={cat}
                    {...buttonPress}
                    onClick={() => setActiveCategory(cat)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                    style={{
                      backgroundColor: active ? 'var(--accent)' : 'transparent',
                      color: active ? '#FFFFFF' : 'var(--text-muted)',
                      border: active ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {cat}
                  </motion.button>
                )
              })}
            </div>

            {/* Gallery items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  {...fade}
                  transition={ease.normal}
                  className="flex flex-col gap-2"
                >
                  {(GALLERY_DATA[activeCategory] ?? []).map((habit) => (
                    <div
                      key={habit.title}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-150"
                      style={{
                        backgroundColor: 'var(--bg-pane-2)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span className="text-2xl">{habit.icon}</span>
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {habit.title}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--text-faint)' }}
                        >
                          {habit.frequency}
                        </p>
                      </div>
                      <motion.button
                        {...buttonPress}
                        onClick={() => handleAdd(habit)}
                        className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-opacity duration-150 cursor-pointer"
                        style={{ backgroundColor: 'var(--accent)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1'
                        }}
                      >
                        <Plus size={12} strokeWidth={2} />
                        {COPY.addCta}
                      </motion.button>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
