// Components
export { Whiteboard, type WhiteboardProps, ViewportControls, type ViewportControlsProps, Toolbar, type ToolbarProps, PropertyPanel, type PropertyPanelProps } from './components';

// Context
export { CanvasProvider, useCanvas, type CanvasProviderProps } from './context/CanvasContext';

// Store
export { useInteractionStore } from './store/interactionStore';

// Hooks
export { useCanvasEvents, useShapeCreation, useHistory, usePlacementMode, useShapeInteractions, useKeyboardShortcuts, useSelectionProperties, useDrawingMode, type SelectionProperties } from './hooks';

// Shapes
export {
  createArrow,
  createRectangle,
  createCircle,
  createTriangle,
  createLine,
  createArrowShape,
  createText,
  shapeFactories,
  lineShapeFactories,
  generateShapeId,
  shapeToData,
  dataToShape,
  type CreateShapeOptions,
} from './shapes';

// Utils
export {
  renderGrid,
  clearGrid,
  snapToGrid,
  snapObjectToGrid,
  getContentBounds,
  checkCanvasExpansion,
  expandCanvasIfNeeded,
  fitCanvasToContent,
  bringForward,
  sendBackward,
  bringToFront,
  sendToBack,
  type CanvasBounds,
} from './utils';

// Types
export type {
  ShapeType,
  ShapeStyles,
  ShapeData,
  CanvasData,
  CatalogItem,
  ComponentCatalog,
  ToolMode,
  HistoryAction,
  CanvasContextValue,
  InteractionState,
  ViewportState,
  GridConfig,
  PresetFont,
} from './types';

export { DEFAULT_STYLES, DEFAULT_VIEWPORT, DEFAULT_GRID_CONFIG, SELECTION_STYLE, SHAPE_CONSTRAINTS, PRESET_FONTS } from './types';
