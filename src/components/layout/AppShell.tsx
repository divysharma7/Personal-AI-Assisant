'use client'
import { usePathname } from 'next/navigation'
import NewSidebar from './Sidebar'
import ArtworkPane from './ArtworkPane'

const NO_SHELL = ['/login', '/signup', '/onboarding']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/'

  // No shell for auth/onboarding routes
  if (NO_SHELL.some(p => pathname.startsWith(p))) {
    return <>{children}</>
  }

  return (
    <>
      {/* Desktop-only notice for viewports < 1024px */}
      <div className="md:hidden flex items-center justify-center h-screen px-6" style={{ background: 'var(--bg-canvas, var(--bg))' }}>
        <div className="text-center max-w-sm">
          <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--text-1)' }}>
            Best on desktop
          </h2>
          <p className="text-[14px]" style={{ color: 'var(--text-2)' }}>
            LAIF is designed for screens 1024px and wider. Please visit on a desktop browser for the best experience.
          </p>
        </div>
      </div>

      {/* Desktop 3-column layout */}
      <div
        className="hidden md:flex h-screen w-screen overflow-hidden p-[3px]"
        style={{ background: 'var(--bg-canvas, var(--bg))' }}
      >
        {/* Sidebar pane */}
        <NewSidebar />

        {/* 1px gap */}
        <div style={{ width: 1 }} />

        {/* Center: Main content pane */}
        <div
          className="flex flex-col flex-1 overflow-hidden min-w-0"
          style={{
            background: 'var(--bg-pane, var(--card))',
            borderRadius: 'var(--radius-pane, 16px)',
            minWidth: 540,
          }}
        >
          {children}
        </div>

        {/* 1px gap */}
        <div style={{ width: 1 }} />

        {/* Right pane: artwork by default */}
        <ArtworkPane />
      </div>
    </>
  )
}
