import { renderHook, act } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { useMultiSelect } from './useMultiSelect'

describe('useMultiSelect', () => {
  it('starts with empty selection', () => {
    const { result } = renderHook(() => useMultiSelect())
    expect(result.current.selectedIds.size).toBe(0)
    expect(result.current.hasSelection).toBe(false)
    expect(result.current.selectedCount).toBe(0)
  })

  it('toggleId adds an id to selection', () => {
    const { result } = renderHook(() => useMultiSelect())
    act(() => {
      result.current.toggleId('task-1')
    })
    expect(result.current.selectedIds.has('task-1')).toBe(true)
    expect(result.current.selectedCount).toBe(1)
    expect(result.current.hasSelection).toBe(true)
  })

  it('toggleId removes an id when toggled twice', () => {
    const { result } = renderHook(() => useMultiSelect())
    act(() => {
      result.current.toggleId('task-1')
    })
    act(() => {
      result.current.toggleId('task-1')
    })
    expect(result.current.selectedIds.has('task-1')).toBe(false)
    expect(result.current.selectedCount).toBe(0)
  })

  it('clearSelection empties the selection', () => {
    const { result } = renderHook(() => useMultiSelect())
    act(() => {
      result.current.toggleId('a')
      result.current.toggleId('b')
    })
    expect(result.current.selectedCount).toBe(2)

    act(() => {
      result.current.clearSelection()
    })
    expect(result.current.selectedCount).toBe(0)
    expect(result.current.hasSelection).toBe(false)
  })

  it('Escape key clears selection', () => {
    const { result } = renderHook(() => useMultiSelect())

    // Add a selection first
    act(() => {
      result.current.toggleId('task-1')
    })
    expect(result.current.selectedCount).toBe(1)

    // Fire Escape keydown
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })
    expect(result.current.selectedCount).toBe(0)
  })

  it('selectIds replaces the selection with provided ids', () => {
    const { result } = renderHook(() => useMultiSelect())
    act(() => {
      result.current.toggleId('old')
    })
    act(() => {
      result.current.selectIds(['x', 'y', 'z'])
    })
    expect(result.current.selectedCount).toBe(3)
    expect(result.current.selectedIds.has('old')).toBe(false)
    expect(result.current.selectedIds.has('x')).toBe(true)
  })
})
