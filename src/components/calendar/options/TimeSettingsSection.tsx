'use client'

import type { ViewOptions } from '../ViewOptionsModal'
import { Toggle, OptionRow, RadioGroup, SectionTitle, HourSlider } from './shared'
import type { UpdateFn } from './shared'

interface TimeSettingsSectionProps {
  options: ViewOptions
  update: UpdateFn
}

export default function TimeSettingsSection({ options, update }: TimeSettingsSectionProps) {
  return (
    <>
      <SectionTitle>Time &amp; Display</SectionTitle>

      <OptionRow label="First Day of Week">
        <RadioGroup
          options={[
            { key: 'sunday' as const, label: 'Sun' },
            { key: 'monday' as const, label: 'Mon' },
            { key: 'saturday' as const, label: 'Sat' },
          ]}
          value={options.firstDayOfWeek}
          onChange={(v) => update({ firstDayOfWeek: v })}
        />
      </OptionRow>

      <OptionRow label="Time Format">
        <RadioGroup
          options={[
            { key: '12h' as const, label: '12h' },
            { key: '24h' as const, label: '24h' },
          ]}
          value={options.timeFormat}
          onChange={(v) => update({ timeFormat: v })}
        />
      </OptionRow>

      <OptionRow label="Show Week Numbers">
        <Toggle value={options.showWeekNumbers} onChange={(v) => update({ showWeekNumbers: v })} />
      </OptionRow>

      <HourSlider
        label="Start Hour"
        value={options.startHour}
        min={0}
        max={12}
        onChange={(v) => update({ startHour: v })}
      />

      <HourSlider
        label="End Hour"
        value={options.endHour}
        min={12}
        max={24}
        onChange={(v) => update({ endHour: v })}
      />

      <OptionRow label="Show Declined Events">
        <Toggle value={options.showDeclinedEvents} onChange={(v) => update({ showDeclinedEvents: v })} />
      </OptionRow>

      <OptionRow label="Default Duration">
        <RadioGroup
          options={[
            { key: '30' as unknown as '30', label: '30m' },
            { key: '60' as unknown as '60', label: '1h' },
            { key: '120' as unknown as '120', label: '2h' },
          ]}
          value={String(options.defaultEventDuration) as '30' | '60' | '120'}
          onChange={(v) => update({ defaultEventDuration: Number(v) as 30 | 60 | 120 })}
        />
      </OptionRow>

      <OptionRow label="Show Capacity Bar">
        <Toggle value={options.showCapacityBar} onChange={(v) => update({ showCapacityBar: v })} />
      </OptionRow>
    </>
  )
}
