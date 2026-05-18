'use client'
import { usePathname } from 'next/navigation'
import SuperlistSidebar from './SuperlistSidebar'
import ArtworkPanel from './ArtworkPanel'
import BottomDock from './BottomDock'

const NO_SHELL = ['/login', '/signup']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/'

  if (NO_SHELL.some(p => pathname.startsWith(p))) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Left: Sidebar — hidden on mobile */}
      <SuperlistSidebar />

      {/* Center: Content card — white, rounded, floating */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 py-2 md:py-3">
        <div
          className="flex-1 overflow-hidden min-h-0 rounded-2xl md:rounded-[20px] flex flex-col"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          {children}
        </div>
        <BottomDock />
      </div>

      {/* Right: Artwork panel — hidden on mobile and small screens */}
      <ArtworkPanel />
    </div>
  )
}
