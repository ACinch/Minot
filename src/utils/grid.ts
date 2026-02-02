import { Canvas as FabricCanvas, Line } from 'fabric';
import type { GridConfig } from '../types';

const GRID_LINE_GROUP_ID = '__grid_lines__';

/**
 * Renders a grid overlay on the canvas
 * Grid lines are non-selectable and always behind other objects
 */
export function renderGrid(
  canvas: FabricCanvas,
  config: GridConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Remove existing grid lines
  clearGrid(canvas);

  if (!config.enabled) {
    canvas.renderAll();
    return;
  }

  const { size, color } = config;
  const lines: Line[] = [];

  // Vertical lines
  for (let x = 0; x <= canvasWidth; x += size) {
    const line = new Line([x, 0, x, canvasHeight], {
      stroke: color,
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
    (line as Line & { gridLine: boolean }).gridLine = true;
    lines.push(line);
  }

  // Horizontal lines
  for (let y = 0; y <= canvasHeight; y += size) {
    const line = new Line([0, y, canvasWidth, y], {
      stroke: color,
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
    (line as Line & { gridLine: boolean }).gridLine = true;
    lines.push(line);
  }

  // Add all lines and send to back
  lines.forEach((line) => {
    canvas.add(line);
    canvas.sendObjectToBack(line);
  });

  canvas.renderAll();
}

/**
 * Removes all grid lines from the canvas
 */
export function clearGrid(canvas: FabricCanvas): void {
  const gridLines = canvas.getObjects().filter(
    (obj) => (obj as typeof obj & { gridLine?: boolean }).gridLine === true
  );
  gridLines.forEach((line) => canvas.remove(line));
}

/**
 * Snaps a coordinate to the nearest grid point
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snaps an object's position to the grid
 */
export function snapObjectToGrid(
  obj: { left?: number; top?: number },
  gridSize: number
): { left: number; top: number } {
  return {
    left: snapToGrid(obj.left || 0, gridSize),
    top: snapToGrid(obj.top || 0, gridSize),
  };
}
