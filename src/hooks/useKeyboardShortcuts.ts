import { useEffect, useCallback } from 'react';
import { Canvas as FabricCanvas, Object as FabricObject, ActiveSelection } from 'fabric';
import { useInteractionStore } from '../store/interactionStore';
import { useHistory } from './useHistory';
import { generateShapeId } from '../shapes/serialization';
import { SHAPE_CONSTRAINTS } from '../types';

/**
 * Handles keyboard shortcuts for canvas operations
 */
export function useKeyboardShortcuts(canvas: FabricCanvas | null) {
  const { selectedIds, setSelectedIds } = useInteractionStore();
  const { undo, redo, canUndo, canRedo } = useHistory();

  // Delete selected objects
  const deleteSelected = useCallback(() => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    if (activeObject instanceof ActiveSelection) {
      activeObject.forEachObject((obj) => canvas.remove(obj));
    } else {
      canvas.remove(activeObject);
    }

    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedIds([]);
  }, [canvas, setSelectedIds]);

  // Duplicate selected objects
  const duplicateSelected = useCallback(() => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const offset = 20;

    if (activeObject instanceof ActiveSelection) {
      const clonedObjects: FabricObject[] = [];

      activeObject.forEachObject((obj) => {
        obj.clone((cloned: FabricObject) => {
          cloned.set({
            left: (cloned.left || 0) + offset,
            top: (cloned.top || 0) + offset,
          });
          (cloned as FabricObject & { id: string }).id = generateShapeId();
          canvas.add(cloned);
          clonedObjects.push(cloned);
        });
      });

      canvas.discardActiveObject();

      // Select the cloned objects
      if (clonedObjects.length > 0) {
        const selection = new ActiveSelection(clonedObjects, { canvas });
        canvas.setActiveObject(selection);
        const ids = clonedObjects.map(
          (obj) => (obj as FabricObject & { id?: string }).id
        ).filter(Boolean) as string[];
        setSelectedIds(ids);
      }
    } else {
      activeObject.clone((cloned: FabricObject) => {
        cloned.set({
          left: (cloned.left || 0) + offset,
          top: (cloned.top || 0) + offset,
        });
        const id = generateShapeId();
        (cloned as FabricObject & { id: string }).id = id;
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        setSelectedIds([id]);
      });
    }

    canvas.renderAll();
  }, [canvas, setSelectedIds]);

  // Nudge selected objects with arrow keys
  const nudgeSelected = useCallback((dx: number, dy: number) => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    activeObject.set({
      left: (activeObject.left || 0) + dx,
      top: (activeObject.top || 0) + dy,
    });
    activeObject.setCoords();
    canvas.renderAll();
  }, [canvas]);

  // Keyboard event handler
  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Also skip if editing text on canvas
      const activeObject = canvas.getActiveObject();
      if (activeObject && (activeObject as FabricObject & { isEditing?: boolean }).isEditing) {
        return;
      }

      const nudgeAmount = e.shiftKey
        ? SHAPE_CONSTRAINTS.nudgeAmountShift
        : SHAPE_CONSTRAINTS.nudgeAmount;

      // Delete/Backspace - delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }

      // Ctrl/Cmd + D - duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      // Ctrl/Cmd + Z - undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y - redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Arrow keys - nudge selected
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          nudgeSelected(0, -nudgeAmount);
          break;
        case 'ArrowDown':
          e.preventDefault();
          nudgeSelected(0, nudgeAmount);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nudgeSelected(-nudgeAmount, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          nudgeSelected(nudgeAmount, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas, deleteSelected, duplicateSelected, nudgeSelected, undo, redo, canUndo, canRedo]);

  return {
    deleteSelected,
    duplicateSelected,
    nudgeSelected,
  };
}
