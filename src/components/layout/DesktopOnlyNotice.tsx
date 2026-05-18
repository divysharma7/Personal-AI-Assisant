'use client'

export default function DesktopOnlyNotice() {
  return (
    <div className="flex lg:hidden h-screen w-screen items-center justify-center px-8"
      style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* LAIF logo */}
        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            <span className="text-2xl font-bold">L</span>
          </div>
        </div>

        <h1 className="text-[22px] font-bold mb-3" style={{ color: 'var(--text-1)' }}>
          LAIF works best on desktop
        </h1>
        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
          For the best experience, please use a screen 1024px or wider. Our mobile app is coming soon.
        </p>
      </div>
    </div>
  )
}
