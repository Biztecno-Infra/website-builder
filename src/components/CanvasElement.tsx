import React, { useEffect, useRef, useState } from 'react';
import type { CanvasElement as El, BuilderState, Breakpoint } from '../types';
import { richTextState } from '../utils/richTextState';
import { createCleanPasteHandler } from '../utils/cleanPaste';
import { ElementQuickBar } from './ElementQuickBar';
import { FormPreview } from './FormPreview';


export interface GuideLine { type: 'v' | 'h'; pos: number; }
export interface DragInfo { x: number; y: number; width: number; height: number; }

export interface ActiveCanvasDrag {
  id: string;
  fromSectionId: string;
  grabOffsetX: number;
  grabOffsetY: number;
}
export const canvasDragShared = {
  active: null as ActiveCanvasDrag | null,
  isCrossSection: false,
  zoom: 1,
};

export const dragState = {
  context: null as 'palette' | 'grid-element' | null,
};

interface Props {
  element: El;
  isSelected: boolean;
  isMultiSelected: boolean;
  onSelect: (shift: boolean) => void;
  onUpdate: (updates: Partial<El>) => void;
  onCommit: (prevSnapshot: BuilderState) => void;
  snapshot: BuilderState;
  snapEnabled: boolean;
  onContextMenu: (x: number, y: number) => void;
  sectionElements?: El[];
  onGuides?: (guides: GuideLine[], dragInfo?: DragInfo) => void;
  previewMode?: boolean;
  onDuplicate?: () => void;
  onDelete?: () => void;
  sectionId: string;
  /** active builder breakpoint — drives responsive in-element previews (e.g. Form field stacking) */
  breakpoint?: Breakpoint;
}

const SNAP = 8;
const HANDLE_DIRS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const;
type Dir = (typeof HANDLE_DIRS)[number];

const CURSOR: Record<Dir, string> = {
  nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', e: 'e-resize',
  se: 'se-resize', s: 's-resize', sw: 'sw-resize', w: 'w-resize',
};

function handlePos(dir: Dir): React.CSSProperties {
  const top  = dir.includes('n') ? 0 : dir.includes('s') ? '100%' : '50%';
  const left = dir.includes('w') ? 0 : dir.includes('e') ? '100%' : '50%';
  return { top, left };
}

function snap(v: number, enabled: boolean): number {
  if (!enabled) return Math.round(v);
  return Math.round(v / SNAP) * SNAP;
}

const GUIDE_THRESHOLD = 5;

function computeGuides(
  rawX: number, rawY: number, el: El, others: El[], snapEnabled: boolean,
): { nx: number; ny: number; guides: GuideLine[] } {
  const guides: GuideLine[] = [];
  let nx = snap(rawX, snapEnabled);
  let ny = snap(rawY, snapEnabled);
  let snapX: number | undefined;
  let snapY: number | undefined;

  const { width: elW, height: elH } = el.layout;
  const mL = rawX, mR = rawX + elW, mCX = rawX + elW / 2;
  const mT = rawY, mB = rawY + elH, mCY = rawY + elH / 2;

  for (const other of others) {
    if (other.id === el.id) continue;
    const { x: ox, y: oy, width: ow, height: oh } = other.layout;
    const oL = ox, oR = ox + ow, oCX = ox + ow / 2;
    const oT = oy, oB = oy + oh, oCY = oy + oh / 2;

    if (snapX === undefined) {
      const vPairs: [number, number][] = [
        [mL, oL], [mL, oR], [mL, oCX],
        [mR, oL], [mR, oR], [mR, oCX],
        [mCX, oL], [mCX, oR], [mCX, oCX],
      ];
      for (const [myVal, oVal] of vPairs) {
        if (Math.abs(myVal - oVal) < GUIDE_THRESHOLD) {
          snapX = oVal - (myVal - rawX);
          if (!guides.find(g => g.type === 'v' && g.pos === oVal))
            guides.push({ type: 'v', pos: oVal });
          break;
        }
      }
    }

    if (snapY === undefined) {
      const hPairs: [number, number][] = [
        [mT, oT], [mT, oB], [mT, oCY],
        [mB, oT], [mB, oB], [mB, oCY],
        [mCY, oT], [mCY, oB], [mCY, oCY],
      ];
      for (const [myVal, oVal] of hPairs) {
        if (Math.abs(myVal - oVal) < GUIDE_THRESHOLD) {
          snapY = oVal - (myVal - rawY);
          if (!guides.find(g => g.type === 'h' && g.pos === oVal))
            guides.push({ type: 'h', pos: oVal });
          break;
        }
      }
    }

    if (snapX !== undefined && snapY !== undefined) break;
  }

  if (snapX !== undefined) nx = snapX;
  if (snapY !== undefined) ny = snapY;
  return { nx, ny, guides };
}

export function CanvasElement({
  element: el, isSelected, isMultiSelected, onSelect, onUpdate, onCommit, snapshot, snapEnabled, onContextMenu,
  sectionElements, onGuides, previewMode, onDuplicate, onDelete, sectionId, breakpoint = 'desktop',
}: Props) {
  const [editing, setEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [animVisible, setAnimVisible] = useState(
    !previewMode || el.animation.type === 'none' || el.animation.trigger === 'load'
  );

  useEffect(() => {
    if (!previewMode || el.animation.type === 'none') return;
    if (el.animation.trigger === 'load') { setAnimVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [previewMode, el.animation.type, el.animation.trigger]);

  const handleBodyMouseDown = (e: React.MouseEvent) => {
    if (previewMode) return;
    if (e.button !== 0) return;
    e.stopPropagation();
    if (el.state.locked) { onSelect(e.shiftKey); return; }

    onSelect(e.shiftKey);

    const startX = e.clientX;
    const startY = e.clientY;
    const originX = el.layout.x;
    const originY = el.layout.y;
    const prevSnapshot = snapshot;
    let moved = false;
    const prevPointerEvents = wrapperRef.current?.style.pointerEvents;
    if (wrapperRef.current) wrapperRef.current.style.pointerEvents = 'none';

    const elRect = wrapperRef.current?.getBoundingClientRect();
    canvasDragShared.active = {
      id: el.id,
      fromSectionId: sectionId,
      grabOffsetX: e.clientX - (elRect?.left ?? 0),
      grabOffsetY: e.clientY - (elRect?.top ?? 0),
    };

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      moved = true;
      if (canvasDragShared.isCrossSection) return;

      const z = canvasDragShared.zoom;
      const di: DragInfo = { x: 0, y: 0, width: el.layout.width, height: el.layout.height };
      if (sectionElements && onGuides) {
        const { nx, ny, guides } = computeGuides(originX + dx / z, originY + dy / z, el, sectionElements, snapEnabled);
        di.x = nx; di.y = ny;
        onGuides(guides, di);
        onUpdate({ layout: { ...el.layout, x: nx, y: ny } });
      } else {
        const nx = snap(originX + dx / z, snapEnabled);
        const ny = snap(originY + dy / z, snapEnabled);
        di.x = nx; di.y = ny;
        onGuides?.([], di);
        onUpdate({ layout: { ...el.layout, x: nx, y: ny } });
      }
    };

    const onUp = () => {
      if (wrapperRef.current) wrapperRef.current.style.pointerEvents = prevPointerEvents ?? '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      onGuides?.([]);
      canvasDragShared.active = null;
      canvasDragShared.isCrossSection = false;
      if (moved) onCommit(prevSnapshot);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (el.type !== 'text' && el.type !== 'button') return;
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => {
      editRef.current?.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      if (editRef.current && sel) {
        range.selectNodeContents(editRef.current);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 0);
  };

  const handleEditBlur = () => {
    if (!editing) return;
    if (richTextState.applyingFormat) {
      // A sidebar formatting button was clicked — stay in edit mode and re-focus
      setTimeout(() => editRef.current?.focus(), 0);
      return;
    }
    const html = editRef.current?.innerHTML ?? '';
    const text = editRef.current?.innerText ?? '';
    onCommit(snapshot);
    if (el.type === 'text') onUpdate({ content: { ...el.content, rich: html, plain: text } });
    if (el.type === 'button') onUpdate({ content: { ...el.content, label: text } });
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (editRef.current) {
        if (el.type === 'button') editRef.current.innerText = el.content.label ?? '';
        else editRef.current.innerHTML = el.content.rich || el.content.plain || '';
      }
      setEditing(false);
    }
    if (e.key === 'Enter' && el.type === 'button') {
      e.preventDefault();
      handleEditBlur();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e.clientX, e.clientY);
  };

  const handleResizeMouseDown = (dir: Dir) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (el.state.locked) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const { x: ox, y: oy, width: ow, height: oh } = el.layout;
    const prevSnapshot = snapshot;

    const onMove = (ev: MouseEvent) => {
      const z = canvasDragShared.zoom;
      const dx = (ev.clientX - startX) / z;
      const dy = (ev.clientY - startY) / z;
      let x = ox, y = oy, w = ow, h = oh;

      // Dividers are meant to be thin lines, so allow them below the usual 20px floor.
      const minSize = el.type === 'divider' ? 1 : 20;

      if (dir.includes('e')) w = Math.max(minSize, ow + dx);
      if (dir.includes('s')) h = Math.max(minSize, oh + dy);
      if (dir.includes('w')) { w = Math.max(minSize, ow - dx); x = ox + ow - w; }
      if (dir.includes('n')) { h = Math.max(minSize, oh - dy); y = oy + oh - h; }

      onUpdate({ layout: { ...el.layout, x: snap(x, snapEnabled), y: snap(y, snapEnabled), width: snap(w, snapEnabled), height: snap(h, snapEnabled) } });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      onCommit(prevSnapshot);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleRotateMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const prevSnapshot = snapshot;

    const onMove = (ev: MouseEvent) => {
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI) + 90;
      onUpdate({ layout: { ...el.layout, rotation: Math.round(angle) } });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      onCommit(prevSnapshot);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const shadow = el.style.shadow.enabled
    ? `${el.style.shadow.x}px ${el.style.shadow.y}px ${el.style.shadow.blur}px ${el.style.shadow.spread}px ${el.style.shadow.color}`
    : undefined;

  const ANIM_CLASSES: Record<string, string> = {
    'fade-in': 'pb-anim-fade-in',
    'slide-up': 'pb-anim-slide-up',
    'slide-left': 'pb-anim-slide-left',
    'zoom-in': 'pb-anim-zoom-in',
  };
  const animClass = previewMode && el.animation.type !== 'none'
    ? animVisible
      ? ANIM_CLASSES[el.animation.type] ?? ''
      : 'pb-anim-pending'
    : '';

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: el.layout.x,
    top: el.layout.y,
    width: el.layout.width,
    height: el.layout.height,
    opacity: el.style.opacity,
    zIndex: (isSelected || isMultiSelected) ? el.layout.zIndex + 1000 : el.layout.zIndex,
    cursor: el.state.locked ? 'default' : previewMode ? 'default' : 'move',
    userSelect: 'none',
    boxSizing: 'border-box',
    transform: el.layout.rotation ? `rotate(${el.layout.rotation}deg)` : undefined,
    boxShadow: shadow,
    display: el.state.hidden ? 'none' : undefined,
    ['--anim-duration' as string]: `${el.animation.duration}ms`,
    ['--anim-delay' as string]: `${el.animation.delay}ms`,
  };

  const selected = isSelected || isMultiSelected;

  return (
    <div
      ref={wrapperRef}
      data-el-id={el.id}
      style={wrapperStyle}
      className={['pb-canvas-el', selected && !previewMode && 'pb-selected', el.state.locked && 'pb-locked', animClass || null].filter(Boolean).join(' ')}
      onMouseDown={handleBodyMouseDown}
      onDoubleClick={previewMode ? undefined : handleDoubleClick}
      onContextMenu={previewMode ? undefined : handleContextMenu}
    >
      <ElementContent el={el} editing={editing} editRef={editRef}
        onBlur={handleEditBlur} onKeyDown={handleEditKeyDown} breakpoint={breakpoint} />

      {selected && !editing && !previewMode && (
        <>
          {/* Portal-based bar — renders at document.body so overflow:hidden never clips it */}
          {(onDuplicate || onDelete) && (
            <ElementQuickBar anchorRef={wrapperRef} onDuplicate={onDuplicate} onDelete={onDelete} />
          )}

          <div className={'pb-rotate-handle'} onMouseDown={handleRotateMouseDown} title="Rotate" />

          {HANDLE_DIRS.map(dir => (
            <div
              key={dir}
              className={'pb-resize-handle'}
              style={{ ...handlePos(dir), cursor: CURSOR[dir] }}
              onMouseDown={handleResizeMouseDown(dir)}
            />
          ))}

          {el.state.locked && <div className={'pb-lock-indicator'}>🔒</div>}
        </>
      )}
    </div>
  );
}

export function ElementContent({
  el, editing, editRef, onBlur, onKeyDown, breakpoint = 'desktop',
}: {
  el: El;
  editing: boolean;
  editRef: React.RefObject<HTMLDivElement | null>;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  breakpoint?: Breakpoint;
}) {
  const { padding, background, border, typography } = el.style;
  const padStr = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;

  let bgImage: string | undefined;
  let bgColor: string | undefined = background.color;
  if (background.type === 'linear-gradient') {
    bgImage = `linear-gradient(${background.angle}deg, ${background.from}, ${background.to})`;
    bgColor = undefined;
  } else if (background.type === 'radial-gradient') {
    bgImage = `radial-gradient(circle, ${background.from}, ${background.to})`;
    bgColor = undefined;
  } else if (background.image) {
    bgImage = `url(${background.image})`;
  }

  const base: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: bgColor,
    backgroundImage: bgImage,
    backgroundSize: background.image && background.type === 'solid' ? 'cover' : undefined,
    backgroundPosition: background.image && background.type === 'solid' ? background.position : undefined,
    borderRadius: border.radius,
    border: border.width > 0 ? `${border.width}px ${border.style} ${border.color}` : 'none',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  useEffect(() => {
    if (editing && editRef.current && el.type === 'text') {
      editRef.current.innerHTML = el.content.rich || el.content.plain || '';
      editRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      if (sel) { range.selectNodeContents(editRef.current); sel.removeAllRanges(); sel.addRange(range); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  if (el.type === 'text') {
    if (editing) {
      return (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onPaste={createCleanPasteHandler()}
          style={{
            ...base,
            padding: padStr,
            fontSize: typography.size,
            fontWeight: typography.weight,
            fontFamily: typography.family,
            color: typography.color,
            textAlign: typography.align,
            lineHeight: typography.lineHeight,
            letterSpacing: typography.letterSpacing ? `${typography.letterSpacing}px` : undefined,
            textTransform: (typography.textTransform && typography.textTransform !== 'none') ? typography.textTransform : undefined,
            wordBreak: 'break-word',
            outline: '2px solid #006e75',
            cursor: 'text',
          }}
        />
      );
    }
    const textStyle: React.CSSProperties = {
      ...base, padding: padStr,
      fontSize: typography.size, fontWeight: typography.weight, fontFamily: typography.family,
      color: typography.color, textAlign: typography.align, lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing ? `${typography.letterSpacing}px` : undefined,
      textTransform: (typography.textTransform && typography.textTransform !== 'none') ? typography.textTransform : undefined,
      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    };
    if (el.content.rich) {
      return <div style={textStyle} dangerouslySetInnerHTML={{ __html: el.content.rich }} />;
    }
    return <div style={textStyle}>{el.content.plain}</div>;
  }

  if (el.type === 'image') {
    if (!el.content.src) {
      return (
        <div style={{
          ...base, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94a3b8', fontSize: 13, background: '#f1f5f9', padding: padStr,
        }}>
          No image
        </div>
      );
    }
    return (
      <div style={base}>
        <img
          src={el.content.src}
          alt={el.content.alt}
          style={{ width: '100%', height: '100%', objectFit: el.content.objectFit, display: 'block' }}
          draggable={false}
        />
      </div>
    );
  }

  if (el.type === 'button') {
    if (editing) {
      return (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onPaste={createCleanPasteHandler()}
          style={{
            ...base,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: typography.size, fontWeight: typography.weight, fontFamily: typography.family,
            color: typography.color, padding: padStr,
            letterSpacing: typography.letterSpacing ? `${typography.letterSpacing}px` : undefined,
            textTransform: (typography.textTransform && typography.textTransform !== 'none') ? typography.textTransform : undefined,
            outline: '2px solid #006e75', cursor: 'text',
          }}
        >
          {el.content.label}
        </div>
      );
    }
    return (
      <div style={{
        ...base,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: typography.size, fontWeight: typography.weight, fontFamily: typography.family,
        color: typography.color, padding: padStr,
        letterSpacing: typography.letterSpacing ? `${typography.letterSpacing}px` : undefined,
        textTransform: (typography.textTransform && typography.textTransform !== 'none') ? typography.textTransform : undefined,
      }}>
        {el.content.label}
      </div>
    );
  }

  if (el.type === 'divider') {
    const isVertical = el.content.orientation === 'vertical';
    if (isVertical) {
      const innerW = Math.max(1, el.layout.width - padding.left - padding.right || 2);
      return (
        <div style={{ ...base, display: 'flex', justifyContent: 'center', alignItems: 'stretch', padding: padStr }}>
          <div style={{ width: innerW, height: '100%',
            backgroundColor: background.color || '#dddddd', borderRadius: border.radius }} />
        </div>
      );
    }
    const innerH = Math.max(1, el.layout.height - padding.top - padding.bottom || 2);
    return (
      <div style={{ ...base, display: 'flex', alignItems: 'center', padding: padStr }}>
        <div style={{ width: '100%', height: innerH,
          backgroundColor: background.color || '#dddddd', borderRadius: border.radius }} />
      </div>
    );
  }

  if (el.type === 'video') {
    if (!el.content.videoUrl) {
      return (
        <div style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#111', color: '#888', fontSize: 13, gap: 8 }}>
          ▶ Add video URL
        </div>
      );
    }
    const embedUrl = el.content.videoUrl
      .replace('watch?v=', 'embed/')
      .replace('youtu.be/', 'www.youtube.com/embed/');
    return (
      <div style={base}>
        <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen title="video" />
      </div>
    );
  }

  if (el.type === 'spacer') {
    return (
      <div style={{ ...base, backgroundColor: 'transparent', backgroundImage: 'none' }} />
    );
  }

  if (el.type === 'icon') {
    const iconSize = el.content.iconSize ?? 40;
    const iconColor = typography.color;
    return (
      <div style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: padStr }}>
        {el.content.iconSvg
          ? <div style={{ width: iconSize, height: iconSize, color: iconColor, flexShrink: 0 }}
                 dangerouslySetInnerHTML={{ __html: el.content.iconSvg }} />
          : <span style={{ fontSize: iconSize, color: iconColor, lineHeight: 1 }}>{el.content.iconName ?? '★'}</span>
        }
      </div>
    );
  }

  if (el.type === 'form') {
    return (
      <div style={{ ...base, padding: padStr }}>
        <FormPreview el={el} stackFields={breakpoint === 'mobile'} />
      </div>
    );
  }

  // box
  return <div style={{ ...base, padding: padStr }} />;
}
