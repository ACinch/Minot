import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import type { CanvasContextValue, CanvasData, ComponentCatalog, ShapeData, ViewportState, GridConfig } from '../types';
import { DEFAULT_VIEWPORT, DEFAULT_GRID_CONFIG } from '../types';
import { shapeToData, dataToShape } from '../shapes/serialization';

const CANVAS_DATA_VERSION = '1.0.0';

const CanvasContext = createContext<CanvasContextValue | null>(null);

export interface CanvasProviderProps {
  children: ReactNode;
  catalog: ComponentCatalog;
  width?: number;
  height?: number;
  backgroundColor?: string;
  initialGridConfig?: Partial<GridConfig>;
  initialViewport?: Partial<ViewportState>;
}

export function CanvasProvider({
  children,
  catalog,
  width = 800,
  height = 600,
  backgroundColor = '#f5f5f5',
  initialGridConfig,
  initialViewport,
}: CanvasProviderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const dimensionsRef = useRef({ width, height, backgroundColor });
  const [viewport, setViewportState] = useState<ViewportState>({
    ...DEFAULT_VIEWPORT,
    ...initialViewport,
  });
  const [gridConfig, setGridConfigState] = useState<GridConfig>({
    ...DEFAULT_GRID_CONFIG,
    ...initialGridConfig,
  });

  // Update dimensions ref when props change
  useEffect(() => {
    dimensionsRef.current = { width, height, backgroundColor };
  }, [width, height, backgroundColor]);

  // Initialize Fabric canvas
  const initializeCanvas = useCallback((canvasElement: HTMLCanvasElement) => {
    const fabricCanvas = new FabricCanvas(canvasElement, {
      width: dimensionsRef.current.width,
      height: dimensionsRef.current.height,
      backgroundColor: dimensionsRef.current.backgroundColor,
      selection: true,
      preserveObjectStacking: true,
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
      setCanvas(null);
    };
  }, []);

  // Load canvas data from JSON
  const loadData = useCallback(
    (data: CanvasData) => {
      if (!canvas) return;

      canvas.clear();
      canvas.setWidth(data.width);
      canvas.setHeight(data.height);
      canvas.backgroundColor = data.backgroundColor;

      data.shapes.forEach((shapeData) => {
        const catalogItem = catalog.shapes.find((item) => item.type === shapeData.type);
        const fabricObject = dataToShape(shapeData, catalogItem);
        if (fabricObject) {
          canvas.add(fabricObject);
        }
      });

      canvas.renderAll();
    },
    [canvas, catalog]
  );

  // Export canvas data to JSON
  const getData = useCallback((): CanvasData => {
    if (!canvas) {
      return {
        version: CANVAS_DATA_VERSION,
        width: dimensionsRef.current.width,
        height: dimensionsRef.current.height,
        backgroundColor: dimensionsRef.current.backgroundColor,
        shapes: [],
      };
    }

    const shapes: ShapeData[] = canvas.getObjects().map((obj) => shapeToData(obj));

    return {
      version: CANVAS_DATA_VERSION,
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      backgroundColor: (canvas.backgroundColor as string) || '#ffffff',
      shapes,
    };
  }, [canvas]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = dimensionsRef.current.backgroundColor;
    canvas.renderAll();
  }, [canvas]);

  const setViewport = useCallback((updates: Partial<ViewportState>) => {
    setViewportState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setGridConfig = useCallback((updates: Partial<GridConfig>) => {
    setGridConfigState((prev) => ({ ...prev, ...updates }));
  }, []);

  const value: CanvasContextValue = {
    canvas,
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    catalog,
    loadData,
    getData,
    clearCanvas,
    viewport,
    setViewport,
    gridConfig,
    setGridConfig,
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas(): CanvasContextValue {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}

export { CanvasContext };
