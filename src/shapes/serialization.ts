import {
  Object as FabricObject,
  Rect,
  Circle,
  Triangle,
  Line,
  IText,
  Image as FabricImage,
  Canvas as FabricCanvas,
} from 'fabric';
import type { ShapeData, ShapeType, CatalogItem, ShapeStyles } from '../types';
import { DEFAULT_STYLES } from '../types';
import { createArrow } from './arrow';

// Generate unique ID for shapes
export function generateShapeId(): string {
  return `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Extract styles from a Fabric object
function extractStyles(obj: FabricObject): ShapeStyles {
  return {
    borderColor: (obj.stroke as string) || DEFAULT_STYLES.borderColor,
    borderWidth: obj.strokeWidth || DEFAULT_STYLES.borderWidth,
    backgroundColor: (obj.fill as string) || DEFAULT_STYLES.backgroundColor,
    fontFamily: (obj as IText).fontFamily || DEFAULT_STYLES.fontFamily,
    fontSize: (obj as IText).fontSize || DEFAULT_STYLES.fontSize,
    fontColor: ((obj as IText).fill as string) || DEFAULT_STYLES.fontColor,
  };
}

// Determine shape type from Fabric object
function getShapeType(obj: FabricObject): ShapeType {
  // Check for custom type first (for arrows, etc.)
  if ((obj as FabricObject & { shapeType?: ShapeType }).shapeType) {
    return (obj as FabricObject & { shapeType?: ShapeType }).shapeType!;
  }

  if (obj instanceof Rect) return 'rectangle';
  if (obj instanceof Circle) return 'circle';
  if (obj instanceof Triangle) return 'triangle';
  if (obj instanceof Line) return 'line';
  if (obj instanceof IText) return 'text';
  if (obj instanceof FabricImage) return 'image';

  return 'rectangle'; // Default fallback
}

// Convert Fabric object to serializable data
export function shapeToData(obj: FabricObject): ShapeData {
  const type = getShapeType(obj);
  const id = (obj as FabricObject & { id?: string }).id || generateShapeId();

  const baseData: ShapeData = {
    id,
    type,
    left: obj.left || 0,
    top: obj.top || 0,
    angle: obj.angle || 0,
    scaleX: obj.scaleX || 1,
    scaleY: obj.scaleY || 1,
    styles: extractStyles(obj),
  };

  // Add type-specific properties
  switch (type) {
    case 'rectangle':
      baseData.width = (obj as Rect).width;
      baseData.height = (obj as Rect).height;
      break;
    case 'circle':
      baseData.radius = (obj as Circle).radius;
      break;
    case 'triangle':
      baseData.width = (obj as Triangle).width;
      baseData.height = (obj as Triangle).height;
      break;
    case 'line':
    case 'arrow':
      const line = obj as Line;
      baseData.points = [
        { x: line.x1 || 0, y: line.y1 || 0 },
        { x: line.x2 || 0, y: line.y2 || 0 },
      ];
      break;
    case 'text':
      baseData.text = (obj as IText).text;
      baseData.width = (obj as IText).width;
      break;
    case 'image':
      baseData.src = (obj as FabricImage).getSrc();
      baseData.width = (obj as FabricImage).width;
      baseData.height = (obj as FabricImage).height;
      break;
  }

  return baseData;
}

// Convert serialized data back to Fabric object
export function dataToShape(
  data: ShapeData,
  catalogItem?: CatalogItem
): FabricObject | null {
  // Use custom factory if provided
  if (catalogItem?.factory) {
    const obj = catalogItem.factory({} as FabricCanvas, data);
    (obj as FabricObject & { id: string }).id = data.id;
    return obj;
  }

  const commonOptions = {
    left: data.left,
    top: data.top,
    angle: data.angle,
    scaleX: data.scaleX,
    scaleY: data.scaleY,
    stroke: data.styles.borderColor,
    strokeWidth: data.styles.borderWidth,
    fill: data.styles.backgroundColor,
  };

  let fabricObject: FabricObject | null = null;

  switch (data.type) {
    case 'rectangle':
      fabricObject = new Rect({
        ...commonOptions,
        width: data.width || 100,
        height: data.height || 100,
      });
      break;

    case 'circle':
      fabricObject = new Circle({
        ...commonOptions,
        radius: data.radius || 50,
      });
      break;

    case 'triangle':
      fabricObject = new Triangle({
        ...commonOptions,
        width: data.width || 100,
        height: data.height || 100,
      });
      break;

    case 'line':
      if (data.points && data.points.length >= 2) {
        fabricObject = new Line(
          [data.points[0].x, data.points[0].y, data.points[1].x, data.points[1].y],
          {
            ...commonOptions,
            fill: undefined, // Lines don't have fill
          }
        );
      }
      break;

    case 'arrow':
      if (data.points && data.points.length >= 2) {
        fabricObject = createArrow(
          data.points[0].x,
          data.points[0].y,
          data.points[1].x,
          data.points[1].y,
          data.styles
        );
      }
      break;

    case 'text':
      fabricObject = new IText(data.text || 'Text', {
        ...commonOptions,
        fill: data.styles.fontColor,
        fontFamily: data.styles.fontFamily,
        fontSize: data.styles.fontSize,
      });
      break;

    case 'image':
      // Images need async loading - return placeholder
      // The actual loading should be handled by the consumer
      if (data.src) {
        // For now, we'll skip image loading in this synchronous function
        // A proper implementation would use FabricImage.fromURL
        console.warn('Image loading requires async handling');
      }
      break;
  }

  if (fabricObject) {
    (fabricObject as FabricObject & { id: string }).id = data.id;
    (fabricObject as FabricObject & { shapeType: ShapeType }).shapeType = data.type;
  }

  return fabricObject;
}
