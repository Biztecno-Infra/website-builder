import React from 'react';

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  sectionWidth: number;
  sectionHeight: number;
}

export function DragGuides({ x, y, width, height, sectionWidth, sectionHeight }: Props) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const dTop    = y;
  const dBottom = sectionHeight - y - height;
  const dLeft   = x;
  const dRight  = sectionWidth - x - width;
  const MIN = 22;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9995, overflow: 'visible' }}>
      {dTop > 0 && (
        <div className="pb-drag-guide-v" style={{ left: cx, top: 0, height: dTop }}>
          {dTop >= MIN && <span className="pb-drag-guide-lbl pb-drag-guide-lbl--v" style={{ top: dTop / 2 }}>{Math.round(dTop)}</span>}
        </div>
      )}
      {dBottom > 0 && (
        <div className="pb-drag-guide-v" style={{ left: cx, top: y + height, height: dBottom }}>
          {dBottom >= MIN && <span className="pb-drag-guide-lbl pb-drag-guide-lbl--v" style={{ top: dBottom / 2 }}>{Math.round(dBottom)}</span>}
        </div>
      )}
      {dLeft > 0 && (
        <div className="pb-drag-guide-h" style={{ top: cy, left: 0, width: dLeft }}>
          {dLeft >= MIN && <span className="pb-drag-guide-lbl pb-drag-guide-lbl--h" style={{ left: dLeft / 2 }}>{Math.round(dLeft)}</span>}
        </div>
      )}
      {dRight > 0 && (
        <div className="pb-drag-guide-h" style={{ top: cy, left: x + width, width: dRight }}>
          {dRight >= MIN && <span className="pb-drag-guide-lbl pb-drag-guide-lbl--h" style={{ left: dRight / 2 }}>{Math.round(dRight)}</span>}
        </div>
      )}
      <div className="pb-drag-size-lbl" style={{ left: cx, top: y + height + 6 }}>
        {Math.round(width)} × {Math.round(height)}
      </div>
    </div>
  );
}
