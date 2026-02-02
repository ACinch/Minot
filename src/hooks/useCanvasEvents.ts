import { useEffect, useCallback } from 'react';
import type { Canvas as FabricCanvas, Object as FabricObject } from 'fabric';
import { useInteractionStore } from '../store/interactionStore';
import { useCanvas } from '../context/CanvasContext';
import { shapeToData } from '../shapes/serialization';

export function useCanvasEvents() {
  const { canvas } = useCanvas();
  const {
    setSelectedIds,
    clearSelection,
    pushHistory,
  } = useInteractionStore();

  // Handle selection changes
  const handleSelectionCreated = useCallback(
    (e: { selected?: FabricObject[] }) => {
      if (e.selected) {
        const ids = e.selected.map(
          (obj) => (obj as FabricObject & { id?: string }).id || ''
        ).filter(Boolean);
        setSelectedIds(ids);
      }
    },
    [setSelectedIds]
  );

  const handleSelectionUpdated = useCallback(
    (e: { selected?: FabricObject[] }) => {
      if (e.selected) {
        const ids = e.selected.map(
          (obj) => (obj as FabricObject & { id?: string }).id || ''
        ).filter(Boolean);
        setSelectedIds(ids);
      }
    },
    [setSelectedIds]
  );

  const handleSelectionCleared = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Handle object modifications for history
  const handleObjectModified = useCallback(
    (e: { target?: FabricObject }) => {
      if (!canvas || !e.target) return;

      // Create history entry
      const canvasJson = JSON.stringify(canvas.toJSON());
      pushHistory({
        type: 'modify',
        timestamp: Date.now(),
        before: '', // Would need to capture before state
        after: canvasJson,
      });
    },
    [canvas, pushHistory]
  );

  // Handle object added
  const handleObjectAdded = useCallback(
    (e: { target?: FabricObject }) => {
      if (!canvas || !e.target) return;

      const canvasJson = JSON.stringify(canvas.toJSON());
      pushHistory({
        type: 'add',
        timestamp: Date.now(),
        before: '',
        after: canvasJson,
      });
    },
    [canvas, pushHistory]
  );

  // Handle object removed
  const handleObjectRemoved = useCallback(
    (e: { target?: FabricObject }) => {
      if (!canvas || !e.target) return;

      const canvasJson = JSON.stringify(canvas.toJSON());
      pushHistory({
        type: 'remove',
        timestamp: Date.now(),
        before: '',
        after: canvasJson,
      });
    },
    [canvas, pushHistory]
  );

  // Set up event listeners
  useEffect(() => {
    if (!canvas) return;

    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', handleObjectRemoved);

    return () => {
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionUpdated);
      canvas.off('selection:cleared', handleSelectionCleared);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:removed', handleObjectRemoved);
    };
  }, [
    canvas,
    handleSelectionCreated,
    handleSelectionUpdated,
    handleSelectionCleared,
    handleObjectModified,
    handleObjectAdded,
    handleObjectRemoved,
  ]);

  return {
    canvas,
  };
}
