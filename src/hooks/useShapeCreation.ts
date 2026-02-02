import { useCallback } from 'react';
import { useCanvas } from '../context/CanvasContext';
import { useInteractionStore } from '../store/interactionStore';
import {
  createRectangle,
  createCircle,
  createTriangle,
  createLine,
  createArrowShape,
  createText,
  type CreateShapeOptions,
} from '../shapes/factories';
import type { ShapeType } from '../types';

export function useShapeCreation() {
  const { canvas } = useCanvas();
  const { currentStyles, setActiveTool } = useInteractionStore();

  const addShape = useCallback(
    (type: ShapeType, options: CreateShapeOptions = {}) => {
      if (!canvas) return null;

      const shapeOptions: CreateShapeOptions = {
        ...options,
        styles: { ...currentStyles, ...options.styles },
      };

      let shape = null;

      switch (type) {
        case 'rectangle':
          shape = createRectangle(canvas, shapeOptions);
          break;
        case 'circle':
          shape = createCircle(canvas, shapeOptions);
          break;
        case 'triangle':
          shape = createTriangle(canvas, shapeOptions);
          break;
        case 'text':
          shape = createText(canvas, shapeOptions);
          break;
        case 'line':
          // Default line coordinates if not provided
          shape = createLine(
            canvas,
            options.left ?? 100,
            options.top ?? 100,
            (options.left ?? 100) + (options.width ?? 100),
            (options.top ?? 100) + (options.height ?? 0),
            shapeOptions
          );
          break;
        case 'arrow':
          // Default arrow coordinates if not provided
          shape = createArrowShape(
            canvas,
            options.left ?? 100,
            options.top ?? 100,
            (options.left ?? 100) + (options.width ?? 100),
            (options.top ?? 100) + (options.height ?? 0),
            shapeOptions
          );
          break;
        default:
          console.warn(`Unknown shape type: ${type}`);
      }

      // Switch back to select mode after creating shape
      setActiveTool('select');

      return shape;
    },
    [canvas, currentStyles, setActiveTool]
  );

  const addShapeAtCenter = useCallback(
    (type: ShapeType, options: CreateShapeOptions = {}) => {
      if (!canvas) return null;

      const centerX = canvas.getWidth() / 2;
      const centerY = canvas.getHeight() / 2;

      return addShape(type, {
        ...options,
        left: centerX - (options.width ?? 50),
        top: centerY - (options.height ?? 50),
      });
    },
    [canvas, addShape]
  );

  return {
    addShape,
    addShapeAtCenter,
  };
}
