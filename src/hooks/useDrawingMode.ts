import { useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { useInteractionStore } from '../store/interactionStore';
import { createArrow } from '../shapes/arrow';
import { generateShapeId } from '../shapes/serialization';
import { SELECTION_STYLE } from '../types';
import type { ShapeType } from '../types';

const GHOST_OPACITY = 0.25;

/**
 * Hook to handle click-drag drawing of lines and arrows
 */
export function useDrawingMode(canvas: fabric.Canvas | null) {
  const { activeTool, currentStyles, setIsDrawing, isDrawing, setSelectedIds } = useInteractionStore();

  const isDrawingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const previewShapeRef = useRef<fabric.Object | null>(null);

  const isLineMode = activeTool === 'line' || activeTool === 'arrow';

  // Create preview shape
  const createPreview = useCallback((x1: number, y1: number, x2: number, y2: number): fabric.Object => {
    if (activeTool === 'arrow') {
      const arrow = createArrow(x1, y1, x2, y2, {
        borderColor: currentStyles.borderColor,
        borderWidth: currentStyles.borderWidth,
      });
      arrow.set({
        opacity: GHOST_OPACITY,
        selectable: false,
        evented: false,
      });
      return arrow;
    } else {
      return new fabric.Line([x1, y1, x2, y2], {
        stroke: currentStyles.borderColor,
        strokeWidth: currentStyles.borderWidth,
        opacity: GHOST_OPACITY,
        selectable: false,
        evented: false,
      });
    }
  }, [activeTool, currentStyles]);

  // Create final shape
  const createFinalShape = useCallback((x1: number, y1: number, x2: number, y2: number): fabric.Object => {
    let shape: fabric.Object;

    if (activeTool === 'arrow') {
      shape = createArrow(x1, y1, x2, y2, {
        borderColor: currentStyles.borderColor,
        borderWidth: currentStyles.borderWidth,
      });
    } else {
      shape = new fabric.Line([x1, y1, x2, y2], {
        stroke: currentStyles.borderColor,
        strokeWidth: currentStyles.borderWidth,
      });
    }

    // Set ID and type
    const id = generateShapeId();
    (shape as fabric.Object & { id: string }).id = id;
    (shape as fabric.Object & { shapeType: ShapeType }).shapeType = activeTool as ShapeType;

    // Apply selection styling
    shape.set({
      borderColor: SELECTION_STYLE.borderColor,
      cornerColor: SELECTION_STYLE.cornerColor,
      cornerStyle: SELECTION_STYLE.cornerStyle,
      transparentCorners: SELECTION_STYLE.transparentCorners,
    });

    return shape;
  }, [activeTool, currentStyles]);

  // Clean up preview shape
  const removePreview = useCallback(() => {
    if (previewShapeRef.current && canvas) {
      canvas.remove(previewShapeRef.current);
      previewShapeRef.current = null;
    }
  }, [canvas]);

  // Handle mouse down - start drawing
  useEffect(() => {
    if (!canvas || !isLineMode) return;

    const handleMouseDown = (e: fabric.IEvent<MouseEvent>) => {
      // Don't start drawing if clicking on an existing object
      if (e.target && !(e.target as fabric.Object & { gridLine?: boolean }).gridLine) {
        return;
      }

      if (!e.pointer) return;

      isDrawingRef.current = true;
      setIsDrawing(true);
      startPointRef.current = { x: e.pointer.x, y: e.pointer.y };

      // Create initial preview (zero length)
      const preview = createPreview(
        e.pointer.x,
        e.pointer.y,
        e.pointer.x,
        e.pointer.y
      );
      previewShapeRef.current = preview;
      canvas.add(preview);
      canvas.renderAll();
    };

    canvas.on('mouse:down', handleMouseDown as (e: fabric.IEvent<Event>) => void);

    return () => {
      canvas.off('mouse:down', handleMouseDown as (e: fabric.IEvent<Event>) => void);
    };
  }, [canvas, isLineMode, createPreview, setIsDrawing]);

  // Handle mouse move - update preview
  useEffect(() => {
    if (!canvas || !isLineMode) return;

    const handleMouseMove = (e: { pointer?: { x: number; y: number } }) => {
      if (!isDrawingRef.current || !startPointRef.current || !e.pointer) return;

      // Remove old preview
      removePreview();

      // Create new preview with updated end point
      const preview = createPreview(
        startPointRef.current.x,
        startPointRef.current.y,
        e.pointer.x,
        e.pointer.y
      );
      previewShapeRef.current = preview;
      canvas.add(preview);
      canvas.renderAll();
    };

    canvas.on('mouse:move', handleMouseMove);

    return () => {
      canvas.off('mouse:move', handleMouseMove);
    };
  }, [canvas, isLineMode, createPreview, removePreview]);

  // Handle mouse up - complete shape
  useEffect(() => {
    if (!canvas || !isLineMode) return;

    const handleMouseUp = (e: { pointer?: { x: number; y: number } }) => {
      if (!isDrawingRef.current || !startPointRef.current || !e.pointer) return;

      // Remove preview
      removePreview();

      // Only create shape if there's some distance
      const dx = e.pointer.x - startPointRef.current.x;
      const dy = e.pointer.y - startPointRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        // Create final shape
        const shape = createFinalShape(
          startPointRef.current.x,
          startPointRef.current.y,
          e.pointer.x,
          e.pointer.y
        );

        canvas.add(shape);
        canvas.renderAll();

        // Update selection to new shape
        const id = (shape as fabric.Object & { id: string }).id;
        setSelectedIds([id]);
      }

      // Reset state (stay in draw mode for multiple shapes)
      isDrawingRef.current = false;
      setIsDrawing(false);
      startPointRef.current = null;
    };

    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [canvas, isLineMode, createFinalShape, removePreview, setIsDrawing, setSelectedIds]);

  // Cancel drawing on Escape
  useEffect(() => {
    if (!isLineMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawingRef.current) {
        removePreview();
        isDrawingRef.current = false;
        setIsDrawing(false);
        startPointRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLineMode, removePreview, setIsDrawing]);

  // Clean up when leaving draw mode
  useEffect(() => {
    if (!isLineMode) {
      removePreview();
      isDrawingRef.current = false;
      startPointRef.current = null;
    }
  }, [isLineMode, removePreview]);

  return {
    isDrawing: isDrawingRef.current,
    isLineMode,
  };
}
