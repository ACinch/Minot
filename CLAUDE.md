# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minot is a React component library for building whiteboard-style work surfaces (similar to Miro). The library provides a unified context-driven architecture where all canvas interactions flow through a central `CanvasProvider` context, making it easy to register custom shapes/tools and manage whiteboard state.

## Core Architecture: Context-Driven Whiteboard

### The CanvasProvider Pattern

All whiteboard functionality is managed through the `CanvasProvider` context. The provider:

1. **Wraps your application** - All Minot components must be descendants of `CanvasProvider`
2. **Accepts a component catalog** - Register available shapes/tools via the `catalog` prop
3. **Manages the Fabric.js canvas** - The HTML Canvas is rendered using Fabric.js, but all interaction flows through React context
4. **Provides data operations** - `loadData()`/`getData()` for JSON serialization, `clearCanvas()` for reset

```tsx
<CanvasProvider catalog={catalog} initialGridConfig={{ enabled: true }}>
  {/* All Minot components go here */}
</CanvasProvider>
```

### Registering Shapes and Tools

The `ComponentCatalog` defines what shapes/tools appear in the toolbar and can be placed on the canvas:

```tsx
const catalog: ComponentCatalog = {
  shapes: [
    { type: 'rectangle', label: 'Rectangle' },
    { type: 'circle', label: 'Circle' },
    { type: 'text', label: 'Text' },
    // Custom shapes can include icons and custom factories
    { type: 'arrow', label: 'Arrow', icon: <ArrowIcon /> },
  ],
};
```

Built-in shape types: `rectangle`, `circle`, `triangle`, `line`, `arrow`, `text`, `image`

### Context Access via Hooks

- **`useCanvas()`** - Access canvas instance, catalog, data operations, viewport, and grid config
- **`useInteractionStore()`** - Access/modify active tool, selection, styles, history, and mode flags

## Tech Stack

- **React + TypeScript** component library
- **Fabric.js** for HTML Canvas rendering (abstracted behind context)
- **React Context** (`CanvasProvider`) for catalog, data, viewport, and grid state
- **Zustand** (`useInteractionStore`) for interaction state (selection, tools, history)
- **Rollup** for library bundling
- **Jest** for unit tests, **Playwright** for e2e tests
- **pnpm** as package manager

## Build Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build library with Rollup
pnpm dev              # Development mode with watch
pnpm test             # Run Jest unit tests
pnpm test:e2e         # Run Playwright e2e tests
pnpm test -- --watch  # Run tests in watch mode
pnpm lint             # Run ESLint
pnpm typecheck        # Type check without emitting
```

## Component Reference

| Component | Purpose |
|-----------|---------|
| `CanvasProvider` | Required wrapper - provides context and accepts catalog |
| `Whiteboard` | Main canvas component - renders Fabric.js canvas |
| `Toolbar` | Shape/tool picker - reads from catalog |
| `PropertyPanel` | Edit selected shape properties |
| `ViewportControls` | Zoom/pan controls |

## Hook Reference

| Hook | Purpose |
|------|---------|
| `useCanvas` | Access context: canvas, catalog, loadData/getData, viewport, gridConfig |
| `useInteractionStore` | Zustand store: activeTool, selectedIds, currentStyles, history |
| `useShapeCreation` | Programmatically create shapes |
| `usePlacementMode` | Ghost preview + click-to-place for shapes |
| `useDrawingMode` | Click-drag for lines/arrows |
| `useShapeInteractions` | Snap-to-grid, min size, aspect lock |
| `useKeyboardShortcuts` | Delete, duplicate, nudge, undo/redo |
| `useSelectionProperties` | Read/write properties of selected shapes |
| `useHistory` | Undo/redo operations |

## Shape Interaction Modes

- **Placement mode**: Rectangle, circle, triangle, text - click toolbar, ghost follows cursor, click to place
- **Drawing mode**: Line, arrow - click toolbar, click-drag on canvas to draw

## Key Constants

- `DEFAULT_STYLES` - Default shape styling (border, fill, font)
- `SELECTION_STYLE` - Black selection handles, no rotation
- `SHAPE_CONSTRAINTS` - Min size 16x16, nudge amounts
- `PRESET_FONTS` - 10 preset font families for text
- `DEFAULT_GRID_CONFIG` - Grid size 20px, snap disabled by default

## CSS Theming

Components use CSS custom properties:
- `--toolbar-*` for Toolbar
- `--panel-*` for PropertyPanel

All components accept `className` and `classNames` props for style overrides.

## CI/CD

### GitHub Actions

- **CI** (`.github/workflows/ci.yml`): Runs on push/PR to main
  - Tests on Node 18, 20, 22
  - Type checking, linting, unit tests
  - E2E tests with Playwright

- **Publish** (`.github/workflows/publish.yml`): Runs on release or manual trigger
  - Builds and publishes to npm with provenance
  - Supports dry-run mode for testing

### Publishing a New Version

1. Update version in `package.json`
2. Create a GitHub release (triggers publish workflow)
3. Or manually trigger the workflow from Actions tab

### Required Secrets

- `NPM_TOKEN`: npm access token with publish permission
  - Create at https://www.npmjs.com/settings/tokens
  - Add to repo Settings > Secrets > Actions

## Consumer Responsibilities

The library intentionally leaves these to consuming applications:
- Real-time collaboration/sync
- Image/SVG export (canvas ref exposed via context)
- Persistence layer
- Comments/annotations
