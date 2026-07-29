import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, ChevronUp, ChevronDown, ArrowRightLeft, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { ease, springs, motionTokens } from '@/lib/motion'
import { useCalendarControls, CalendarEntry, CalendarGroup } from '@/hooks/useCalendarControls'

// ── Row component ──────────────────────────────────────────────

interface CalendarControlRowProps {
  entry: CalendarEntry
  index: number
  groupLength: number
  pending: boolean
  errored: boolean
  onMoveToGroup: (id: string, group: CalendarGroup) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onToggleVisibility: (id: string) => void
}

function CalendarControlRow({
  entry,
  index,
  groupLength,
  pending,
  errored,
  onMoveToGroup,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
}: CalendarControlRowProps) {
  const targetGroup: CalendarGroup = entry.group === 'active' ? 'passive' : 'active'
  const targetLabel = targetGroup === 'active' ? 'Move to Active' : 'Move to Passive'
  const canMoveUp = index > 0
  const canMoveDown = index < groupLength - 1

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: motionTokens.distance.xs }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -motionTokens.distance.xs }}
      transition={springs.snappy}
      className="group/row flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors duration-150 sm:gap-3 sm:px-4"
      style={{
        backgroundColor: errored
          ? 'rgba(239, 68, 68, 0.08)'
          : pending
            ? 'var(--bg-hover)'
            : 'transparent',
        border: errored ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent',
        minHeight: 44,
      }}
      onMouseEnter={(e) => {
        if (!pending && !errored) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
      }}
      onMouseLeave={(e) => {
        if (!pending && !errored) e.currentTarget.style.backgroundColor = 'transparent'
      }}
      role="listitem"
      aria-label={`${entry.name} — ${entry.accountLabel}${entry.readOnly ? ', read-only' : ''}`}
    >
      {/* Drag handle (visual only — actual reorder via buttons) */}
      <span
        className="hidden flex-shrink-0 cursor-grab items-center sm:flex"
        style={{ color: 'var(--text-faint)' }}
        aria-hidden
      >
        <GripVertical size={14} strokeWidth={1.5} />
      </span>

      {/* Color swatch */}
      <span
        className="h-3 w-3 flex-shrink-0 rounded-full"
        style={{ backgroundColor: entry.color }}
        aria-hidden
      />

      {/* Calendar name + account */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className="truncate text-[13px] font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {entry.name}
          </span>
          {entry.readOnly && (
            <span
              className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none"
              style={{
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-faint)',
                border: '1px solid var(--border)',
              }}
            >
              Read-only
            </span>
          )}
        </div>
        <span
          className="truncate text-[11px]"
          style={{ color: 'var(--text-faint)' }}
        >
          {entry.accountLabel}
          <span className="mx-1 opacity-50">{'\u00B7'}</span>
          {entry.accountEmail}
        </span>
      </div>

      {/* Action buttons — visible on hover, always focusable */}
      <div className="flex flex-shrink-0 items-center gap-1">
        {/* Pending spinner */}
        {pending && (
          <span className="flex h-7 w-7 items-center justify-center" aria-label="Saving">
            <Loader2
              size={14}
              strokeWidth={2}
              style={{ color: 'var(--accent)', animation: 'calendar-controls-spin 1s linear infinite' }}
            />
          </span>
        )}

        {/* Error indicator */}
        {errored && (
          <span
            className="flex h-7 w-7 items-center justify-center"
            aria-label="Update failed"
            title="Failed to save — change was reverted"
          >
            <AlertCircle size={14} strokeWidth={2} style={{ color: '#ef4444' }} />
          </span>
        )}

        {/* Visibility toggle */}
        <button
          type="button"
          onClick={() => onToggleVisibility(entry.id)}
          disabled={pending}
          className="flex h-7 w-7 items-center justify-center rounded-md opacity-60 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 group-hover/row:opacity-60 sm:opacity-0 disabled:opacity-30 cursor-pointer"
          style={{
            color: entry.visible ? 'var(--text-primary)' : 'var(--text-faint)',
            background: 'none',
            border: 'none',
          }}
          aria-label={entry.visible ? `Hide ${entry.name} from Calendar view` : `Show ${entry.name} in Calendar view`}
          title={entry.visible ? 'Hidden from Calendar' : 'Visible in Calendar'}
        >
          {entry.visible ? (
            <Eye size={14} strokeWidth={1.5} />
          ) : (
            <EyeOff size={14} strokeWidth={1.5} />
          )}
        </button>

        {/* Move up */}
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp || pending}
          className="flex h-7 w-7 items-center justify-center rounded-md opacity-60 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 group-hover/row:opacity-60 sm:opacity-0 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}
          aria-label={`Move ${entry.name} up`}
        >
          <ChevronUp size={14} strokeWidth={2} />
        </button>

        {/* Move down */}
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown || pending}
          className="flex h-7 w-7 items-center justify-center rounded-md opacity-60 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 group-hover/row:opacity-60 sm:opacity-0 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}
          aria-label={`Move ${entry.name} down`}
        >
          <ChevronDown size={14} strokeWidth={2} />
        </button>

        {/* Move to other group */}
        <button
          type="button"
          onClick={() => onMoveToGroup(entry.id, targetGroup)}
          disabled={pending}
          className="flex h-7 items-center justify-center gap-1 rounded-md px-1.5 text-[10px] font-semibold opacity-60 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 group-hover/row:opacity-60 sm:opacity-0 disabled:opacity-30 cursor-pointer"
          style={{
            color: 'var(--accent)',
            background: 'none',
            border: 'none',
            whiteSpace: 'nowrap',
          }}
          aria-label={targetLabel}
          title={targetLabel}
        >
          <ArrowRightLeft size={12} strokeWidth={2} aria-hidden />
          <span className="hidden lg:inline">
            {targetGroup === 'active' ? 'To Active' : 'To Passive'}
          </span>
        </button>
      </div>
    </motion.div>
  )
}

// ── Group section ──────────────────────────────────────────────

interface CalendarGroupSectionProps {
  title: string
  subtitle: string
  entries: CalendarEntry[]
  pendingIds: Set<string>
  errorIds: Set<string>
  onMoveToGroup: (id: string, group: CalendarGroup) => void
  onReorder: (calendarId: string, fromIndex: number, toIndex: number) => void
  onToggleVisibility: (id: string) => void
}

function CalendarGroupSection({
  title,
  subtitle,
  entries,
  pendingIds,
  errorIds,
  onMoveToGroup,
  onReorder,
  onToggleVisibility,
}: CalendarGroupSectionProps) {
  const handleMoveUp = useCallback(
    (index: number, entry: CalendarEntry) => {
      onReorder(entry.id, index, index - 1)
    },
    [onReorder],
  )

  const handleMoveDown = useCallback(
    (index: number, entry: CalendarEntry) => {
      onReorder(entry.id, index, index + 1)
    },
    [onReorder],
  )

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <div>
          <h4
            className="text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ color: 'var(--text-faint)' }}
          >
            {title}
          </h4>
          <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-faint)', opacity: 0.7 }}>
            {subtitle}
          </p>
        </div>
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-faint)' }}
        >
          {entries.length} calendar{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div
        role="list"
        aria-label={`${title} calendars`}
        className="flex flex-col gap-0.5 rounded-xl"
        style={{
          backgroundColor: 'var(--bg-pane-2)',
          border: '1px solid var(--border)',
          padding: '4px',
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {entries.map((entry, index) => (
            <CalendarControlRow
              key={entry.id}
              entry={entry}
              index={index}
              groupLength={entries.length}
              pending={pendingIds.has(entry.id)}
              errored={errorIds.has(entry.id)}
              onMoveToGroup={onMoveToGroup}
              onMoveUp={() => handleMoveUp(index, entry)}
              onMoveDown={() => handleMoveDown(index, entry)}
              onToggleVisibility={onToggleVisibility}
            />
          ))}
        </AnimatePresence>

        {entries.length === 0 && (
          <div
            className="flex items-center justify-center py-6 text-[12px]"
            style={{ color: 'var(--text-faint)' }}
          >
            No calendars in this group
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main section ───────────────────────────────────────────────

export default function CalendarControlsSection() {
  const {
    activeCalendars,
    passiveCalendars,
    pendingIds,
    errorIds,
    moveToGroup,
    reorder,
    toggleVisibility,
  } = useCalendarControls()

  return (
    <div className="flex flex-col gap-5">
      {/* Spin keyframe for loader icons */}
      <style>{`
        @keyframes calendar-controls-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Explainer banner */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: 'var(--accent-soft)',
          border: '1px solid var(--border)',
        }}
        role="note"
        aria-label="Calendar controls explanation"
      >
        <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
          Calendar Controls
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--accent)' }}>Active calendars</strong> are shown in the Agenda
          and count as busy time.{' '}
          <strong style={{ color: 'var(--text-primary)' }}>Passive calendars</strong> are available
          in the Calendar view but hidden from the Agenda and treated as free time.
          Use the visibility icon to toggle whether a calendar appears at all.
        </p>
      </div>

      {/* Active group */}
      <CalendarGroupSection
        title="Active"
        subtitle="Shown in Agenda and treated as busy"
        entries={activeCalendars}
        pendingIds={pendingIds}
        errorIds={errorIds}
        onMoveToGroup={moveToGroup}
        onReorder={reorder}
        onToggleVisibility={toggleVisibility}
      />

      {/* Passive group */}
      <CalendarGroupSection
        title="Passive"
        subtitle="Available in Calendar, hidden from Agenda, and treated as free"
        entries={passiveCalendars}
        pendingIds={pendingIds}
        errorIds={errorIds}
        onMoveToGroup={moveToGroup}
        onReorder={reorder}
        onToggleVisibility={toggleVisibility}
      />

      {/* Global error toast for rollbacks */}
      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence>
          {errorIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: motionTokens.distance.sm }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -motionTokens.distance.sm }}
              transition={ease.fast}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
              role="alert"
            >
              <AlertCircle size={13} strokeWidth={2} aria-hidden />
              A change failed and was reverted. Please try again.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
