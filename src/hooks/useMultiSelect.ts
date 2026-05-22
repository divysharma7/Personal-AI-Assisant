'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Multi-select hook for calendar tasks.
 * Manages selected task IDs and provides helpers for toggling/clearing.
 * Escape clears the selection.
 */
export function useMultiSelect() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const modifierHeldRef = useRef(false)

  const toggleId = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const selectIds = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  // Track modifier keys for Cmd/Ctrl+click multi-select
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.shiftKey || e.metaKey || e.ctrlKey) modifierHeldRef.current = true
    }
    const up = (e: KeyboardEvent) => {
      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) modifierHeldRef.current = false
    }
    const blur = () => { modifierHeldRef.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  // Escape to clear selection
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.target as HTMLElement)?.isContentEditable) return

      if (e.key === 'Escape' && selectedIds.size > 0) {
        e.preventDefault()
        e.stopPropagation()
        clearSelection()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [selectedIds.size, clearSelection])

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    toggleId,
    clearSelection,
    selectIds,
    modifierHeldRef,
    hasSelection: selectedIds.size > 0,
  }
}
