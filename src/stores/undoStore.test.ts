import { useUndoStore } from './undoStore'

const initialState = useUndoStore.getState()

function makeEntry(desc: string) {
  return { description: desc, revert: async () => {} }
}

describe('undoStore', () => {
  beforeEach(() => {
    useUndoStore.setState(initialState, true)
  })

  it('starts with an empty stack', () => {
    expect(useUndoStore.getState().undoStack).toEqual([])
  })

  it('pushUndo adds an entry to the stack', () => {
    useUndoStore.getState().pushUndo(makeEntry('first'))
    expect(useUndoStore.getState().undoStack).toHaveLength(1)
    expect(useUndoStore.getState().undoStack[0].description).toBe('first')
  })

  it('push 3, pop 1 returns the last entry and leaves 2', () => {
    const { pushUndo } = useUndoStore.getState()
    pushUndo(makeEntry('a'))
    useUndoStore.getState().pushUndo(makeEntry('b'))
    useUndoStore.getState().pushUndo(makeEntry('c'))
    expect(useUndoStore.getState().undoStack).toHaveLength(3)

    const popped = useUndoStore.getState().popUndo()
    expect(popped?.description).toBe('c')
    expect(useUndoStore.getState().undoStack).toHaveLength(2)
  })

  it('caps stack at 20 entries (oldest evicted)', () => {
    for (let i = 0; i < 21; i++) {
      useUndoStore.getState().pushUndo(makeEntry(`entry-${i}`))
    }
    const stack = useUndoStore.getState().undoStack
    expect(stack).toHaveLength(20)
    // The oldest (entry-0) should have been evicted; entry-1 is now the oldest
    expect(stack[0].description).toBe('entry-1')
    expect(stack[19].description).toBe('entry-20')
  })

  it('popUndo returns undefined on empty stack', () => {
    const result = useUndoStore.getState().popUndo()
    expect(result).toBeUndefined()
  })
})
