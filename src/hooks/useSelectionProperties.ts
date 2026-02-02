import { useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { useCanvas } from '../context/CanvasContext';
import { useInteractionStore } from '../store/interactionStore';
import type { ShapeStyles } from '../types';
import { DEFAULT_STYLES } from '../types';

export interface SelectionProperties {
  borderColor: string | 'mixed';
  borderWidth: number | 'mixed';
  backgroundColor: string | 'mixed';
  fontFamily: string | 'mixed';
  fontSize: number | 'mixed';
  fontColor: string | 'mixed';
  hasSelection: boolean;
  hasTextSelection: boolean;
}

const DEFAULT_SELECTION_PROPERTIES: SelectionProperties = {
  borderColor: DEFAULT_STYLES.borderColor,
  borderWidth: DEFAULT_STYLES.borderWidth,
  backgroundColor: DEFAULT_STYLES.backgroundColor,
  fontFamily: DEFAULT_STYLES.fontFamily || 'Arial',
  fontSize: DEFAULT_STYLES.fontSize || 16,
  fontColor: DEFAULT_STYLES.fontColor || '#000000',
  hasSelection: false,
  hasTextSelection: false,
};

/**
 * Gets a property value from multiple objects, returning 'mixed' if values differ
 */
function getPropertyValue<T>(objects: fabric.Object[], getter: (obj: fabric.Object) => T): T | 'mixed' {
  if (objects.length === 0) return 'mixed';

  const firstValue = getter(objects[0]);
  const allSame = objects.every((obj) => getter(obj) === firstValue);

  return allSame ? firstValue : 'mixed';
}

/**
 * Hook to read and update properties of selected shapes
 */
export function useSelectionProperties(canvas: fabric.Canvas | null) {
  const { selectedIds, currentStyles, setCurrentStyles } = useInteractionStore();
  const [properties, setProperties] = useState<SelectionProperties>(DEFAULT_SELECTION_PROPERTIES);

  // Read properties from selection
  useEffect(() => {
    if (!canvas) {
      setProperties({ ...DEFAULT_SELECTION_PROPERTIES, ...currentStyles });
      return;
    }

    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
      setProperties({
        ...DEFAULT_SELECTION_PROPERTIES,
        borderColor: currentStyles.borderColor,
        borderWidth: currentStyles.borderWidth,
        backgroundColor: currentStyles.backgroundColor,
        fontFamily: currentStyles.fontFamily || 'Arial',
        fontSize: currentStyles.fontSize || 16,
        fontColor: currentStyles.fontColor || '#000000',
        hasSelection: false,
        hasTextSelection: false,
      });
      return;
    }

    let objects: fabric.Object[];
    if (activeObject instanceof fabric.ActiveSelection) {
      objects = activeObject.getObjects();
    } else {
      objects = [activeObject];
    }

    const hasTextSelection = objects.some((obj) => obj instanceof fabric.IText);

    setProperties({
      borderColor: getPropertyValue(objects, (obj) => obj.stroke as string) || DEFAULT_STYLES.borderColor,
      borderWidth: getPropertyValue(objects, (obj) => obj.strokeWidth) ?? DEFAULT_STYLES.borderWidth,
      backgroundColor: getPropertyValue(objects, (obj) => obj.fill as string) || DEFAULT_STYLES.backgroundColor,
      fontFamily: hasTextSelection
        ? getPropertyValue(
            objects.filter((obj) => obj instanceof fabric.IText),
            (obj) => (obj as fabric.IText).fontFamily
          ) || 'Arial'
        : currentStyles.fontFamily || 'Arial',
      fontSize: hasTextSelection
        ? getPropertyValue(
            objects.filter((obj) => obj instanceof fabric.IText),
            (obj) => (obj as fabric.IText).fontSize
          ) ?? 16
        : currentStyles.fontSize || 16,
      fontColor: hasTextSelection
        ? getPropertyValue(
            objects.filter((obj) => obj instanceof fabric.IText),
            (obj) => (obj as fabric.IText).fill as string
          ) || '#000000'
        : currentStyles.fontColor || '#000000',
      hasSelection: true,
      hasTextSelection,
    });
  }, [canvas, selectedIds, currentStyles]);

  // Update border color
  const setBorderColor = useCallback((color: string) => {
    setCurrentStyles({ borderColor: color });

    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    if (activeObject instanceof fabric.ActiveSelection) {
      activeObject.forEachObject((obj) => obj.set('stroke', color));
    } else {
      activeObject.set('stroke', color);
    }
    canvas.renderAll();
  }, [canvas, setCurrentStyles]);

  // Update border width
  const setBorderWidth = useCallback((width: number) => {
    setCurrentStyles({ borderWidth: width });

    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    if (activeObject instanceof fabric.ActiveSelection) {
      activeObject.forEachObject((obj) => obj.set('strokeWidth', width));
    } else {
      activeObject.set('strokeWidth', width);
    }
    canvas.renderAll();
  }, [canvas, setCurrentStyles]);

  // Update background color
  const setBackgroundColor = useCallback((color: string) => {
    setCurrentStyles({ backgroundColor: color });

    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    if (activeObject instanceof fabric.ActiveSelection) {
      activeObject.forEachObject((obj) => {
        // Don't set fill on lines
        if (!(obj instanceof fabric.IText)) {
          obj.set('fill', color);
        }
      });
    } else if (!(activeObject instanceof fabric.IText)) {
      activeObject.set('fill', color);
    }
    canvas.renderAll();
  }, [canvas, setCurrentStyles]);

  // Update font family
  const setFontFamily = useCallback((font: string) => {
    setCurrentStyles({ fontFamily: font });

    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    if (activeObject instanceof fabric.ActiveSelection) {
      activeObject.forEachObject((obj) => {
        if (obj instanceof fabric.IText) {
          obj.set('fontFamily', font);
        }
      });
    } else if (activeObject instanceof fabric.IText) {
      activeObject.set('fontFamily', font);
    }
    canvas.renderAll();
  }, [canvas, setCurrentStyles]);

  // Update font size
  const setFontSize = useCallback((size: number) => {
    setCurrentStyles({ fontSize: size });

    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    if (activeObject instanceof fabric.ActiveSelection) {
      activeObject.forEachObject((obj) => {
        if (obj instanceof fabric.IText) {
          obj.set('fontSize', size);
        }
      });
    } else if (activeObject instanceof fabric.IText) {
      activeObject.set('fontSize', size);
    }
    canvas.renderAll();
  }, [canvas, setCurrentStyles]);

  // Update font color
  const setFontColor = useCallback((color: string) => {
    setCurrentStyles({ fontColor: color });

    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    if (activeObject instanceof fabric.ActiveSelection) {
      activeObject.forEachObject((obj) => {
        if (obj instanceof fabric.IText) {
          obj.set('fill', color);
        }
      });
    } else if (activeObject instanceof fabric.IText) {
      activeObject.set('fill', color);
    }
    canvas.renderAll();
  }, [canvas, setCurrentStyles]);

  return {
    properties,
    setBorderColor,
    setBorderWidth,
    setBackgroundColor,
    setFontFamily,
    setFontSize,
    setFontColor,
  };
}
