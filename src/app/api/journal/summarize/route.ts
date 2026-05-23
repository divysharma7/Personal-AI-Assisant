import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import JournalEntry from '@/lib/models/JournalEntry'
import type { IJournalEntry } from '@/lib/models/JournalEntry'
import { callOpenRouterJSON, isAIConfigured } from '@/lib/ai'

const EMPTY_DOC = '{"type":"doc","content":[{"type":"paragraph"}]}'

// Recursively extract plain text from a Tiptap JSON node
function extractText(node: any): string {
  if (node.type === 'text') return node.text ?? ''
  if (!node.content) return ''
  return node.content.map(extractText).join(' ')
}

// GET /api/journal/summarize?date=YYYY-MM-DD&today=YYYY-MM-DD
// Fetches the entry for `date`, summarises it with AI, saves result to `today`'s entry
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date  = searchParams.get('date')   // yesterday
  const today = searchParams.get('today')  // today — where we persist the result

  if (!date || !today) {
    return NextResponse.json({ error: 'Missing date or today param' }, { status: 400 })
  }

  await connectDB()

  const entry   = await JournalEntry.findOne({ date }).lean<IJournalEntry>()
  const content = entry?.content ?? ''

  if (!content || content === EMPTY_DOC) {
    return NextResponse.json({ summary: '', todos: [] })
  }

  let text = ''
  try { text = extractText(JSON.parse(content)).trim() } catch { /* ignore */ }

  if (!text) return NextResponse.json({ summary: '', todos: [] })

  if (!isAIConfigured()) {
    return NextResponse.json({ summary: '', todos: [] })
  }

  let summary = ''
  let todos: string[] = []
  let todayItems: string[] = []

  const parsed = await callOpenRouterJSON<{ summary?: string; todos?: string[]; today?: string[] }>(
    [{
      role: 'user',
      content: `You are a personal productivity assistant reviewing someone's journal entry from yesterday.

Provide three things:
1. "summary" — a concise 2-3 sentence recap of the key themes, activities, decisions, and feelings from yesterday
2. "todos" — up to 5 carry-forward tasks that were explicitly mentioned or clearly left unfinished yesterday
3. "today" — up to 3 sharp, high-priority focus items the person should tackle TODAY, inferred from the context and momentum of yesterday's entry (e.g. next steps, pending decisions, follow-ups). Make these feel urgent and specific to today.

Respond ONLY with valid JSON — no markdown, no extra text:
{"summary":"...","todos":["..."],"today":["..."]}

Journal entry:
${text}`,
    }],
    { maxTokens: 550, temperature: 0.2 },
  )

  if (parsed) {
    summary = typeof parsed.summary === 'string' ? parsed.summary : ''
    todos = Array.isArray(parsed.todos) ? parsed.todos.filter((t: unknown) => typeof t === 'string') : []
    todayItems = Array.isArray(parsed.today) ? parsed.today.filter((t: unknown) => typeof t === 'string') : []
  }

  // Always persist — even an empty result marks summary_fetched so AI won't re-run
  await JournalEntry.findOneAndUpdate(
    { date: today },
    { $set: { last_summary: summary, summary_todos: todos, today_items: todayItems, summary_fetched: true } },
    { upsert: true }
  )

  return NextResponse.json({ summary, todos, today: todayItems })
}
