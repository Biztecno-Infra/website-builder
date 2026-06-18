export interface StoredFile {
  id: string;
  name: string;
  url: string;
  kind: 'image' | 'gif' | 'video';
  /** Widen asset (self) URL, when the file originated from a Widen upload. */
  assetUrl?: string;
  /** Original uploaded file name, when known. */
  fileName?: string;
}

type Listener = () => void;

// Local asset library — temporary persistence until the backend asset
// library is available. Mirrors the in-memory list to localStorage.
const STORAGE_KEY = 'website-builder-assets';

const _listeners = new Set<Listener>();

function isStoredFile(v: unknown): v is StoredFile {
  if (!v || typeof v !== 'object') return false;
  const f = v as Record<string, unknown>;
  return typeof f.id === 'string' && typeof f.url === 'string';
}

function load(): StoredFile[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isStoredFile) : [];
  } catch {
    return [];
  }
}

function persist(files: StoredFile[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch {
    // ignore quota / serialization errors — in-memory list still works
  }
}

// Hydrated from localStorage on module init so the panel shows saved assets on mount.
let _files: StoredFile[] = load();

export const uploadStore = {
  getFiles: (): StoredFile[] => [..._files],

  addFiles: (files: StoredFile[]): void => {
    // Dedupe by id: drop any incoming id already present, then prepend so
    // new uploads appear at the top of the list.
    const incomingIds = new Set(files.map(f => f.id));
    _files = [...files, ..._files.filter(f => !incomingIds.has(f.id))];
    persist(_files);
    _listeners.forEach(l => l());
  },

  subscribe: (fn: Listener): (() => void) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
