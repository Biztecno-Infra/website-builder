import { useState, useRef, useEffect, type ReactNode } from 'react';

import type { Border, BgType, Padding, Shadow, SectionBackground, SiteTheme } from '../../types';
import { PbInput } from '../PbInput';
import { PbSelect } from '../PbSelect';
import { PbColorPicker } from '../PbColorPicker';
import {
  BG_TYPE_WITH_TRANSPARENT_OPTIONS,
  BG_IMAGE_POSITION_OPTIONS,
} from '../../utils/selectOptions';

export function themeToSwatches(theme: SiteTheme): string[] {
  const c = theme.colors;
  return [c.primary, c.accent, c.text, c.light, c.background, c.sectionBg].filter(Boolean) as string[];
}

// ── Color field: swatch + hex, opens PbColorPicker popup on click ─────────────

export function ColorField({ value, onChange, onFocus, onBlur, swatches }: {
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  swatches?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const PICKER_H = 380;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapRef.current && !wrapRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest?.('.pb-cpf-popup')
      ) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onBlur]);

  const safe = /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : '#000000';

  const handleToggle = () => {
    if (open) { setOpen(false); onBlur?.(); return; }
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const right = window.innerWidth - rect.right;
      if (spaceBelow < PICKER_H && rect.top > PICKER_H) {
        setPos({ bottom: window.innerHeight - rect.top + 4, right });
      } else {
        setPos({ top: rect.bottom + 4, right });
      }
    }
    onFocus?.();
    setOpen(true);
  };

  return (
    <div className="pb-cpf" ref={wrapRef}>
      <label className="pb-color-field" onClick={handleToggle}>
        <span className="pb-color-swatch-wrap">
          <span className="pb-color-swatch-preview" style={{ background: safe }} />
        </span>
        <span className="pb-color-hex-text">{safe.slice(0, 7).toUpperCase()}</span>
      </label>
      {open && pos && (
        <div className="pb-cpf-popup" style={{ top: pos.top, bottom: pos.bottom, right: pos.right }}>
          <PbColorPicker value={value} onChange={onChange} swatches={swatches} />
        </div>
      )}
    </div>
  );
}

// ── Number input with attached px unit box ───────────────────────────────────

export function PxInput({ value, onChange, onFocus, onBlur, placeholder, unit = 'px', step, disabled, min, max }: {
  value: number | string;
  onChange: (v: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  unit?: string;
  step?: number;
  disabled?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div className="pb-px-field">
      <PbInput type="number" value={value} placeholder={placeholder} step={step} disabled={disabled}
        min={min} max={max}
        onFocus={onFocus} onBlur={onBlur}
        onChange={e => onChange(Number(e.target.value))} />
      <span className="pb-px-unit">{unit}</span>
    </div>
  );
}

// ── Button toggle group (Free/Grid, Filled/Outline, etc.) ────────────────────

export function ToggleGroup({ options, value, onChange }: {
  options: Array<{ value: string; label: ReactNode; title?: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="pb-toggle-group">
      {options.map(opt => (
        <button key={opt.value}
          className={['pb-toggle-btn', value === opt.value && 'pb-active'].filter(Boolean).join(' ')}
          title={opt.title}
          onClick={() => onChange(opt.value)}
        >{opt.label}</button>
      ))}
    </div>
  );
}

// ── TRBL Spacing editor (Margin + optional Padding) ──────────────────────────

const SIDES = ['top', 'right', 'bottom', 'left'] as const;

export function SpacingEditor({ margin, onMarginChange, padding, onPaddingChange, onFocus, onBlur }: {
  margin?: Padding;
  onMarginChange?: (key: keyof Padding, val: number) => void;
  padding?: Padding;
  onPaddingChange?: (key: keyof Padding, val: number) => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <>
      <div className="pb-trbl-col-labels">
        {(['Top', 'Right', 'Bottom', 'Left'] as const).map(s => <span key={s}>{s}</span>)}
        <span className="pb-trbl-px-spacer" />
      </div>
      {margin && onMarginChange && (
        <>
          <div className="pb-trbl-row-label">Margin</div>
          <div className="pb-trbl-inputs">
            {SIDES.map(s => (
              <PbInput key={s} type="number" className="pb-trbl-input" value={margin[s]}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => onMarginChange(s, Number(e.target.value))} />
            ))}
            <span className="pb-trbl-px-cell">px</span>
          </div>
        </>
      )}
      {padding && onPaddingChange && (
        <>
          <div className="pb-trbl-row-label">Padding</div>
          <div className="pb-trbl-inputs">
            {SIDES.map(s => (
              <PbInput key={s} type="number" className="pb-trbl-input" value={padding[s]}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => onPaddingChange(s, Number(e.target.value))} />
            ))}
            <span className="pb-trbl-px-cell">px</span>
          </div>
        </>
      )}
    </>
  );
}

// ── Shadow editor — no Enable checkbox, always show all fields ───────────────

export function ShadowEditor({ shadow, onChange, onFocus, onBlur, swatches }: {
  shadow: Shadow;
  onChange: (updates: Partial<Shadow>) => void;
  onFocus: () => void;
  onBlur: () => void;
  swatches?: string[];
}) {
  const update = (updates: Partial<Shadow>) => onChange({ ...updates, enabled: true });
  return (
    <>
      {(['x', 'y', 'blur', 'spread'] as const).map(k => (
        <div key={k} className="pb-prop-row">
          <label>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
          <PbInput type="number" value={shadow[k]}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => update({ [k]: Number(e.target.value) })} />
        </div>
      ))}
      <div className="pb-prop-row">
        <label>Color</label>
        <ColorField
          value={shadow.color?.startsWith('#') ? shadow.color : '#000000'}
          onChange={v => update({ color: v })}
          onFocus={onFocus} onBlur={onBlur}
          swatches={swatches} />
      </div>
    </>
  );
}

// ── Border editor — always shows Width / Radius / Color ──────────────────────

export function BorderEditor({ border, onChange, onFocus, onBlur, swatches }: {
  border: Border;
  onChange: (updates: Partial<Border>) => void;
  onFocus: () => void;
  onBlur: () => void;
  swatches?: string[];
}) {
  return (
    <>
      <div className="pb-prop-row">
        <label>Width</label>
        <PxInput value={border.width} min={0} onFocus={onFocus} onBlur={onBlur}
          onChange={v => onChange({ width: v, ...(v > 0 && border.style === 'none' ? { style: 'solid' as const } : {}) })} />
      </div>
      <div className="pb-prop-row">
        <label>Radius</label>
        <PxInput value={border.radius} min={0} onFocus={onFocus} onBlur={onBlur}
          onChange={v => onChange({ radius: v })} />
      </div>
      <div className="pb-prop-row">
        <label>Color</label>
        <ColorField
          value={border.color?.startsWith('#') ? border.color : '#cccccc'}
          onChange={v => onChange({ color: v })}
          onFocus={onFocus} onBlur={onBlur}
          swatches={swatches} />
      </div>
    </>
  );
}

// ── Visibility editor — "Hide on tab" / "Hide on mobile", checkbox on right ──

export function VisibilityEditor({ hideOnTablet, hideOnMobile, onTabletChange, onMobileChange }: {
  hideOnTablet: boolean;
  hideOnMobile: boolean;
  onTabletChange: (v: boolean) => void;
  onMobileChange: (v: boolean) => void;
}) {
  return (
    <>
      <div className="pb-prop-row pb-vis-row">
        <label>Hide on tab</label>
        <input type="checkbox" checked={hideOnTablet} onChange={e => onTabletChange(e.target.checked)} />
      </div>
      <div className="pb-prop-row pb-vis-row">
        <label>Hide on mobile</label>
        <input type="checkbox" checked={hideOnMobile} onChange={e => onMobileChange(e.target.checked)} />
      </div>
    </>
  );
}

// ── Background editor — full bg type/color/gradient/image ────────────────────

export function BackgroundEditor({ bg, onChange, onPushSnapshot, onFocus, onBlur, theme }: {
  bg: SectionBackground;
  onChange: (updates: Partial<SectionBackground>) => void;
  onPushSnapshot: () => void;
  onFocus: () => void;
  onBlur: () => void;
  theme: SiteTheme;
}) {
  const safeColor = bg.color?.startsWith('#') ? bg.color : '#ffffff';
  const swatches = themeToSwatches(theme);
  return (
    <>
      <div className="pb-prop-row">
        <label>Type</label>
        <PbSelect value={bg.type}
          options={BG_TYPE_WITH_TRANSPARENT_OPTIONS}
          onChange={v => { onPushSnapshot(); onChange({ type: v as BgType }); }} />
      </div>

      {bg.type === 'solid' && bg.color !== 'transparent' && (
        <div className="pb-prop-row">
          <label>Color</label>
          <ColorField value={safeColor} onChange={v => onChange({ color: v })} onFocus={onFocus} onBlur={onBlur} swatches={swatches} />
        </div>
      )}

      {(bg.type === 'linear-gradient' || bg.type === 'radial-gradient') && (
        <>
          <div className="pb-prop-row">
            <label>From</label>
            <ColorField value={bg.from || '#006e75'} onChange={v => onChange({ from: v })} onFocus={onFocus} onBlur={onBlur} swatches={swatches} />
          </div>
          <div className="pb-prop-row">
            <label>To</label>
            <ColorField value={bg.to || '#0b978e'} onChange={v => onChange({ to: v })} onFocus={onFocus} onBlur={onBlur} swatches={swatches} />
          </div>
          {bg.type === 'linear-gradient' && (
            <div className="pb-prop-row">
              <label>Angle</label>
              <PxInput value={bg.angle ?? 135} min={0} max={360} onFocus={onFocus} onBlur={onBlur}
                onChange={v => onChange({ angle: v })} />
            </div>
          )}
        </>
      )}

      <div className="pb-prop-row pb-full">
        <label>Image url</label>
        <PbInput type="text" variant="plain" value={bg.image || ''} placeholder="https://..."
          onFocus={onFocus} onBlur={onBlur}
          onChange={e => onChange({ image: e.target.value })} />
      </div>

      {bg.image && (
        <>
          <div className="pb-prop-row">
            <label>Image Position</label>
            <PbSelect value={bg.position || 'center'}
              options={BG_IMAGE_POSITION_OPTIONS}
              onChange={v => onChange({ position: v })} />
          </div>
          <div className="pb-prop-row">
            <label>Overlay</label>
            <PbInput type="number" value={bg.overlay ?? 0} min={0} max={1} step={0.05}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ overlay: Math.max(0, Math.min(1, Number(e.target.value))) })} />
          </div>
        </>
      )}
    </>
  );
}
