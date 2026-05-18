'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { THEMES, DENSITY_SCALES, type ThemeId, type ThemeDef, type DensityLevel } from '@/lib/themes'

interface ThemeContextValue {
  theme: ThemeId
  themeObj: ThemeDef
  resolvedMode: 'light' | 'dark' // what is actually applied
  setTheme: (id: ThemeId) => void
  toggle: () => void
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

function getSystemMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveDataTheme(id: ThemeId): string {
  if (id === 'system') {
    return getSystemMode() === 'dark' ? 'dark' : 'light'
  }
  return id
}

function resolveMode(id: ThemeId): 'light' | 'dark' {
  if (id === 'system') return getSystemMode()
  if (id === 'light') return 'light'
  return 'dark' // dark + blackout
}

function applyThemeToDOM(id: ThemeId) {
  const el = document.documentElement
  el.setAttribute('data-theme', resolveDataTheme(id))
}

function applyDensity(d: DensityLevel) {
  const scale = DENSITY_SCALES[d]
  document.documentElement.style.setProperty('--density-padding', String(scale.padding))
  document.documentElement.style.setProperty('--density-font', String(scale.fontSize))
  document.documentElement.style.setProperty('--density-gap', String(scale.gap))
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('light')
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light')
  const [density, setDensityState] = useState<DensityLevel>('comfortable')
  const [reduceMotion, setReduceMotionState] = useState(false)
  const [soundEnabled, setSoundEnabledState] = useState(false)
  const [soundPack, setSoundPackState] = useState<'minimal' | 'playful'>('minimal')

  // Initialize from localStorage + OS preference
  useEffect(() => {
    const stored = localStorage.getItem('laif-theme') || localStorage.getItem('pim-theme-id') || localStorage.getItem('pim-theme') || 'light'
    // Map legacy theme ids to new system
    let mapped: ThemeId = 'light'
    if (stored === 'dark' || stored === 'midnight' || stored === 'ocean' || stored === 'forest' || stored === 'nord') {
      mapped = 'dark'
    } else if (stored === 'blackout') {
      mapped = 'blackout'
    } else if (stored === 'system') {
      mapped = 'system'
    } else if (stored === 'light' || stored === 'daylight' || stored === 'sunset') {
      mapped = 'light'
    }

    setThemeId(mapped)
    setResolvedMode(resolveMode(mapped))
    applyThemeToDOM(mapped)

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

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (themeId !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      setResolvedMode(resolveMode('system'))
      applyThemeToDOM('system')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [themeId])

  const themeObj = THEMES.find(t => t.id === themeId) || THEMES[0]

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id)
    setResolvedMode(resolveMode(id))
    localStorage.setItem('laif-theme', id)
    applyThemeToDOM(id)
  }, [])

  const toggle = useCallback(() => {
    const next: ThemeId = resolvedMode === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }, [resolvedMode, setTheme])

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
      theme: themeId, themeObj, resolvedMode, setTheme, toggle,
      density, setDensity,
      reduceMotion, setReduceMotion,
      soundEnabled, soundPack, setSoundEnabled, setSoundPack,
    }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export const useTheme = () => useContext(ThemeCtx)
