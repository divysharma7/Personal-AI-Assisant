'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { THEMES, DENSITY_SCALES, type ThemeDef, type DensityLevel } from '@/lib/themes'

interface ThemeContextValue {
  theme: string // theme id
  themeObj: ThemeDef
  setTheme: (id: string) => void
  toggle: () => void // legacy dark/light toggle
  density: DensityLevel
  setDensity: (d: DensityLevel) => void
  reduceMotion: boolean
  setReduceMotion: (v: boolean) => void
  soundEnabled: boolean
  soundPack: 'minimal' | 'playful'
  setSoundEnabled: (v: boolean) => void
  setSoundPack: (p: 'minimal' | 'playful') => void
}

const ThemeCtx = createContext<ThemeContextValue>(null!)

function applyTheme(t: ThemeDef) {
  const el = document.documentElement
  el.setAttribute('data-theme', t.mode)
  el.setAttribute('data-theme-id', t.id)
  el.style.setProperty('--bg', t.bg)
  el.style.setProperty('--surface', t.surface)
  el.style.setProperty('--card', t.card)
  el.style.setProperty('--border', t.border)
  el.style.setProperty('--text-1', t.text1)
  el.style.setProperty('--text-2', t.text2)
  el.style.setProperty('--text-3', t.text3)
  el.style.setProperty('--accent', t.accent)
  el.style.setProperty('--accent-hover', t.accentHover)
  el.style.setProperty('--accent-soft', `${t.accent}18`)
  el.style.setProperty('--accent-light', t.accent)
  el.style.setProperty('--accent-dim', `${t.accent}15`)
  el.style.setProperty('--accent-glow', `${t.accent}40`)
}

function applyDensity(d: DensityLevel) {
  const scale = DENSITY_SCALES[d]
  document.documentElement.style.setProperty('--density-padding', String(scale.padding))
  document.documentElement.style.setProperty('--density-font', String(scale.fontSize))
  document.documentElement.style.setProperty('--density-gap', String(scale.gap))
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState('midnight')
  const [density, setDensityState] = useState<DensityLevel>('comfortable')
  const [reduceMotion, setReduceMotionState] = useState(false)
  const [soundEnabled, setSoundEnabledState] = useState(false)
  const [soundPack, setSoundPackState] = useState<'minimal' | 'playful'>('minimal')

  // Initialize from localStorage + OS preference
  useEffect(() => {
    const stored = localStorage.getItem('pim-theme-id') || localStorage.getItem('pim-theme') || 'midnight'
    // Map legacy 'dark'/'light' to new theme ids
    const mapped = stored === 'dark' ? 'midnight' : stored === 'light' ? 'daylight' : stored
    const found = THEMES.find(t => t.id === mapped) || THEMES[0]
    setThemeId(found.id)
    applyTheme(found)

    const d = (localStorage.getItem('pim-density') || 'comfortable') as DensityLevel
    setDensityState(d)
    applyDensity(d)

    const rm = localStorage.getItem('pim-reduce-motion') === 'true' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReduceMotionState(rm)
    if (rm) document.documentElement.classList.add('reduce-motion')

    setSoundEnabledState(localStorage.getItem('pim-sound') === 'true')
    setSoundPackState((localStorage.getItem('pim-sound-pack') || 'minimal') as 'minimal' | 'playful')
  }, [])

  const themeObj = THEMES.find(t => t.id === themeId) || THEMES[0]

  const setTheme = useCallback((id: string) => {
    const t = THEMES.find(x => x.id === id)
    if (!t) return
    setThemeId(id)
    localStorage.setItem('pim-theme-id', id)
    localStorage.setItem('pim-theme', t.mode) // legacy compat
    applyTheme(t)
  }, [])

  const toggle = useCallback(() => {
    const nextMode = themeObj.mode === 'dark' ? 'daylight' : 'midnight'
    setTheme(nextMode)
  }, [themeObj.mode, setTheme])

  const setDensity = useCallback((d: DensityLevel) => {
    setDensityState(d)
    localStorage.setItem('pim-density', d)
    applyDensity(d)
  }, [])

  const setReduceMotion = useCallback((v: boolean) => {
    setReduceMotionState(v)
    localStorage.setItem('pim-reduce-motion', String(v))
    if (v) document.documentElement.classList.add('reduce-motion')
    else document.documentElement.classList.remove('reduce-motion')
  }, [])

  const setSoundEnabled = useCallback((v: boolean) => {
    setSoundEnabledState(v)
    localStorage.setItem('pim-sound', String(v))
  }, [])

  const setSoundPack = useCallback((p: 'minimal' | 'playful') => {
    setSoundPackState(p)
    localStorage.setItem('pim-sound-pack', p)
  }, [])

  return (
    <ThemeCtx.Provider value={{
      theme: themeId, themeObj, setTheme, toggle,
      density, setDensity,
      reduceMotion, setReduceMotion,
      soundEnabled, soundPack, setSoundEnabled, setSoundPack,
    }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export const useTheme = () => useContext(ThemeCtx)
