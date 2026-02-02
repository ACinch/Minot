import { useCallback } from 'react';
import { useCanvas } from '../context/CanvasContext';

export interface ViewportControlsProps {
  className?: string;
  style?: React.CSSProperties;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

export function ViewportControls({
  className,
  style,
  minZoom = 0.1,
  maxZoom = 5,
  zoomStep = 0.1,
}: ViewportControlsProps) {
  const { viewport, setViewport } = useCanvas();

  const zoomIn = useCallback(() => {
    setViewport({ zoom: Math.min(viewport.zoom + zoomStep, maxZoom) });
  }, [viewport.zoom, zoomStep, maxZoom, setViewport]);

  const zoomOut = useCallback(() => {
    setViewport({ zoom: Math.max(viewport.zoom - zoomStep, minZoom) });
  }, [viewport.zoom, zoomStep, minZoom, setViewport]);

  const resetViewport = useCallback(() => {
    setViewport({ zoom: 1, panX: 0, panY: 0 });
  }, [setViewport]);

  const zoomToFit = useCallback(() => {
    // This will be implemented to fit all content in view
    // For now just reset
    resetViewport();
  }, [resetViewport]);

  return (
    <div className={className} style={{ display: 'flex', gap: '4px', ...style }}>
      <button onClick={zoomOut} title="Zoom Out" aria-label="Zoom Out">
        −
      </button>
      <span style={{ minWidth: '50px', textAlign: 'center' }}>
        {Math.round(viewport.zoom * 100)}%
      </span>
      <button onClick={zoomIn} title="Zoom In" aria-label="Zoom In">
        +
      </button>
      <button onClick={resetViewport} title="Reset View" aria-label="Reset View">
        ⟲
      </button>
    </div>
  );
}
