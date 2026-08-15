import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFocusTimer } from './useFocusTimer'

describe('useFocusTimer refresh recovery', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
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

  it('keeps ticking when a running timer is refreshed from the server', () => {
    let now = 0
    let nextFrameId = 0
    const frames = new Map<number, FrameRequestCallback>()

    vi.spyOn(performance, 'now').mockImplementation(() => now)
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      nextFrameId += 1
      frames.set(nextFrameId, callback)
      return nextFrameId
    })
    vi.stubGlobal('cancelAnimationFrame', (frameId: number) => {
      frames.delete(frameId)
    })

    const runNextFrame = (time: number) => {
      const next = frames.entries().next().value as [number, FrameRequestCallback] | undefined
      expect(next).toBeDefined()
      const [frameId, callback] = next!
      frames.delete(frameId)
      now = time
      callback(time)
    }

    const onComplete = vi.fn()
    const { result } = renderHook(() => useFocusTimer({
      mode: 'POMO',
      durationSeconds: 60,
      onComplete,
    }))

    act(() => result.current.start())
    act(() => runNextFrame(59_000))
    expect(result.current.remainingSeconds).toBe(1)

    act(() => result.current.restore(59, 'RUNNING'))
    act(() => runNextFrame(60_000))

    expect(result.current.status).toBe('IDLE')
    expect(result.current.remainingSeconds).toBe(0)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
