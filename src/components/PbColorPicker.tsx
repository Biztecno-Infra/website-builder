import { useRef, useState, useEffect, useCallback } from 'react';
import { Icon } from './Icon';

interface HSVA { h: number; s: number; v: number; a: number; }

function hexToHsva(hex: string): HSVA {
  const clean = hex.replace('#', '');
  let r = 0, g = 0, b = 0, a = 1;
  if (clean.length >= 6) {
    r = parseInt(clean.slice(0, 2), 16) / 255;
    g = parseInt(clean.slice(2, 4), 16) / 255;
    b = parseInt(clean.slice(4, 6), 16) / 255;
  }
  if (clean.length === 8) {
    a = parseInt(clean.slice(6, 8), 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max, a };
}

function hsvaToHex(h: number, s: number, v: number, a: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const toHex = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, '0');
  const base = `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`;
  return a < 1 ? `${base}${toHex(a)}` : base;
}

export interface PbColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  /** Show alpha slider (default: true) */
  alpha?: boolean;
  /** Optional preset color swatches */
  swatches?: string[];
  className?: string;
}

export function PbColorPicker({ value, onChange, alpha = true, swatches, className }: PbColorPickerProps) {
  const safe = /^#[0-9a-fA-F]{6,8}$/.test(value) ? value : '#000000';
  const [hsva, setHsva] = useState<HSVA>(() => hexToHsva(safe));
  const [hexInput, setHexInput] = useState(() => safe.slice(0, 7).toUpperCase());

  const gradRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const internalRef = useRef(false);

  useEffect(() => {
    if (internalRef.current) { internalRef.current = false; return; }
    const h = hexToHsva(safe);
    setHsva(h);
    setHexInput(safe.slice(0, 7).toUpperCase());
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = useCallback((next: HSVA) => {
    internalRef.current = true;
    setHsva(next);
    const hex = hsvaToHex(next.h, next.s, next.v, next.a);
    setHexInput(hex.slice(0, 7).toUpperCase());
    onChange(hex);
  }, [onChange]);

  const pickFromGradient = useCallback((e: PointerEvent | React.PointerEvent) => {
    const el = gradRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - left) / width));
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - top) / height));
    commit({ ...hsva, s, v });
  }, [hsva, commit]);

  const solidHue = hsvaToHex(hsva.h, 1, 1, 1);
  const solidCurrent = hsvaToHex(hsva.h, hsva.s, hsva.v, 1);

  return (
    <div className={['pb-cp pb-flex-col', className].filter(Boolean).join(' ')}>
      {/* SV gradient */}
      <div
        ref={gradRef}
        className="pb-cp-gradient"
        style={{ '--pb-cp-hue': solidHue } as React.CSSProperties}
        onPointerDown={e => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          pickFromGradient(e);
        }}
        onPointerMove={e => { if (dragging.current) pickFromGradient(e); }}
        onPointerUp={() => { dragging.current = false; }}
        onPointerCancel={() => { dragging.current = false; }}
      >
        <div
          className="pb-cp-thumb"
          style={{ left: `${hsva.s * 100}%`, top: `${(1 - hsva.v) * 100}%` }}
        />
      </div>

      {/* Hue + alpha sliders */}
      <div className="pb-cp-sliders pb-flex-col">
        <div className="pb-cp-hue-track">
          <input
            type="range" className="pb-cp-range"
            min={0} max={360} step={1}
            value={Math.round(hsva.h)}
            onChange={e => commit({ ...hsva, h: Number(e.target.value) })}
          />
        </div>
        {alpha && (
          <div className="pb-cp-alpha-track" style={{ '--pb-cp-solid': solidCurrent } as React.CSSProperties}>
            <input
              type="range" className="pb-cp-range"
              min={0} max={100} step={1}
              value={Math.round(hsva.a * 100)}
              onChange={e => commit({ ...hsva, a: Number(e.target.value) / 100 })}
            />
          </div>
        )}
      </div>

      {/* Hex + opacity + eyedropper — bordered row */}
      <div className="pb-cp-bottom">
        <span className="pb-cp-cur-swatch" style={{ background: safe }} />
        <input
          className="pb-cp-hex-input"
          value={hexInput}
          maxLength={7}
          spellCheck={false}
          onChange={e => {
            const v = e.target.value.toUpperCase();
            setHexInput(v);
            if (/^#[0-9A-F]{6}$/i.test(v)) {
              const next = hexToHsva(v);
              commit({ ...next, a: hsva.a });
            }
          }}
          onBlur={() => setHexInput(safe.slice(0, 7).toUpperCase())}
        />
        {alpha && (
          <input
            className="pb-cp-alpha-pct"
            value={`${Math.round(hsva.a * 100)}%`}
            onChange={e => {
              const n = parseInt(e.target.value.replace('%', ''), 10);
              if (!isNaN(n)) commit({ ...hsva, a: Math.max(0, Math.min(100, n)) / 100 });
            }}
          />
        )}
        <button
          type="button"
          className="pb-cp-eyedropper"
          title="Pick color from screen"
          onClick={async () => {
            if (!('EyeDropper' in window)) return;
            try {
              // @ts-ignore
              const { sRGBHex } = await new (window as any).EyeDropper().open();
              onChange(sRGBHex);
            } catch {}
          }}
        >
          <Icon id="colorPicker" size={16} />
        </button>
      </div>

      {/* Divider */}
      {swatches && swatches.length > 0 && <div className="pb-cp-divider" />}

      {/* Swatches */}
      {swatches && swatches.length > 0 && (
        <div className="pb-cp-swatches">
          {swatches.map((s, i) => (
            <button
              key={i}
              type="button"
              className="pb-cp-swatch"
              style={{ background: s }}
              title={s}
              onClick={() => onChange(s)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
