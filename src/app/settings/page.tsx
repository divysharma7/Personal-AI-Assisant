'use client'
import { useState } from 'react'
import { Umbrella, Palette, Volume2, SlidersHorizontal, LogOut } from 'lucide-react'
import FloatingChat from '@/components/chat/FloatingChat'
import UmbrellaSettings from '@/components/umbrellas/UmbrellaSettings'
import { useTheme } from '@/contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import { THEMES, type DensityLevel } from '@/lib/themes'

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'sound',      label: 'Sound',      icon: Volume2 },
  { id: 'display',    label: 'Display',    icon: SlidersHorizontal },
  { id: 'umbrellas',  label: 'Umbrellas',  icon: Umbrella },
] as const

type SectionId = typeof SECTIONS[number]['id']

const DENSITY_OPTIONS: { id: DensityLevel; label: string }[] = [
  { id: 'compact',     label: 'Compact' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'spacious',    label: 'Spacious' },
]

function playTestSound(pack: 'minimal' | 'playful') {
  if (typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.value = 0.15
    if (pack === 'minimal') {
      osc.type = 'sine'
      osc.frequency.value = 800
    } else {
      osc.type = 'triangle'
      osc.frequency.value = 1200
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15)
    }
    osc.start()
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)
    osc.stop(ctx.currentTime + 0.25)
  } catch {}
}

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>('appearance')
  const { theme, setTheme, density, setDensity, reduceMotion, setReduceMotion, soundEnabled, soundPack, setSoundEnabled, setSoundPack } = useTheme()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="px-8 md:px-10 py-8 md:py-10">
            {/* Title row with sign out */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-[32px] md:text-[36px] font-bold" style={{ color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Settings
              </h1>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-3)' }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>

            {/* Tab pills */}
            <div className="flex items-center gap-1 mb-8 flex-wrap">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={active === s.id
                    ? { background: 'var(--accent)', color: '#fff' }
                    : { background: 'var(--surface)', color: 'var(--text-2)' }}
                >
                  <s.icon size={14} />
                  {s.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="max-w-2xl">
              {active === 'appearance' && (
                <div className="space-y-6">
                  {/* Theme picker */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Theme</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {THEMES.map(t => (
                        <button key={t.id} onClick={() => setTheme(t.id)}
                          className="rounded-xl p-3 text-left transition-all"
                          style={{
                            background: t.bg, border: theme === t.id ? `2px solid ${t.accent}` : '2px solid transparent',
                            boxShadow: theme === t.id ? `0 0 0 3px ${t.accent}30` : 'none',
                          }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 rounded-full" style={{ background: t.accent }} />
                            <span className="text-xs font-semibold" style={{ color: t.text1 }}>{t.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <div className="flex-1 h-2 rounded" style={{ background: t.card }} />
                            <div className="w-4 h-2 rounded" style={{ background: t.accent }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {active === 'display' && (
                <div className="space-y-6">
                  {/* Density */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Density</h3>
                    <div className="flex gap-2">
                      {DENSITY_OPTIONS.map(d => (
                        <button key={d.id} onClick={() => setDensity(d.id)}
                          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={density === d.id
                            ? { background: 'var(--accent)', color: '#fff' }
                            : { background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reduce motion */}
                  <div className="flex items-center justify-between rounded-2xl p-4" style={{ background: 'var(--surface)' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Reduce motion</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Replace spring animations with subtle fades</p>
                    </div>
                    <button onClick={() => setReduceMotion(!reduceMotion)}
                      className="w-10 h-6 rounded-full transition-colors relative"
                      style={{ background: reduceMotion ? 'var(--accent)' : 'var(--input-bg)' }}>
                      <div className="absolute w-4 h-4 rounded-full bg-white top-1 transition-all"
                        style={{ left: reduceMotion ? 22 : 4 }} />
                    </button>
                  </div>
                </div>
              )}

              {active === 'sound' && (
                <div className="space-y-6">
                  {/* Sound toggle */}
                  <div className="flex items-center justify-between rounded-2xl p-4" style={{ background: 'var(--surface)' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>UI Sounds</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Play sounds on task complete, timer end, etc.</p>
                    </div>
                    <button onClick={() => setSoundEnabled(!soundEnabled)}
                      className="w-10 h-6 rounded-full transition-colors relative"
                      style={{ background: soundEnabled ? 'var(--accent)' : 'var(--input-bg)' }}>
                      <div className="absolute w-4 h-4 rounded-full bg-white top-1 transition-all"
                        style={{ left: soundEnabled ? 22 : 4 }} />
                    </button>
                  </div>

                  {/* Sound pack */}
                  {soundEnabled && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Sound Pack</h3>
                      <div className="flex gap-2">
                        {(['minimal', 'playful'] as const).map(p => (
                          <button key={p} onClick={() => { setSoundPack(p); playTestSound(p) }}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all"
                            style={soundPack === p
                              ? { background: 'var(--accent)', color: '#fff' }
                              : { background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {active === 'umbrellas' && <UmbrellaSettings />}
            </div>
          </div>
        </div>
      </main>
      <FloatingChat onRefreshItems={() => {}} />
    </>
  )
}
