import { Canvas as FabricCanvas, Object as FabricObject, ActiveSelection } from 'fabric';

/**
 * Bring selected object(s) forward one level
 */
export function bringForward(canvas: FabricCanvas): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  if (activeObject instanceof ActiveSelection) {
    // Sort by current index to maintain relative order
    const objects = activeObject.getObjects().sort((a, b) => {
      return canvas.getObjects().indexOf(b) - canvas.getObjects().indexOf(a);
    });
    objects.forEach((obj) => canvas.bringObjectForward(obj));
  } else {
    canvas.bringObjectForward(activeObject);
  }

  canvas.renderAll();
}

/**
 * Send selected object(s) backward one level
 */
export function sendBackward(canvas: FabricCanvas): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  if (activeObject instanceof ActiveSelection) {
    // Sort by current index to maintain relative order
    const objects = activeObject.getObjects().sort((a, b) => {
      return canvas.getObjects().indexOf(a) - canvas.getObjects().indexOf(b);
    });
    objects.forEach((obj) => canvas.sendObjectBackwards(obj));
  } else {
    canvas.sendObjectBackwards(activeObject);
  }

  canvas.renderAll();
}

/**
 * Bring selected object(s) to front
 */
export function bringToFront(canvas: FabricCanvas): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  if (activeObject instanceof ActiveSelection) {
    const objects = activeObject.getObjects().sort((a, b) => {
      return canvas.getObjects().indexOf(a) - canvas.getObjects().indexOf(b);
    });
    objects.forEach((obj) => canvas.bringObjectToFront(obj));
  } else {
    canvas.bringObjectToFront(activeObject);
  }

  canvas.renderAll();
}

/**
 * Send selected object(s) to back (but above grid lines)
 */
export function sendToBack(canvas: FabricCanvas): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  // Find the first non-grid object index
  const objects = canvas.getObjects();
  let firstNonGridIndex = 0;
  for (let i = 0; i < objects.length; i++) {
    if (!(objects[i] as FabricObject & { gridLine?: boolean }).gridLine) {
      firstNonGridIndex = i;
      break;
    }
  }

  if (activeObject instanceof ActiveSelection) {
    const selectionObjects = activeObject.getObjects().sort((a, b) => {
      return canvas.getObjects().indexOf(b) - canvas.getObjects().indexOf(a);
    });
    selectionObjects.forEach((obj) => {
      canvas.sendObjectToBack(obj);
      // Move above grid lines
      canvas.moveTo(obj, firstNonGridIndex);
    });
  } else {
    canvas.sendObjectToBack(activeObject);
    canvas.moveTo(activeObject, firstNonGridIndex);
  }

  canvas.renderAll();
}
