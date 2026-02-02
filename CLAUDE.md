# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minot is a React component library for building whiteboard-style work surfaces (similar to Miro). It provides reusable components for adding shapes, text, and images to a canvas.

## Tech Stack

- **React + TypeScript** component library
- **Fabric.js** for HTML Canvas rendering
- **React Context** for component catalog, canvas data (JSON import/export), viewport, and grid state
- **Zustand** for canvas interaction state (selection, tools, drawing modes, styles, history)
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

## Architecture

### State Management (Dual-Layer)

- **React Context** (`CanvasProvider`): Data flow layer
  - Canvas JSON serialization/deserialization (`loadData`/`getData`)
  - Component catalog configuration
  - Viewport state (zoom, pan)
  - Grid configuration (size, snap, visibility)
  - Canvas ref exposure for image export

- **Zustand Store** (`useInteractionStore`): Interaction layer
  - Active tool and placement/drawing mode
  - Selection state (selected IDs)
  - Current styles (applied to new shapes)
  - Undo/redo history stack
  - Drawing/panning flags

### Components

| Component | Purpose |
|-----------|---------|
| `Whiteboard` | Main canvas, integrates all hooks |
| `Toolbar` | Tool/shape selection from catalog |
| `PropertyPanel` | Edit shape/text properties |
| `ViewportControls` | Zoom/pan controls |

### Hooks

| Hook | Purpose |
|------|---------|
| `useCanvasEvents` | Selection change and history tracking |
| `useShapeCreation` | Programmatic shape creation |
| `usePlacementMode` | Ghost preview + click-to-place |
| `useDrawingMode` | Click-drag for lines/arrows |
| `useShapeInteractions` | No rotation, snap-to-grid, min size, aspect lock |
| `useKeyboardShortcuts` | Delete, duplicate, nudge, undo/redo |
| `useSelectionProperties` | Read/write properties of selected shapes |
| `useHistory` | Undo/redo operations |

### Shape Modes

- **Placement mode**: Rectangle, circle, triangle, text - click toolbar, ghost follows cursor, click to place
- **Drawing mode**: Line, arrow - click toolbar, click-drag on canvas to draw

### Key Constants

- `DEFAULT_STYLES` - Default shape styling
- `SELECTION_STYLE` - Black selection handles, no rotation
- `SHAPE_CONSTRAINTS` - Min size 16x16, nudge amounts
- `PRESET_FONTS` - 10 preset font families for text
- `DEFAULT_GRID_CONFIG` - Grid size 20px, snap disabled by default

### CSS Theming

Components use CSS custom properties for styling:
- `--toolbar-*` for Toolbar
- `--panel-*` for PropertyPanel

All components accept `className` and `classNames` props for style overrides.

## Consumer Responsibilities

The library intentionally leaves these to consuming applications:
- Real-time collaboration/sync
- Image/SVG export (canvas ref exposed via context)
- Persistence layer
- Comments/annotations (future)
