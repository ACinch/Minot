# Minot

A React component library for building whiteboard-style work surfaces, similar to Miro or FigJam.

## Installation

```bash
npm install minot
# or
pnpm add minot
# or
yarn add minot
```

## Quick Start

```tsx
import {
  CanvasProvider,
  Whiteboard,
  Toolbar,
  PropertyPanel,
  type ComponentCatalog,
} from 'minot';

// Define available shapes
const catalog: ComponentCatalog = {
  shapes: [
    { type: 'rectangle', label: 'Rectangle' },
    { type: 'circle', label: 'Circle' },
    { type: 'triangle', label: 'Triangle' },
    { type: 'line', label: 'Line' },
    { type: 'arrow', label: 'Arrow' },
    { type: 'text', label: 'Text' },
  ],
};

function App() {
  return (
    <CanvasProvider catalog={catalog}>
      <div style={{ display: 'flex' }}>
        <Toolbar orientation="vertical" />
        <Whiteboard />
        <PropertyPanel />
      </div>
    </CanvasProvider>
  );
}
```

## Architecture

Minot uses a context-driven architecture where all canvas interactions flow through `CanvasProvider`:

- **CanvasProvider**: Wraps your app, accepts a component catalog, manages Fabric.js canvas
- **Whiteboard**: Main canvas component
- **Toolbar**: Shape/tool picker (reads from catalog)
- **PropertyPanel**: Edit selected shape properties
- **ViewportControls**: Zoom/pan controls

### Hooks

```tsx
import { useCanvas, useInteractionStore } from 'minot';

// Access canvas operations
const { getData, loadData, clearCanvas, gridConfig, setGridConfig } = useCanvas();

// Access interaction state
const { activeTool, selectedIds, placementShape } = useInteractionStore();
```

## Features

- Built-in shapes: rectangle, circle, triangle, line, arrow, text, image
- JSON serialization/deserialization for save/load
- Grid with snap-to-grid support
- Zoom and pan controls
- Keyboard shortcuts (delete, duplicate, nudge, undo/redo)
- CSS custom properties for theming

## Tech Stack

- React + TypeScript
- Fabric.js for canvas rendering
- Zustand for interaction state
- React Context for data flow

## License

MIT
