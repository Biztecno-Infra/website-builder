import { useEffect, useRef } from 'react';
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

const COLOR_FIELDS: Array<{
  key: keyof ThemeColors;
  label: string;
  desc: string;
}> = [
  { key: 'primary',    label: 'Primary',     desc: 'Buttons & icons'           },
  { key: 'accent',     label: 'Accent',      desc: 'Accent buttons'            },
  { key: 'text',       label: 'Text',        desc: 'Default text color'        },
  { key: 'background', label: 'Page Bg',     desc: 'Page/body background'      },
  { key: 'light',      label: 'Light',       desc: 'Boxes & dividers'          },
  { key: 'sectionBg',  label: 'Section Bg',  desc: 'New section background'    },
];

interface Props {
  theme: SiteTheme;
  onUpdate: (updates: Partial<SiteTheme>) => void;
  onApplyTheme?: () => void;
}

function ColorCard({
  colorKey, label, desc, value, onChange,
}: {
  colorKey: string; label: string; desc: string; value: string; onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const safe = value?.startsWith('#') ? value : '#006e75';

  return (
    <div className={'pb-tc-card'} onClick={() => inputRef.current?.click()} title={`Change ${label}`}>
      <div className={'pb-tc-swatch'} style={{ background: safe }}>
        <input
          ref={inputRef}
          type="color"
          value={safe}
          onChange={e => onChange(e.target.value)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          tabIndex={-1}
          onClick={e => e.stopPropagation()}
        />
      </div>
      <div className={'pb-tc-info'}>
        <span className={'pb-tc-label'}>{label}</span>
        <span className={'pb-tc-hex'}>{safe}</span>
        <span className={'pb-tc-desc'}>{desc}</span>
      </div>
    </div>
  );
}

export function ThemePanel({ theme, onUpdate, onApplyTheme }: Props) {
  useEffect(() => {
    injectGoogleFont(theme.fonts.body);
  }, [theme.fonts.body]);

  const updateColor = (key: keyof ThemeColors, value: string) =>
    onUpdate({ colors: { ...theme.colors, [key]: value } });

  return (
    <aside className={'pb-left-sidebar'}>
      <div className={'pb-sidebar-section-title'}>Site Theme</div>

      {/* ── Colors ── */}
      <div className={'pb-prop-section'}>
        <div className={'pb-section-header'}>Colors</div>
        <div className={'pb-tc-grid'}>
          {COLOR_FIELDS.map(({ key, label, desc }) => (
            <ColorCard
              key={key}
              colorKey={key}
              label={label}
              desc={desc}
              value={theme.colors[key] ?? '#ffffff'}
              onChange={v => updateColor(key, v)}
            />
          ))}
        </div>
      </div>

      {/* ── Font ── */}
      <div className={'pb-prop-section'}>
        <div className={'pb-section-header'}>Font</div>
        <select
          value={theme.fonts.body}
          onChange={e => onUpdate({ fonts: { body: e.target.value } })}
          style={{ width: '100%', fontSize: 12, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4 }}
        >
          {FONT_OPTIONS.map(f => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f.split(',')[0].replace(/'/g, '')}
            </option>
          ))}
        </select>
        <div style={{ marginTop: 8, padding: '10px 12px', background: '#f8fafc', borderRadius: 6, fontFamily: theme.fonts.body }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Aa — {theme.fonts.body.split(',')[0].replace(/'/g, '')}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>The quick brown fox jumps over the lazy dog</div>
        </div>
      </div>

      {/* ── Apply ── */}
      {onApplyTheme && (
        <div className={'pb-prop-section'}>
          <div className={'pb-section-header'}>Apply to Canvas</div>
          <p style={{ fontSize: 11, color: '#888', lineHeight: 1.5, margin: '0 0 10px' }}>
            Updates elements that were created with the previous theme colors. Font updates everywhere.
          </p>
          <button className={'pb-apply-theme-btn'} onClick={onApplyTheme}>
            Apply Theme
          </button>
        </div>
      )}
    </aside>
  );
}
