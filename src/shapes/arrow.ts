import { fabric } from 'fabric';
import type { ShapeStyles } from '../types';
import { DEFAULT_STYLES } from '../types';

// Arrow head size relative to line thickness
const ARROW_HEAD_SCALE = 4;

export function createArrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  styles: Partial<ShapeStyles> = {}
): fabric.Group {
  const mergedStyles = { ...DEFAULT_STYLES, ...styles };
  const headSize = mergedStyles.borderWidth * ARROW_HEAD_SCALE;

  // Calculate angle for arrow head
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const angleDeg = (angle * 180) / Math.PI;

  // Create the line
  const line = new fabric.Line([x1, y1, x2, y2], {
    stroke: mergedStyles.borderColor,
    strokeWidth: mergedStyles.borderWidth,
    selectable: false,
  });

  // Create arrow head (triangle)
  const arrowHead = new fabric.Triangle({
    width: headSize,
    height: headSize * 1.5,
    fill: mergedStyles.borderColor,
    left: x2,
    top: y2,
    angle: angleDeg + 90,
    originX: 'center',
    originY: 'center',
    selectable: false,
  });

  // Group line and arrow head
  const group = new fabric.Group([line, arrowHead], {
    selectable: true,
    hasControls: true,
  });

  // Mark as arrow type for serialization
  (group as fabric.Group & { shapeType: string }).shapeType = 'arrow';

  return group;
}
