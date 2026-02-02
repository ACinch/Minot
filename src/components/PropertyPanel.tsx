import { useCallback } from 'react';
import { useSelectionProperties } from '../hooks/useSelectionProperties';
import { useCanvas } from '../context/CanvasContext';
import { PRESET_FONTS } from '../types';

export interface PropertyPanelProps {
  className?: string;
  style?: React.CSSProperties;
  classNames?: {
    root?: string;
    section?: string;
    sectionTitle?: string;
    row?: string;
    label?: string;
    input?: string;
    select?: string;
  };
}

const defaultStyles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--panel-gap, 16px)',
    padding: 'var(--panel-padding, 12px)',
    backgroundColor: 'var(--panel-bg, #ffffff)',
    border: 'var(--panel-border, 1px solid #e0e0e0)',
    borderRadius: 'var(--panel-radius, 4px)',
    minWidth: 'var(--panel-min-width, 200px)',
    fontSize: 'var(--panel-font-size, 14px)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--panel-section-gap, 8px)',
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: 'var(--panel-title-size, 12px)',
    textTransform: 'uppercase' as const,
    color: 'var(--panel-title-color, #666)',
    marginBottom: '4px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  label: {
    color: 'var(--panel-label-color, #333)',
    flex: '0 0 auto',
  },
  input: {
    flex: '1 1 auto',
    minWidth: '60px',
    maxWidth: '100px',
    padding: '4px 8px',
    border: 'var(--panel-input-border, 1px solid #ccc)',
    borderRadius: 'var(--panel-input-radius, 4px)',
    fontSize: 'inherit',
  },
  colorInput: {
    width: '32px',
    height: '32px',
    padding: '2px',
    border: 'var(--panel-input-border, 1px solid #ccc)',
    borderRadius: 'var(--panel-input-radius, 4px)',
    cursor: 'pointer',
  },
  select: {
    flex: '1 1 auto',
    minWidth: '100px',
    padding: '4px 8px',
    border: 'var(--panel-input-border, 1px solid #ccc)',
    borderRadius: 'var(--panel-input-radius, 4px)',
    fontSize: 'inherit',
    backgroundColor: 'white',
  },
};

export function PropertyPanel({
  className,
  style,
  classNames = {},
}: PropertyPanelProps) {
  const { canvas } = useCanvas();
  const {
    properties,
    setBorderColor,
    setBorderWidth,
    setBackgroundColor,
    setFontFamily,
    setFontSize,
    setFontColor,
  } = useSelectionProperties(canvas);

  const handleBorderWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setBorderWidth(value);
    }
  }, [setBorderWidth]);

  const handleFontSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setFontSize(value);
    }
  }, [setFontSize]);

  return (
    <div
      className={`${className || ''} ${classNames.root || ''}`.trim() || undefined}
      style={{ ...defaultStyles.root, ...style }}
    >
      {/* Shape Properties Section */}
      <div className={classNames.section} style={defaultStyles.section}>
        <div className={classNames.sectionTitle} style={defaultStyles.sectionTitle}>
          Shape
        </div>

        {/* Border Color */}
        <div className={classNames.row} style={defaultStyles.row}>
          <label className={classNames.label} style={defaultStyles.label}>
            Border
          </label>
          <input
            type="color"
            value={properties.borderColor === 'mixed' ? '#000000' : properties.borderColor}
            onChange={(e) => setBorderColor(e.target.value)}
            className={classNames.input}
            style={defaultStyles.colorInput}
            title="Border color"
          />
        </div>

        {/* Border Width */}
        <div className={classNames.row} style={defaultStyles.row}>
          <label className={classNames.label} style={defaultStyles.label}>
            Width
          </label>
          <input
            type="number"
            min={0}
            max={20}
            value={properties.borderWidth === 'mixed' ? '' : properties.borderWidth}
            onChange={handleBorderWidthChange}
            placeholder={properties.borderWidth === 'mixed' ? 'Mixed' : undefined}
            className={classNames.input}
            style={defaultStyles.input}
            title="Border width"
          />
        </div>

        {/* Background Color */}
        <div className={classNames.row} style={defaultStyles.row}>
          <label className={classNames.label} style={defaultStyles.label}>
            Fill
          </label>
          <input
            type="color"
            value={properties.backgroundColor === 'mixed' ? '#ffffff' : properties.backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className={classNames.input}
            style={defaultStyles.colorInput}
            title="Fill color"
          />
        </div>
      </div>

      {/* Text Properties Section - only shown when text is selected or for new text */}
      <div className={classNames.section} style={defaultStyles.section}>
        <div className={classNames.sectionTitle} style={defaultStyles.sectionTitle}>
          Text
        </div>

        {/* Font Family */}
        <div className={classNames.row} style={defaultStyles.row}>
          <label className={classNames.label} style={defaultStyles.label}>
            Font
          </label>
          <select
            value={properties.fontFamily === 'mixed' ? '' : properties.fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className={classNames.select}
            style={defaultStyles.select}
            title="Font family"
          >
            {properties.fontFamily === 'mixed' && (
              <option value="" disabled>Mixed</option>
            )}
            {PRESET_FONTS.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className={classNames.row} style={defaultStyles.row}>
          <label className={classNames.label} style={defaultStyles.label}>
            Size
          </label>
          <input
            type="number"
            min={8}
            max={200}
            value={properties.fontSize === 'mixed' ? '' : properties.fontSize}
            onChange={handleFontSizeChange}
            placeholder={properties.fontSize === 'mixed' ? 'Mixed' : undefined}
            className={classNames.input}
            style={defaultStyles.input}
            title="Font size"
          />
        </div>

        {/* Font Color */}
        <div className={classNames.row} style={defaultStyles.row}>
          <label className={classNames.label} style={defaultStyles.label}>
            Color
          </label>
          <input
            type="color"
            value={properties.fontColor === 'mixed' ? '#000000' : properties.fontColor}
            onChange={(e) => setFontColor(e.target.value)}
            className={classNames.input}
            style={defaultStyles.colorInput}
            title="Font color"
          />
        </div>
      </div>
    </div>
  );
}
