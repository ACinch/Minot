import { fabric } from 'fabric';

const EXPAND_MARGIN = 100; // Pixels from edge to trigger expansion
const EXPAND_AMOUNT = 200; // How much to expand by

export interface CanvasBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Calculate the bounding box of all objects on the canvas
 */
export function getContentBounds(canvas: fabric.Canvas): CanvasBounds | null {
  const objects = canvas.getObjects().filter(
    (obj) => !(obj as typeof obj & { gridLine?: boolean }).gridLine
  );

  if (objects.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  objects.forEach((obj) => {
    const bound = obj.getBoundingRect();
    minX = Math.min(minX, bound.left);
    minY = Math.min(minY, bound.top);
    maxX = Math.max(maxX, bound.left + bound.width);
    maxY = Math.max(maxY, bound.top + bound.height);
  });

  return { minX, minY, maxX, maxY };
}

/**
 * Check if canvas needs to expand based on object positions
 * Returns new dimensions if expansion needed, null otherwise
 */
export function checkCanvasExpansion(
  canvas: fabric.Canvas,
  margin: number = EXPAND_MARGIN,
  expandAmount: number = EXPAND_AMOUNT
): { width: number; height: number } | null {
  const bounds = getContentBounds(canvas);
  if (!bounds) return null;

  const currentWidth = canvas.getWidth();
  const currentHeight = canvas.getHeight();

  let newWidth = currentWidth;
  let newHeight = currentHeight;
  let needsExpansion = false;

  // Check right edge
  if (bounds.maxX > currentWidth - margin) {
    newWidth = bounds.maxX + expandAmount;
    needsExpansion = true;
  }

  // Check bottom edge
  if (bounds.maxY > currentHeight - margin) {
    newHeight = bounds.maxY + expandAmount;
    needsExpansion = true;
  }

  return needsExpansion ? { width: newWidth, height: newHeight } : null;
}

/**
 * Expand the canvas if objects are near the edges
 */
export function expandCanvasIfNeeded(
  canvas: fabric.Canvas,
  margin?: number,
  expandAmount?: number
): boolean {
  const newDimensions = checkCanvasExpansion(canvas, margin, expandAmount);

  if (newDimensions) {
    canvas.setWidth(newDimensions.width);
    canvas.setHeight(newDimensions.height);
    canvas.renderAll();
    return true;
  }

  return false;
}

/**
 * Fit the canvas size to its content with optional padding
 */
export function fitCanvasToContent(
  canvas: fabric.Canvas,
  padding: number = 50,
  minWidth: number = 400,
  minHeight: number = 300
): void {
  const bounds = getContentBounds(canvas);

  if (!bounds) {
    canvas.setWidth(minWidth);
    canvas.setHeight(minHeight);
    canvas.renderAll();
    return;
  }

  const newWidth = Math.max(bounds.maxX + padding, minWidth);
  const newHeight = Math.max(bounds.maxY + padding, minHeight);

  canvas.setWidth(newWidth);
  canvas.setHeight(newHeight);
  canvas.renderAll();
}
