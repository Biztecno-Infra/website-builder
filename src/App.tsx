import './builder.css';
import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Canvas } from './components/Canvas';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { AlignmentToolbar } from './components/AlignmentToolbar';
import { Toolbar } from './components/Toolbar';
import { Icon } from './components/Icon';
import { makeEmpty, DEFAULT_THEME } from './hooks/useBuilderStore';
import { PageBuilderProvider, usePageBuilder } from './context/PageBuilderContext';
import type { PageBuilderRef } from './context/PageBuilderContext';
import { makeKnightState } from './data/knightState';
import { exportHtml } from './utils/exportHtml';
import { sparsifyNodes } from './utils/sparse';
import type { Breakpoint, BuilderState, Container, GridCell, CanvasElement } from './types';

export interface PageBuilderProps {
  initialState?: BuilderState;
  siteName?: string;
  onPublish?: (state: BuilderState) => void | Promise<void>;
  onChange?: (state: BuilderState) => void;
}

/**
 * Thin entry component. Provides the builder store + shared UI state via
 * {@link PageBuilderProvider} (which also binds the imperative {@link PageBuilderRef}
 * to the forwarded ref), then renders the editor shell which consumes that context.
 */
const App = forwardRef<PageBuilderRef, PageBuilderProps>(function App(
  { initialState, siteName = 'Website Builder', onPublish, onChange }: PageBuilderProps = {},
  ref,
) {
  return (
    <PageBuilderProvider initialState={initialState} onChange={onChange} apiRef={ref}>
      <PageBuilderShell siteName={siteName} onPublish={onPublish} />
    </PageBuilderProvider>
  );
});

interface PageBuilderShellProps {
  siteName: string;
  onPublish?: (state: BuilderState) => void | Promise<void>;
}

function PageBuilderShell({ siteName, onPublish }: PageBuilderShellProps) {
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
    copyElement,
    pasteElement,
    deleteSelected,
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
    addCarousel,
    updateCarousel,
    updateCarouselResponsive,
    addSlide,
    deleteSlide,
    duplicateSlide,
    reorderSlide,
    setActiveSlide,
    addAccordion,
    updateAccordion,
    updateAccordionResponsive,
    addAccordionItem,
    deleteAccordionItem,
    duplicateAccordionItem,
    reorderAccordionItem,
    toggleAccordionItem,
    resetAccordionRuntime,
    // ── Shared UI state (provided by PageBuilderProvider) ──
    websiteName,
    selectedCarouselId, setSelectedCarouselId,
    selectedAccordionId, setSelectedAccordionId,
    snapEnabled,
    zoom, setZoom, changeZoom,
    breakpoint, setBreakpoint,
    previewMode, setPreviewMode,
    previewDevice, setPreviewDevice,
    rightPanelOpen, setRightPanelOpen,
    contextMenu, setContextMenu,
    previewScrollRef, capturePreviewScroll,
  } = usePageBuilder();

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
  const selectedCarousel = selectedCarouselId
    ? (nodes[selectedCarouselId] as import('./types').Carousel | undefined ?? null)
    : null;

  const handleAddCarousel = useCallback((sectionId?: string, dropX?: number, dropY?: number) => {
    const id = addCarousel(sectionId, dropX, dropY);
    if (id) {
      setSelectedCarouselId(id);
      setSelectedId(null);
      setSelectedIds([]);
      setSelectedGridCellId(null);
      setSelectedContainerId(null);
    }
  }, [addCarousel, setSelectedId, setSelectedIds, setSelectedGridCellId]);

  const selectedAccordion = selectedAccordionId
    ? (nodes[selectedAccordionId] as import('./types').Accordion | undefined ?? null)
    : null;

  const handleAddAccordion = useCallback((sectionId?: string, dropX?: number, dropY?: number) => {
    const id = addAccordion(sectionId, dropX, dropY);
    if (id) {
      setSelectedAccordionId(id);
      setSelectedId(null);
      setSelectedIds([]);
      setSelectedGridCellId(null);
      setSelectedContainerId(null);
      setSelectedCarouselId(null);
    }
  }, [addAccordion, setSelectedId, setSelectedIds, setSelectedGridCellId]);
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
        n.type !== 'section' && n.type !== 'grid-cell' && n.type !== 'container' && n.type !== 'carousel')
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
    const json = JSON.stringify({ ...state, nodes: sparsifyNodes(state.nodes) }, null, 2);
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

        importState(raw);

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

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        if (!previewMode) { capturePreviewScroll(); resetAccordionRuntime(); }
        setPreviewMode(p => !p);
        return;
      }
      if (e.key === 'Escape') {
        if (previewMode) { setPreviewMode(false); return; }
        // Bubble up selection one level at a time: element → container → cell → section → deselect
        if (selectedId) { setSelectedId(null); return; }
        if (selectedIds.length > 0) { setSelectedIds([]); return; }
        if (selectedContainerId) { setSelectedContainerId(null); return; }
        if (selectedGridCellId) { setSelectedGridCellId(null); return; }
        if (selectedCarouselId) { setSelectedCarouselId(null); return; }
        if (selectedAccordionId) { setSelectedAccordionId(null); return; }
        if (selectedSectionId) { setSelectedSectionId(null); return; }
        return;
      }

      if (previewMode) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedIds.length > 0) { deleteSelected(); return; }
        if (selectedId) { deleteElement(selectedId); setSelectedId(null); return; }
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
        const ids = selectedIds.filter(id => !!elements[id]);
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
      stateRef, elements, previewMode, changeZoom, setZoom,
      capturePreviewScroll, resetAccordionRuntime]);

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
        <div className={"pb-app pb-preview-app pb-flex-col"}>
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
              // Interactive runtime callbacks — these mutate only transient UI
              // state (activeSlide / activeItems), never the document or undo
              // history, so Preview behaves like the exported/published site.
              onSetActiveSlide={setActiveSlide}
              onToggleAccordionItem={toggleAccordionItem}
              previewMode
              previewWidth={previewWidth}
              onPreviewNavigatePage={setActivePage}
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
      <div className={'pb-app pb-flex-col'}>
        <Toolbar
          siteName={websiteName || siteName}
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
          onPreview={() => { capturePreviewScroll(); resetAccordionRuntime(); setPreviewMode(true); }}
          onExportHTML={handleExportHTML}
          onExportJSON={handleExportJSON}
          onImport={() => importRef.current?.click()}
          onLoadDemo={() => importState(makeKnightState())}
          onClear={() => {
            if (window.confirm('Clear the canvas and start with an empty page? (Ctrl+Z to undo)')) {
              importState(makeEmpty());
            }
          }}
          onPublish={onPublish ? () => onPublish({ ...state, nodes: sparsifyNodes(state.nodes) }) : undefined}
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
          onAddCarousel={() => handleAddCarousel()}
          onAddFreeSection={addSection}
          onAddGridSection={columnSpans => addGridSection(undefined, columnSpans)}
          onAddSectionFromTemplate={addSectionFromTemplate}
          onAddContainer={(mode, spans) => selectedGridCellId && addContainer(selectedGridCellId, mode, spans)}
          selectedIds={selectedIds}
          selectedSectionId={selectedSectionId}
          selectedGridCellId={selectedGridCellId}
          selectedContainerId={selectedContainerId}
          selectedCarouselId={selectedCarouselId}
          onSelect={id => { setSelectedId(id); setSelectedCarouselId(null); setSelectedAccordionId(null); setSelectedContainerId(null); }}
          onSelectGridCell={id => { setSelectedGridCellId(id); setSelectedId(null); setSelectedIds([]); setSelectedCarouselId(null); setSelectedAccordionId(null); }}
          onSelectContainer={id => { setSelectedContainerId(id); setSelectedGridCellId(null); setSelectedId(null); setSelectedIds([]); setSelectedCarouselId(null); setSelectedAccordionId(null); }}
          onSelectCarousel={id => { const c = nodes[id]; setSelectedCarouselId(id); setSelectedSectionId(c && 'parent' in c ? (c as Container).parent : null); setSelectedId(null); setSelectedIds([]); setSelectedGridCellId(null); setSelectedContainerId(null); setSelectedAccordionId(null); }}
          onAddAccordion={() => handleAddAccordion()}
          selectedAccordionId={selectedAccordionId}
          onSelectAccordion={id => { const c = nodes[id]; setSelectedAccordionId(id); setSelectedSectionId(c && 'parent' in c ? (c as Container).parent : null); setSelectedId(null); setSelectedIds([]); setSelectedGridCellId(null); setSelectedContainerId(null); setSelectedCarouselId(null); }}
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
          onSelectSection={id => { setSelectedSectionId(id); setSelectedIds([]); setSelectedId(null); setSelectedGridCellId(null); setSelectedContainerId(null); setSelectedCarouselId(null); setSelectedAccordionId(null); }}
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

        <div className={'pb-middle-container pb-flex-col'}>
          <div className={'pb-content-wrapper pb-flex-col'} style={{ position: 'relative' }} ref={canvasWrapperRef}>
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
              onSelectSection={id => { setSelectedSectionId(id); setSelectedIds([]); setSelectedId(null); setSelectedGridCellId(null); setSelectedContainerId(null); setSelectedCarouselId(null); setSelectedAccordionId(null); }}
              onSelectElement={(id, shift) => { if (shift) { toggleSelectedId(id); } else { setSelectedId(id); setSelectedContainerId(null); setSelectedCarouselId(null); setSelectedAccordionId(null); } }}
              onSelectGridCell={id => { setSelectedGridCellId(id); setSelectedId(null); setSelectedIds([]); setSelectedContainerId(null); setSelectedCarouselId(null); setSelectedAccordionId(null); }}
              onDeselect={() => { setSelectedIds([]); setSelectedId(null); setSelectedSectionId(null); setSelectedGridCellId(null); setSelectedContainerId(null); setSelectedCarouselId(null); setSelectedAccordionId(null); }}
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
              onSelectContainer={id => { setSelectedContainerId(id); setSelectedGridCellId(null); setSelectedId(null); setSelectedCarouselId(null); setSelectedAccordionId(null); }}
              selectedCarouselId={selectedCarouselId}
              onSelectCarousel={id => { setSelectedCarouselId(id); setSelectedSectionId(nodes[id] && 'parent' in nodes[id] ? (nodes[id] as Container).parent : null); setSelectedId(null); setSelectedIds([]); setSelectedGridCellId(null); setSelectedContainerId(null); setSelectedAccordionId(null); }}
              onSetActiveSlide={setActiveSlide}
              onAddSlide={addSlide}
              onAddCarousel={handleAddCarousel}
              onUpdateCarousel={updateCarousel}
              onUpdateCarouselResponsive={updateCarouselResponsive}
              selectedAccordionId={selectedAccordionId}
              onSelectAccordion={id => { setSelectedAccordionId(id); setSelectedSectionId(nodes[id] && 'parent' in nodes[id] ? (nodes[id] as Container).parent : null); setSelectedId(null); setSelectedIds([]); setSelectedGridCellId(null); setSelectedContainerId(null); setSelectedCarouselId(null); }}
              onAddAccordion={handleAddAccordion}
              onUpdateAccordion={updateAccordion}
              onUpdateAccordionResponsive={updateAccordionResponsive}
              onToggleAccordionItem={toggleAccordionItem}
              onAddAccordionItem={addAccordionItem}
              zoom={zoom}
              canvasDisplayWidth={breakpoint === 'desktop' ? 1280 : undefined}
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
          section={selectedElement ? null : (selectedGridCell ? null : (selectedContainer ? null : (selectedCarousel ? null : (selectedAccordion ? null : selectedSection))))}
          gridCell={selectedGridCell}
          container={selectedContainer}
          onUpdateContainer={updateContainer}
          carousel={selectedElement || selectedGridCell || selectedContainer ? null : selectedCarousel}
          onUpdateCarousel={updateCarousel}
          onUpdateCarouselResponsive={updateCarouselResponsive}
          onAddSlide={addSlide}
          onDeleteSlide={deleteSlide}
          onDuplicateSlide={duplicateSlide}
          onReorderSlide={reorderSlide}
          onSetActiveSlide={setActiveSlide}
          onSelectSlide={id => { setSelectedGridCellId(id); setSelectedCarouselId(null); setSelectedId(null); setSelectedIds([]); }}
          selectedSlideId={selectedGridCellId}
          accordion={selectedElement || selectedGridCell || selectedContainer || selectedCarousel ? null : selectedAccordion}
          onUpdateAccordion={updateAccordion}
          onUpdateAccordionResponsive={updateAccordionResponsive}
          onAddAccordionItem={addAccordionItem}
          onDeleteAccordionItem={deleteAccordionItem}
          onDuplicateAccordionItem={duplicateAccordionItem}
          onReorderAccordionItem={reorderAccordionItem}
          onToggleAccordionItem={toggleAccordionItem}
          onSelectAccordionItemCell={id => { setSelectedGridCellId(id); setSelectedAccordionId(null); setSelectedId(null); setSelectedIds([]); }}
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

export default App;
