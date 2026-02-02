import { fabric } from 'fabric';

/**
 * Bring selected object(s) forward one level
 */
export function bringForward(canvas: fabric.Canvas): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  if (activeObject instanceof fabric.ActiveSelection) {
    // Sort by current index to maintain relative order
    const objects = activeObject.getObjects().sort((a, b) => {
      return canvas.getObjects().indexOf(b) - canvas.getObjects().indexOf(a);
    });
    objects.forEach((obj) => canvas.bringForward(obj));
  } else {
    canvas.bringForward(activeObject);
  }

  canvas.renderAll();
}

/**
 * Send selected object(s) backward one level
 */
export function sendBackward(canvas: fabric.Canvas): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  if (activeObject instanceof fabric.ActiveSelection) {
    // Sort by current index to maintain relative order
    const objects = activeObject.getObjects().sort((a, b) => {
      return canvas.getObjects().indexOf(a) - canvas.getObjects().indexOf(b);
    });
    objects.forEach((obj) => canvas.sendBackwards(obj));
  } else {
    canvas.sendBackwards(activeObject);
  }

  canvas.renderAll();
}

/**
 * Bring selected object(s) to front
 */
export function bringToFront(canvas: fabric.Canvas): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  if (activeObject instanceof fabric.ActiveSelection) {
    const objects = activeObject.getObjects().sort((a, b) => {
      return canvas.getObjects().indexOf(a) - canvas.getObjects().indexOf(b);
    });
    objects.forEach((obj) => canvas.bringToFront(obj));
  } else {
    canvas.bringToFront(activeObject);
  }

  canvas.renderAll();
}

/**
 * Send selected object(s) to back (but above grid lines)
 */
export function sendToBack(canvas: fabric.Canvas): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  // Find the first non-grid object index
  const objects = canvas.getObjects();
  let firstNonGridIndex = 0;
  for (let i = 0; i < objects.length; i++) {
    if (!(objects[i] as fabric.Object & { gridLine?: boolean }).gridLine) {
      firstNonGridIndex = i;
      break;
    }
  }

  if (activeObject instanceof fabric.ActiveSelection) {
    const selectionObjects = activeObject.getObjects().sort((a, b) => {
      return canvas.getObjects().indexOf(b) - canvas.getObjects().indexOf(a);
    });
    selectionObjects.forEach((obj) => {
      canvas.sendToBack(obj);
      // Move above grid lines
      canvas.moveTo(obj, firstNonGridIndex);
    });
  } else {
    canvas.sendToBack(activeObject);
    canvas.moveTo(activeObject, firstNonGridIndex);
  }

  canvas.renderAll();
}
