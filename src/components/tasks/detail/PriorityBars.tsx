'use client'

/** Priority bars SVG — filled rectangles */
export default function PriorityBars({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="10" width="3" height="5" rx="0.8" fill={color} />
      <rect x="6.5" y="6.5" width="3" height="8.5" rx="0.8" fill={color} />
      <rect x="11" y="3" width="3" height="12" rx="0.8" fill={color} />
    </svg>
  )
}
