import type { CanvasElement } from '../types';

interface Props {
  selectedIds: string[];
  elements: Record<string, CanvasElement>;
  onUpdateElements: (updates: Array<{ id: string; changes: Partial<CanvasElement> }>) => void;
}

export function AlignmentToolbar({ selectedIds, elements, onUpdateElements }: Props) {
  const els = selectedIds.map(id => elements[id]).filter(Boolean);
  if (els.length < 2) return null;

  const lefts   = els.map(e => e.layout.x);
  const rights  = els.map(e => e.layout.x + e.layout.width);
  const tops    = els.map(e => e.layout.y);
  const bottoms = els.map(e => e.layout.y + e.layout.height);
  const minLeft   = Math.min(...lefts);
  const maxRight  = Math.max(...rights);
  const minTop    = Math.min(...tops);
  const maxBottom = Math.max(...bottoms);
  const centerH   = (minLeft + maxRight) / 2;
  const centerV   = (minTop + maxBottom) / 2;

  const align = (fn: (el: CanvasElement) => Partial<CanvasElement>) => {
    onUpdateElements(els.map(el => ({ id: el.id, changes: fn(el) })));
  };

  const totalW = els.reduce((s, e) => s + e.layout.width,  0);
  const totalH = els.reduce((s, e) => s + e.layout.height, 0);

  return (
    <div className="align-toolbar">
      <span className="align-toolbar-label">Align:</span>

      <button className="align-btn" title="Align Left"
        onClick={() => align(el => ({ layout: { ...el.layout, x: minLeft } }))}>⊢</button>
      <button className="align-btn" title="Center Horizontally"
        onClick={() => align(el => ({ layout: { ...el.layout, x: Math.round(centerH - el.layout.width / 2) } }))}>⊣⊢</button>
      <button className="align-btn" title="Align Right"
        onClick={() => align(el => ({ layout: { ...el.layout, x: maxRight - el.layout.width } }))}>⊣</button>

      <div className="align-toolbar-sep" />

      <button className="align-btn" title="Align Top"
        onClick={() => align(el => ({ layout: { ...el.layout, y: minTop } }))}>⊤</button>
      <button className="align-btn" title="Center Vertically"
        onClick={() => align(el => ({ layout: { ...el.layout, y: Math.round(centerV - el.layout.height / 2) } }))}>⊥⊤</button>
      <button className="align-btn" title="Align Bottom"
        onClick={() => align(el => ({ layout: { ...el.layout, y: maxBottom - el.layout.height } }))}>⊥</button>

      <div className="align-toolbar-sep" />

      <button className="align-btn" title="Distribute Horizontally" onClick={() => {
        const gap = (maxRight - minLeft - totalW) / Math.max(1, els.length - 1);
        const sorted = [...els].sort((a, b) => a.layout.x - b.layout.x);
        let cursor = minLeft;
        onUpdateElements(sorted.map(el => {
          const changes: Partial<CanvasElement> = { layout: { ...el.layout, x: Math.round(cursor) } };
          cursor += el.layout.width + gap;
          return { id: el.id, changes };
        }));
      }}>⇔</button>

      <button className="align-btn" title="Distribute Vertically" onClick={() => {
        const gap = (maxBottom - minTop - totalH) / Math.max(1, els.length - 1);
        const sorted = [...els].sort((a, b) => a.layout.y - b.layout.y);
        let cursor = minTop;
        onUpdateElements(sorted.map(el => {
          const changes: Partial<CanvasElement> = { layout: { ...el.layout, y: Math.round(cursor) } };
          cursor += el.layout.height + gap;
          return { id: el.id, changes };
        }));
      }}>⇕</button>
    </div>
  );
}
