'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, Clock, List, Flag, X } from 'lucide-react'
import { motionTokens } from '@/lib/motion'
import { useBatchActions, getTomorrow, getNextMonday, PRIORITY_OPTIONS } from '@/hooks/useBatchActions'
import type { ListDoc } from '@/hooks/useLists'

// ── Types ──

interface BatchActionBarProps {
  selectedIds: Set<string>
  clearSelection: () => void
}

// ── Dropdown menu component (no shadcn) ──

function DropdownButton({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '5px 10px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.8)',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {icon}
        {label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: 8,
              minWidth: 160,
              borderRadius: 12,
              backgroundColor: 'var(--bg-pane-2, #2a293b)',
              border: '1px solid var(--overlay-2, var(--border))',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              zIndex: 60,
            }}
            onClick={() => setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DropdownItem({
  onClick,
  children,
  danger,
}: {
  onClick: () => void
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: 500,
        color: danger ? '#f87171' : 'var(--text-primary)',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background-color 100ms ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(108,108,158,0.06))')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {children}
    </button>
  )
}

function DropdownSep() {
  return <div style={{ height: 1, margin: '4px 0', backgroundColor: 'var(--border)' }} />
}

// ── Main component ──

export default function BatchActionBar({ selectedIds, clearSelection }: BatchActionBarProps) {
  const {
    count,
    lists,
    handlePostpone,
    handlePostponeTo,
    handleChangeList,
    handleChangePriority,
    handleCompleteAll,
    handleDeleteAll,
  } = useBatchActions({ selectedIds, clearSelection })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCustomDays, setShowCustomDays] = useState(false)
  const [customDays, setCustomDays] = useState(1)

  if (count === 0) return null

  const divider = (
    <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.15)' }} />
  )

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.sharp }}
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '8px 14px',
          borderRadius: 999,
          backgroundColor: 'rgba(30, 30, 40, 0.88)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          whiteSpace: 'nowrap',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Selection count */}
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#fff',
          padding: '2px 10px',
          borderRadius: 999,
          backgroundColor: 'rgba(93, 168, 255, 0.25)',
        }}>
          {count} selected
        </span>

        {divider}

        {/* Postpone */}
        <DropdownButton
          icon={<Clock size={13} strokeWidth={1.5} />}
          label="Postpone"
        >
          <DropdownItem onClick={() => handlePostpone(1)}>+1 day</DropdownItem>
          <DropdownItem onClick={() => handlePostpone(3)}>+3 days</DropdownItem>
          <DropdownItem onClick={() => handlePostpone(7)}>+1 week</DropdownItem>
          <DropdownSep />
          <DropdownItem onClick={() => handlePostponeTo(getTomorrow())}>Tomorrow</DropdownItem>
          <DropdownItem onClick={() => handlePostponeTo(getNextMonday())}>Next Monday</DropdownItem>
          <DropdownSep />
          <DropdownItem onClick={() => setShowCustomDays(true)}>Custom...</DropdownItem>
        </DropdownButton>

        {/* Change List */}
        <DropdownButton
          icon={<List size={13} strokeWidth={1.5} />}
          label="List"
        >
          <DropdownItem onClick={() => handleChangeList(null)}>No list</DropdownItem>
          <DropdownSep />
          {(lists as ListDoc[]).map(list => (
            <DropdownItem key={list._id} onClick={() => handleChangeList(list._id)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {list.icon && <span>{list.icon}</span>}
                {list.title || 'Untitled'}
              </span>
            </DropdownItem>
          ))}
        </DropdownButton>

        {/* Priority */}
        <DropdownButton
          icon={<Flag size={13} strokeWidth={1.5} />}
          label="Priority"
        >
          {PRIORITY_OPTIONS.map(opt => (
            <DropdownItem key={opt.value} onClick={() => handleChangePriority(opt.value)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: opt.color,
                }} />
                {opt.label}
              </span>
            </DropdownItem>
          ))}
        </DropdownButton>

        {divider}

        {/* Complete All */}
        <button
          onClick={handleCompleteAll}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 999,
            fontSize: 12, fontWeight: 600,
            color: '#34d399',
            backgroundColor: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            cursor: 'pointer', transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(52, 211, 153, 0.25)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(52, 211, 153, 0.12)')}
        >
          <Check size={13} strokeWidth={2.5} />
          Complete
        </button>

        {/* Delete All */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 999,
            fontSize: 12, fontWeight: 600,
            color: '#f87171',
            backgroundColor: 'rgba(248, 113, 113, 0.12)',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            cursor: 'pointer', transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.25)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.12)')}
        >
          <Trash2 size={13} strokeWidth={2} />
          Delete
        </button>

        {divider}

        {/* Clear selection */}
        <button
          onClick={clearSelection}
          style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '5px 8px', borderRadius: 999,
            fontSize: 11, fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.55)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)')}
        >
          <X size={12} strokeWidth={2.5} />
          Clear
        </button>
      </motion.div>

      {/* Delete confirmation overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: 320,
                padding: 24,
                borderRadius: 16,
                backgroundColor: 'var(--bg-pane, #1e1e2e)',
                border: '1px solid var(--border)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Delete {count} task{count > 1 ? 's' : ''}?
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
                This cannot be undone.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    handleDeleteAll()
                  }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    transition: 'opacity 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom postpone overlay */}
      <AnimatePresence>
        {showCustomDays && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
            onClick={() => setShowCustomDays(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: 300,
                padding: 24,
                borderRadius: 16,
                backgroundColor: 'var(--bg-pane, #1e1e2e)',
                border: '1px solid var(--border)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Postpone by days
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
                Shift selected tasks forward by a custom number of days.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={customDays}
                  onChange={e => setCustomDays(Math.max(1, Number(e.target.value)))}
                  style={{
                    width: 80,
                    height: 32,
                    fontSize: 13,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  onClick={() => setShowCustomDays(false)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCustomDays(false)
                    handlePostpone(customDays)
                  }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                    border: 'none',
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                    transition: 'opacity 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  Postpone
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
