import { useSettingsStore } from './settingsStore'

const initialState = useSettingsStore.getState()

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState(initialState, true)
  })

  // ── Initial defaults ───────────────────────────────────────────────────────

  it('has correct initial defaults', () => {
    const s = useSettingsStore.getState()
    expect(s.showCompleted).toBe(true)
    expect(s.showCheckItem).toBe(false)
    expect(s.showFutureCycles).toBe(true)
    expect(s.showHabits).toBe(true)
    expect(s.showFocusRecords).toBe(false)
    expect(s.showItemIcons).toBe(true)
    expect(s.taskColorMode).toBe('list')
    expect(s.calendarStyle).toBe('modern')
    expect(s.weekStartsOn).toBe(1)
    expect(s.timeFormat).toBe('12h')
    expect(s.dateFormat).toBe('MM/DD/YYYY')
    expect(s.visibleListIds).toBeNull()
  })

  // ── toggleSetting ──────────────────────────────────────────────────────────

  it('toggleSetting flips showCompleted to false', () => {
    useSettingsStore.getState().toggleSetting('showCompleted')
    expect(useSettingsStore.getState().showCompleted).toBe(false)
  })

  it('toggleSetting flips showCompleted back to true on second call', () => {
    useSettingsStore.getState().toggleSetting('showCompleted')
    useSettingsStore.getState().toggleSetting('showCompleted')
    expect(useSettingsStore.getState().showCompleted).toBe(true)
  })

  // ── setTaskColorMode ───────────────────────────────────────────────────────

  it('setTaskColorMode updates to priority', () => {
    useSettingsStore.getState().setTaskColorMode('priority')
    expect(useSettingsStore.getState().taskColorMode).toBe('priority')
  })

  // ── setCalendarStyle ───────────────────────────────────────────────────────

  it('setCalendarStyle updates to classic', () => {
    useSettingsStore.getState().setCalendarStyle('classic')
    expect(useSettingsStore.getState().calendarStyle).toBe('classic')
  })

  // ── setVisibleListIds ──────────────────────────────────────────────────────

  it('setVisibleListIds updates the list', () => {
    useSettingsStore.getState().setVisibleListIds(['a', 'b'])
    expect(useSettingsStore.getState().visibleListIds).toEqual(['a', 'b'])
  })

  // ── toggleListVisibility ───────────────────────────────────────────────────

  it('toggleListVisibility is a no-op when visibleListIds is null', () => {
    expect(useSettingsStore.getState().visibleListIds).toBeNull()
    useSettingsStore.getState().toggleListVisibility('a')
    expect(useSettingsStore.getState().visibleListIds).toBeNull()
  })

  it('toggleListVisibility removes a list id when present', () => {
    useSettingsStore.setState({ visibleListIds: ['a', 'b', 'c'] })
    useSettingsStore.getState().toggleListVisibility('b')
    expect(useSettingsStore.getState().visibleListIds).toEqual(['a', 'c'])
  })

  it('toggleListVisibility adds a list id when absent', () => {
    useSettingsStore.setState({ visibleListIds: ['a'] })
    useSettingsStore.getState().toggleListVisibility('b')
    expect(useSettingsStore.getState().visibleListIds).toEqual(['a', 'b'])
  })

  it('toggleListVisibility sets null when removing the last item', () => {
    useSettingsStore.setState({ visibleListIds: ['a'] })
    useSettingsStore.getState().toggleListVisibility('a')
    expect(useSettingsStore.getState().visibleListIds).toBeNull()
  })

  // ── hydrate ────────────────────────────────────────────────────────────────

  it('hydrate merges partial state', () => {
    useSettingsStore.getState().hydrate({ showCompleted: false, taskColorMode: 'tag' })
    const s = useSettingsStore.getState()
    expect(s.showCompleted).toBe(false)
    expect(s.taskColorMode).toBe('tag')
    // Other fields unchanged
    expect(s.calendarStyle).toBe('modern')
  })
})
