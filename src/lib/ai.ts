/**
 * Shared OpenRouter AI utility — single source of truth for all AI calls in the app.
 * Used by: chat API, journal summarizer, memory parser.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3.7-max'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AICallOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  jsonMode?: boolean
}

/**
 * Call OpenRouter AI with standardized error handling.
 * Returns the assistant's response content, or null on failure.
 */
export async function callOpenRouter(
  messages: AIMessage[],
  options: AICallOptions = {},
): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    console.error('[AI] OPENROUTER_API_KEY not configured')
    return null
  }

  const {
    model = DEFAULT_MODEL,
    maxTokens = 700,
    temperature = 0.3,
    jsonMode = false,
  } = options

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://laif.app',
        'X-Title': 'LAIF',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      console.error(`[AI] OpenRouter ${res.status}: ${text.slice(0, 200)}`)
      return null
    }

    const data = await res.json()
    return data?.choices?.[0]?.message?.content ?? null
  } catch (err) {
    console.error('[AI] OpenRouter call failed:', err)
    return null
  }
}

/**
 * Call OpenRouter and parse JSON response.
 * Returns parsed object or null on failure.
 */
export async function callOpenRouterJSON<T = Record<string, unknown>>(
  messages: AIMessage[],
  options: Omit<AICallOptions, 'jsonMode'> = {},
): Promise<T | null> {
  const content = await callOpenRouter(messages, { ...options, jsonMode: true })
  if (!content) return null
  try {
    return JSON.parse(content) as T
  } catch {
    console.error('[AI] Failed to parse JSON response:', content.slice(0, 200))
    return null
  }
}

/**
 * Check if AI is configured and available.
 */
export function isAIConfigured(): boolean {
  return !!OPENROUTER_API_KEY
}
