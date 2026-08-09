'use client'

import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export function useGlobalShortcuts() {
  const navigate = useNavigate()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    if (e.altKey) return

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('laif:open-command-palette'))
      return
    }

    if (e.ctrlKey || e.metaKey) return

    switch (e.key) {
      case 'n':
      case 'N':
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('laif:open-task-composer'))
        break

      case 'e':
      case 'E':
        e.preventDefault()
        navigate('/calendar')
        break

      case 't':
      case 'T':
        e.preventDefault()
        navigate('/today')
        break

      default:
        break
    }
  }, [navigate])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
