'use client'

import { useState, useEffect, useMemo } from 'react'
import { RRule, Frequency } from 'rrule'

const FREQ_OPTIONS = [
  { value: 'daily' as const, label: 'Daily', freq: Frequency.DAILY },
  { value: 'weekly' as const, label: 'Weekly', freq: Frequency.WEEKLY },
  { value: 'monthly' as const, label: 'Monthly', freq: Frequency.MONTHLY },
  { value: 'yearly' as const, label: 'Yearly', freq: Frequency.YEARLY },
]

const WEEKDAYS = [
  { short: 'Mo', index: 0 },
  { short: 'Tu', index: 1 },
  { short: 'We', index: 2 },
  { short: 'Th', index: 3 },
  { short: 'Fr', index: 4 },
  { short: 'Sa', index: 5 },
  { short: 'Su', index: 6 },
]

type FreqKey = 'daily' | 'weekly' | 'monthly' | 'yearly'
type EndType = 'never' | 'count' | 'until'
type MonthlyMode = 'bymonthday' | 'bynweekday'

interface RRuleEditorProps {
  value: string | null
  onChange: (rrule: string | null) => void
}

function parseExisting(rruleStr: string | null) {
  if (!rruleStr) return null
  try {
    return RRule.fromString(rruleStr)
  } catch {
    return null
  }
}

const pillStyle = (active: boolean): React.CSSProperties => ({
  padding: '4px 10px',
  fontSize: 12,
  fontWeight: 600,
  borderRadius: 6,
  cursor: 'pointer',
  border: active ? '1px solid var(--accent)' : '1px solid transparent',
  backgroundColor: active ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--overlay-2, rgba(108,108,158,0.08))',
  color: active ? 'var(--accent)' : 'var(--text-muted)',
  transition: 'all 150ms ease',
})

const dayBtnStyle = (active: boolean): React.CSSProperties => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  backgroundColor: active ? 'var(--accent)' : 'var(--overlay-2, rgba(108,108,158,0.08))',
  color: active ? '#fff' : 'var(--text-muted)',
  transition: 'all 150ms ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const inputStyle: React.CSSProperties = {
  height: 28,
  width: 56,
  fontSize: 12,
  textAlign: 'center',
  borderRadius: 6,
  border: '1px solid var(--border)',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  outline: 'none',
}

export default function RRuleEditor({ value, onChange }: RRuleEditorProps) {
  const parsed = useMemo(() => parseExisting(value), [value])

  const [enabled, setEnabled] = useState(!!parsed)
  const [freqKey, setFreqKey] = useState<FreqKey>(() => {
    if (!parsed) return 'weekly'
    switch (parsed.options.freq) {
      case Frequency.DAILY: return 'daily'
      case Frequency.WEEKLY: return 'weekly'
      case Frequency.MONTHLY: return 'monthly'
      case Frequency.YEARLY: return 'yearly'
      default: return 'weekly'
    }
  })
  const [interval, setInterval] = useState(() => parsed?.options.interval ?? 1)
  const [byWeekday, setByWeekday] = useState<number[]>(() => {
    if (!parsed?.options.byweekday) return []
    return parsed.options.byweekday.map(d => (typeof d === 'number' ? d : d))
  })
  const [monthlyMode, setMonthlyMode] = useState<MonthlyMode>('bymonthday')
  const [endType, setEndType] = useState<EndType>(() => {
    if (!parsed) return 'never'
    if (parsed.options.count) return 'count'
    if (parsed.options.until) return 'until'
    return 'never'
  })
  const [count, setCount] = useState(() => parsed?.options.count ?? 10)
  const [untilDate, setUntilDate] = useState(() => {
    if (parsed?.options.until) {
      const d = parsed.options.until
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    return ''
  })

  // Build RRULE whenever options change
  useEffect(() => {
    if (!enabled) {
      onChange(null)
      return
    }

    const freq = FREQ_OPTIONS.find(f => f.value === freqKey)!.freq
    const opts: Partial<ConstructorParameters<typeof RRule>[0]> = {
      freq,
      interval: interval > 1 ? interval : undefined,
    }

    if (freqKey === 'weekly' && byWeekday.length > 0) {
      opts.byweekday = byWeekday
    }

    if (endType === 'count' && count > 0) {
      opts.count = count
    } else if (endType === 'until' && untilDate) {
      opts.until = new Date(untilDate + 'T23:59:59')
    }

    try {
      const rule = new RRule(opts as ConstructorParameters<typeof RRule>[0])
      onChange(rule.toString())
    } catch {
      // Invalid combination, don't update
    }
  }, [enabled, freqKey, interval, byWeekday, monthlyMode, endType, count, untilDate, onChange])

  // Preview text
  const previewText = useMemo(() => {
    if (!enabled || !value) return ''
    try {
      const rule = RRule.fromString(value)
      return rule.toText()
    } catch {
      return ''
    }
  }, [enabled, value])

  function toggleWeekday(dayIdx: number) {
    setByWeekday(prev =>
      prev.includes(dayIdx)
        ? prev.filter(d => d !== dayIdx)
        : [...prev, dayIdx].sort()
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Enable toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Repeat
        </span>
        <button
          type="button"
          onClick={() => setEnabled(p => !p)}
          style={pillStyle(enabled)}
        >
          {enabled ? 'On' : 'Off'}
        </button>
      </div>

      {enabled && (
        <>
          {/* Frequency row: "Every [N] [unit]" */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Every</span>
            <input
              type="number"
              min={1}
              max={99}
              value={interval}
              onChange={e => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
              style={inputStyle}
            />
            <select
              value={freqKey}
              onChange={e => setFreqKey(e.target.value as FreqKey)}
              style={{
                height: 28,
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                padding: '0 8px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {FREQ_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Weekly: day-of-week checkboxes */}
          {freqKey === 'weekly' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {WEEKDAYS.map(day => (
                <button
                  key={day.short}
                  type="button"
                  onClick={() => toggleWeekday(day.index)}
                  style={dayBtnStyle(byWeekday.includes(day.index))}
                >
                  {day.short}
                </button>
              ))}
            </div>
          )}

          {/* Monthly: mode selector */}
          {freqKey === 'monthly' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={() => setMonthlyMode('bymonthday')}
                style={pillStyle(monthlyMode === 'bymonthday')}
              >
                By day of month
              </button>
              <button
                type="button"
                onClick={() => setMonthlyMode('bynweekday')}
                style={pillStyle(monthlyMode === 'bynweekday')}
              >
                By nth weekday
              </button>
            </div>
          )}

          {/* End condition */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Ends
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {(['never', 'count', 'until'] as const).map(et => (
                <button
                  key={et}
                  type="button"
                  onClick={() => setEndType(et)}
                  style={pillStyle(endType === et)}
                >
                  {et === 'never' ? 'Never' : et === 'count' ? 'After' : 'On date'}
                </button>
              ))}
            </div>

            {endType === 'count' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={count}
                  onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ ...inputStyle, width: 64 }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>occurrences</span>
              </div>
            )}

            {endType === 'until' && (
              <input
                type="date"
                value={untilDate}
                onChange={e => setUntilDate(e.target.value)}
                style={{
                  ...inputStyle,
                  width: 140,
                  textAlign: 'left',
                  padding: '0 8px',
                }}
              />
            )}
          </div>

          {/* Preview */}
          {previewText && (
            <p style={{
              fontSize: 12,
              fontStyle: 'italic',
              color: 'var(--accent)',
              margin: 0,
            }}>
              {previewText.charAt(0).toUpperCase() + previewText.slice(1)}
            </p>
          )}
        </>
      )}
    </div>
  )
}
