'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ── Types ───────────────────────────────────────────────────────────────────

export interface ChatSessionSummary {
  _id: string
  title: string
  updatedAt: string
  messageCount: number
}

export interface ChatSessionMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSessionFull {
  _id: string
  title: string
  messages: ChatSessionMessage[]
  createdAt: string
  updatedAt: string
}

// ── Query keys ──────────────────────────────────────────────────────────────

const SESSIONS_KEY = ['chat-sessions'] as const

// ── Fetchers ────────────────────────────────────────────────────────────────

async function fetchSessions(): Promise<ChatSessionSummary[]> {
  const res = await fetch('/api/chat/sessions')
  if (!res.ok) throw new Error('Failed to fetch chat sessions')
  const data = await res.json()
  return data.sessions
}

async function fetchSession(id: string): Promise<ChatSessionFull> {
  const res = await fetch(`/api/chat/sessions/${id}`)
  if (!res.ok) throw new Error('Failed to fetch chat session')
  return res.json()
}

// ── Hooks ───────────────────────────────────────────────────────────────────

export function useChatSessions() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: fetchSessions,
  })

  return { sessions, isLoading }
}

export function useChatSession(id: string | null) {
  const { data: session, isLoading } = useQuery({
    queryKey: [...SESSIONS_KEY, id],
    queryFn: () => fetchSession(id!),
    enabled: !!id,
  })

  return { session, isLoading }
}

export function useCreateChatSession() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (title?: string) => {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error('Failed to create chat session')
      return res.json() as Promise<ChatSessionSummary>
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
    },
  })

  const createSession = useCallback(
    (title?: string) => mutation.mutateAsync(title),
    [mutation],
  )

  return { createSession, isCreating: mutation.isPending }
}

export function useDeleteChatSession() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/chat/sessions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete chat session')
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: SESSIONS_KEY })
      const prev = queryClient.getQueryData<ChatSessionSummary[]>(SESSIONS_KEY)
      queryClient.setQueryData<ChatSessionSummary[]>(
        SESSIONS_KEY,
        old => (old ?? []).filter(s => s._id !== id),
      )
      return { prev }
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(SESSIONS_KEY, context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
    },
  })

  return mutation
}

export function useAppendMessages() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      id,
      messages,
    }: {
      id: string
      messages: { role: 'user' | 'assistant'; content: string }[]
    }) => {
      const res = await fetch(`/api/chat/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })
      if (!res.ok) throw new Error('Failed to append messages')
      return res.json() as Promise<ChatSessionFull>
    },
    onMutate: async ({ id, messages }) => {
      const key = [...SESSIONS_KEY, id]
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<ChatSessionFull>(key)
      if (prev) {
        queryClient.setQueryData<ChatSessionFull>(key, {
          ...prev,
          messages: [
            ...prev.messages,
            ...messages.map(m => ({
              ...m,
              timestamp: new Date().toISOString(),
            })),
          ],
        })
      }
      return { prev }
    },
    onError: (_err, { id }, context) => {
      if (context?.prev) {
        queryClient.setQueryData([...SESSIONS_KEY, id], context.prev)
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...SESSIONS_KEY, id] })
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
    },
  })

  const appendMessages = useCallback(
    (id: string, messages: { role: 'user' | 'assistant'; content: string }[]) =>
      mutation.mutateAsync({ id, messages }),
    [mutation],
  )

  return { appendMessages, isAppending: mutation.isPending }
}
