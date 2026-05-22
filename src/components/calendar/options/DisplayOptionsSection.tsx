'use client'

import type { ViewOptions } from '../ViewOptionsModal'
import { Toggle, OptionRow } from './shared'
import type { UpdateFn } from './shared'

interface DisplayOptionsSectionProps {
  options: ViewOptions
  update: UpdateFn
}

export default function DisplayOptionsSection({ options, update }: DisplayOptionsSectionProps) {
  return (
    <>
      <OptionRow label="Show Weekends">
        <Toggle value={options.showWeekends} onChange={(v) => update({ showWeekends: v })} />
      </OptionRow>
      <OptionRow label="Show Completed">
        <Toggle value={options.showCompleted} onChange={(v) => update({ showCompleted: v })} />
      </OptionRow>
      <OptionRow label="Show Check Item">
        <Toggle value={options.showCheckItem} onChange={(v) => update({ showCheckItem: v })} />
      </OptionRow>
      <OptionRow label="Show All Repeat Cycle">
        <Toggle value={options.showAllRepeatCycle} onChange={(v) => update({ showAllRepeatCycle: v })} />
      </OptionRow>
      <OptionRow label="Show Habit">
        <Toggle value={options.showHabit} onChange={(v) => update({ showHabit: v })} />
      </OptionRow>
      <OptionRow label="Show Focus Records" info>
        <Toggle value={options.showFocusRecords} onChange={(v) => update({ showFocusRecords: v })} />
      </OptionRow>
      <OptionRow label="Show Countdown">
        <Toggle value={options.showCountdown} onChange={(v) => update({ showCountdown: v })} />
      </OptionRow>
      <OptionRow label="Additional Time Zone" info>
        <Toggle value={options.additionalTimeZone} onChange={(v) => update({ additionalTimeZone: v })} />
      </OptionRow>
    </>
  )
}
