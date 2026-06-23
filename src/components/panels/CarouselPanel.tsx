import { useRef } from 'react';
import type { Breakpoint, BuilderState, Carousel, GridCell, NodeMap } from '../../types';
import { IconButton } from '../IconButton';

interface Props {
  carousel: Carousel;
  nodes: NodeMap;
  snapshot: BuilderState;
  breakpoint?: Breakpoint;
  selectedSlideId?: string | null;
  onUpdateCarousel: (id: string, updates: Partial<Omit<Carousel, 'id' | 'type' | 'parent' | 'children'>>) => void;
  onUpdateCarouselResponsive: (id: string, bp: Breakpoint, updates: { height?: number; minHeight?: number; hidden?: boolean }) => void;
  onAddSlide: (carouselId: string, afterSlideId?: string) => void;
  onDeleteSlide: (slideId: string) => void;
  onDuplicateSlide: (slideId: string) => void;
  onReorderSlide: (carouselId: string, fromIndex: number, toIndex: number) => void;
  onSetActiveSlide: (carouselId: string, index: number) => void;
  onSelectSlide: (slideId: string) => void;
  onPushSnapshot: (snapshot: BuilderState) => void;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="pb-flex-between pb-panel-row pb-interactive">
      <span style={{ fontSize: 12, color: '#334' }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  );
}

function NumberField({ label, value, min, max, step = 1, suffix, onCommitStart, onChange }: {
  label: string; value: number; min?: number; max?: number; step?: number; suffix?: string;
  onCommitStart: () => void; onChange: (v: number) => void;
}) {
  return (
    <div className="pb-flex-between pb-panel-row">
      <span style={{ fontSize: 12, color: '#334' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="number" value={value} min={min} max={max} step={step}
          style={{ width: 64, padding: '4px 6px', border: '1px solid #d6dee8', borderRadius: 4, fontSize: 12 }}
          onFocus={onCommitStart}
          onChange={e => onChange(Number(e.target.value))}
        />
        {suffix && <span style={{ fontSize: 11, color: '#94a3b8' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ColorField({ label, value, onCommitStart, onChange }: {
  label: string; value: string; onCommitStart: () => void; onChange: (v: string) => void;
}) {
  return (
    <div className="pb-flex-between pb-panel-row">
      <span style={{ fontSize: 12, color: '#334' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="color" value={value}
          style={{ width: 28, height: 24, padding: 0, border: '1px solid #d6dee8', borderRadius: 4, cursor: 'pointer', background: 'none' }}
          onFocus={onCommitStart}
          onChange={e => onChange(e.target.value)}
        />
        <input
          type="text" value={value}
          style={{ width: 72, padding: '4px 6px', border: '1px solid #d6dee8', borderRadius: 4, fontSize: 12 }}
          onFocus={onCommitStart}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function CarouselPanel({
  carousel, nodes, snapshot, breakpoint = 'desktop', selectedSlideId,
  onUpdateCarousel, onUpdateCarouselResponsive,
  onAddSlide, onDeleteSlide, onDuplicateSlide, onReorderSlide, onSetActiveSlide, onSelectSlide,
  onPushSnapshot,
}: Props) {
  const focusSnapshot = useRef<BuilderState | null>(null);
  const onFocus = () => { if (!focusSnapshot.current) focusSnapshot.current = snapshot; };
  const flushFocus = () => { if (focusSnapshot.current) { onPushSnapshot(focusSnapshot.current); focusSnapshot.current = null; } };

  const p = carousel.props;
  const commit = () => onPushSnapshot(snapshot);
  const setProps = (updates: Partial<typeof p>, withSnapshot = true) => {
    if (withSnapshot) commit();
    onUpdateCarousel(carousel.id, { props: { ...p, ...updates } });
  };

  const slides = carousel.children
    .map(id => nodes[id] as GridCell | undefined)
    .filter((c): c is GridCell => !!c);
  const active = Math.max(0, Math.min(slides.length - 1, carousel.activeSlide ?? 0));

  // Responsive height — desktop writes layout.height, tablet/mobile write responsive override
  const r = carousel.responsive ?? {};
  const effHeight =
    breakpoint === 'mobile' ? (r.mobile?.height ?? r.tablet?.height ?? carousel.layout.height) :
    breakpoint === 'tablet' ? (r.tablet?.height ?? carousel.layout.height) :
    carousel.layout.height;
  const heightOverridden =
    (breakpoint === 'tablet' && r.tablet?.height !== undefined) ||
    (breakpoint === 'mobile' && r.mobile?.height !== undefined);

  return (
    <aside className={'pb-right-sidebar pb-flex-col'} onBlur={flushFocus}>
      <div className={'pb-panel-header'}>
        <span className={'pb-panel-header-title'}>Carousel</span>
      </div>

      {/* ── General ── */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e9eef4' }}>
        <div className="pb-panel-label">General</div>
        <Toggle label="Autoplay" checked={p.autoplay} onChange={v => setProps({ autoplay: v })} />
        {p.autoplay && (
          <NumberField
            label="Interval" value={p.autoplayInterval} min={1} max={30} suffix="s"
            onCommitStart={onFocus}
            onChange={v => setProps({ autoplayInterval: Math.max(1, v) }, false)}
          />
        )}
        <Toggle label="Loop" checked={p.loop} onChange={v => setProps({ loop: v })} />
        <Toggle label="Pause on hover" checked={p.pauseOnHover ?? true} onChange={v => setProps({ pauseOnHover: v })} />
        <NumberField
          label="Transition" value={p.transitionDuration ?? 400} min={100} max={2000} step={50} suffix="ms"
          onCommitStart={onFocus}
          onChange={v => setProps({ transitionDuration: Math.max(100, Math.min(2000, v)) }, false)}
        />
        <Toggle label="Show arrows" checked={p.showArrows} onChange={v => setProps({ showArrows: v })} />
        <Toggle label="Show dots / indicators" checked={p.showDots} onChange={v => setProps({ showDots: v })} />
        {p.showDots && (
          <ColorField
            label="Dot color"
            value={p.dotColor ?? '#ffffff'}
            onCommitStart={onFocus}
            onChange={v => setProps({ dotColor: v }, false)}
          />
        )}
      </div>

      {/* ── Layout ── */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e9eef4' }}>
        <div className="pb-panel-label pb-flex-between">
          <span>Layout{breakpoint !== 'desktop' ? ` · ${breakpoint}` : ''}</span>
          {heightOverridden && (
            <button
              onClick={() => {
                commit();
                onUpdateCarouselResponsive(carousel.id, breakpoint, { height: undefined });
              }}
              style={{ fontSize: 10, color: '#0b978e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >reset</button>
          )}
        </div>
        <NumberField
          label="Height" value={effHeight} min={80} max={2000} suffix="px"
          onCommitStart={onFocus}
          onChange={v => onUpdateCarouselResponsive(carousel.id, breakpoint, { height: Math.max(80, v) })}
        />
      </div>

      {/* ── Slides ── */}
      <div style={{ padding: '8px 12px' }}>
        <div className="pb-panel-label pb-flex-between">
          <span>Slides ({slides.length})</span>
          <button
            onClick={() => onAddSlide(carousel.id)}
            style={{ fontSize: 11, color: '#fff', background: '#0b978e', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontWeight: 600 }}
          >+ Add Slide</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {slides.map((slide, i) => {
            const isActive = i === active;
            const isSelected = selectedSlideId === slide.id;
            return (
              <div
                key={slide.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 5,
                  border: `1px solid ${isSelected ? '#0b978e' : '#e3e9f0'}`,
                  background: isSelected ? 'rgba(11,151,142,0.06)' : isActive ? '#f7fafc' : '#fff',
                  cursor: 'pointer',
                }}
                onClick={() => { onSetActiveSlide(carousel.id, i); onSelectSlide(slide.id); }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334', flex: 1 }}>
                  Slide {i + 1}{isActive ? ' ·' : ''}
                </span>
                <IconButton variant="ghost" title="Move up" disabled={i === 0}
                  onClick={e => { e.stopPropagation(); onReorderSlide(carousel.id, i, i - 1); }}>↑</IconButton>
                <IconButton variant="ghost" title="Move down" disabled={i === slides.length - 1}
                  onClick={e => { e.stopPropagation(); onReorderSlide(carousel.id, i, i + 1); }}>↓</IconButton>
                <IconButton variant="ghost" title="Duplicate slide"
                  onClick={e => { e.stopPropagation(); onDuplicateSlide(slide.id); }}>⧉</IconButton>
                <IconButton variant="danger" title="Delete slide" disabled={slides.length <= 1}
                  onClick={e => { e.stopPropagation(); onDeleteSlide(slide.id); }}>✕</IconButton>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
