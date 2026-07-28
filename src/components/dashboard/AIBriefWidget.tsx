
import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { http } from '@/lib/api/client'
import { fadeSlideUp, ease, buttonPress } from '@/lib/motion'

interface BriefData {
  content: string
  generatedAt: string
}

export default function AIBriefWidget() {
  const [brief, setBrief] = useState<BriefData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchBrief = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await http.get<{ content?: string; summary?: string; generatedAt?: string }>('/api/ai/brief')
      setBrief({
        content: data.content || data.summary || '',
        generatedAt: data.generatedAt || new Date().toISOString(),
      })
    } catch {
      setError(true)
      setBrief(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBrief() }, [fetchBrief])

  const updatedAt = brief?.generatedAt
    ? format(new Date(brief.generatedAt), 'h:mm a')
    : null

  if (loading) {
    return (
      <div
        className="rounded-xl p-4"
        style={{ border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-faint)' }}>AI Brief</span>
        </div>
        <div className="animate-pulse">
          <div className="h-3 rounded mb-2" style={{ backgroundColor: 'var(--overlay-1)', width: '80%' }} />
          <div className="h-3 rounded mb-2" style={{ backgroundColor: 'var(--overlay-1)', width: '60%' }} />
          <div className="h-3 rounded" style={{ backgroundColor: 'var(--overlay-1)', width: '40%' }} />
        </div>
      </div>
    )
  }

  if (error || !brief?.content) {
    return (
      <div
        className="rounded-xl p-4"
        style={{ border: '1px solid var(--border)', borderStyle: 'dashed' }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sparkles size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-faint)' }}>AI Brief</span>
          </div>
          <motion.button
            {...buttonPress}
            onClick={fetchBrief}
            className="flex h-6 w-6 items-center justify-center rounded cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)' }}
          >
            <RefreshCw size={12} strokeWidth={1.5} />
          </motion.button>
        </div>
        <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>
          AI Brief will appear here when the backend endpoint is available.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      {...fadeSlideUp}
      transition={ease.normal}
      className="rounded-xl p-4"
      style={{ border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-faint)' }}>AI Brief</span>
          {updatedAt && (
            <span className="text-[11px]" style={{ color: 'var(--text-faint)', opacity: 0.6 }}>
              Updated {updatedAt}
            </span>
          )}
        </div>
        <motion.button
          {...buttonPress}
          onClick={fetchBrief}
          className="flex h-6 w-6 items-center justify-center rounded cursor-pointer"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)' }}
        >
          <RefreshCw size={12} strokeWidth={1.5} />
        </motion.button>
      </div>
      <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {brief.content}
      </p>
    </motion.div>
  )
}
