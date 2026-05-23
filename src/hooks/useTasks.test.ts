import { createElement, type ReactNode } from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse, delay } from 'msw'
import { server } from '@/__tests__/mocks/server'
import { useTasks } from './useTasks'

// Fresh QueryClient per test to avoid cache leaks
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

describe('useTasks - createTask', () => {
  it('creates a task via POST /api/tasks', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/tasks', async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json(
          { _id: 'new-123', type: 'task', ...capturedBody },
          { status: 201 },
        )
      }),
    )

    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.createTask({
        title: 'Test task',
        priority: 'medium',
        status: 'todo',
      })
    })

    expect(capturedBody).not.toBeNull()
    expect(capturedBody!.title).toBe('Test task')
    expect(capturedBody!.priority).toBe('medium')
    expect(capturedBody!.status).toBe('todo')
  })

  it('optimistically adds task to cache before API responds', async () => {
    server.use(
      http.get('/api/tasks', () => HttpResponse.json([])),
      http.post('/api/tasks', async () => {
        // Delay the response so we can observe the optimistic update
        await delay(500)
        return HttpResponse.json(
          { _id: 'delayed-123', type: 'task', title: 'Optimistic', priority: 'medium', status: 'todo' },
          { status: 201 },
        )
      }),
    )

    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

    // Wait for initial query to settle
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Fire mutation without awaiting completion
    act(() => {
      result.current.createTask({
        title: 'Optimistic',
        priority: 'medium',
        status: 'todo',
      })
    })

    // The optimistic update should add a temp task immediately
    await waitFor(() => {
      const titles = result.current.tasks.map(t => t.title)
      expect(titles).toContain('Optimistic')
    })

    // The optimistic task should have a temp ID
    const optimisticTask = result.current.tasks.find(t => t.title === 'Optimistic')
    expect(optimisticTask?._id).toMatch(/^temp-/)
  })

  it('rolls back optimistic update on API error', async () => {
    server.use(
      http.get('/api/tasks', () => HttpResponse.json([])),
      http.post('/api/tasks', () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      }),
    )

    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

    // Wait for initial query
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Attempt to create -- it will fail
    await act(async () => {
      try {
        await result.current.createTask({
          title: 'Will fail',
          priority: 'medium',
          status: 'todo',
        })
      } catch {
        // Expected error
      }
    })

    // After error + rollback, the task list should be empty again
    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(0)
    })
  })

  it('invalidates tasks query on settle', async () => {
    let fetchCount = 0
    server.use(
      http.get('/api/tasks', () => {
        fetchCount++
        return HttpResponse.json([])
      }),
      http.post('/api/tasks', async ({ request }) => {
        const body = await request.json() as Record<string, unknown>
        return HttpResponse.json(
          { _id: 'settle-123', type: 'task', ...body },
          { status: 201 },
        )
      }),
    )

    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    const initialFetchCount = fetchCount

    await act(async () => {
      await result.current.createTask({ title: 'Settle test', priority: 'low', status: 'backlog' })
    })

    // onSettled should trigger a refetch, so fetchCount should increase
    await waitFor(() => {
      expect(fetchCount).toBeGreaterThan(initialFetchCount)
    })
  })

  it('sends correct content-type header', async () => {
    let capturedContentType: string | null = null
    server.use(
      http.post('/api/tasks', async ({ request }) => {
        capturedContentType = request.headers.get('content-type')
        const body = await request.json() as Record<string, unknown>
        return HttpResponse.json({ _id: 'ct-123', type: 'task', ...body }, { status: 201 })
      }),
    )

    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.createTask({ title: 'Content type test', priority: 'medium', status: 'todo' })
    })

    expect(capturedContentType).toBe('application/json')
  })

  it('sends all optional fields when provided', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/tasks', async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ _id: 'full-123', type: 'task', ...capturedBody }, { status: 201 })
      }),
    )

    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

    const fullTask = {
      title: 'Full task',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2026-06-01T00:00:00Z',
      description: 'Description here',
      listId: 'list-456',
      labelIds: ['l1', 'l2'],
      scheduledStart: '2026-06-01T09:00:00Z',
      scheduledEnd: '2026-06-01T10:00:00Z',
    }

    await act(async () => {
      await result.current.createTask(fullTask)
    })

    expect(capturedBody).toMatchObject(fullTask)
  })
})
