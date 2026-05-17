import * as chrono from 'chrono-node'

export interface ParsedTask {
  title: string
  dueDate: Date | null
  tags: string[]
  priority: 'low' | 'medium' | 'high' | null
}

const PRIORITY_PATTERN = /!(?:high|medium|low|none)\b/gi
const TAG_PATTERN = /#(\w+)/g

// Words/phrases chrono should NOT parse as dates — they're too ambiguous
const EXCLUDED_PHRASES = /\b(weekend|weekday|morning|evening|night|afternoon|daily|weekly|monthly|yearly)\b/gi

// Duration-only patterns that chrono aggressively parses as dates
const DURATION_ONLY = /\b\d+\s*(?:minutes?|mins?|hours?|hrs?|seconds?|secs?|days?|weeks?|months?)\b/gi

/**
 * Parse a quick-add string into structured task data.
 *
 * Rules:
 * - chrono-node (casual) extracts date/time expressions
 * - Ambiguous words like "weekend", "morning" are NOT treated as dates
 * - Bare durations like "30 minutes" are NOT treated as dates
 * - #word tokens are extracted as tags
 * - !high / !medium / !low / !none sets priority (!none → null)
 * - Everything remaining becomes the title (trimmed, collapsed whitespace)
 */
export function parseQuickAdd(input: string): ParsedTask {
  if (!input.trim()) {
    return { title: '', dueDate: null, tags: [], priority: null }
  }

  let remaining = input

  // ── Extract priority ────────────────────────────────────────────
  let priority: ParsedTask['priority'] = null
  const priorityMatches = remaining.match(PRIORITY_PATTERN)
  if (priorityMatches && priorityMatches.length > 0) {
    const raw = priorityMatches[priorityMatches.length - 1].toLowerCase().slice(1) as 'high' | 'medium' | 'low' | 'none'
    priority = raw === 'none' ? null : raw
  }
  remaining = remaining.replace(PRIORITY_PATTERN, '')

  // ── Extract tags ────────────────────────────────────────────────
  const tags: string[] = []
  let tagMatch: RegExpExecArray | null
  TAG_PATTERN.lastIndex = 0
  while ((tagMatch = TAG_PATTERN.exec(remaining)) !== null) {
    tags.push(tagMatch[1])
  }
  remaining = remaining.replace(TAG_PATTERN, '')

  // ── Extract date with chrono-node ───────────────────────────────
  // Temporarily mask ambiguous words and bare durations so chrono ignores them
  const masks: { placeholder: string; original: string }[] = []
  let maskedInput = remaining

  // Mask excluded phrases
  maskedInput = maskedInput.replace(EXCLUDED_PHRASES, (match) => {
    const placeholder = `__MASK${masks.length}__`
    masks.push({ placeholder, original: match })
    return placeholder
  })

  // Mask bare durations (e.g. "30 minutes", "2 hours")
  maskedInput = maskedInput.replace(DURATION_ONLY, (match) => {
    const placeholder = `__MASK${masks.length}__`
    masks.push({ placeholder, original: match })
    return placeholder
  })

  const parsed = chrono.parse(maskedInput, new Date(), { forwardDate: true })
  let dueDate: Date | null = null

  if (parsed.length > 0) {
    const result = parsed[0]
    // Only accept if there's a concrete date component (not just a time or duration)
    const hasDate = result.start.isCertain('day') || result.start.isCertain('weekday')
    const hasExplicitAnchor = /\b(tomorrow|today|tonight|next|this|on|at|by)\b/i.test(result.text)

    if (hasDate || hasExplicitAnchor) {
      dueDate = result.start.date()
      // Remove the matched date text from the masked string, then unmask
      maskedInput = maskedInput.replace(result.text, '')
    }
  }

  // Restore masked words
  for (const { placeholder, original } of masks) {
    maskedInput = maskedInput.replace(placeholder, original)
  }
  remaining = maskedInput

  // ── Clean up title ──────────────────────────────────────────────
  const title = remaining.replace(/\s{2,}/g, ' ').trim()

  return { title, dueDate, tags, priority }
}
