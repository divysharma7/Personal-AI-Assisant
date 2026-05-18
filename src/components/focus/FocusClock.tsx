'use client'

import dynamic from 'next/dynamic'

export type FocusTheme = 'aurora' | 'minimal' | 'liquid'

interface FocusClockProps {
  remainingSeconds: number
  totalSeconds: number
  isRunning: boolean
  isPaused: boolean
  theme: FocusTheme
  isBreak: boolean
}

// Dynamic imports for theme components — heavy SVG/animation bundles
const AuroraTheme = dynamic(() => import('./themes/AuroraTheme'), { ssr: false })
const MinimalTheme = dynamic(() => import('./themes/MinimalTheme'), { ssr: false })
const LiquidTheme = dynamic(() => import('./themes/LiquidTheme'), { ssr: false })

const themeMap = {
  aurora: AuroraTheme,
  minimal: MinimalTheme,
  liquid: LiquidTheme,
} as const

export default function FocusClock({
  remainingSeconds,
  totalSeconds,
  isRunning,
  isPaused,
  theme,
  isBreak,
}: FocusClockProps) {
  const ThemeComponent = themeMap[theme]

  return (
    <div className="flex items-center justify-center" style={{ width: 400, height: 400 }}>
      <ThemeComponent
        remainingSeconds={remainingSeconds}
        totalSeconds={totalSeconds}
        isRunning={isRunning}
        isPaused={isPaused}
        isBreak={isBreak}
      />
    </div>
  )
}
