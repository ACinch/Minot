import { useCallback } from 'react';
import { useCanvas } from '../context/CanvasContext';
import { useInteractionStore } from '../store/interactionStore';

export function useHistory() {
  const { canvas, loadData } = useCanvas();
  const {
    undo: storeUndo,
    redo: storeRedo,
    canUndo,
    canRedo,
    history,
    historyIndex,
  } = useInteractionStore();

  const undo = useCallback(() => {
    if (!canvas || !canUndo()) return;

    const action = storeUndo();
    if (action && action.before) {
      try {
        const data = JSON.parse(action.before);
        canvas.loadFromJSON(data, () => {
          canvas.renderAll();
        });
      } catch (e) {
        console.error('Failed to undo:', e);
      }
    }
  }, [canvas, canUndo, storeUndo]);

  const redo = useCallback(() => {
    if (!canvas || !canRedo()) return;

    const action = storeRedo();
    if (action && action.after) {
      try {
        const data = JSON.parse(action.after);
        canvas.loadFromJSON(data, () => {
          canvas.renderAll();
        });
      } catch (e) {
        console.error('Failed to redo:', e);
      }
    }
  }, [canvas, canRedo, storeRedo]);

  return {
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    historyLength: history.length,
    historyIndex,
  };
}
