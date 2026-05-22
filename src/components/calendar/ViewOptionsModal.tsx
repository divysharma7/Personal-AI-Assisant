'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { scaleIn, ease, motionTokens, cssTransition } from '@/lib/motion'
import DisplayOptionsSection from './options/DisplayOptionsSection'
import TimeSettingsSection from './options/TimeSettingsSection'
import ColorSettingsSection from './options/ColorSettingsSection'
import StyleSection from './options/StyleSection'

interface ViewOptionsModalProps {
  open: boolean
  onClose: () => void
  options: ViewOptions
  onOptionsChange: (options: ViewOptions) => void
  lists?: { id: string; name: string; color: string; visible: boolean }[]
}

export interface ViewOptions {
  showWeekends: boolean
  showCompleted: boolean
  showCheckItem: boolean
  showAllRepeatCycle: boolean
  showHabit: boolean
  showFocusRecords: boolean
  showCountdown: boolean
  additionalTimeZone: boolean
  colorBy: 'list' | 'tag' | 'priority'
  itemStyle: 'modern' | 'classic'
  showHeatmap: boolean
  firstDayOfWeek: 'sunday' | 'monday' | 'saturday'
  timeFormat: '12h' | '24h'
  showWeekNumbers: boolean
  startHour: number
  endHour: number
  showDeclinedEvents: boolean
  defaultEventDuration: 30 | 60 | 120
  showCapacityBar: boolean
  colorMode: 'calendar' | 'priority' | 'single'
}

export const DEFAULT_VIEW_OPTIONS: ViewOptions = {
  showWeekends: true,
  showCompleted: false,
  showCheckItem: false,
  showAllRepeatCycle: false,
  showHabit: true,
  showFocusRecords: false,
  showCountdown: false,
  additionalTimeZone: false,
  colorBy: 'list',
  itemStyle: 'classic',
  showHeatmap: true,
  firstDayOfWeek: 'sunday',
  timeFormat: '12h',
  showWeekNumbers: false,
  startHour: 0,
  endHour: 24,
  showDeclinedEvents: false,
  defaultEventDuration: 60,
  showCapacityBar: true,
  colorMode: 'calendar',
}

type PageKey = 'main' | 'color' | 'style'

const PAGE_TITLES: Record<PageKey, string> = {
  main: 'View Options',
  color: 'Color',
  style: 'Style',
}

/** Drill-down row: label + right chevron, 44px height */
function DrillDownRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 44,
        cursor: 'pointer',
        border: 'none',
        backgroundColor: 'transparent',
        color: 'var(--text-primary)',
        fontSize: 14,
        fontWeight: 500,
        transition: cssTransition.bg,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <span>{label}</span>
      <ChevronRight size={16} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
    </button>
  )
}

/** Slide variants for page transitions */
const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? motionTokens.distance.xl : -motionTokens.distance.xl,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -motionTokens.distance.xl : motionTokens.distance.xl,
    opacity: 0,
  }),
}

export default function ViewOptionsModal({
  open,
  onClose,
  options,
  onOptionsChange,
  lists = [],
}: ViewOptionsModalProps) {
  const [page, setPage] = useState<PageKey>('main')
  const [direction, setDirection] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setPage('main')
      setDirection(0)
    }
  }, [open])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (page !== 'main') goBack()
        else onClose()
      }
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [open, onClose, page])

  if (!open) return null

  const update = (partial: Partial<ViewOptions>) => {
    onOptionsChange({ ...options, ...partial })
  }

  function navigateTo(target: PageKey) {
    setDirection(1)
    setPage(target)
  }

  function goBack() {
    setDirection(-1)
    setPage('main')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        ref={modalRef}
        {...scaleIn}
        transition={ease.slow}
        style={{
          width: 420,
          maxHeight: '80vh',
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-pane)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {page !== 'main' && (
              <button
                onClick={goBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  transition: cssTransition.bg,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
            )}
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {PAGE_TITLES[page]}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 6,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              transition: cssTransition.bg,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable content with page transitions */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={ease.normal}
              style={{ paddingBottom: 12 }}
            >
              {page === 'main' && (
                <MainPage
                  options={options}
                  update={update}
                  onNavigate={navigateTo}
                />
              )}

              {page === 'color' && (
                <ColorSettingsSection options={options} update={update} lists={lists} />
              )}

              {page === 'style' && (
                <StyleSection options={options} update={update} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

/** Main page: drill-down rows + toggle rows */
function MainPage({
  options,
  update,
  onNavigate,
}: {
  options: ViewOptions
  update: (partial: Partial<ViewOptions>) => void
  onNavigate: (page: PageKey) => void
}) {
  return (
    <>
      {/* Drill-down rows */}
      <div style={{ paddingTop: 4 }}>
        <DrillDownRow label="Color" onClick={() => onNavigate('color')} />
        <DrillDownRow label="Style" onClick={() => onNavigate('style')} />
      </div>

      <div style={{ margin: '4px 20px', height: 1, backgroundColor: 'var(--border)' }} />

      {/* Toggle rows */}
      <DisplayOptionsSection options={options} update={update} />

      <div style={{ margin: '4px 20px', height: 1, backgroundColor: 'var(--border)' }} />

      {/* Time settings (collapsed into main page) */}
      <TimeSettingsSection options={options} update={update} />
    </>
  )
}
