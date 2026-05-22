import { useCalendarStore } from './calendarStore'

// Snapshot the initial state so we can reset between tests
const initialState = useCalendarStore.getState()

describe('calendarStore', () => {
  beforeEach(() => {
    useCalendarStore.setState(initialState, true)
  })

  // ── Initial state ──────────────────────────────────────────────────────────

  it('has correct initial defaults', () => {
    const s = useCalendarStore.getState()
    expect(s.viewMode).toBe('week')
    expect(s.hourHeight).toBe(48)
    expect(s.selectedTaskIds).toEqual([])
    expect(s.allDayBarHeight).toBe(60)
    expect(s.arrangePanelOpen).toBe(false)
    expect(s.splitViewOpen).toBe(false)
    expect(s.splitViewListId).toBeNull()
  })

  // ── setViewMode ────────────────────────────────────────────────────────────

  it('setViewMode updates viewMode', () => {
    useCalendarStore.getState().setViewMode('month')
    expect(useCalendarStore.getState().viewMode).toBe('month')
  })

  // ── setHourHeight clamping ─────────────────────────────────────────────────

  it('setHourHeight clamps values below minimum to 24', () => {
    useCalendarStore.getState().setHourHeight(20)
    expect(useCalendarStore.getState().hourHeight).toBe(24)
  })

  it('setHourHeight clamps values above maximum to 120', () => {
    useCalendarStore.getState().setHourHeight(200)
    expect(useCalendarStore.getState().hourHeight).toBe(120)
  })

  it('setHourHeight accepts values within range', () => {
    useCalendarStore.getState().setHourHeight(60)
    expect(useCalendarStore.getState().hourHeight).toBe(60)
  })

  // ── setAllDayBarHeight clamping ────────────────────────────────────────────

  it('setAllDayBarHeight clamps values below minimum to 40', () => {
    useCalendarStore.getState().setAllDayBarHeight(30)
    expect(useCalendarStore.getState().allDayBarHeight).toBe(40)
  })

  it('setAllDayBarHeight clamps values above maximum to 240', () => {
    useCalendarStore.getState().setAllDayBarHeight(300)
    expect(useCalendarStore.getState().allDayBarHeight).toBe(240)
  })

  // ── toggleTaskSelection ────────────────────────────────────────────────────

  it('toggleTaskSelection adds an id', () => {
    useCalendarStore.getState().toggleTaskSelection('a')
    expect(useCalendarStore.getState().selectedTaskIds).toEqual(['a'])
  })

  it('toggleTaskSelection removes an id when toggled twice', () => {
    const { toggleTaskSelection } = useCalendarStore.getState()
    toggleTaskSelection('a')
    // Re-fetch state after first mutation
    useCalendarStore.getState().toggleTaskSelection('a')
    expect(useCalendarStore.getState().selectedTaskIds).toEqual([])
  })

  // ── clearSelection ─────────────────────────────────────────────────────────

  it('clearSelection empties selectedTaskIds', () => {
    useCalendarStore.getState().toggleTaskSelection('x')
    useCalendarStore.getState().toggleTaskSelection('y')
    expect(useCalendarStore.getState().selectedTaskIds).toHaveLength(2)
    useCalendarStore.getState().clearSelection()
    expect(useCalendarStore.getState().selectedTaskIds).toEqual([])
  })

  // ── navigateBy ─────────────────────────────────────────────────────────────

  it('navigateBy(1) in week view advances 7 days', () => {
    const base = new Date(2025, 0, 1) // Jan 1 2025
    useCalendarStore.setState({ currentDate: base, viewMode: 'week' })
    useCalendarStore.getState().navigateBy(1)
    const result = useCalendarStore.getState().currentDate
    expect(result.getDate()).toBe(8)
    expect(result.getMonth()).toBe(0)
  })

  it('navigateBy(-1) in day view goes back 1 day', () => {
    const base = new Date(2025, 0, 10)
    useCalendarStore.setState({ currentDate: base, viewMode: 'day' })
    useCalendarStore.getState().navigateBy(-1)
    const result = useCalendarStore.getState().currentDate
    expect(result.getDate()).toBe(9)
  })

  it('navigateBy(0) resets to today', () => {
    const farAway = new Date(2099, 5, 15)
    useCalendarStore.setState({ currentDate: farAway })
    useCalendarStore.getState().navigateBy(0)
    const result = useCalendarStore.getState().currentDate
    const now = new Date()
    expect(result.getFullYear()).toBe(now.getFullYear())
    expect(result.getMonth()).toBe(now.getMonth())
    expect(result.getDate()).toBe(now.getDate())
  })

  it('navigateBy(1) in month view advances 1 month', () => {
    const base = new Date(2025, 2, 15) // March 15
    useCalendarStore.setState({ currentDate: base, viewMode: 'month' })
    useCalendarStore.getState().navigateBy(1)
    const result = useCalendarStore.getState().currentDate
    expect(result.getMonth()).toBe(3) // April
  })

  it('navigateBy(1) in year view advances 1 year', () => {
    const base = new Date(2025, 5, 1)
    useCalendarStore.setState({ currentDate: base, viewMode: 'year' })
    useCalendarStore.getState().navigateBy(1)
    const result = useCalendarStore.getState().currentDate
    expect(result.getFullYear()).toBe(2026)
  })

  it('navigateBy sets navigationDirection', () => {
    const base = new Date(2025, 0, 1)
    useCalendarStore.setState({ currentDate: base, viewMode: 'week' })

    useCalendarStore.getState().navigateBy(1)
    expect(useCalendarStore.getState().navigationDirection).toBe(1)

    useCalendarStore.getState().navigateBy(-1)
    expect(useCalendarStore.getState().navigationDirection).toBe(-1)
  })

  it('navigateBy(0) sets navigationDirection to 1', () => {
    useCalendarStore.setState({ navigationDirection: -1 })
    useCalendarStore.getState().navigateBy(0)
    expect(useCalendarStore.getState().navigationDirection).toBe(1)
  })
})
