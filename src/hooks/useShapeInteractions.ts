import { useEffect, useCallback } from 'react';
import { Canvas as FabricCanvas, Object as FabricObject, ActiveSelection } from 'fabric';
import { useCanvas } from '../context/CanvasContext';
import { useInteractionStore } from '../store/interactionStore';
import { snapToGrid } from '../utils/grid';
import { SHAPE_CONSTRAINTS, SELECTION_STYLE } from '../types';

/**
 * Configures shape interaction behaviors on the canvas
 */
export function useShapeInteractions(canvas: FabricCanvas | null) {
  const { gridConfig } = useCanvas();
  const { setSelectedIds } = useInteractionStore();

  // Configure default object controls (no rotation, black styling)
  useEffect(() => {
    if (!canvas) return;

    // Set default control visibility for all objects
    FabricObject.prototype.setControlsVisibility({
      mtr: false, // Disable rotation control
    });

    // Set default styling
    FabricObject.prototype.set({
      borderColor: SELECTION_STYLE.borderColor,
      cornerColor: SELECTION_STYLE.cornerColor,
      cornerStyle: SELECTION_STYLE.cornerStyle,
      transparentCorners: SELECTION_STYLE.transparentCorners,
      cornerSize: 8,
      padding: 0,
    });

    // Set minimum scale constraints
    FabricObject.prototype.minScaleLimit = 0.1;

  }, [canvas]);

  // Handle object scaling - enforce minimum size and aspect ratio with Shift
  useEffect(() => {
    if (!canvas) return;

    let isShiftPressed = false;
    let originalScaleX = 1;
    let originalScaleY = 1;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') isShiftPressed = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') isShiftPressed = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleScalingStart = (e: { target?: FabricObject }) => {
      if (e.target) {
        originalScaleX = e.target.scaleX || 1;
        originalScaleY = e.target.scaleY || 1;
      }
    };

    const handleScaling = (e: { target?: FabricObject; transform?: { corner: string } }) => {
      const obj = e.target;
      if (!obj) return;

      const width = (obj.width || 0) * (obj.scaleX || 1);
      const height = (obj.height || 0) * (obj.scaleY || 1);

      // Enforce minimum size
      if (width < SHAPE_CONSTRAINTS.minWidth) {
        obj.scaleX = SHAPE_CONSTRAINTS.minWidth / (obj.width || 1);
      }
      if (height < SHAPE_CONSTRAINTS.minHeight) {
        obj.scaleY = SHAPE_CONSTRAINTS.minHeight / (obj.height || 1);
      }

      // Lock aspect ratio when Shift is pressed
      if (isShiftPressed && originalScaleX && originalScaleY) {
        const aspectRatio = originalScaleX / originalScaleY;
        const corner = e.transform?.corner;

        // Determine which dimension changed more and adjust the other
        if (corner && (corner.includes('r') || corner.includes('l'))) {
          // Horizontal resize - adjust height
          obj.scaleY = (obj.scaleX || 1) / aspectRatio;
        } else {
          // Vertical resize - adjust width
          obj.scaleX = (obj.scaleY || 1) * aspectRatio;
        }
      }
    };

    canvas.on('object:scaling', handleScaling);
    canvas.on('object:scaling', handleScalingStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.off('object:scaling', handleScaling);
      canvas.off('object:scaling', handleScalingStart);
    };
  }, [canvas]);

  // Handle snap-to-grid during movement
  useEffect(() => {
    if (!canvas) return;

    const handleMoving = (e: { target?: FabricObject }) => {
      if (!gridConfig.snapToGrid || !e.target) return;

      const obj = e.target;
      obj.set({
        left: snapToGrid(obj.left || 0, gridConfig.size),
        top: snapToGrid(obj.top || 0, gridConfig.size),
      });
    };

    const handleScalingSnap = (e: { target?: FabricObject }) => {
      if (!gridConfig.snapToGrid || !e.target) return;

      const obj = e.target;
      const width = (obj.width || 0) * (obj.scaleX || 1);
      const height = (obj.height || 0) * (obj.scaleY || 1);

      // Snap dimensions to grid
      const snappedWidth = snapToGrid(width, gridConfig.size);
      const snappedHeight = snapToGrid(height, gridConfig.size);

      if (obj.width && snappedWidth >= SHAPE_CONSTRAINTS.minWidth) {
        obj.scaleX = snappedWidth / obj.width;
      }
      if (obj.height && snappedHeight >= SHAPE_CONSTRAINTS.minHeight) {
        obj.scaleY = snappedHeight / obj.height;
      }
    };

    canvas.on('object:moving', handleMoving);
    canvas.on('object:scaling', handleScalingSnap);

    return () => {
      canvas.off('object:moving', handleMoving);
      canvas.off('object:scaling', handleScalingSnap);
    };
  }, [canvas, gridConfig]);

  // Update selected IDs when selection changes
  useEffect(() => {
    if (!canvas) return;

    const updateSelection = () => {
      const activeObject = canvas.getActiveObject();
      if (!activeObject) {
        setSelectedIds([]);
        return;
      }

      if (activeObject instanceof ActiveSelection) {
        const ids = activeObject.getObjects().map(
          (obj) => (obj as FabricObject & { id?: string }).id
        ).filter(Boolean) as string[];
        setSelectedIds(ids);
      } else {
        const id = (activeObject as FabricObject & { id?: string }).id;
        setSelectedIds(id ? [id] : []);
      }
    };

    canvas.on('selection:created', updateSelection);
    canvas.on('selection:updated', updateSelection);
    canvas.on('selection:cleared', () => setSelectedIds([]));

    return () => {
      canvas.off('selection:created', updateSelection);
      canvas.off('selection:updated', updateSelection);
      canvas.off('selection:cleared');
    };
  }, [canvas, setSelectedIds]);

  return null;
}
