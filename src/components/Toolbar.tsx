import { useRef, useState } from 'react';
import type { Breakpoint, Page } from '../types';
import { Icon } from './Icon';

interface Props {
  // Site / page
  siteName: string;
  pages: Page[];
  activePage: Page;
  onSetActivePage: (id: string) => void;
  // Undo / redo
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  // Breakpoint
  breakpoint: Breakpoint;
  onSetBreakpoint: (bp: Breakpoint) => void;
  // Layout mode
  layoutWidth: 'fixed' | 'fluid';
  onSetLayoutWidth: (v: 'fixed' | 'fluid') => void;
  // Zoom
  zoom: number;
  onZoomChange: (delta: number) => void;
  onZoomReset: () => void;
  // Actions
  onPreview: () => void;
  onExportHTML: () => void;
  onExportJSON: () => void;
  onImport: () => void;
  onLoadDemo: () => void;
  onClear: () => void;
}

export function Toolbar({
  siteName, pages, activePage, onSetActivePage,
  canUndo, canRedo, onUndo, onRedo,
  breakpoint, onSetBreakpoint,
  layoutWidth, onSetLayoutWidth,
  zoom, onZoomChange, onZoomReset,
  onPreview, onExportHTML, onExportJSON, onImport,
  onLoadDemo, onClear,
}: Props) {
  const [pageDropOpen, setPageDropOpen] = useState(false);
  const [publishDropOpen, setPublishDropOpen] = useState(false);
  const [zoomDropOpen, setZoomDropOpen] = useState(false);
  const pageDropRef = useRef<HTMLDivElement>(null);
  const publishDropRef = useRef<HTMLDivElement>(null);

  const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200];

  const closeDrop = (setter: (v: boolean) => void) => () => setter(false);

  return (
    <header className="pb-toolbar pb-flex-row">

      {/* ── Left: logo + site name + page dropdown ── */}
      <div className="pb-toolbar-left pb-flex-row">
        <span className="pb-toolbar-logo pb-flex-center">
          <Icon id="logo" size={20} />
        </span>

        <span className="pb-toolbar-site-name">{siteName}</span>

        <div className="pb-toolbar-vdivider" />

        {/* Page dropdown */}
        <div className="pb-toolbar-dropdown-wrap" ref={pageDropRef}>
          <button
            className="pb-toolbar-page-btn"
            onClick={() => { setPageDropOpen(o => !o); setPublishDropOpen(false); setZoomDropOpen(false); }}
          >
            <span className="pb-toolbar-page-name">{activePage.name}</span>
            <Icon id="chevronDown" size={12} />
          </button>
          {pageDropOpen && (
            <div className="pb-toolbar-drop pb-toolbar-drop--left" onMouseLeave={closeDrop(setPageDropOpen)}>
              {pages.map(p => (
                <button
                  key={p.id}
                  className={['pb-toolbar-drop-item', p.id === activePage.id && 'pb-active'].filter(Boolean).join(' ')}
                  onClick={() => { onSetActivePage(p.id); setPageDropOpen(false); }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Center: undo/redo + breakpoints + zoom ── */}
      <div className="pb-toolbar-center pb-flex-row">

        {/* Undo / Redo */}
        <div className="pb-toolbar-icon-group pb-flex-row">
          <button
            className="pb-toolbar-icon-btn pb-flex-center"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Icon id="undo" size={16} />
          </button>
          <button
            className="pb-toolbar-icon-btn pb-flex-center"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Icon id="redo" size={16} />
          </button>
        </div>

        <div className="pb-toolbar-vdivider" />

        {/* Breakpoints */}
        <div className="pb-toolbar-icon-group pb-flex-row">
          {([
            { bp: 'desktop' as Breakpoint, icon: 'desktop' as const, title: 'Desktop (1280px)' },
            { bp: 'tablet'  as Breakpoint, icon: 'tablet'  as const, title: 'Tablet (768px)'  },
            { bp: 'mobile'  as Breakpoint, icon: 'mobile'  as const, title: 'Mobile (375px)'  },
          ]).map(({ bp, icon, title }) => (
            <button
              key={bp}
              className={['pb-toolbar-icon-btn pb-flex-center', breakpoint === bp && 'pb-active'].filter(Boolean).join(' ')}
              onClick={() => onSetBreakpoint(bp)}
              title={title}
            >
              <Icon id={icon} size={16} />
            </button>
          ))}
        </div>

        <div className="pb-toolbar-vdivider" />

        {/* Zoom dropdown */}
        <div className="pb-toolbar-dropdown-wrap">
          <button
            className="pb-toolbar-zoom-btn"
            onClick={() => { setZoomDropOpen(o => !o); setPageDropOpen(false); setPublishDropOpen(false); }}
            title="Zoom — click to change, Ctrl+0 to reset"
          >
            <span>{Math.round(zoom * 100)}%</span>
            <Icon id="chevronDown" size={12} />
          </button>
          {zoomDropOpen && (
            <div className="pb-toolbar-drop pb-toolbar-drop--center" onMouseLeave={closeDrop(setZoomDropOpen)}>
              {ZOOM_PRESETS.map(z => (
                <button
                  key={z}
                  className={['pb-toolbar-drop-item', Math.round(zoom * 100) === z && 'pb-active'].filter(Boolean).join(' ')}
                  onClick={() => { onZoomChange((z / 100 - zoom) * 100); setZoomDropOpen(false); }}
                >
                  {z}%
                </button>
              ))}
              <div className="pb-toolbar-drop-divider" />
              <button className="pb-toolbar-drop-item" onClick={() => { onZoomReset(); setZoomDropOpen(false); }}>
                Reset (100%)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: preview + publish ── */}
      <div className="pb-toolbar-right pb-flex-row">
        <button className="pb-toolbar-preview-btn" onClick={onPreview} title="Preview (Ctrl+Shift+P)">
          <Icon id="preview" size={16} />
          <span>Preview</span>
        </button>

        {/* Publish dropdown (minimal — chevron only) */}
        <div className="pb-toolbar-dropdown-wrap" ref={publishDropRef}>
          <div className="pb-toolbar-publish-group">
            <button className="pb-toolbar-publish-btn" onClick={onExportHTML} title="Publish / Export HTML">
              <Icon id="publish" size={16} color="#ffffff" />
              <span>Publish</span>
            </button>
            <button
              className="pb-toolbar-publish-chevron"
              onClick={() => { setPublishDropOpen(o => !o); setPageDropOpen(false); setZoomDropOpen(false); }}
              title="More options"
            >
              <Icon id="chevronDown" size={12} color="#ffffff" />
            </button>
          </div>
          {publishDropOpen && (
            <div className="pb-toolbar-drop pb-toolbar-drop--right" onMouseLeave={closeDrop(setPublishDropOpen)}>
              <button className="pb-toolbar-drop-item" onClick={() => { onExportHTML(); setPublishDropOpen(false); }}>
                Export HTML
              </button>
              <button className="pb-toolbar-drop-item" onClick={() => { onExportJSON(); setPublishDropOpen(false); }}>
                Export JSON
              </button>
              <button className="pb-toolbar-drop-item" onClick={() => { onImport(); setPublishDropOpen(false); }}>
                Import JSON
              </button>
              <div className="pb-toolbar-drop-divider" />
              <div className="pb-toolbar-drop-label">Layout</div>
              {(['fixed', 'fluid'] as const).map(mode => (
                <button
                  key={mode}
                  className={['pb-toolbar-drop-item', layoutWidth === mode && 'pb-active'].filter(Boolean).join(' ')}
                  onClick={() => { onSetLayoutWidth(mode); setPublishDropOpen(false); }}
                >
                  {mode === 'fixed' ? 'Fixed width' : 'Fluid width'}
                  {layoutWidth === mode && <span className="pb-toolbar-drop-check">✓</span>}
                </button>
              ))}
              <div className="pb-toolbar-drop-divider" />
              <button className="pb-toolbar-drop-item" onClick={() => { onLoadDemo(); setPublishDropOpen(false); }}>
                Load demo
              </button>
              <button className="pb-toolbar-drop-item pb-toolbar-drop-item--danger" onClick={() => { onClear(); setPublishDropOpen(false); }}>
                Clear canvas
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
