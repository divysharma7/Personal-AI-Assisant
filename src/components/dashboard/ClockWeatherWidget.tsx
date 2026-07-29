
import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface WeatherData {
  temp: string
  condition: string
}

export default function ClockWeatherWidget() {
  const [now, setNow] = useState(new Date())
  const [weather, setWeather] = useState<WeatherData | null>(null)

  // Tick every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch weather once (cached for 30 min)
  useEffect(() => {
    let cancelled = false
    const cached = sessionStorage.getItem('laif-weather')
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached)
        if (Date.now() - ts < 30 * 60 * 1000) {
          setWeather(data)
          return
        }
      } catch { /* ignore */ }
    }

    fetch('https://wttr.in/?format=%t+%C', { headers: { 'Accept': 'text/plain' } })
      .then((r) => r.ok ? r.text() : Promise.reject())
      .then((text) => {
        if (cancelled) return
        const trimmed = text.trim()
        const match = trimmed.match(/^([+-]?\d+°\w*)\s+(.+)$/)
        const data: WeatherData = match
          ? { temp: match[1], condition: match[2] }
          : { temp: '', condition: trimmed }
        setWeather(data)
        try { sessionStorage.setItem('laif-weather', JSON.stringify({ data, ts: Date.now() })) }
        catch { /* ignore */ }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const timeStr = format(now, 'h:mm')
  const ampm = format(now, 'a')
  const seconds = format(now, 'ss')

  return (
    <div className="flex items-baseline gap-3">
      <span
        style={{
          fontSize: 32,
          fontWeight: 200,
          fontFamily: 'Inter, system-ui, sans-serif',
          color: 'var(--text-primary)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {timeStr}
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-faint)', marginLeft: 2 }}>
          {ampm}
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: 'var(--text-faint)',
            marginLeft: 1,
            opacity: 0.6,
          }}
        >
          :{seconds}
        </span>
      </span>
      {weather && (
        <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          {weather.temp}{weather.condition ? ` · ${weather.condition}` : ''}
        </span>
      )}
    </div>
  )
}
