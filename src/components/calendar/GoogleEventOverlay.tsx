'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { CalendarEvent } from './types'

interface GoogleEventOverlayProps {
  event: CalendarEvent
  /** Whether the user has enabled the Google events overlay */
  showGoogleEventsOnCalendar: boolean
  /** Top position in pixels (computed from grid row) */
  top: number
  /** Height in pixels (computed from grid span) */
  height: number
}

/**
 * Renders a Google Calendar event as a ghost block in the time grid.
 * Lighter opacity (0.6), no drag handle, link icon in corner.
 */
export default function GoogleEventOverlay({
  event,
  showGoogleEventsOnCalendar,
  top,
  height,
}: GoogleEventOverlayProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (!showGoogleEventsOnCalendar || !event.isExternal) return null

  const handleClick = () => {
    // Open event in Google Calendar (construct a search URL as fallback)
    const googleUrl = `https://calendar.google.com/calendar/r/search?q=${encodeURIComponent(event.title)}`
    window.open(googleUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="absolute left-1 right-1 rounded-lg px-2.5 py-1.5 cursor-pointer transition-all duration-150"
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 24)}px`,
        backgroundColor: event.color,
        opacity: isHovered ? 0.75 : 0.6,
        zIndex: 5,
        overflow: 'hidden',
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Link icon in corner */}
      <div className="absolute right-1.5 top-1.5">
        <ExternalLink size={12} strokeWidth={1.5} color="#FFFFFF" style={{ opacity: 0.8 }} />
      </div>

      {/* Title */}
      <span
        className="block truncate text-[12px] font-medium leading-tight"
        style={{ color: '#FFFFFF' }}
      >
        {event.title}
      </span>

      {/* Time */}
      {height >= 36 && (
        <span
          className="block truncate text-[10px] leading-tight mt-0.5"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {new Date(event.start).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </span>
      )}

      {/* Hover tooltip */}
      {isHovered && (
        <div
          className="absolute left-full top-0 z-50 ml-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs shadow-lg"
          style={{
            backgroundColor: 'var(--bg-pane-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          From Google Calendar — open in Google
        </div>
      )}
    </div>
  )
}
