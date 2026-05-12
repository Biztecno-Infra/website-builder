import type { SiteTheme, ThemeColors } from '../types';

const FONT_OPTIONS = [
  'Inter, sans-serif',
  'Arial, sans-serif',
  'Helvetica, Arial, sans-serif',
  'Roboto, sans-serif',
  "'Open Sans', sans-serif",
  'Lato, sans-serif',
  'Montserrat, sans-serif',
  'Poppins, sans-serif',
  'Georgia, serif',
  "'Times New Roman', serif",
  'Merriweather, serif',
];

const COLOR_FIELDS: Array<{ key: keyof ThemeColors; label: string }> = [
  { key: 'primary',    label: 'Primary'    },
  { key: 'secondary',  label: 'Secondary'  },
  { key: 'text',       label: 'Text'       },
  { key: 'light',      label: 'Light'      },
  { key: 'background', label: 'Background' },
  { key: 'accent',     label: 'Accent'     },
];

interface Props {
  theme: SiteTheme;
  onUpdate: (updates: Partial<SiteTheme>) => void;
  onApplyTheme?: () => void;
}

export function ThemePanel({ theme, onUpdate, onApplyTheme }: Props) {
  const updateColor = (key: keyof ThemeColors, value: string) => {
    onUpdate({ colors: { ...theme.colors, [key]: value } });
  };

  return (
    <aside className="left-sidebar">
      <div className="sidebar-section-title">Site Theme</div>

      <div className="prop-section">
        <div className="section-header">Brand Colors</div>
        <div className="theme-colors">
          {COLOR_FIELDS.map(({ key, label }) => (
            <div key={key} className="theme-color-row">
              <input
                type="color"
                value={theme.colors[key].startsWith('#') ? theme.colors[key] : '#006e75'}
                onChange={e => updateColor(key, e.target.value)}
                className="theme-color-swatch"
                title={label}
              />
              <span className="theme-color-label">{label}</span>
              <span className="theme-color-hex">{theme.colors[key]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="prop-section">
        <div className="section-header">Typography</div>
        <div className="prop-row full">
          <label>Heading Font</label>
          <select
            value={theme.fonts.heading}
            onChange={e => onUpdate({ fonts: { ...theme.fonts, heading: e.target.value } })}
          >
            {FONT_OPTIONS.map(f => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f.split(',')[0].replace(/'/g, '')}
              </option>
            ))}
          </select>
        </div>
        <div className="prop-row full">
          <label>Body Font</label>
          <select
            value={theme.fonts.body}
            onChange={e => onUpdate({ fonts: { ...theme.fonts, body: e.target.value } })}
          >
            {FONT_OPTIONS.map(f => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f.split(',')[0].replace(/'/g, '')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="prop-section">
        <div className="section-header">Preview</div>
        <div className="theme-preview" style={{ fontFamily: theme.fonts.body }}>
          <div style={{ fontFamily: theme.fonts.heading, fontSize: 18, fontWeight: 700,
            color: theme.colors.text, marginBottom: 6 }}>
            Heading Text
          </div>
          <div style={{ fontSize: 13, color: theme.colors.text, marginBottom: 10 }}>
            Body text sample in your chosen font.
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {COLOR_FIELDS.map(({ key, label }) => (
              <div key={key} title={label}
                style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: theme.colors[key],
                  border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
            ))}
          </div>
        </div>
      </div>

      {onApplyTheme && (
        <div className="prop-section">
          <div className="section-header">Apply</div>
          <p style={{ fontSize: 11, color: '#888', margin: '0 0 8px' }}>
            Push theme fonts &amp; colors onto all existing text and button elements on the canvas.
          </p>
          <button className="apply-theme-btn" onClick={onApplyTheme}>
            Apply Theme to Canvas
          </button>
        </div>
      )}
    </aside>
  );
}
