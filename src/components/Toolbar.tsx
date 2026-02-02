import { useCallback } from 'react';
import { useCanvas } from '../context/CanvasContext';
import { useInteractionStore } from '../store/interactionStore';
import type { ToolMode, ShapeType, CatalogItem } from '../types';

export interface ToolbarProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
  // Class name overrides
  classNames?: {
    root?: string;
    button?: string;
    buttonActive?: string;
    divider?: string;
    shapeSection?: string;
  };
  // Whether to show built-in tools (select, pan)
  showSelectTool?: boolean;
  showPanTool?: boolean;
}

const defaultStyles = {
  root: {
    display: 'flex',
    gap: 'var(--toolbar-gap, 4px)',
    padding: 'var(--toolbar-padding, 8px)',
    backgroundColor: 'var(--toolbar-bg, #ffffff)',
    border: 'var(--toolbar-border, 1px solid #e0e0e0)',
    borderRadius: 'var(--toolbar-radius, 4px)',
  } as React.CSSProperties,
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--toolbar-button-size, 36px)',
    height: 'var(--toolbar-button-size, 36px)',
    padding: 'var(--toolbar-button-padding, 6px)',
    backgroundColor: 'var(--toolbar-button-bg, transparent)',
    border: 'var(--toolbar-button-border, 1px solid transparent)',
    borderRadius: 'var(--toolbar-button-radius, 4px)',
    cursor: 'pointer',
    transition: 'background-color 0.15s, border-color 0.15s',
  } as React.CSSProperties,
  buttonActive: {
    backgroundColor: 'var(--toolbar-button-active-bg, #e3f2fd)',
    borderColor: 'var(--toolbar-button-active-border, #2196f3)',
  } as React.CSSProperties,
  buttonHover: {
    backgroundColor: 'var(--toolbar-button-hover-bg, #f5f5f5)',
  } as React.CSSProperties,
  divider: {
    width: 'var(--toolbar-divider-size, 1px)',
    height: 'var(--toolbar-divider-length, 24px)',
    backgroundColor: 'var(--toolbar-divider-color, #e0e0e0)',
    margin: 'var(--toolbar-divider-margin, 0 4px)',
    alignSelf: 'center',
  } as React.CSSProperties,
};

// Simple icons as SVG
const SelectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
  </svg>
);

const PanIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3" />
  </svg>
);

// Default shape icons
const shapeIcons: Record<ShapeType, React.ReactNode> = {
  rectangle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  circle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  triangle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3L22 21H2L12 3z" />
    </svg>
  ),
  line: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="20" x2="20" y2="4" />
    </svg>
  ),
  arrow: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="20" x2="20" y2="4" />
      <polyline points="10,4 20,4 20,14" />
    </svg>
  ),
  text: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </svg>
  ),
  image: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
};

export function Toolbar({
  orientation = 'horizontal',
  className,
  style,
  classNames = {},
  showSelectTool = true,
  showPanTool = true,
}: ToolbarProps) {
  const { catalog } = useCanvas();
  const { activeTool, setActiveTool, placementShape, setPlacementShape } = useInteractionStore();

  const handleToolClick = useCallback((tool: ToolMode) => {
    setPlacementShape(null);
    setActiveTool(tool);
  }, [setActiveTool, setPlacementShape]);

  const handleShapeClick = useCallback((shapeType: ShapeType) => {
    if (shapeType === 'line' || shapeType === 'arrow') {
      // Line/arrow use drawing mode, not placement mode
      setPlacementShape(null);
      setActiveTool(shapeType);
    } else {
      // Other shapes use placement mode
      setPlacementShape(shapeType);
    }
  }, [setPlacementShape, setActiveTool]);

  const isToolActive = (tool: ToolMode) => activeTool === tool && !placementShape;
  const isShapeActive = (shapeType: ShapeType) => {
    if (shapeType === 'line' || shapeType === 'arrow') {
      return activeTool === shapeType && !placementShape;
    }
    return placementShape === shapeType;
  };

  const rootStyle: React.CSSProperties = {
    ...defaultStyles.root,
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    ...style,
  };

  const dividerStyle: React.CSSProperties = {
    ...defaultStyles.divider,
    ...(orientation === 'vertical' && {
      width: 'var(--toolbar-divider-length, 24px)',
      height: 'var(--toolbar-divider-size, 1px)',
    }),
  };

  const getButtonStyle = (isActive: boolean): React.CSSProperties => ({
    ...defaultStyles.button,
    ...(isActive && defaultStyles.buttonActive),
  });

  const getButtonClassName = (isActive: boolean): string => {
    const classes = [classNames.button || ''];
    if (isActive && classNames.buttonActive) {
      classes.push(classNames.buttonActive);
    }
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div
      className={`${className || ''} ${classNames.root || ''}`.trim() || undefined}
      style={rootStyle}
      role="toolbar"
      aria-label="Canvas tools"
    >
      {/* Select tool */}
      {showSelectTool && (
        <button
          className={getButtonClassName(isToolActive('select'))}
          style={getButtonStyle(isToolActive('select'))}
          onClick={() => handleToolClick('select')}
          title="Select (V)"
          aria-label="Select tool"
          aria-pressed={isToolActive('select')}
        >
          <SelectIcon />
        </button>
      )}

      {/* Pan tool */}
      {showPanTool && (
        <button
          className={getButtonClassName(isToolActive('pan'))}
          style={getButtonStyle(isToolActive('pan'))}
          onClick={() => handleToolClick('pan')}
          title="Pan (H)"
          aria-label="Pan tool"
          aria-pressed={isToolActive('pan')}
        >
          <PanIcon />
        </button>
      )}

      {/* Divider */}
      {(showSelectTool || showPanTool) && catalog.shapes.length > 0 && (
        <div
          className={classNames.divider}
          style={dividerStyle}
          role="separator"
        />
      )}

      {/* Shape buttons from catalog */}
      <div
        className={classNames.shapeSection}
        style={{
          display: 'flex',
          flexDirection: orientation === 'vertical' ? 'column' : 'row',
          gap: 'var(--toolbar-gap, 4px)',
        }}
      >
        {catalog.shapes.map((item: CatalogItem) => (
          <button
            key={item.type}
            className={getButtonClassName(isShapeActive(item.type))}
            style={getButtonStyle(isShapeActive(item.type))}
            onClick={() => handleShapeClick(item.type)}
            title={item.label}
            aria-label={`Add ${item.label}`}
            aria-pressed={isShapeActive(item.type)}
          >
            {item.icon || shapeIcons[item.type] || item.label.charAt(0)}
          </button>
        ))}
      </div>
    </div>
  );
}
