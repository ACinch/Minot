import { useEffect, useCallback, useRef } from 'react';
import { fabric } from 'fabric';
import { useCanvas } from '../context/CanvasContext';
import { useInteractionStore } from '../store/interactionStore';
import type { ShapeType } from '../types';
import { generateShapeId } from '../shapes/serialization';

const GHOST_OPACITY = 0.25;

/**
 * Creates a ghost (preview) shape for placement mode
 */
function createGhostShape(type: ShapeType, styles: { borderColor: string; backgroundColor: string; borderWidth: number }): fabric.Object | null {
  const commonOptions = {
    originX: 'center' as const,
    originY: 'center' as const,
    opacity: GHOST_OPACITY,
    selectable: false,
    evented: false,
    stroke: styles.borderColor,
    strokeWidth: styles.borderWidth,
    fill: styles.backgroundColor,
  };

  switch (type) {
    case 'rectangle':
      return new fabric.Rect({ ...commonOptions, width: 100, height: 80 });
    case 'circle':
      return new fabric.Circle({ ...commonOptions, radius: 50 });
    case 'triangle':
      return new fabric.Triangle({ ...commonOptions, width: 100, height: 100 });
    case 'line':
      return new fabric.Line([0, 0, 100, 0], { ...commonOptions, fill: undefined });
    case 'arrow':
      // Simplified arrow preview - just a line
      return new fabric.Line([0, 0, 100, 0], { ...commonOptions, fill: undefined });
    case 'text':
      return new fabric.IText('Text', {
        ...commonOptions,
        fontSize: 16,
        fontFamily: 'Arial',
      });
    default:
      return null;
  }
}

export function usePlacementMode(canvas: fabric.Canvas | null) {
  const { placementShape, setPlacementShape, currentStyles, setActiveTool, setSelectedIds } = useInteractionStore();
  const ghostRef = useRef<fabric.Object | null>(null);

  // Create/remove ghost shape when placement mode changes
  useEffect(() => {
    if (!canvas) return;

    // Remove existing ghost
    if (ghostRef.current) {
      canvas.remove(ghostRef.current);
      ghostRef.current = null;
    }

    // Create new ghost if in placement mode
    if (placementShape) {
      const ghost = createGhostShape(placementShape, currentStyles);
      if (ghost) {
        ghostRef.current = ghost;
        // Position off-screen initially
        ghost.set({ left: -1000, top: -1000 });
        canvas.add(ghost);
        canvas.renderAll();
      }
    }

    return () => {
      if (ghostRef.current && canvas) {
        canvas.remove(ghostRef.current);
        ghostRef.current = null;
      }
    };
  }, [canvas, placementShape, currentStyles]);

  // Handle mouse move - update ghost position
  useEffect(() => {
    if (!canvas || !placementShape) return;

    const handleMouseMove = (e: { pointer?: { x: number; y: number } }) => {
      if (ghostRef.current && e.pointer) {
        ghostRef.current.set({
          left: e.pointer.x,
          top: e.pointer.y,
        });
        canvas.renderAll();
      }
    };

    canvas.on('mouse:move', handleMouseMove);

    return () => {
      canvas.off('mouse:move', handleMouseMove);
    };
  }, [canvas, placementShape]);

  // Handle click - place the shape
  useEffect(() => {
    if (!canvas || !placementShape) return;

    const handleMouseDown = (e: { pointer?: { x: number; y: number } }) => {
      if (!e.pointer || !ghostRef.current) return;

      // Create the actual shape at click position
      const ghost = ghostRef.current;

      // Clone the ghost but make it a real shape
      ghost.clone((cloned: fabric.Object) => {
        cloned.set({
          opacity: 1,
          selectable: true,
          evented: true,
          left: e.pointer!.x,
          top: e.pointer!.y,
        });

        // Add ID and type
        (cloned as fabric.Object & { id: string }).id = generateShapeId();
        (cloned as fabric.Object & { shapeType: ShapeType }).shapeType = placementShape;

        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();

        // Update selection in store
        const id = (cloned as fabric.Object & { id: string }).id;
        setSelectedIds([id]);
      });

      // Exit placement mode
      setPlacementShape(null);
      setActiveTool('select');
    };

    canvas.on('mouse:down', handleMouseDown);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
    };
  }, [canvas, placementShape, setPlacementShape, setActiveTool, setSelectedIds]);

  // Cancel placement on Escape key
  useEffect(() => {
    if (!placementShape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPlacementShape(null);
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placementShape, setPlacementShape, setActiveTool]);

  return {
    isPlacementMode: !!placementShape,
    placementShape,
    cancelPlacement: useCallback(() => {
      setPlacementShape(null);
      setActiveTool('select');
    }, [setPlacementShape, setActiveTool]),
  };
}
