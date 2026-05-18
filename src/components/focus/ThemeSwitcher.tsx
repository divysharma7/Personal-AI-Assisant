'use client'

import { motion } from 'framer-motion'
import { buttonPress } from '@/lib/motion'
import type { FocusTheme } from './FocusClock'

interface ThemeSwitcherProps {
  activeTheme: FocusTheme
  onThemeChange: (theme: FocusTheme) => void
}

const themes: { id: FocusTheme; label: string; colors: string[]; key: string }[] = [
  {
    id: 'aurora',
    label: 'Aurora',
    colors: ['#7c3aed', '#c084fc'],
    key: '1',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    colors: ['#333333', '#666666'],
    key: '2',
  },
  {
    id: 'liquid',
    label: 'Liquid',
    colors: ['#f97316', '#fde68a'],
    key: '3',
  },
]

export default function ThemeSwitcher({ activeTheme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <div className="flex items-center gap-3">
      {themes.map((theme) => {
        const isActive = activeTheme === theme.id
        return (
          <motion.button
            key={theme.id}
            {...buttonPress}
            onClick={() => onThemeChange(theme.id)}
            className="relative flex items-center justify-center rounded-full cursor-pointer"
            style={{
              width: 32,
              height: 32,
              outline: isActive ? `2px solid rgba(255, 255, 255, 0.6)` : '2px solid transparent',
              outlineOffset: 2,
              transition: 'outline-color 0.15s ease',
            }}
            title={`${theme.label} (${theme.key})`}
            aria-label={`Switch to ${theme.label} theme`}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
              }}
            />
          </motion.button>
        )
      })}
    </div>
  )
}
