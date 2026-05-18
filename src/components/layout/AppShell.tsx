'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import ArtworkPane from './ArtworkPane'
import { copy } from '@/lib/copy'
import { fade, ease } from '@/lib/motion'

const SHELL_EXCLUDED = ['/login', '/signup', '/onboarding']

function DesktopOnlyNotice() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
    >
      <motion.div
        {...fade}
        transition={ease.slow}
        className="rounded-2xl p-8"
        style={{ backgroundColor: 'var(--bg-pane)', maxWidth: 400 }}
      >
        <h1 className="mb-3 text-2xl font-bold">{copy.desktopOnly.title}</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {copy.desktopOnly.body}
        </p>
      </motion.div>
    </div>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // No shell for auth/onboarding routes
  const noShell = SHELL_EXCLUDED.some((p) => pathname.startsWith(p))
  if (noShell) return <>{children}</>

  // Small viewport notice
  if (!isDesktop) return <DesktopOnlyNotice />

  return (
    <div
      className="flex h-screen p-[3px]"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      {/* Left: Sidebar */}
      <Sidebar />

      {/* Gap */}
      <div className="w-[1px] flex-shrink-0" />

      {/* Center: Main content */}
      <main
        className="flex min-w-[540px] flex-1 flex-col overflow-y-auto rounded-[16px]"
        style={{ backgroundColor: 'var(--bg-pane)' }}
      >
        {children}
      </main>

      {/* Gap */}
      <div className="w-[1px] flex-shrink-0" />

      {/* Right: Artwork pane */}
      <ArtworkPane />
    </div>
  )
}
