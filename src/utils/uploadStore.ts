export interface StoredFile {
  id: string;
  name: string;
  url: string;
  kind: 'image' | 'gif' | 'video';
}

type Listener = () => void;

const _files: StoredFile[] = [];
const _listeners = new Set<Listener>();

export const uploadStore = {
  getFiles: (): StoredFile[] => [..._files],
  addFiles: (files: StoredFile[]): void => {
    _files.unshift(...files);
    _listeners.forEach(l => l());
  },
  subscribe: (fn: Listener): (() => void) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
