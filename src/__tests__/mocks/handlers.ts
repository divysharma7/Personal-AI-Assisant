import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/tasks', () => HttpResponse.json([])),
  http.post('/api/tasks', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ _id: 'mock-id', ...body }, { status: 201 })
  }),
  http.put('/api/tasks/:id', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json(body)
  }),
  http.delete('/api/tasks/:id', () => HttpResponse.json({ success: true })),
  http.get('/api/lists', () => HttpResponse.json([])),
  http.get('/api/calendar/events', () => HttpResponse.json([])),
]
