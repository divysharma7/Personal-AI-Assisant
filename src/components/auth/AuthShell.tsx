import type { ReactNode } from 'react'
import { CalendarDays, CheckCircle2, Focus, Sparkles } from 'lucide-react'
import './auth-brand.css'
import LifeOSMark from '@/components/brand/LifeOSMark'

interface AuthShellProps {
  children: ReactNode
  eyebrow: string
}

const dailyLoop = [
  { time: '08:30', title: 'Shape the day', icon: CalendarDays },
  { time: '10:00', title: 'Protect what matters', icon: Focus },
  { time: '17:30', title: 'Close the loop', icon: CheckCircle2 },
]

export default function AuthShell({ children, eyebrow }: AuthShellProps) {
  return (
    <div className="auth-brand-shell lg:grid lg:grid-cols-[minmax(380px,0.92fr)_minmax(520px,1.08fr)]">
      <aside className="auth-brand-aside hidden min-h-screen border-r border-[var(--brand-line)] p-10 lg:flex lg:flex-col xl:p-14">
        <LifeOSMark tone="paper" size="lg" />

        <div className="my-auto max-w-[500px] py-16">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--brand-line)] bg-white/[0.025] px-3 py-1.5 text-[11px] text-[var(--brand-text-secondary)]">
            <Sparkles size={13} className="text-[var(--brand-indigo-hover)]" />
            A quieter way to run your day
          </div>
          <h1 className="max-w-[490px] text-[clamp(42px,4.2vw,64px)] font-semibold leading-[1.02] tracking-[-0.055em] text-[var(--brand-text)]">
            Everything in your life, moving as one.
          </h1>
          <p className="mt-6 max-w-md text-[14px] leading-7 text-[var(--brand-text-secondary)]">
            Plans, time, habits, and focused work converge into one calm daily rhythm.
          </p>

          <div className="mt-12 max-w-md rounded-xl border border-[var(--brand-line)] bg-black/10 p-2">
            {dailyLoop.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="relative grid grid-cols-[48px_30px_1fr] items-center gap-2 rounded-lg px-3 py-3.5">
                  <span className="text-[11px] tabular-nums text-[var(--brand-text-muted)]">{item.time}</span>
                  <span className="relative z-10 grid h-7 w-7 place-items-center rounded-lg border border-[var(--brand-line)] bg-[var(--brand-panel-raised)] text-[var(--brand-indigo-hover)]">
                    <Icon size={14} strokeWidth={1.8} />
                  </span>
                  {index < dailyLoop.length - 1 && <span aria-hidden="true" className="absolute left-[75px] top-[41px] h-7 w-px bg-[var(--brand-line)]" />}
                  <span className="text-[13px] font-medium text-[var(--brand-text)]">{item.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-[11px] text-[var(--brand-text-muted)]">Plan · focus · reflect</p>
        <div aria-hidden="true" className="auth-orbit-watermark" />
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between lg:justify-end">
          <LifeOSMark tone="paper" className="lg:hidden" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
            {eyebrow}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </main>
    </div>
  )
}
