import {
  createContext, useCallback, useContext, useEffect,
  useImperativeHandle, useMemo, useRef, useState,
  type ForwardedRef, type ReactNode,
} from 'react';
import { useBuilderStore, makeEmpty, clearDraftStorage } from '../hooks/useBuilderStore';
import { sparsifyNodes } from '../utils/sparse';
import type { Breakpoint, BuilderState } from '../types';
import type { UploadedImage, ImageSearchResult, ImageSearchResponse, UploadLibraryResponse } from '../api/hostCallbacks';

/**
 * The serialized website payload returned by {@link PageBuilderRef.getWebsiteData}.
 * `websiteJson` is the full builder state with its node map sparsified (only
 * values that differ from defaults are stored), suitable for persisting to an API.
 */
export interface WebsiteData {
  /** The user-facing website name, trimmed of surrounding whitespace. */
  websiteName: string;
  /** The complete builder document — `BuilderState` with a sparsified node map. */
  websiteJson: BuilderState;
}

/**
 * The result of running {@link PageBuilderRef.validate}.
 */
export interface ValidationResult {
  /** `true` when no validation errors were found. */
  isValid: boolean;
  /** Human-readable messages describing each validation failure. Empty when valid. */
  errors: string[];
}

/**
 * Imperative API exposed by `PageBuilder` through a React ref.
 *
 * Host applications attach a ref to `<PageBuilder ref={ref} />` and call these
 * methods to drive Save / Publish / Export and other actions externally — the
 * builder owns all editor state, so no `onSave`-style callbacks are required.
 *
 * @example
 * ```tsx
 * const builderRef = useRef<PageBuilderRef>(null);
 *
 * const handleSave = async () => {
 *   const { isValid, errors } = builderRef.current!.validate();
 *   if (!isValid) return alert(errors.join('\n'));
 *   const { websiteName, websiteJson } = builderRef.current!.getWebsiteData();
 *   await api.save(websiteName, websiteJson);
 * };
 *
 * return <PageBuilder ref={builderRef} />;
 * ```
 */
export interface PageBuilderRef {
  /**
   * Returns the website ready to persist: the trimmed website name and the full
   * builder document with its node map sparsified for compact storage.
   */
  getWebsiteData: () => WebsiteData;
  /**
   * Returns the current, live builder state (full node map, not sparsified).
   * Use this for in-memory inspection; prefer {@link getWebsiteData} for saving.
   */
  getState: () => BuilderState;
  /**
   * Validates the website (currently the website name; extensible for future
   * rules) and returns a structured result.
   */
  validate: () => ValidationResult;
  /**
   * Clears the persisted local draft (the single `microsite-builder-v5` entry)
   * and resets the canvas to an empty document. Call this when starting a new
   * website so the builder begins blank and re-fills as the user builds.
   */
  clearDraft: () => void;
}

/**
 * Everything the builder UI needs to render and mutate the document: the full
 * builder store (state + all actions) plus the shared, cross-cutting UI state
 * (selection of carousels/accordions, zoom, breakpoint, preview, panels).
 *
 * Consume it from any descendant of `PageBuilderProvider` via {@link usePageBuilder}.
 */
export type PageBuilderContextValue = ReturnType<typeof useBuilderStore> & {
  // ── Carousel / accordion selection (not part of the core store) ──
  selectedCarouselId: string | null;
  setSelectedCarouselId: (id: string | null) => void;
  selectedAccordionId: string | null;
  setSelectedAccordionId: (id: string | null) => void;
  // ── Shared editor UI state ──
  snapEnabled: boolean;
  zoom: number;
  setZoom: (z: number) => void;
  changeZoom: (delta: number) => void;
  breakpoint: Breakpoint;
  setBreakpoint: (bp: Breakpoint) => void;
  previewMode: boolean;
  setPreviewMode: React.Dispatch<React.SetStateAction<boolean>>;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  setPreviewDevice: (d: 'desktop' | 'tablet' | 'mobile') => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  contextMenu: { x: number; y: number; id: string } | null;
  setContextMenu: (m: { x: number; y: number; id: string } | null) => void;
  previewScrollRef: React.MutableRefObject<number>;
  capturePreviewScroll: () => void;
  /** The live website name (state.site.name) — single source of truth. */
  websiteName: string;
  onImageUpload?: (file: File) => Promise<UploadedImage>;
  onImageSearch?: (query: string, offset: number, limit: number) => Promise<ImageSearchResponse>;
  onFetchUploads?: (offset: number, limit: number) => Promise<UploadLibraryResponse>;
};

const PageBuilderContext = createContext<PageBuilderContextValue | null>(null);

/**
 * Access the shared PageBuilder store + UI state. Must be called from a component
 * rendered inside {@link PageBuilderProvider}; throws otherwise.
 */
export function usePageBuilder(): PageBuilderContextValue {
  const ctx = useContext(PageBuilderContext);
  if (!ctx) {
    throw new Error('usePageBuilder must be used within a <PageBuilderProvider>');
  }
  return ctx;
}

export interface PageBuilderProviderProps {
  initialState?: BuilderState;
  /** Notified after every state change (skips the initial render). */
  onChange?: (state: BuilderState) => void;
  /** Forwarded ref from `PageBuilder` — receives the imperative {@link PageBuilderRef}. */
  apiRef?: ForwardedRef<PageBuilderRef>;
  children: ReactNode;
  onImageUpload?: (file: File) => Promise<UploadedImage>;
  onImageSearch?: (query: string, offset: number, limit: number) => Promise<ImageSearchResponse>;
  onFetchUploads?: (offset: number, limit: number) => Promise<UploadLibraryResponse>;
}

/**
 * Owns the builder store, the shared editor UI state, and the cross-cutting
 * effects (onChange, selection cleanup). It also binds the imperative
 * {@link PageBuilderRef} to the forwarded `apiRef`, so the host's ref API and
 * the in-tree context read from one source of truth.
 */
export function PageBuilderProvider({ initialState, onChange, apiRef, children, onImageUpload, onImageSearch, onFetchUploads }: PageBuilderProviderProps) {
  const store = useBuilderStore(initialState);
  const { state, nodes, stateRef, importState } = store;

  // ── Carousel / accordion selection ──
  const [selectedCarouselId, setSelectedCarouselId] = useState<string | null>(null);
  const [selectedAccordionId, setSelectedAccordionId] = useState<string | null>(null);

  // ── Shared editor UI state ──
  const [snapEnabled] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const previewScrollRef = useRef<number>(0);

  const capturePreviewScroll = useCallback(() => {
    previewScrollRef.current = document.querySelector('.pb-canvas-wrapper')?.scrollTop ?? 0;
  }, []);

  const changeZoom = useCallback((delta: number) =>
    setZoom(z => Math.round(Math.min(200, Math.max(25, z * 100 + delta)) / 5) * 5 / 100), []);

  // The website name is part of the builder document (state.site.name), keeping
  // the builder state as the single source of truth.
  const websiteName = state.site.name ?? '';

  // ── Imperative API bound to the forwarded ref (host-facing) ──
  // stateRef holds the latest state so callers always read current values
  // without re-binding the handle on every change.
  useImperativeHandle(apiRef, () => ({
    getWebsiteData: () => {
      const current = stateRef.current;
      return {
        websiteName: (current.site.name ?? '').trim(),
        websiteJson: { ...current, nodes: sparsifyNodes(current.nodes) },
      };
    },
    getState: () => stateRef.current,
    validate: () => {
      const errors: string[] = [];
      if (!(stateRef.current.site.name ?? '').trim()) {
        errors.push('Website name is required.');
      }
      // Future validation rules can append to `errors` here.
      return { isValid: errors.length === 0, errors };
    },
    clearDraft: () => {
      // Remove the persisted draft, then reset the canvas to empty. The store's
      // autosave effect re-persists the empty doc, so the single
      // microsite-builder-v5 entry now reflects a fresh, blank website.
      clearDraftStorage();
      importState(makeEmpty());
    },
  }), [apiRef, stateRef, importState]);

  // Notify host of state changes (skip the first render).
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    onChange?.(state);
  }, [state, onChange]);

  // When initialState loads async (e.g. API fetch resolves after first render), sync it in.
  const initialStateRef = useRef(initialState);
  useEffect(() => {
    if (initialState && initialState !== initialStateRef.current) {
      initialStateRef.current = initialState;
      importState(initialState);
    }
  }, [initialState, importState]);

  // Clear carousel/accordion selection if the node was removed (e.g. after undo).
  useEffect(() => {
    if (selectedCarouselId && !nodes[selectedCarouselId]) setSelectedCarouselId(null);
  }, [nodes, selectedCarouselId]);
  useEffect(() => {
    if (selectedAccordionId && !nodes[selectedAccordionId]) setSelectedAccordionId(null);
  }, [nodes, selectedAccordionId]);

  const value = useMemo<PageBuilderContextValue>(() => ({
    ...store,
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
    websiteName,
    onImageUpload, onImageSearch, onFetchUploads,
  }), [
    store,
    selectedCarouselId, selectedAccordionId,
    snapEnabled, zoom, changeZoom, breakpoint,
    previewMode, previewDevice, rightPanelOpen, contextMenu,
    capturePreviewScroll, websiteName,
    onImageUpload, onImageSearch, onFetchUploads,
  ]);

  return <PageBuilderContext.Provider value={value}>{children}</PageBuilderContext.Provider>;
}
