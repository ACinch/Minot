import { useState, useCallback } from 'react';
import {
  CanvasProvider,
  Whiteboard,
  Toolbar,
  PropertyPanel,
  ViewportControls,
  useCanvas,
  useInteractionStore,
  type ComponentCatalog,
  type CanvasData,
} from 'minot';

// Define the shape catalog
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

// Grid toggle component
function GridToggle() {
  const { gridConfig, setGridConfig } = useCanvas();

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={gridConfig.enabled}
          onChange={(e) => setGridConfig({ enabled: e.target.checked })}
        />
        Show Grid
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={gridConfig.snapToGrid}
          onChange={(e) => setGridConfig({ snapToGrid: e.target.checked })}
        />
        Snap to Grid
      </label>
    </div>
  );
}

// Data controls component
function DataControls() {
  const { getData, loadData, clearCanvas } = useCanvas();
  const [savedData, setSavedData] = useState<CanvasData | null>(null);

  const handleSave = useCallback(() => {
    const data = getData();
    setSavedData(data);
    console.log('Saved canvas data:', JSON.stringify(data, null, 2));
    alert('Canvas data saved! Check console for JSON.');
  }, [getData]);

  const handleLoad = useCallback(() => {
    if (savedData) {
      loadData(savedData);
      alert('Canvas data loaded!');
    } else {
      alert('No saved data to load. Save first!');
    }
  }, [savedData, loadData]);

  const handleClear = useCallback(() => {
    if (confirm('Clear the canvas?')) {
      clearCanvas();
    }
  }, [clearCanvas]);

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleLoad} disabled={!savedData}>Load</button>
      <button onClick={handleClear}>Clear</button>
    </div>
  );
}

// Status bar showing current tool and selection
function StatusBar() {
  const { activeTool, selectedIds, placementShape } = useInteractionStore();

  let status = `Tool: ${activeTool}`;
  if (placementShape) {
    status = `Placing: ${placementShape}`;
  }
  if (selectedIds.length > 0) {
    status += ` | Selected: ${selectedIds.length} shape(s)`;
  }

  return (
    <div style={{
      padding: '8px 12px',
      backgroundColor: '#333',
      color: '#fff',
      fontSize: '12px',
      fontFamily: 'monospace',
    }}>
      {status}
    </div>
  );
}

// Main app layout
function AppContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Minot Demo</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <GridToggle />
          <DataControls />
        </div>
      </header>

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar - Toolbar */}
        <aside style={{
          width: '60px',
          backgroundColor: '#fff',
          borderRight: '1px solid #e0e0e0',
          padding: '12px 8px',
        }}>
          <Toolbar orientation="vertical" />
        </aside>

        {/* Canvas area */}
        <main style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          overflow: 'auto',
          backgroundColor: '#e8e8e8',
        }}>
          <Whiteboard
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          />
        </main>

        {/* Right sidebar - Property Panel */}
        <aside style={{
          width: '220px',
          backgroundColor: '#fff',
          borderLeft: '1px solid #e0e0e0',
          padding: '12px',
          overflowY: 'auto',
        }}>
          <PropertyPanel />
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
            <ViewportControls />
          </div>
        </aside>
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  );
}

// App with provider
export default function App() {
  return (
    <CanvasProvider
      catalog={catalog}
      initialGridConfig={{ enabled: true, snapToGrid: false }}
    >
      <AppContent />
    </CanvasProvider>
  );
}
