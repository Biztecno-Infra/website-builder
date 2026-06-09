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
  { key: 'primary',    label: 'Primary Color',  desc: 'Buttons & icons'        },
  { key: 'accent',     label: 'Accent Color',   desc: 'Accent buttons'         },
  { key: 'text',       label: 'Text Color',     desc: 'Default text color'     },
  { key: 'light',      label: 'Light Color',    desc: 'Boxes & dividers'       },
  { key: 'sectionBg',  label: 'Section Bg',     desc: 'New section background' },
  { key: 'background', label: 'Page Bg',        desc: 'Page/body background'   },
];

interface Props {
  theme: SiteTheme;
  onUpdate: (updates: Partial<SiteTheme>) => void;
  onApplyTheme?: () => void;
}

function ColorCard({
  label, desc, value, onChange,
}: {
  label: string; desc: string; value: string; onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const safe = value?.startsWith('#') ? value : '#006e75';

  return (
    <div className={'pb-tc-card'} onClick={() => inputRef.current?.click()} title={`${label} — ${desc}`}>
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
        <span className={'pb-tc-hex'}>{safe.toUpperCase()}</span>
      </div>
    </div>
  );
}

function FontSelect({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className={'pb-font-pairing-row'}>
      <span className={'pb-font-pairing-label'}>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={'pb-font-pairing-select'}
        style={{ fontFamily: value }}
      >
        {FONT_OPTIONS.map(f => (
          <option key={f} value={f} style={{ fontFamily: f }}>
            {f.split(',')[0].replace(/'/g, '')}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ThemePanel({ theme, onUpdate, onApplyTheme }: Props) {
  const bodyFont = theme.fonts.body;
  const headingFont = theme.fonts.heading ?? theme.fonts.body;

  useEffect(() => {
    injectGoogleFont(bodyFont);
  }, [bodyFont]);

  useEffect(() => {
    injectGoogleFont(headingFont);
  }, [headingFont]);

  const updateColor = (key: keyof ThemeColors, value: string) =>
    onUpdate({ colors: { ...theme.colors, [key]: value } });

  return (
    <aside className={'pb-left-sidebar'}>
      <div className={'pb-sidebar-section-title'}>Site Theme</div>

      {/* ── Color palette ── */}
      <div className={'pb-prop-section'}>
        <div className={'pb-section-header'}>Color palette</div>
        <div className={'pb-section-content'}>
          <div className={'pb-tc-grid'}>
            {COLOR_FIELDS.map(({ key, label, desc }) => (
              <ColorCard
                key={key}
                label={label}
                desc={desc}
                value={theme.colors[key] ?? '#ffffff'}
                onChange={v => updateColor(key, v)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Font Pairings ── */}
      <div className={'pb-prop-section'}>
        <div className={'pb-section-header'}>Typography</div>
        <div className={'pb-section-content'}>
          <FontSelect
            label="Headings"
            value={headingFont}
            onChange={v => onUpdate({ fonts: { ...theme.fonts, heading: v } })}
          />
          <div className={'pb-font-preview'} style={{ fontFamily: headingFont }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
              {headingFont.split(',')[0].replace(/'/g, '')}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Aa Bb Cc 123</div>
          </div>
          <FontSelect
            label="Body"
            value={bodyFont}
            onChange={v => onUpdate({ fonts: { ...theme.fonts, body: v } })}
          />
          <div className={'pb-font-preview'} style={{ fontFamily: bodyFont }}>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
        </div>
      </div>

      {/* ── Apply ── */}
      {onApplyTheme && (
        <div className={'pb-prop-section'}>
          <div className={'pb-section-header'}>Apply to Canvas</div>
          <div className={'pb-section-content'}>
            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, margin: '0 0 10px' }}>
              Updates elements using the previous theme colors. Font changes apply everywhere.
            </p>
            <button className={'pb-apply-theme-btn'} onClick={onApplyTheme}>
              Apply Theme
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
