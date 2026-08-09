interface LifeOSMarkProps {
  tone?: 'ink' | 'paper'
  compact?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { mark: 24, label: 'text-[13px]', gap: 'gap-2' },
  md: { mark: 30, label: 'text-[15px]', gap: 'gap-2.5' },
  lg: { mark: 42, label: 'text-[19px]', gap: 'gap-3' },
}

/**
 * Life OS "Open Orbit" mark.
 *
 * The continuous path moves from a wide orbit toward a calm centre: the
 * product's many systems converging around one person. It is deliberately
 * flat, high-contrast, and legible at favicon size.
 */
export default function LifeOSMark({
  tone = 'ink',
  compact = false,
  className = '',
  size = 'md',
}: LifeOSMarkProps) {
  const textColor = tone === 'paper' ? '#f4f4f5' : '#19191a'
  const dimensions = sizes[size]

  return (
    <div
      className={`inline-flex items-center ${dimensions.gap} ${className}`}
      aria-label="Life OS"
    >
      <svg
        aria-hidden="true"
        width={dimensions.mark}
        height={dimensions.mark}
        viewBox="0 0 32 32"
        fill="none"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="10" fill="#6472FF" />
        <path
          d="M22.65 9.45C19.3 5.82 13.66 5.48 9.9 8.72C6.16 11.95 6.08 17.77 9.48 21.18C12.68 24.39 17.98 24.31 21.08 21.4C23.91 18.75 23.72 14.18 21.31 11.8C19.09 9.61 15.42 9.52 13.18 11.5C11.18 13.28 11.3 16.38 13.1 17.97C14.78 19.47 17.27 19.38 18.7 17.88"
          stroke="#FFFFFF"
          strokeWidth="2.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!compact && (
        <span
          className={`${dimensions.label} font-semibold tracking-[-0.035em]`}
          style={{ color: textColor }}
        >
          Life OS
        </span>
      )}
    </div>
  )
}
