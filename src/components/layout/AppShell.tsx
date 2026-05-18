'use client'
import { usePathname } from 'next/navigation'
import SuperlistSidebar from './SuperlistSidebar'
import BottomDock from './BottomDock'

const NO_SHELL = ['/login', '/signup']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/'

  if (NO_SHELL.some(p => pathname.startsWith(p))) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Sidebar — hidden on mobile */}
      <SuperlistSidebar />

      {/* Main content — no card wrap, content fills space */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <div className="flex-1 overflow-hidden min-h-0">
          {children}
        </div>
        <BottomDock />
      </div>
    </div>
  )
}
