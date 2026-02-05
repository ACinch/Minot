# Demo App

This folder contains a demo application showcasing Minot component usage.

## Running the Demo

### Development (default - uses source with hot reloading)

```bash
cd demo
pnpm install
pnpm dev        # Uses ../src with hot reloading
pnpm build      # Production build from source
```

### Testing the npm package (before publishing)

```bash
# First, build and pack the library from root
cd ..
pnpm build
npm pack

# Then test in demo
cd demo
pnpm dev:package    # Uses packaged minot from tarball
pnpm build:package  # Production build from package
```

Note: When switching between modes, you may need to clear Vite's cache:
```bash
rm -rf node_modules/.vite
```

## Usage Pattern

### 1. Define a Component Catalog

Register the shapes/tools you want available in your whiteboard:

```tsx
import { ComponentCatalog } from 'minot';

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
```

### 2. Wrap Your App with CanvasProvider

The provider accepts the catalog and optional configuration:

```tsx
import { CanvasProvider } from 'minot';

function App() {
  return (
    <CanvasProvider
      catalog={catalog}
      width={800}
      height={600}
      backgroundColor="#f5f5f5"
      initialGridConfig={{ enabled: true, snapToGrid: false }}
      initialViewport={{ zoom: 1, panX: 0, panY: 0 }}
    >
      <AppContent />
    </CanvasProvider>
  );
}
```

### 3. Use Components Inside the Provider

```tsx
import { Whiteboard, Toolbar, PropertyPanel, ViewportControls } from 'minot';

function AppContent() {
  return (
    <div style={{ display: 'flex' }}>
      <Toolbar orientation="vertical" />
      <Whiteboard />
      <PropertyPanel />
      <ViewportControls />
    </div>
  );
}
```

### 4. Access Context for Custom Controls

Use `useCanvas` for data operations and grid/viewport control:

```tsx
import { useCanvas } from 'minot';

function DataControls() {
  const { getData, loadData, clearCanvas, gridConfig, setGridConfig } = useCanvas();

  const handleSave = () => {
    const data = getData();
    localStorage.setItem('canvas', JSON.stringify(data));
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('canvas');
    if (saved) loadData(JSON.parse(saved));
  };

  return (
    <>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleLoad}>Load</button>
      <button onClick={clearCanvas}>Clear</button>
      <label>
        <input
          type="checkbox"
          checked={gridConfig.snapToGrid}
          onChange={(e) => setGridConfig({ snapToGrid: e.target.checked })}
        />
        Snap to Grid
      </label>
    </>
  );
}
```

Use `useInteractionStore` for tool/selection state:

```tsx
import { useInteractionStore } from 'minot';

function StatusBar() {
  const { activeTool, selectedIds, placementShape } = useInteractionStore();

  return (
    <div>
      Tool: {activeTool} | Selected: {selectedIds.length} shapes
      {placementShape && ` | Placing: ${placementShape}`}
    </div>
  );
}
```

## Key Exports from Minot

### Components
- `CanvasProvider` - Required context wrapper
- `Whiteboard` - Main canvas
- `Toolbar` - Shape picker (reads from catalog)
- `PropertyPanel` - Edit selected shape properties
- `ViewportControls` - Zoom/pan controls

### Hooks
- `useCanvas()` - Context access: canvas, catalog, data ops, viewport, grid
- `useInteractionStore()` - Zustand store: tool, selection, styles, history

### Types
- `ComponentCatalog` - Shape catalog definition
- `CanvasData` - JSON serialization format
- `ShapeType` - `'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow' | 'text' | 'image'`

## Data Format

Canvas data is serialized as JSON:

```json
{
  "version": "1.0.0",
  "width": 800,
  "height": 600,
  "backgroundColor": "#f5f5f5",
  "shapes": [
    {
      "id": "shape_123",
      "type": "rectangle",
      "left": 100,
      "top": 100,
      "width": 200,
      "height": 150,
      "angle": 0,
      "scaleX": 1,
      "scaleY": 1,
      "styles": {
        "borderColor": "#000000",
        "borderWidth": 2,
        "backgroundColor": "#ffffff"
      }
    }
  ]
}
```
