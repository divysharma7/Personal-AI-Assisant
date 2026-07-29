interface LifeOSMarkProps {
  tone?: 'ink' | 'paper'
  compact?: boolean
  className?: string
}

export default function LifeOSMark({
  tone = 'ink',
  compact = false,
  className = '',
}: LifeOSMarkProps) {
  const color = tone === 'paper' ? '#f7f3ea' : '#191915'

  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="Life OS"
    >
      <span
        aria-hidden="true"
        className="relative grid h-7 w-7 grid-cols-2 gap-[3px] rounded-[9px] p-[5px]"
        style={{ backgroundColor: color }}
      >
        <span className="rounded-[2px] bg-[#f15b43]" />
        <span className="rounded-[2px] bg-[#f7f3ea]" />
        <span className="rounded-[2px] bg-[#f7f3ea]" />
        <span className="rounded-[2px] bg-[#c8ee72]" />
      </span>
      {!compact && (
        <span
          className="text-[15px] font-semibold tracking-[-0.035em]"
          style={{ color }}
        >
          Life OS
        </span>
      )}
    </div>
  )
}
