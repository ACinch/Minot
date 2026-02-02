import { useEffect, useRef, useCallback, useState } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { useCanvas } from '../context/CanvasContext';
import { useCanvasEvents } from '../hooks/useCanvasEvents';
import { usePlacementMode } from '../hooks/usePlacementMode';
import { useShapeInteractions } from '../hooks/useShapeInteractions';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useDrawingMode } from '../hooks/useDrawingMode';
import { useInteractionStore } from '../store/interactionStore';
import { SELECTION_STYLE } from '../types';
import { renderGrid } from '../utils/grid';
import { expandCanvasIfNeeded } from '../utils/infiniteCanvas';

export interface WhiteboardProps {
  className?: string;
  style?: React.CSSProperties;
  onReady?: (canvas: FabricCanvas) => void;
}

export function Whiteboard({
  className,
  style,
  onReady,
}: WhiteboardProps) {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const { canvasRef, viewport, gridConfig } = useCanvas();
  const { placementShape, activeTool } = useInteractionStore();

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasElementRef.current || fabricCanvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasElementRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f5f5f5',
      selection: true,
      preserveObjectStacking: true,
      // Selection styling
      selectionBorderColor: SELECTION_STYLE.borderColor,
      selectionColor: 'rgba(0, 0, 0, 0.1)',
    });

    // Set default object controls styling
    fabricCanvas.getObjects().forEach((obj) => {
      obj.set({
        borderColor: SELECTION_STYLE.borderColor,
        cornerColor: SELECTION_STYLE.cornerColor,
        cornerStyle: SELECTION_STYLE.cornerStyle,
        transparentCorners: SELECTION_STYLE.transparentCorners,
      });
    });

    fabricCanvasRef.current = fabricCanvas;
    setFabricCanvas(fabricCanvas);

    // Store reference for context access
    if (canvasRef && 'current' in canvasRef) {
      (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        canvasElementRef.current;
    }

    // Handle object added - apply selection style and check for canvas expansion
    fabricCanvas.on('object:added', (e) => {
      if (e.target) {
        e.target.set({
          borderColor: SELECTION_STYLE.borderColor,
          cornerColor: SELECTION_STYLE.cornerColor,
          cornerStyle: SELECTION_STYLE.cornerStyle,
          transparentCorners: SELECTION_STYLE.transparentCorners,
        });
      }
      expandCanvasIfNeeded(fabricCanvas);
    });

    // Handle object modified - check for canvas expansion
    fabricCanvas.on('object:modified', () => {
      expandCanvasIfNeeded(fabricCanvas);
    });

    if (onReady) {
      onReady(fabricCanvas);
    }

    return () => {
      fabricCanvas.dispose();
      fabricCanvasRef.current = null;
      setFabricCanvas(null);
    };
  }, [onReady, canvasRef]);

  // Apply viewport changes (zoom and pan)
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.setZoom(viewport.zoom);
    canvas.absolutePan({ x: -viewport.panX, y: -viewport.panY });
    canvas.renderAll();
  }, [viewport]);

  // Apply grid changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    renderGrid(canvas, gridConfig, canvas.getWidth(), canvas.getHeight());
  }, [gridConfig]);

  // Set up canvas event handlers
  useCanvasEvents();

  // Handle placement mode (ghost shape preview)
  usePlacementMode(fabricCanvas);

  // Configure shape interactions (no rotation, snap-to-grid, min size)
  useShapeInteractions(fabricCanvas);

  // Handle keyboard shortcuts (delete, duplicate, nudge, undo/redo)
  useKeyboardShortcuts(fabricCanvas);

  // Handle drawing mode (click-drag for lines/arrows)
  const { isLineMode } = useDrawingMode(fabricCanvas);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'inline-block',
        overflow: 'auto',
        border: '1px solid #ccc',
        cursor: placementShape ? 'crosshair' : isLineMode ? 'crosshair' : undefined,
        ...style,
      }}
    >
      <canvas ref={canvasElementRef} />
    </div>
  );
}
