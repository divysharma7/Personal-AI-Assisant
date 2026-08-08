import { motion } from 'framer-motion'
import { buttonPress } from '@/lib/motion'
import { Target, Check } from 'lucide-react'

interface Preset {
  id: string
  label: string
  description: string
  focus: number // minutes
}

interface PresetSelectorProps {
  presets: Preset[]
  selected: Preset | null
  onSelect: (preset: Preset) => void
  disabled?: boolean
}

export default function PresetSelector({
  presets,
  selected,
  onSelect,
  disabled = false,
}: PresetSelectorProps) {
  return (
    <section
      className="p-5 rounded-[16px]"
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="mb-5 flex items-center gap-2">
        <Target size={17} style={{ color: 'var(--text-muted)' }} />
        <h2 className="text-sm font-semibold">Choose a rhythm</h2>
      </div>
      <div className="space-y-2">
        {presets.map((item) => (
          <motion.button
            {...buttonPress}
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            disabled={disabled}
            aria-pressed={selected?.id === item.id}
            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            style={{
              backgroundColor: selected?.id === item.id ? 'var(--accent)' : 'var(--overlay-1)',
              color: selected?.id === item.id ? '#fff' : 'var(--text-primary)',
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
          >
            <span>
              <span className="block text-sm font-semibold tabular-nums">{item.label}</span>
              <span
                className="mt-0.5 block text-[11px]"
                style={{
                  color: selected?.id === item.id ? 'rgba(255,255,255,0.6)' : 'var(--text-faint)',
                }}
              >
                {item.description}
              </span>
            </span>
            {selected?.id === item.id && <Check size={16} />}
          </motion.button>
        ))}
      </div>
    </section>
  )
}
