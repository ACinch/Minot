import type { fabric } from 'fabric';

// Shape types supported by the library
export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow' | 'text' | 'image';

// Shape property configuration
export interface ShapeStyles {
  borderColor: string;
  borderWidth: number;
  backgroundColor: string;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
}

// Base shape data for serialization
export interface ShapeData {
  id: string;
  type: ShapeType;
  left: number;
  top: number;
  width?: number;
  height?: number;
  radius?: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  styles: ShapeStyles;
  // Type-specific data
  text?: string;
  points?: { x: number; y: number }[];
  src?: string;
}

// Canvas data for JSON import/export
export interface CanvasData {
  version: string;
  width: number;
  height: number;
  backgroundColor: string;
  shapes: ShapeData[];
}

// Component catalog item for shape picker
export interface CatalogItem {
  type: ShapeType;
  label: string;
  icon?: React.ReactNode;
  defaultStyles?: Partial<ShapeStyles>;
  // Custom factory for complex shapes
  factory?: (canvas: fabric.Canvas, options: Partial<ShapeData>) => fabric.Object;
}

// Component catalog configuration
export interface ComponentCatalog {
  shapes: CatalogItem[];
}

// Tool modes for canvas interaction
export type ToolMode = 'select' | 'pan' | 'draw' | ShapeType;

// Viewport state for zoom/pan
export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

// Grid configuration
export interface GridConfig {
  enabled: boolean;
  size: number;
  snapToGrid: boolean;
  color: string;
}

// History action for undo/redo
export interface HistoryAction {
  type: 'add' | 'remove' | 'modify' | 'batch';
  timestamp: number;
  before: string; // JSON snapshot
  after: string;  // JSON snapshot
}

// Canvas context value
export interface CanvasContextValue {
  canvas: fabric.Canvas | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  catalog: ComponentCatalog;
  // Data operations
  loadData: (data: CanvasData) => void;
  getData: () => CanvasData;
  clearCanvas: () => void;
  // Viewport
  viewport: ViewportState;
  setViewport: (viewport: Partial<ViewportState>) => void;
  // Grid
  gridConfig: GridConfig;
  setGridConfig: (config: Partial<GridConfig>) => void;
}

// Interaction store state (Zustand)
export interface InteractionState {
  // Current tool
  activeTool: ToolMode;
  setActiveTool: (tool: ToolMode) => void;

  // Selection
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;

  // Shape styles (applied to new shapes and selection)
  currentStyles: ShapeStyles;
  setCurrentStyles: (styles: Partial<ShapeStyles>) => void;

  // History
  history: HistoryAction[];
  historyIndex: number;
  pushHistory: (action: HistoryAction) => void;
  undo: () => HistoryAction | null;
  redo: () => HistoryAction | null;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Canvas state flags
  isPanning: boolean;
  setIsPanning: (panning: boolean) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;

  // Placement mode
  placementShape: ShapeType | null;
  setPlacementShape: (shape: ShapeType | null) => void;
  isPlacementMode: () => boolean;
}

// Default styles
export const DEFAULT_STYLES: ShapeStyles = {
  borderColor: '#000000',
  borderWidth: 2,
  backgroundColor: '#ffffff',
  fontFamily: 'Arial',
  fontSize: 16,
  fontColor: '#000000',
};

// Default viewport state
export const DEFAULT_VIEWPORT: ViewportState = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

// Default grid configuration
export const DEFAULT_GRID_CONFIG: GridConfig = {
  enabled: false,
  size: 20,
  snapToGrid: false,
  color: '#e0e0e0',
};

// Selection styling constant
export const SELECTION_STYLE = {
  borderColor: '#000000',
  cornerColor: '#000000',
  cornerStyle: 'circle' as const,
  transparentCorners: false,
};

// Shape interaction constraints
export const SHAPE_CONSTRAINTS = {
  minWidth: 16,
  minHeight: 16,
  nudgeAmount: 1,
  nudgeAmountShift: 10,
};

// Preset fonts for text shapes
export const PRESET_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
  'Palatino Linotype',
] as const;

export type PresetFont = typeof PRESET_FONTS[number];
