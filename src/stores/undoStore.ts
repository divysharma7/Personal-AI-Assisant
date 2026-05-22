import { create } from 'zustand'

interface UndoEntry {
  description: string
  revert: () => Promise<void>
}

interface UndoState {
  undoStack: UndoEntry[]
  pushUndo: (entry: UndoEntry) => void
  popUndo: () => UndoEntry | undefined
}

const MAX_UNDO_ENTRIES = 20

export const useUndoStore = create<UndoState>((set, get) => ({
  undoStack: [],
  pushUndo: (entry) =>
    set((state) => ({
      undoStack: [...state.undoStack.slice(-(MAX_UNDO_ENTRIES - 1)), entry],
    })),
  popUndo: () => {
    const { undoStack } = get()
    if (undoStack.length === 0) return undefined
    const entry = undoStack[undoStack.length - 1]
    set({ undoStack: undoStack.slice(0, -1) })
    return entry
  },
}))
