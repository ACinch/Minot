import { create } from 'zustand';
import type { InteractionState, HistoryAction, ShapeStyles, ToolMode, ShapeType } from '../types';
import { DEFAULT_STYLES } from '../types';

const MAX_HISTORY_SIZE = 50;

export const useInteractionStore = create<InteractionState>((set, get) => ({
  // Current tool
  activeTool: 'select',
  setActiveTool: (tool: ToolMode) => set({ activeTool: tool }),

  // Selection
  selectedIds: [],
  setSelectedIds: (ids: string[]) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),

  // Shape styles
  currentStyles: DEFAULT_STYLES,
  setCurrentStyles: (styles: Partial<ShapeStyles>) =>
    set((state) => ({
      currentStyles: { ...state.currentStyles, ...styles },
    })),

  // History
  history: [],
  historyIndex: -1,

  pushHistory: (action: HistoryAction) =>
    set((state) => {
      // Remove any redo history when new action is pushed
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(action);

      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        return {
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }

      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),

  undo: () => {
    const state = get();
    if (state.historyIndex < 0) return null;

    const action = state.history[state.historyIndex];
    set({ historyIndex: state.historyIndex - 1 });
    return action;
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return null;

    const nextIndex = state.historyIndex + 1;
    const action = state.history[nextIndex];
    set({ historyIndex: nextIndex });
    return action;
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // Canvas state flags
  isPanning: false,
  setIsPanning: (panning: boolean) => set({ isPanning: panning }),
  isDrawing: false,
  setIsDrawing: (drawing: boolean) => set({ isDrawing: drawing }),

  // Placement mode
  placementShape: null,
  setPlacementShape: (shape: ShapeType | null) => set({
    placementShape: shape,
    // When entering placement mode, set tool to the shape type
    activeTool: shape || 'select',
  }),
  isPlacementMode: () => get().placementShape !== null,
}));
