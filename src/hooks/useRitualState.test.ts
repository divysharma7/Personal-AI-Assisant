import { createElement, type ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/__tests__/mocks/server'
import { useRitualState } from './useRitualState'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useRitualState', () => {
  beforeEach(() => localStorage.clear())

  it('loads the combined remote state for one date', async () => {
    server.use(
      http.get('*/api/rituals', ({ request }) => {
        expect(new URL(request.url).searchParams.get('date')).toBe('2026-08-16')
        return HttpResponse.json({
          date: '2026-08-16',
          outcome: 'Ship safely',
          acceptedWindows: [],
          planCompleted: true,
          taskDecisions: {},
          shutdownCompleted: false,
        })
      }),
    )

    const { result } = renderHook(() => useRitualState('2026-08-16'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.state.outcome).toBe('Ship safely'))
    expect(result.current.state.planCompleted).toBe(true)
  })

  it('sends only the changed fields so an earlier shutdown does not block a morning edit', async () => {
    let body: Record<string, unknown> | null = null
    server.use(
      http.get('*/api/rituals', () => HttpResponse.json({
        date: '2026-08-16',
        outcome: 'Old outcome',
        acceptedWindows: [],
        planCompleted: true,
        taskDecisions: { 'task-1': 'complete' },
        shutdownCompleted: true,
      })),
      http.post('*/api/rituals', async ({ request }) => {
        body = await request.json() as Record<string, unknown>
        return HttpResponse.json({
          date: '2026-08-16',
          outcome: 'New outcome',
          acceptedWindows: [],
          planCompleted: true,
          taskDecisions: { 'task-1': 'complete' },
          shutdownCompleted: true,
        })
      }),
    )

    const { result } = renderHook(() => useRitualState('2026-08-16'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.state.shutdownCompleted).toBe(true))

    await act(async () => {
      await result.current.updateRitual({ outcome: 'New outcome' })
    })

    expect(body).toEqual({ date: '2026-08-16', outcome: 'New outcome' })
    await waitFor(() => expect(result.current.state.outcome).toBe('New outcome'))
  })

  it('uses the atomic close-day command for task decisions', async () => {
    let body: Record<string, unknown> | null = null
    server.use(
      http.get('*/api/rituals', () => HttpResponse.json({
        date: '2026-08-16',
        acceptedWindows: [],
        planCompleted: false,
        taskDecisions: {},
        shutdownCompleted: false,
      })),
      http.post('*/api/rituals/close-day', async ({ request }) => {
        body = await request.json() as Record<string, unknown>
        return HttpResponse.json({
          date: '2026-08-16',
          acceptedWindows: [],
          planCompleted: false,
          taskDecisions: { 'task-1': 'complete' },
          shutdownCompleted: true,
        })
      }),
    )

    const { result } = renderHook(() => useRitualState('2026-08-16'), {
      wrapper: createWrapper(),
    })
    await act(async () => {
      await result.current.closeDay([{ taskId: 'task-1', action: 'complete' }])
    })

    expect(body).toMatchObject({
      date: '2026-08-16',
      commandId: expect.any(String),
      decisions: [{ taskId: 'task-1', action: 'complete' }],
    })
    await waitFor(() => expect(result.current.state.shutdownCompleted).toBe(true))
  })

  it('uses a new close command when decisions change after a failed attempt', async () => {
    const commandIds: string[] = []
    let attempts = 0
    server.use(
      http.get('*/api/rituals', () => HttpResponse.json({
        date: '2026-08-16',
        acceptedWindows: [],
        planCompleted: false,
        taskDecisions: {},
        shutdownCompleted: false,
      })),
      http.post('*/api/rituals/close-day', async ({ request }) => {
        attempts += 1
        const body = await request.json() as { commandId: string }
        commandIds.push(body.commandId)
        if (attempts === 1) return HttpResponse.json({ error: 'temporary failure' }, { status: 500 })
        return HttpResponse.json({
          date: '2026-08-16',
          acceptedWindows: [],
          planCompleted: false,
          taskDecisions: { 'task-1': 'drop' },
          shutdownCompleted: true,
        })
      }),
    )

    const { result } = renderHook(() => useRitualState('2026-08-16'), {
      wrapper: createWrapper(),
    })

    await expect(act(async () => {
      await result.current.closeDay([{ taskId: 'task-1', action: 'complete' }])
    })).rejects.toThrow()
    await act(async () => {
      await result.current.closeDay([{ taskId: 'task-1', action: 'drop' }])
    })

    expect(commandIds).toHaveLength(2)
    expect(commandIds[1]).not.toBe(commandIds[0])
  })
})
