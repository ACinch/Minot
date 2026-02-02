import { Rect, Circle, Triangle, Line, IText, Canvas as FabricCanvas } from 'fabric';
import type { ShapeStyles, ShapeType } from '../types';
import { DEFAULT_STYLES } from '../types';
import { createArrow } from './arrow';
import { generateShapeId } from './serialization';

export interface CreateShapeOptions {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  styles?: Partial<ShapeStyles>;
}

// Factory functions for creating shapes with consistent defaults
export function createRectangle(
  canvas: FabricCanvas,
  options: CreateShapeOptions = {}
) {
  const styles = { ...DEFAULT_STYLES, ...options.styles };

  const rect = new Rect({
    left: options.left ?? 100,
    top: options.top ?? 100,
    width: options.width ?? 100,
    height: options.height ?? 80,
    fill: styles.backgroundColor,
    stroke: styles.borderColor,
    strokeWidth: styles.borderWidth,
  });

  (rect as Rect & { id: string }).id = generateShapeId();
  (rect as Rect & { shapeType: ShapeType }).shapeType = 'rectangle';

  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.renderAll();

  return rect;
}

export function createCircle(
  canvas: FabricCanvas,
  options: CreateShapeOptions = {}
) {
  const styles = { ...DEFAULT_STYLES, ...options.styles };

  const circle = new Circle({
    left: options.left ?? 100,
    top: options.top ?? 100,
    radius: options.radius ?? 50,
    fill: styles.backgroundColor,
    stroke: styles.borderColor,
    strokeWidth: styles.borderWidth,
  });

  (circle as Circle & { id: string }).id = generateShapeId();
  (circle as Circle & { shapeType: ShapeType }).shapeType = 'circle';

  canvas.add(circle);
  canvas.setActiveObject(circle);
  canvas.renderAll();

  return circle;
}

export function createTriangle(
  canvas: FabricCanvas,
  options: CreateShapeOptions = {}
) {
  const styles = { ...DEFAULT_STYLES, ...options.styles };

  const triangle = new Triangle({
    left: options.left ?? 100,
    top: options.top ?? 100,
    width: options.width ?? 100,
    height: options.height ?? 100,
    fill: styles.backgroundColor,
    stroke: styles.borderColor,
    strokeWidth: styles.borderWidth,
  });

  (triangle as Triangle & { id: string }).id = generateShapeId();
  (triangle as Triangle & { shapeType: ShapeType }).shapeType = 'triangle';

  canvas.add(triangle);
  canvas.setActiveObject(triangle);
  canvas.renderAll();

  return triangle;
}

export function createLine(
  canvas: FabricCanvas,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: CreateShapeOptions = {}
) {
  const styles = { ...DEFAULT_STYLES, ...options.styles };

  const line = new Line([x1, y1, x2, y2], {
    stroke: styles.borderColor,
    strokeWidth: styles.borderWidth,
  });

  (line as Line & { id: string }).id = generateShapeId();
  (line as Line & { shapeType: ShapeType }).shapeType = 'line';

  canvas.add(line);
  canvas.setActiveObject(line);
  canvas.renderAll();

  return line;
}

export function createArrowShape(
  canvas: FabricCanvas,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: CreateShapeOptions = {}
) {
  const styles = { ...DEFAULT_STYLES, ...options.styles };

  const arrow = createArrow(x1, y1, x2, y2, styles);
  (arrow as typeof arrow & { id: string }).id = generateShapeId();

  canvas.add(arrow);
  canvas.setActiveObject(arrow);
  canvas.renderAll();

  return arrow;
}

export function createText(
  canvas: FabricCanvas,
  options: CreateShapeOptions = {}
) {
  const styles = { ...DEFAULT_STYLES, ...options.styles };

  const text = new IText(options.text ?? 'Text', {
    left: options.left ?? 100,
    top: options.top ?? 100,
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    fill: styles.fontColor,
  });

  (text as IText & { id: string }).id = generateShapeId();
  (text as IText & { shapeType: ShapeType }).shapeType = 'text';

  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();

  return text;
}

// Shape factory map for dynamic creation
export const shapeFactories = {
  rectangle: createRectangle,
  circle: createCircle,
  triangle: createTriangle,
  text: createText,
} as const;

// Line-based shapes need start/end coordinates
export const lineShapeFactories = {
  line: createLine,
  arrow: createArrowShape,
} as const;
