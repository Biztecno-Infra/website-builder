import { useEffect, useRef, useState } from 'react';
import type { SiteTheme, ThemeColors } from '../types';
import { PbSelect } from './PbSelect';
import { PbButton } from './PbButton';
import { PbColorPicker } from './PbColorPicker';
import { injectGoogleFont } from '../utils/fonts';
import { FONT_FAMILY_OPTIONS } from '../utils/selectOptions';
import { IconButton } from './IconButton';

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
  onClose?: () => void;
}

const PICKER_H = 380;

function ColorCard({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const safe = value?.startsWith('#') ? value : '#006e75';
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest?.('.pb-cpf-popup')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClick = () => {
    if (open) { setOpen(false); return; }
    const rect = pillRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const right = window.innerWidth - rect.right;
      if (spaceBelow < PICKER_H && rect.top > PICKER_H) {
        setPos({ bottom: window.innerHeight - rect.top + 4, right });
      } else {
        setPos({ top: rect.bottom + 4, right });
      }
    }
    setOpen(true);
  };

  return (
    <div className={'pb-tc-card pb-flex-row'}>
      <span className={'pb-tc-label'}>{label}</span>
      <div ref={pillRef}>
        <div className={'pb-tc-pill pb-flex-row'} onClick={handleClick}>
          <div className={'pb-tc-swatch'} style={{ background: safe }} />
          <span className={'pb-tc-hex'}>{safe.toUpperCase()}</span>
        </div>
        {open && pos && (
          <div className={'pb-cpf-popup'} style={{ top: pos.top, bottom: pos.bottom, right: pos.right }}>
            <PbColorPicker value={safe} onChange={onChange} />
          </div>
        )}
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
    <div className={'pb-font-pairing-row pb-flex-col'}>
      <span className={'pb-font-pairing-label'}>{label}</span>
      <PbSelect value={value} options={FONT_FAMILY_OPTIONS} onChange={onChange} size="md" searchable />
    </div>
  );
}


export function ThemePanel({ theme, onUpdate, onApplyTheme, onClose }: Props) {
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
    <aside className={'pb-left-sidebar pb-flex-col'}>
      <div className={'pb-blocks-header pb-flex-between'}>
        <span className={'pb-blocks-header-title'}>Site Theme</span>
        <IconButton variant="close" onClick={onClose} title="Close">✕</IconButton>
      </div>

      {/* ── Color palette ── */}
      <div className={'pb-prop-section'}>
        <div className={'pb-section-header'}>Color palette</div>
        <div className={'pb-section-content pb-section-content--flush'}>
          <div className={'pb-tc-grid pb-flex-col'}>
            {COLOR_FIELDS.map(({ key, label }) => (
              <ColorCard
                key={key}
                label={label}
                value={theme.colors[key] ?? '#ffffff'}
                onChange={v => updateColor(key, v)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Font Pairings ── */}
      <div className={'pb-prop-section'}>
        <div className={'pb-section-header'}>Font Pairings</div>
        <div className={'pb-section-content'}>
          <FontSelect
            label="Headings"
            value={headingFont}
            onChange={v => onUpdate({ fonts: { ...theme.fonts, heading: v } })}
          />
          <FontSelect
            label="Body Text"
            value={bodyFont}
            onChange={v => onUpdate({ fonts: { ...theme.fonts, body: v } })}
          />
        </div>
      </div>

      {/* ── Apply ── */}
      {onApplyTheme && (
        <div className={'pb-prop-section'}>
          <div className={'pb-section-content'}>
            <PbButton fullWidth onClick={onApplyTheme}>Apply Theme</PbButton>
          </div>
        </div>
      )}
    </aside>
  );
}
