import { useEffect } from 'react';
import type { SiteTheme, ThemeColors } from '../types';
import { injectGoogleFont } from '../utils/fonts';

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
  useEffect(() => {
    injectGoogleFont(theme.fonts.body);
  }, [theme.fonts.body]);

  const updateColor = (key: keyof ThemeColors, value: string) => {
    onUpdate({ colors: { ...theme.colors, [key]: value } });
  };

  return (
    <aside className={'pb-left-sidebar'}>
      <div className={'pb-sidebar-section-title'}>Site Theme</div>

      <div className={'pb-prop-section'}>
        <div className={'pb-section-header'}>Brand Colors</div>
        <div className={'pb-theme-colors'}>
          {COLOR_FIELDS.map(({ key, label }) => (
            <div key={key} className={'pb-theme-color-row'}>
              <input
                type="color"
                value={(theme.colors[key] ?? '#006e75').startsWith('#') ? theme.colors[key] : '#006e75'}
                onChange={e => updateColor(key, e.target.value)}
                className={'pb-theme-color-swatch'}
                title={label}
              />
              <span className={'pb-theme-color-label'}>{label}</span>
              <span className={'pb-theme-color-hex'}>{theme.colors[key]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={'pb-prop-section'}>
        <div className={'pb-section-header'}>Section Background</div>
        <p style={{ fontSize: 11, color: '#888', margin: '0 0 8px' }}>
          Applied to all sections when you click "Apply Theme to Canvas".
        </p>
        <div className={'pb-theme-colors'}>
          <div className={'pb-theme-color-row'}>
            <input
              type="color"
              value={(theme.colors.sectionBg ?? '#ffffff').startsWith('#') ? theme.colors.sectionBg : '#ffffff'}
              onChange={e => updateColor('sectionBg', e.target.value)}
              className={'pb-theme-color-swatch'}
              title="Section Background"
            />
            <span className={'pb-theme-color-label'}>Color</span>
            <span className={'pb-theme-color-hex'}>{theme.colors.sectionBg ?? '#ffffff'}</span>
          </div>
        </div>
      </div>

      <div className={'pb-prop-section'}>
        <div className={'pb-section-header'}>Typography</div>
        <div className={"pb-prop-row pb-full"}>
          <label>Site Font</label>
          <select
            value={theme.fonts.body}
            onChange={e => onUpdate({ fonts: { body: e.target.value } })}
          >
            {FONT_OPTIONS.map(f => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f.split(',')[0].replace(/'/g, '')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {onApplyTheme && (
        <div className={'pb-prop-section'}>
          <div className={'pb-section-header'}>Apply</div>
          <p style={{ fontSize: 11, color: '#888', margin: '0 0 8px' }}>
            Push theme fonts &amp; colors onto all existing text and button elements on the canvas.
          </p>
          <button className={'pb-apply-theme-btn'} onClick={onApplyTheme}>
            Apply Theme to Canvas
          </button>
        </div>
      )}
    </aside>
  );
}
