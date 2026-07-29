import type { ReactNode } from 'react'
import LifeOSMark from '@/components/brand/LifeOSMark'

interface AuthShellProps {
  children: ReactNode
  eyebrow: string
}

const dailyLoop = [
  { time: '08:30', title: 'Plan the day', color: '#f15b43' },
  { time: '10:00', title: 'Protect deep work', color: '#191915' },
  { time: '17:30', title: 'Close the loop', color: '#7d78d7' },
]

export default function AuthShell({ children, eyebrow }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#f3efe6] text-[#191915] lg:grid lg:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.1fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden border-r border-black/10 bg-[#dedbcf] p-10 lg:flex lg:flex-col">
        <LifeOSMark />

        <div className="my-auto max-w-lg py-16">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
            Your daily operating system
          </p>
          <h1
            className="max-w-[520px] text-[clamp(48px,5vw,76px)] font-normal leading-[0.95] tracking-[-0.055em]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            One place for the day you&apos;re actually living.
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-black/55">
            Bring plans, calendar time, and focused work into one calm rhythm.
          </p>

          <div className="mt-12 max-w-md border-t border-black/15">
            {dailyLoop.map((item) => (
              <div
                key={item.title}
                className="grid grid-cols-[56px_12px_1fr] items-center gap-3 border-b border-black/15 py-4"
              >
                <span className="text-xs tabular-nums text-black/40">{item.time}</span>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-semibold">{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-black/40">Plan → focus → reset</p>
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full border-[64px] border-[#c8ee72]/80"
        />
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between lg:justify-end">
          <LifeOSMark className="lg:hidden" />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
            {eyebrow}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[430px]">{children}</div>
        </div>
      </main>
    </div>
  )
}
