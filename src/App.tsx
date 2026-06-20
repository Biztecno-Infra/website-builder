import { useCallback, useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Canvas } from './components/Canvas';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { AlignmentToolbar } from './components/AlignmentToolbar';
import { useBuilderStore, makeEmpty } from './hooks/useBuilderStore';
import { migrateState } from './hooks/useBuilderStore';
import { makeDemoState } from './data/demoState';
import { makeSaasLandingState } from './data/saasLandingState';
import { makeAgencyState } from './data/agencyState';
import { makePortfolioState } from './data/portfolioState';
import newsletterTemplate from './data/newsletterTemplate.json';
import linearShowcase from '../showcases/linear.json';
import lemonSqueezyShowcase from '../showcases/lemon-squeezy.json';
import { exportHtml } from './utils/exportHtml';
import { serializeState } from './utils/serializeState';
import type { Breakpoint, GridCell, CanvasElement } from './types';

export default function App() {
  const {
    state,
    nodes,
    elements,
    order,
    header, sections, footer,
    pages, activePageId, activePage,
    selectedId,
    selectedIds,
    selectedSectionId,
    setSelectedId,
    setSelectedIds,
    setSelectedSectionId,
    toggleSelectedId,
    addElement,
    addElementAt,
    addSection,
    addGridSection,
    addSectionFromTemplate,
    deleteSection,
    updateSection,
    duplicateSection,
    duplicateElement,
    copyElement,
    pasteElement,
    updateElement,
    updateElements,
    pushSnapshot,
    deleteElement,
    deleteSelected,
    bringToFront,
    sendToBack,
    reorderElement,
    reorderSection,
    moveElementToSection,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    stateRef,
    addPage,
    deletePage,
    renamePage,
    setActivePage,
    importState,
    updateTheme,
    updateResponsive,
    selectedGridCellId,
    setSelectedGridCellId,
    addGridCell,
    updateGridCell,
    deleteGridCell,
    reorderGridCell,
    addNestedGrid,
    removeNestedGrid,
    addElementToCell,
    moveGridElement,
    moveElementToGridCell,
  } = useBuilderStore();

  const [snapEnabled, setSnapEnabled] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewMobile, setPreviewMobile] = useState(false);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [styleClipboard, setStyleClipboard] = useState<CanvasElement['style'] | null>(null);

  const changeZoom = useCallback((delta: number) =>
    setZoom(z => Math.round(Math.min(200, Math.max(25, z * 100 + delta)) / 5) * 5 / 100), []);
  const importRef = useRef<HTMLInputElement>(null);

  const selectedElement = selectedId ? (elements[selectedId] ?? null) : null;
  const selectedGridCell = !selectedElement && selectedGridCellId
    ? (nodes[selectedGridCellId] as GridCell | undefined ?? null)
    : null;
  const isInGridCell = selectedElement
    ? nodes[selectedElement.parent]?.type === 'grid-cell'
    : false;
  const selectedSection =
    selectedSectionId === header.id ? header :
    selectedSectionId === footer.id ? footer :
    sections.find(s => s.id === selectedSectionId) ?? null;

  const handleApplyTheme = useCallback(() => {
    if (!window.confirm('Apply theme fonts & colors to all text and button elements? (Ctrl+Z to undo)')) return;
    pushSnapshot(state);
    const updates = Object.values(nodes)
      .filter((n): n is CanvasElement => n.type !== 'section' && n.type !== 'grid-cell')
      .flatMap(el => {
        if (el.type === 'text') return [{ id: el.id, changes: { style: { ...el.style, typography: { ...el.style.typography, family: state.theme.fonts.body, color: state.theme.colors.text } } } }];
        if (el.type === 'button') return [{ id: el.id, changes: { style: { ...el.style, background: { ...el.style.background, color: state.theme.colors.primary }, typography: { ...el.style.typography, family: state.theme.fonts.body } } } }];
        return [];
      });
    updateElements(updates);
  }, [nodes, state, pushSnapshot, updateElements]);

  // Export HTML
  const handleExportHTML = () => {
    const html = exportHtml(state, activePage.name);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePage.name.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJSON = () => {
    const json = JSON.stringify(serializeState(state), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePage.name.toLowerCase().replace(/\s+/g, '-')}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        importState(migrateState(raw));
      } catch { /* ignore invalid files */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Close context menu on outside click
  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest('input, textarea, select, [contenteditable]');

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); handleUndo(); return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); handleRedo(); return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault(); changeZoom(10); return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault(); changeZoom(-10); return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault(); setZoom(1); return;
      }

      if (typing) return;

      if (e.key === 'Escape') {
        if (previewMode) { setPreviewMode(false); return; }
        setSelectedIds([]); setSelectedSectionId(null); setSelectedGridCellId(null); return;
      }

      if (previewMode) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedIds.length > 0) deleteSelected();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedId) {
        e.preventDefault(); copyElement(selectedId); return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault(); pasteElement(); return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedId) {
        e.preventDefault(); duplicateElement(selectedId); return;
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        const ids = selectedIds.filter(id => {
          const el = elements[id];
          return el && !el.state.locked;
        });
        if (!ids.length) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        pushSnapshot(stateRef.current);
        updateElements(ids.map(id => {
          const el = elements[id];
          return { id, changes: { layout: { ...el.layout, x: el.layout.x + dx, y: el.layout.y + dy } } };
        }));
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUndo, handleRedo, deleteSelected, selectedId, selectedIds, copyElement, pasteElement,
      duplicateElement, updateElements, pushSnapshot, setSelectedIds, setSelectedSectionId,
      stateRef, elements, previewMode, changeZoom, setZoom]);

  if (previewMode) {
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="app preview-app">
          <header className="toolbar preview-toolbar">
            <div className="toolbar-left">
              <span className="app-name">{activePage.name}</span>
            </div>
            <div className="toolbar-center">
              <button
                className={`toolbar-btn${!previewMobile ? ' active' : ''}`}
                onClick={() => setPreviewMobile(false)}
                title="Desktop preview"
              >
                🖥 Desktop
              </button>
              <button
                className={`toolbar-btn${previewMobile ? ' active' : ''}`}
                onClick={() => setPreviewMobile(true)}
                title="Mobile preview (375px)"
              >
                📱 Mobile
              </button>
            </div>
            <div className="toolbar-right">
              <button className="toolbar-btn primary" onClick={() => setPreviewMode(false)}>
                ✕ Exit Preview
              </button>
            </div>
          </header>

          <div className={`preview-canvas-wrapper${previewMobile ? ' mobile-frame' : ''}`}>
            <Canvas
              nodes={nodes}
              header={header}
              sections={sections}
              footer={footer}
              selectedId={null}
              selectedIds={[]}
              selectedSectionId={null}
              onSelectSection={() => {}}
              onSelectElement={() => {}}
              onDeselect={() => {}}
              onUpdate={updateElement}
              onCommit={pushSnapshot}
              snapshot={state}
              onDrop={addElementAt}
              onUpdateSection={updateSection}
              onAddSection={addSection}
              onDeleteSection={deleteSection}
              onDuplicateSection={() => {}}
              onMoveSectionUp={() => {}}
              onMoveSectionDown={() => {}}
              snapEnabled={false}
              onContextMenu={() => {}}
              onMultiSelect={() => {}}
              previewMode
              previewWidth={previewMobile ? 375 : undefined}
            />
          </div>
        </div>
      </DndProvider>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <LeftSidebar
          nodes={nodes}
          onAdd={addElement}
          onAddFreeSection={addSection}
          onAddGridSection={addGridSection}
          onAddSectionFromTemplate={addSectionFromTemplate}
          selectedIds={selectedIds}
          selectedSectionId={selectedSectionId}
          selectedGridCellId={selectedGridCellId}
          onSelect={setSelectedId}
          onSelectGridCell={id => { setSelectedGridCellId(id); setSelectedIds([]); }}
          onReorderSection={reorderSection}
          onReorderElement={reorderElement}
          onMoveElementToSection={moveElementToSection}
          onUpdate={updateElement}
          header={header}
          sections={sections}
          footer={footer}
          onSelectSection={id => { setSelectedSectionId(id); setSelectedIds([]); }}
          pages={pages}
          activePageId={activePageId}
          onSetActivePage={setActivePage}
          onAddPage={addPage}
          onDeletePage={deletePage}
          onRenamePage={renamePage}
          theme={state.theme}
          onUpdateTheme={updateTheme}
          onApplyTheme={handleApplyTheme}
        />

        <div className="middle-container">
          <header className="toolbar">
            <div className="toolbar-left">
              <span className="app-name">Page Builder</span>
              {/* <span className="active-page-name">{activePage.name}</span> */}
              <div className="toolbar-divider" />
              <button
                className="toolbar-btn toolbar-btn--demo"
                title="Replace canvas with the built-in demo page (undoable)"
                onClick={() => {
                  if (window.confirm('Load demo page? This replaces the current canvas (you can Ctrl+Z to undo).')) {
                    importState(makeDemoState());
                  }
                }}
              >
                ⊞ Load Demo
              </button>
              <button
                className="toolbar-btn toolbar-btn--demo"
                title="Load the newsletter template (undoable)"
                onClick={() => {
                  if (window.confirm('Load newsletter template? This replaces the current canvas (you can Ctrl+Z to undo).')) {
                    importState(migrateState(newsletterTemplate as any));
                  }
                }}
              >
                ✉ Newsletter
              </button>
              {/* <button
                className="toolbar-btn toolbar-btn--demo"
                title="Load SaaS landing page demo (Flowdesk)"
                onClick={() => {
                  if (window.confirm('Load Flowdesk SaaS demo? This replaces the current canvas (Ctrl+Z to undo).')) {
                    importState(makeSaasLandingState());
                  }
                }}
              >
                ⚡ SaaS Demo
              </button> */}
              <button
                className="toolbar-btn toolbar-btn--demo"
                title="Load agency page demo (Studio Craft)"
                onClick={() => {
                  if (window.confirm('Load Studio Craft agency demo? This replaces the current canvas (Ctrl+Z to undo).')) {
                    importState(makeAgencyState());
                  }
                }}
              >
                ◆ Agency Demo
              </button>
              {/* <button
                className="toolbar-btn toolbar-btn--demo"
                title="Load portfolio demo (Alex Chen)"
                onClick={() => {
                  if (window.confirm('Load Alex Chen portfolio demo? This replaces the current canvas (Ctrl+Z to undo).')) {
                    importState(makePortfolioState());
                  }
                }}
              >
                ✦ Portfolio Demo
              </button> */}
              {/* <button
                className="toolbar-btn toolbar-btn--demo"
                title="Load Linear-inspired showcase"
                onClick={() => {
                  if (window.confirm('Load Linear showcase? This replaces the current canvas (Ctrl+Z to undo).')) {
                    importState(migrateState(linearShowcase as any));
                  }
                }}
              >
                ◈ Linear
              </button> */}
              {/* <button
                className="toolbar-btn toolbar-btn--demo"
                title="Load Lemon Squeezy-inspired showcase"
                onClick={() => {
                  if (window.confirm('Load Lemon Squeezy showcase? This replaces the current canvas (Ctrl+Z to undo).')) {
                    importState(migrateState(lemonSqueezyShowcase as any));
                  }
                }}
              >
                🍋 Lemon Squeezy
              </button> */}
              <button
                className="toolbar-btn toolbar-btn--danger"
                title="Clear canvas and start with an empty page (undoable)"
                onClick={() => {
                  if (window.confirm('Clear the canvas and start with an empty page? (Ctrl+Z to undo)')) {
                    importState(makeEmpty());
                  }
                }}
              >
                ✕ Clear Page
              </button>
            </div>
            <div className="toolbar-center">
              <button className="toolbar-btn" onClick={handleUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                ↩ Undo
              </button>
              <button className="toolbar-btn" onClick={handleRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
                ↪ Redo
              </button>
              {/* <div className="toolbar-divider" />
              <label className="toolbar-toggle" title="Snap to 8px grid">
                <input type="checkbox" checked={snapEnabled} onChange={e => setSnapEnabled(e.target.checked)} />
                Snap
              </label> */}
              <div className="toolbar-divider" />
              <div className="breakpoint-switcher">
                <button
                  className={`bp-btn${breakpoint === 'desktop' ? ' active' : ''}`}
                  onClick={() => setBreakpoint('desktop')}
                  title="Desktop (1200px)"
                >🖥</button>
                <button
                  className={`bp-btn${breakpoint === 'tablet' ? ' active' : ''}`}
                  onClick={() => setBreakpoint('tablet')}
                  title="Tablet (768px)"
                >⬛</button>
                <button
                  className={`bp-btn${breakpoint === 'mobile' ? ' active' : ''}`}
                  onClick={() => setBreakpoint('mobile')}
                  title="Mobile (375px)"
                >📱</button>
              </div>
              <div className="toolbar-divider" />
              <div className="zoom-control">
                <button className="zoom-btn" onClick={() => changeZoom(-10)} title="Zoom out (Ctrl+-)">−</button>
                <button className="zoom-value" onClick={() => setZoom(1)} title="Reset zoom (Ctrl+0)">
                  {Math.round(zoom * 100)}%
                </button>
                <button className="zoom-btn" onClick={() => changeZoom(10)} title="Zoom in (Ctrl+=)">+</button>
              </div>
            </div>
            <div className="toolbar-right">
              {/* <button className="toolbar-btn" onClick={() => setPreviewMode(true)} title="Preview">
                ▶ Preview
              </button> */}
              <div className="toolbar-divider" />
              <button className="toolbar-btn" onClick={handleExportHTML} title="Export HTML">
                 HTML
              </button>
              <button className="toolbar-btn" onClick={handleExportJSON} title="Export JSON">
                 JSON
              </button>
              <button className="toolbar-btn" onClick={() => importRef.current?.click()} title="Import JSON">
                ↑ Import
              </button>
              <input
                ref={importRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportJSON}
              />
              <div className="toolbar-divider" />
              <span className="save-indicator">● Auto-saved</span>
            </div>
          </header>

          <div className="content-wrapper" style={{ position: 'relative' }}>
            {selectedIds.length >= 2 && (
              <AlignmentToolbar
                selectedIds={selectedIds}
                elements={elements}
                onUpdateElements={updates => { pushSnapshot(stateRef.current); updateElements(updates); }}
              />
            )}

            <Canvas
              nodes={nodes}
              header={header}
              sections={sections}
              footer={footer}
              selectedId={selectedId}
              selectedIds={selectedIds}
              selectedSectionId={selectedSectionId}
              selectedGridCellId={selectedGridCellId}
              onSelectSection={id => { setSelectedSectionId(id); setSelectedIds([]); }}
              onSelectElement={(id, shift) => shift ? toggleSelectedId(id) : setSelectedId(id)}
              onSelectGridCell={id => { setSelectedGridCellId(id); }}
              onDeselect={() => { setSelectedIds([]); setSelectedSectionId(null); setSelectedGridCellId(null); }}
              onUpdate={updateElement}
              onCommit={pushSnapshot}
              snapshot={state}
              onDrop={addElementAt}
              onUpdateSection={updateSection}
              onAddSection={addSection}
              onDeleteSection={deleteSection}
              onDuplicateSection={duplicateSection}
              onMoveSectionUp={i => reorderSection(i, i - 1)}
              onMoveSectionDown={i => reorderSection(i, i + 1)}
              snapEnabled={snapEnabled}
              onContextMenu={(id, x, y) => setContextMenu({ id, x, y })}
              onMultiSelect={(ids, sectionId) => { setSelectedIds(ids); setSelectedSectionId(sectionId); }}
              breakpoint={breakpoint}
              onUpdateResponsive={updateResponsive}
              onDuplicateElement={duplicateElement}
              onDeleteElement={deleteElement}
              onMoveElementToSection={(id, toSectionId, x, y) => moveElementToSection(id, toSectionId, 999, { x, y })}
              onUpdateGridCell={updateGridCell}
              onAddGridCell={addGridCell}
              onDeleteGridCell={deleteGridCell}
              onAddElementToCell={addElementToCell}
              onMoveGridElement={moveGridElement}
              onMoveElementToGridCell={moveElementToGridCell}
              onReorderGridCell={reorderGridCell}
              zoom={zoom}
            />

            <RightSidebar
              element={selectedElement}
              section={selectedElement ? null : (selectedGridCell ? null : selectedSection)}
              gridCell={selectedGridCell}
              nodes={nodes}
              isInGridCell={isInGridCell}
              snapshot={state}
              onUpdate={updateElement}
              onUpdateSection={updateSection}
              onUpdateGridCell={updateGridCell}
              onAddGridCell={addGridCell}
              onAddNestedGrid={addNestedGrid}
              onRemoveNestedGrid={removeNestedGrid}
              onPushSnapshot={pushSnapshot}
              onDelete={deleteElement}
              breakpoint={breakpoint}
              onUpdateResponsive={updateResponsive}
              onCopyStyle={selectedElement ? () => setStyleClipboard(selectedElement.style) : undefined}
              onPasteStyle={selectedElement && styleClipboard ? () => { pushSnapshot(state); updateElement(selectedElement.id, { style: styleClipboard }); } : undefined}
              hasCopiedStyle={styleClipboard !== null}
              theme={state.theme}
            />
          </div>

          {contextMenu && (
            <div
              className="context-menu"
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => { duplicateElement(contextMenu.id); setContextMenu(null); }}>Duplicate</button>
              <button onClick={() => { bringToFront(contextMenu.id); setContextMenu(null); }}>Bring to Front</button>
              <button onClick={() => { sendToBack(contextMenu.id); setContextMenu(null); }}>Send to Back</button>
              <button onClick={() => {
                const el = elements[contextMenu.id];
                if (el) updateElement(contextMenu.id, { state: { ...el.state, locked: !el.state.locked } });
                setContextMenu(null);
              }}>
                {elements[contextMenu.id]?.state?.locked ? 'Unlock' : 'Lock'}
              </button>
              <div className="context-menu-divider" />
              <button className="context-menu-danger"
                onClick={() => { deleteElement(contextMenu.id); setContextMenu(null); }}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
