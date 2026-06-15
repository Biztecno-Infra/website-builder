import './builder.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Canvas } from './components/Canvas';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { AlignmentToolbar } from './components/AlignmentToolbar';
import { Toolbar } from './components/Toolbar';
import { Icon } from './components/Icon';
import { useBuilderStore, makeEmpty, DEFAULT_THEME } from './hooks/useBuilderStore';
import { migrateState } from './hooks/useBuilderStore';
import { makeKnightState } from './data/knightState';
import { exportHtml } from './utils/exportHtml';
import { serializeState } from './utils/serializeState';
import type { Breakpoint, Container, GridCell, CanvasElement } from './types';

export default function App() {
  const {
    state,
    nodes,
    elements,
    header, sections, footer, allSections,
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
    promoteSection,
    updateSection,
    duplicateSection,
    copyGridCell,
    pasteGridCellIntoSection,
    pasteIntoGridCell,
    hasCellClipboard,
    duplicateElement,
    updateElement,
    updateElements,
    pushSnapshot,
    deleteElement,
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
    selectedContainerId,
    setSelectedContainerId,
    addGridCell,
    updateGridCell,
    deleteGridCell,
    reorderGridCell,
    removeColumnsBlock,
    addContainer,
    addContainerColumn,
    updateContainer,
    addElementToCell,
    moveGridElement,
    moveElementToGridCell,
    updatePageLayout,
  } = useBuilderStore();

  const [snapEnabled] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [screenWidth] = useState(1280);
  const previewScrollRef = useRef<number>(0);
  const capturePreviewScroll = useCallback(() => {
    previewScrollRef.current = document.querySelector('.pb-canvas-wrapper')?.scrollTop ?? 0;
  }, []);

  const changeZoom = useCallback((delta: number) =>
    setZoom(z => Math.round(Math.min(200, Math.max(25, z * 100 + delta)) / 5) * 5 / 100), []);

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = canvasWrapperRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        changeZoom(e.deltaY > 0 ? -10 : 10);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [changeZoom]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  const importRef = useRef<HTMLInputElement>(null);

  // Tracks the theme colors from the last time Apply Theme was run.
  // On first apply, defaults to DEFAULT_THEME so elements built with
  // default colors get picked up correctly.
  const lastAppliedThemeRef = useRef(DEFAULT_THEME.colors);

  const scrollCanvasToElement = useCallback((id: string) => {
    const el = document.querySelector<HTMLElement>(`[data-el-id="${id}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('pb-canvas-el--flash');
    void el.offsetWidth; // force reflow so animation restarts every time
    el.classList.add('pb-canvas-el--flash');
    setTimeout(() => el.classList.remove('pb-canvas-el--flash'), 1300);
  }, []);

  const selectedElement = selectedId ? (elements[selectedId] ?? null) : null;
  const selectedGridCell = !selectedElement && selectedGridCellId
    ? (nodes[selectedGridCellId] as GridCell | undefined ?? null)
    : null;
  const selectedContainer = selectedContainerId
    ? (nodes[selectedContainerId] as Container | undefined ?? null)
    : null;
  const isInGridCell = selectedElement
    ? nodes[selectedElement.parent]?.type === 'grid-cell'
    : false;
  const selectedSection = allSections.find(s => s.id === selectedSectionId) ?? null;

  useEffect(() => {
    if (selectedId || selectedSectionId || selectedGridCellId || selectedContainerId) {
      setRightPanelOpen(true);
    }
  }, [selectedId, selectedSectionId, selectedGridCellId, selectedContainerId]);

  const handleApplyTheme = useCallback(() => {
    if (!window.confirm('Apply theme colors & font to matching elements? (Ctrl+Z to undo)')) return;
    pushSnapshot(state);
    const { fonts, colors } = state.theme;

    // Compare element colors against the LAST APPLIED theme colors (not the default).
    // This correctly handles: user builds with teal → changes to blue → Apply updates teal→blue.
    // Next Apply: blue→whatever new color they set.
    const old = lastAppliedThemeRef.current;

    const match = (a: string | undefined, b: string) =>
      (a ?? '').toLowerCase() === b.toLowerCase();

    const updates = Object.values(nodes)
      .filter((n): n is CanvasElement =>
        n.type !== 'section' && n.type !== 'grid-cell' && n.type !== 'container')
      .flatMap(el => {
        const elText = el.style.typography.color;
        const elBg   = el.style.background.color ?? '';

        if (el.type === 'text') {
          const newColor = match(elText, old.text) ? colors.text : elText;
          return [{ id: el.id, changes: { style: { ...el.style,
            typography: { ...el.style.typography, family: fonts.body, color: newColor },
          } } }];
        }
        if (el.type === 'button') {
          // Buttons can use primary or accent — check both
          const newBg = match(elBg, old.primary) ? colors.primary
            : match(elBg, old.accent) ? colors.accent
            : elBg;
          const newTextColor = match(elText, old.text) ? colors.text
            : match(elText, old.background) ? colors.background
            : elText;
          return [{ id: el.id, changes: { style: { ...el.style,
            background: { ...el.style.background, color: newBg },
            typography: { ...el.style.typography, family: fonts.body, color: newTextColor },
          } } }];
        }
        if (el.type === 'box' || el.type === 'divider') {
          const newBg = match(elBg, old.light) ? colors.light : elBg;
          return [{ id: el.id, changes: { style: { ...el.style,
            background: { ...el.style.background, color: newBg },
          } } }];
        }
        if (el.type === 'icon') {
          // Icons use primary color — update typography.color if it matched old primary
          const newColor = match(elText, old.primary) ? colors.primary
            : match(elText, old.accent) ? colors.accent
            : elText;
          return [{ id: el.id, changes: { style: { ...el.style,
            typography: { ...el.style.typography, color: newColor },
          } } }];
        }
        // All other elements: just update font family
        return [{ id: el.id, changes: { style: { ...el.style,
          typography: { ...el.style.typography, family: fonts.body },
        } } }];
      });

    updateElements(updates);

    // Sections: only update if they were using the old sectionBg or background
    allSections.forEach(sec => {
      const secBg = sec.style.background.color ?? '';
      if (match(secBg, old.sectionBg) || match(secBg, old.background)) {
        const newBg = match(secBg, old.sectionBg) ? colors.sectionBg : colors.background;
        updateSection(sec.id, { style: { ...sec.style,
          background: { ...sec.style.background, type: 'solid', color: newBg, image: '' },
        } });
      }
    });

    // Grid cell backgrounds are intentional (cards etc.) — never auto-reset them

    // Record the theme we just applied — next Apply compares against this
    lastAppliedThemeRef.current = colors;
  }, [nodes, state, allSections, pushSnapshot, updateElements, updateSection]);

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
        const text = ev.target?.result as string;
        if (!text?.trim()) { alert('The file is empty.'); return; }

        let raw: unknown;
        try { raw = JSON.parse(text); }
        catch { alert('Invalid file — could not parse JSON. Make sure you are uploading a file exported from this builder.'); return; }

        // Validate it looks like a builder state
        const r = raw as Record<string, unknown>;
        const hasSchema = r.schema === '2.0';
        const hasNodes  = r.nodes && typeof r.nodes === 'object';
        const hasPages  = Array.isArray(r.pages) && (r.pages as unknown[]).length > 0;

        if (!hasSchema || !hasNodes || !hasPages) {
          alert('This JSON does not appear to be a valid page builder file.\n\nMake sure you are uploading a file downloaded using the "JSON" export button.');
          return;
        }

        if (!window.confirm(`Import "${file.name}"?\n\nThis will replace your current canvas. You can undo with Ctrl+Z.`)) return;

        // migrateState + importState handles all defaults, hydration, and undo
        const migrated = migrateState(raw);
        importState(migrated);

      } catch (err) {
        alert('Something went wrong importing the file. Please try again.');
      }
    };
    reader.onerror = () => alert('Could not read the file. Please try again.');
    reader.readAsText(file);
    e.target.value = ''; // allow re-importing same file
  };

  // Close context menu on outside click
  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);


  const handleAddElement = useCallback((type: import('./types').ElementType) => {
    if (selectedContainerId) {
      const container = nodes[selectedContainerId] as import('./types').Container | undefined;
      if (container?.children.length) {
        addElementToCell(type, container.children[0]);
        return;
      }
    }
    addElement(type);
  }, [selectedContainerId, nodes, addElementToCell, addElement]);

  if (previewMode) {
    const previewWidth = previewDevice === 'mobile' ? 375 : previewDevice === 'tablet' ? 768 : undefined;
    const previewBp: Breakpoint = previewDevice === 'mobile' ? 'mobile' : previewDevice === 'tablet' ? 'tablet' : 'desktop';
    return (
      <DndProvider backend={HTML5Backend}>
        <div className={"pb-app pb-preview-app"}>
          <header className={"pb-toolbar pb-flex-row pb-preview-toolbar"}>
            <div className={'pb-toolbar-left pb-flex-row'} style={{ gap: 10 }}>
              <span className={'pb-preview-badge'}>Preview</span>
              <span className={'pb-toolbar-vdivider'} />
              <span className={'pb-toolbar-site-name'}>{activePage.name}</span>
            </div>
            <div className={'pb-toolbar-center pb-flex-row'}>
              <div className={'pb-toolbar-icon-group pb-flex-row'}>
                {([
                  { d: 'desktop', icon: 'desktop', title: 'Desktop' },
                  { d: 'tablet',  icon: 'tablet',  title: 'Tablet (768px)' },
                  { d: 'mobile',  icon: 'mobile',  title: 'Mobile (375px)' },
                ] as const).map(({ d, icon, title }) => (
                  <button key={d}
                    className={['pb-toolbar-icon-btn pb-flex-center', previewDevice === d && 'pb-active'].filter(Boolean).join(' ')}
                    onClick={() => setPreviewDevice(d)}
                    title={title}
                  >
                    <Icon id={icon} size={18} />
                  </button>
                ))}
              </div>
            </div>
            <div className={'pb-toolbar-right pb-flex-row'}>
              <button className={"pb-toolbar-btn pb-primary"} onClick={() => setPreviewMode(false)}>
                Exit Preview
              </button>
            </div>
          </header>

          <div className={['pb-preview-canvas-wrapper', previewDevice !== 'desktop' && 'pb-device-frame', previewDevice !== 'desktop' && `pb-device-${previewDevice}`].filter(Boolean).join(' ')}>
            <Canvas
              nodes={nodes}
              sections={allSections}
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
              previewWidth={previewWidth}
              breakpoint={previewBp}
              layoutWidth={activePage.layoutWidth ?? 'fixed'}
              maxWidth={activePage.maxWidth ?? 1280}
              initialScrollTop={previewScrollRef.current}
            />
          </div>
        </div>
      </DndProvider>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={'pb-app'}>
        <Toolbar
          siteName="Website Builder"
          pages={pages}
          activePage={activePage}
          onSetActivePage={setActivePage}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          breakpoint={breakpoint}
          onSetBreakpoint={setBreakpoint}
          layoutWidth={activePage.layoutWidth ?? 'fixed'}
          onSetLayoutWidth={w => updatePageLayout(activePage.id, w)}
          zoom={zoom}
          onZoomChange={changeZoom}
          onZoomReset={() => setZoom(1)}
          onPreview={() => { capturePreviewScroll(); setPreviewMode(true); }}
          onExportHTML={handleExportHTML}
          onExportJSON={handleExportJSON}
          onImport={() => importRef.current?.click()}
          onLoadDemo={() => importState(makeKnightState())}
          onClear={() => {
            if (window.confirm('Clear the canvas and start with an empty page? (Ctrl+Z to undo)')) {
              importState(makeEmpty());
            }
          }}
        />
        <input
          ref={importRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImportJSON}
        />
        <div className={'pb-app-body'}>
          <LeftSidebar
          nodes={nodes}
          onAdd={handleAddElement}
          onAddFreeSection={addSection}
          onAddGridSection={columnSpans => addGridSection(undefined, columnSpans)}
          onAddSectionFromTemplate={addSectionFromTemplate}
          onAddContainer={(mode, spans) => selectedGridCellId && addContainer(selectedGridCellId, mode, spans)}
          selectedIds={selectedIds}
          selectedSectionId={selectedSectionId}
          selectedGridCellId={selectedGridCellId}
          selectedContainerId={selectedContainerId}
          onSelect={id => { setSelectedId(id); setSelectedGridCellId(null); setSelectedContainerId(null); }}
          onSelectGridCell={id => { setSelectedGridCellId(id); setSelectedIds([]); }}
          onSelectContainer={id => { setSelectedContainerId(id); setSelectedGridCellId(null); setSelectedIds([]); }}
          onScrollToElement={scrollCanvasToElement}
          onReorderSection={reorderSection}
          onReorderElement={reorderElement}
          onMoveElementToSection={moveElementToSection}
          onUpdate={updateElement}
          onDeleteElement={deleteElement}
          onDeleteSection={deleteSection}
          header={header}
          sections={sections}
          footer={footer}
          onSelectSection={id => { setSelectedSectionId(id); setSelectedIds([]); setSelectedGridCellId(null); setSelectedContainerId(null); }}
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

        <div className={'pb-middle-container'}>
          <div className={'pb-content-wrapper'} style={{ position: 'relative' }} ref={canvasWrapperRef}>
            {selectedIds.length >= 2 && (
              <AlignmentToolbar
                selectedIds={selectedIds}
                elements={elements}
                onUpdateElements={updates => { pushSnapshot(stateRef.current); updateElements(updates); }}
              />
            )}

            <Canvas
              nodes={nodes}
              sections={allSections}
              selectedId={selectedId}
              selectedIds={selectedIds}
              selectedSectionId={selectedSectionId}
              selectedGridCellId={selectedGridCellId}
              onSelectSection={id => { setSelectedSectionId(id); setSelectedIds([]); setSelectedId(null); setSelectedGridCellId(null); setSelectedContainerId(null); }}
              onSelectElement={(id, shift) => { if (shift) { toggleSelectedId(id); } else { setSelectedId(id); setSelectedSectionId(null); setSelectedContainerId(null); } }}
              onSelectGridCell={id => { setSelectedGridCellId(id); setSelectedId(null); setSelectedIds([]); setSelectedContainerId(null); }}
              onDeselect={() => { setSelectedIds([]); setSelectedId(null); setSelectedSectionId(null); setSelectedGridCellId(null); setSelectedContainerId(null); }}
              onUpdate={updateElement}
              onCommit={pushSnapshot}
              snapshot={state}
              onDrop={addElementAt}
              onUpdateSection={updateSection}
              onAddSection={addSection}
              onDeleteSection={deleteSection}
              onDuplicateSection={duplicateSection}
              onCopyGridCell={copyGridCell}
              onPasteGridCell={pasteGridCellIntoSection}
              onPasteIntoGridCell={pasteIntoGridCell}
              hasCellClipboard={hasCellClipboard}
              onPromoteSection={promoteSection}
              onMoveSectionUp={i => reorderSection(i, i - 1)}
              onMoveSectionDown={i => reorderSection(i, i + 1)}
              snapEnabled={snapEnabled}
              onContextMenu={(id, x, y) => setContextMenu({ id, x, y })}
              onMultiSelect={(ids, sectionId) => { setSelectedIds(ids); setSelectedSectionId(sectionId); setSelectedContainerId(null); setSelectedGridCellId(null); }}
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
              onDropGridLayout={(sectionId, columnSpans, atStart) => addGridSection(sectionId ?? undefined, columnSpans, atStart)}
              onDropTemplate={(afterId, buildFn, atStart) => addSectionFromTemplate(buildFn, afterId, atStart)}
              onRemoveColumnsBlock={removeColumnsBlock}
              onAddContainer={(cellId, mode, spans) => addContainer(cellId, mode, spans)}
              onUpdateContainer={updateContainer}
              onAddSubCell={addContainerColumn}
              selectedContainerId={selectedContainerId}
              onSelectContainer={id => { setSelectedContainerId(id); setSelectedGridCellId(null); setSelectedId(null); }}
              zoom={zoom}
              canvasDisplayWidth={breakpoint === 'desktop' ? screenWidth : undefined}
              layoutWidth={activePage.layoutWidth ?? 'fixed'}
              maxWidth={activePage.maxWidth ?? 1280}
            />

          </div>

          {contextMenu && (
            <div
              className={'pb-context-menu'}
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
              <div className={'pb-context-menu-divider'} />
              <button className={'pb-context-menu-danger'}
                onClick={() => { deleteElement(contextMenu.id); setContextMenu(null); }}>
                Delete
              </button>
            </div>
          )}
        </div>
        <RightSidebar
          element={selectedElement}
          section={selectedElement ? null : (selectedGridCell ? null : (selectedContainer ? null : selectedSection))}
          gridCell={selectedGridCell}
          container={selectedContainer}
          onUpdateContainer={updateContainer}
          nodes={nodes}
          isInGridCell={isInGridCell}
          snapshot={state}
          onUpdate={updateElement}
          onUpdateSection={updateSection}
          onUpdateGridCell={updateGridCell}
          onDeleteGridCell={selectedGridCellId ? deleteGridCell : undefined}
          onAddGridCell={addGridCell}
          onPushSnapshot={pushSnapshot}
          onDelete={deleteElement}
          breakpoint={breakpoint}
          onUpdateResponsive={updateResponsive}
          theme={state.theme}
          pages={state.pages}
          isOpen={rightPanelOpen}
          onClose={() => setRightPanelOpen(false)}
        />
        </div>
      </div>
    </DndProvider>
  );
}
