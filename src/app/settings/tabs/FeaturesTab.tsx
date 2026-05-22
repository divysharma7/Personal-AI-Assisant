'use client'

import { motion } from 'framer-motion'
import { type Theme } from '@/contexts/ThemeContext'
import { fade, ease } from '@/lib/motion'
import ThemePicker from './ThemePicker'
import FocusSettings from './FocusSettings'
import CalendarSettingsSection from './CalendarSettingsSection'

interface FeaturesTabProps {
  theme: Theme
  setTheme: (t: Theme) => void
  soundsEnabled: boolean
  setSoundsEnabled: (v: boolean) => void
  meetingNotesEnabled: boolean
  setMeetingNotesEnabled: (v: boolean) => void
  // Focus settings
  focusWorkDuration: number
  setFocusWorkDuration: (v: number) => void
  focusShortBreak: number
  setFocusShortBreak: (v: number) => void
  focusLongBreak: number
  setFocusLongBreak: (v: number) => void
  focusLongBreakEvery: number
  setFocusLongBreakEvery: (v: number) => void
  focusClockTheme: 'aurora' | 'minimal' | 'liquid'
  setFocusClockTheme: (v: 'aurora' | 'minimal' | 'liquid') => void
  focusSoundOnComplete: boolean
  setFocusSoundOnComplete: (v: boolean) => void
  focusKeyboardShortcuts: boolean
  setFocusKeyboardShortcuts: (v: boolean) => void
  focusShowActiveSession: boolean
  setFocusShowActiveSession: (v: boolean) => void
  focusSettingsToast: boolean
  showFocusToast: () => void
  // Calendar settings in features
  calSettingsToast: boolean
  showCalToast: () => void
  calDefaultView: 'day' | 'week' | 'month'
  setCalDefaultView: (v: 'day' | 'week' | 'month') => void
  calWeekStartsOn: 'monday' | 'sunday' | 'saturday'
  setCalWeekStartsOn: (v: 'monday' | 'sunday' | 'saturday') => void
  calTimeFormat: '12' | '24'
  setCalTimeFormat: (v: '12' | '24') => void
  calShowCurrentTime: boolean
  setCalShowCurrentTime: (v: boolean) => void
  calHideHoursFrom: number
  setCalHideHoursFrom: (v: number) => void
  calHideHoursTo: number
  setCalHideHoursTo: (v: number) => void
  calColorBy: 'list' | 'priority' | 'label'
  setCalColorBy: (v: 'list' | 'priority' | 'label') => void
  calDailyCapacity: number
  setCalDailyCapacity: (v: number) => void
  calShowCapacityBar: boolean
  setCalShowCapacityBar: (v: boolean) => void
  calShowWarnings: boolean
  setCalShowWarnings: (v: boolean) => void
  calShowGoogleOverlay: boolean
  setCalShowGoogleOverlay: (v: boolean) => void
  calShowHabitsOverlay: boolean
  setCalShowHabitsOverlay: (v: boolean) => void
  calShowFocusOverlay: boolean
  setCalShowFocusOverlay: (v: boolean) => void
}

export default function FeaturesTab(props: FeaturesTabProps) {
  return (
    <motion.div key="features" {...fade} transition={ease.normal} className="flex flex-col gap-8">
      <ThemePicker
        theme={props.theme}
        setTheme={props.setTheme}
        soundsEnabled={props.soundsEnabled}
        setSoundsEnabled={props.setSoundsEnabled}
        meetingNotesEnabled={props.meetingNotesEnabled}
        setMeetingNotesEnabled={props.setMeetingNotesEnabled}
      />

      <FocusSettings
        focusWorkDuration={props.focusWorkDuration}
        setFocusWorkDuration={props.setFocusWorkDuration}
        focusShortBreak={props.focusShortBreak}
        setFocusShortBreak={props.setFocusShortBreak}
        focusLongBreak={props.focusLongBreak}
        setFocusLongBreak={props.setFocusLongBreak}
        focusLongBreakEvery={props.focusLongBreakEvery}
        setFocusLongBreakEvery={props.setFocusLongBreakEvery}
        focusClockTheme={props.focusClockTheme}
        setFocusClockTheme={props.setFocusClockTheme}
        focusSoundOnComplete={props.focusSoundOnComplete}
        setFocusSoundOnComplete={props.setFocusSoundOnComplete}
        focusKeyboardShortcuts={props.focusKeyboardShortcuts}
        setFocusKeyboardShortcuts={props.setFocusKeyboardShortcuts}
        focusShowActiveSession={props.focusShowActiveSession}
        setFocusShowActiveSession={props.setFocusShowActiveSession}
        focusSettingsToast={props.focusSettingsToast}
        showFocusToast={props.showFocusToast}
      />

      <CalendarSettingsSection
        calSettingsToast={props.calSettingsToast}
        showCalToast={props.showCalToast}
        calDefaultView={props.calDefaultView}
        setCalDefaultView={props.setCalDefaultView}
        calWeekStartsOn={props.calWeekStartsOn}
        setCalWeekStartsOn={props.setCalWeekStartsOn}
        calTimeFormat={props.calTimeFormat}
        setCalTimeFormat={props.setCalTimeFormat}
        calShowCurrentTime={props.calShowCurrentTime}
        setCalShowCurrentTime={props.setCalShowCurrentTime}
        calHideHoursFrom={props.calHideHoursFrom}
        setCalHideHoursFrom={props.setCalHideHoursFrom}
        calHideHoursTo={props.calHideHoursTo}
        setCalHideHoursTo={props.setCalHideHoursTo}
        calColorBy={props.calColorBy}
        setCalColorBy={props.setCalColorBy}
        calDailyCapacity={props.calDailyCapacity}
        setCalDailyCapacity={props.setCalDailyCapacity}
        calShowCapacityBar={props.calShowCapacityBar}
        setCalShowCapacityBar={props.setCalShowCapacityBar}
        calShowWarnings={props.calShowWarnings}
        setCalShowWarnings={props.setCalShowWarnings}
        calShowGoogleOverlay={props.calShowGoogleOverlay}
        setCalShowGoogleOverlay={props.setCalShowGoogleOverlay}
        calShowHabitsOverlay={props.calShowHabitsOverlay}
        setCalShowHabitsOverlay={props.setCalShowHabitsOverlay}
        calShowFocusOverlay={props.calShowFocusOverlay}
        setCalShowFocusOverlay={props.setCalShowFocusOverlay}
      />
    </motion.div>
  )
}
