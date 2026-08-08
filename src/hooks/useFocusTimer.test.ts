import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFocusTimer } from './useFocusTimer'

describe('useFocusTimer refresh recovery', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('keeps a paused timer frozen while the page is away', () => {
    sessionStorage.setItem('focusTimerState', JSON.stringify({
      version: 1,
      mode: 'POMO',
      durationSeconds: 1500,
      elapsedSeconds: 120,
      status: 'PAUSED',
      savedAt: Date.now() - 60_000,
    }))

    const { result } = renderHook(() => useFocusTimer({
      mode: 'POMO',
      durationSeconds: 1500,
    }))

    expect(result.current.status).toBe('PAUSED')
    expect(result.current.elapsedSeconds).toBe(120)
    expect(result.current.remainingSeconds).toBe(1380)
  })

  it('completes exactly once when a restored Pomo expired in the background', async () => {
    const onComplete = vi.fn()
    sessionStorage.setItem('focusTimerState', JSON.stringify({
      version: 1,
      mode: 'POMO',
      durationSeconds: 1500,
      elapsedSeconds: 1490,
      status: 'RUNNING',
      savedAt: Date.now() - 20_000,
    }))

    const { result } = renderHook(() => useFocusTimer({
      mode: 'POMO',
      durationSeconds: 1500,
      onComplete,
    }))

    await act(async () => { await Promise.resolve() })

    expect(result.current.status).toBe('IDLE')
    expect(result.current.remainingSeconds).toBe(0)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem('focusTimerState')).toBeNull()
  })
})
