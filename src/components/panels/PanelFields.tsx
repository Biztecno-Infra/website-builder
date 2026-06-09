import type { Border, BgType, Padding, Shadow, SectionBackground, SiteTheme } from '../../types';
import { ThemeSwatches } from './ThemeSwatches';

// ── Color field: swatch + hex combined (matches PDF design) ──────────────────

export function ColorField({ value, onChange, onFocus, onBlur }: {
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const safe = /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : '#000000';
  return (
    <label className="pb-color-field">
      <span className="pb-color-swatch-wrap">
        <span className="pb-color-swatch-preview" style={{ background: safe }} />
        <input type="color" value={safe.slice(0, 7)} className="pb-color-swatch-input"
          onFocus={onFocus} onBlur={onBlur}
          onChange={e => onChange(e.target.value)} />
      </span>
      <span className="pb-color-hex-text">{safe.toUpperCase()}</span>
    </label>
  );
}

// ── Number input with attached px unit box ───────────────────────────────────

export function PxInput({ value, onChange, onFocus, onBlur, min, max, placeholder }: {
  value: number | string;
  onChange: (v: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <div className="pb-px-field">
      <input type="number" value={value} min={min} max={max} placeholder={placeholder}
        onFocus={onFocus} onBlur={onBlur}
        onChange={e => onChange(Number(e.target.value))} />
      <span className="pb-px-unit">px</span>
    </div>
  );
}

// ── Button toggle group (Free/Grid, Filled/Outline, etc.) ────────────────────

export function ToggleGroup({ options, value, onChange }: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="pb-toggle-group">
      {options.map(opt => (
        <button key={opt.value}
          className={['pb-toggle-btn', value === opt.value && 'pb-active'].filter(Boolean).join(' ')}
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
      <div className="pb-trbl-header">
        <span />
        <span>Top</span><span>Right</span><span>Bottom</span><span>Left</span>
        <span />
      </div>
      {margin && onMarginChange && (
        <div className="pb-trbl-row">
          <span className="pb-trbl-label">Margin</span>
          {SIDES.map(s => (
            <input key={s} type="number" className="pb-trbl-input" value={margin[s]}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onMarginChange(s, Number(e.target.value))} />
          ))}
          <span className="pb-trbl-unit">px</span>
        </div>
      )}
      {padding && onPaddingChange && (
        <div className="pb-trbl-row">
          <span className="pb-trbl-label">Padding</span>
          {SIDES.map(s => (
            <input key={s} type="number" className="pb-trbl-input" value={padding[s]}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onPaddingChange(s, Number(e.target.value))} />
          ))}
          <span className="pb-trbl-unit">px</span>
        </div>
      )}
    </>
  );
}

// ── Shadow editor — no Enable checkbox, always show all fields ───────────────

export function ShadowEditor({ shadow, onChange, onFocus, onBlur }: {
  shadow: Shadow;
  onChange: (updates: Partial<Shadow>) => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const update = (updates: Partial<Shadow>) => onChange({ ...updates, enabled: true });
  return (
    <>
      {(['x', 'y', 'blur', 'spread'] as const).map(k => (
        <div key={k} className="pb-prop-row">
          <label>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
          <input type="number" value={shadow[k]}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => update({ [k]: Number(e.target.value) })} />
        </div>
      ))}
      <div className="pb-prop-row">
        <label>Color</label>
        <ColorField
          value={shadow.color?.startsWith('#') ? shadow.color : '#000000'}
          onChange={v => update({ color: v })}
          onFocus={onFocus} onBlur={onBlur} />
      </div>
    </>
  );
}

// ── Border editor — always shows Width / Radius / Color ──────────────────────

export function BorderEditor({ border, onChange, onFocus, onBlur }: {
  border: Border;
  onChange: (updates: Partial<Border>) => void;
  onFocus: () => void;
  onBlur: () => void;
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
          onFocus={onFocus} onBlur={onBlur} />
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
  return (
    <>
      <div className="pb-prop-row">
        <label>Type</label>
        <select value={bg.type} onChange={e => { onPushSnapshot(); onChange({ type: e.target.value as BgType }); }}>
          <option value="solid">Solid</option>
          <option value="linear-gradient">Linear Gradient</option>
          <option value="radial-gradient">Radial Gradient</option>
          <option value="transparent">Transparent</option>
        </select>
      </div>

      {bg.type === 'solid' && bg.color !== 'transparent' && (
        <>
          <div className="pb-prop-row">
            <label>Color</label>
            <ColorField value={safeColor} onChange={v => onChange({ color: v })} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(); onChange({ color: c }); }} />
        </>
      )}

      {(bg.type === 'linear-gradient' || bg.type === 'radial-gradient') && (
        <>
          <div className="pb-prop-row">
            <label>From</label>
            <ColorField value={bg.from || '#006e75'} onChange={v => onChange({ from: v })} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(); onChange({ from: c }); }} />
          <div className="pb-prop-row">
            <label>To</label>
            <ColorField value={bg.to || '#0b978e'} onChange={v => onChange({ to: v })} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(); onChange({ to: c }); }} />
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
        <input type="text" value={bg.image || ''} placeholder="https://..."
          onFocus={onFocus} onBlur={onBlur}
          onChange={e => onChange({ image: e.target.value })} />
      </div>

      {bg.image && (
        <>
          <div className="pb-prop-row">
            <label>Image Position</label>
            <select value={bg.position || 'center'} onChange={e => onChange({ position: e.target.value })}>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="center">Center</option>
            </select>
          </div>
          <div className="pb-prop-row">
            <label>Overlay</label>
            <input type="number" value={bg.overlay ?? 0} min={0} max={1} step={0.05}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ overlay: Math.max(0, Math.min(1, Number(e.target.value))) })} />
          </div>
        </>
      )}
    </>
  );
}
