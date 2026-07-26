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
    if ((e.ctrlKey || e.metaKey) && e.key !== 'k') return

    switch (e.key) {
      case 't':
      case 'T':
        e.preventDefault()
        navigate('/')
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('laif:focus-new-task'))
        }, 100)
        break

      case 'e':
      case 'E':
        e.preventDefault()
        navigate('/calendar')
        break

      case 'j':
      case 'J':
        e.preventDefault()
        navigate('/journal')
        break

      case 'k':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          navigate('/tasks')
        }
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
