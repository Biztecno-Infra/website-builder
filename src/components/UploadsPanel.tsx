import { useState, useEffect } from 'react';
import { SearchInput } from './SearchInput';
import { uploadStore, type StoredFile } from '../utils/uploadStore';
import { IconButton } from './IconButton';

type FilterTab = 'all' | 'images' | 'gif' | 'video';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',    label: 'All'    },
  { key: 'images', label: 'Images' },
  { key: 'gif',    label: 'Gif'    },
  { key: 'video',  label: 'Video'  },
];

interface Props {
  onClose: () => void;
}

export function UploadsPanel({ onClose }: Props) {
  const [files, setFiles]   = useState<StoredFile[]>(() => uploadStore.getFiles());
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = uploadStore.subscribe(() => setFiles(uploadStore.getFiles()));
    return unsub;
  }, []);

  const filtered = files.filter(f => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'images') return f.kind === 'image';
    if (filter === 'gif')    return f.kind === 'gif';
    if (filter === 'video')  return f.kind === 'video';
    return true;
  });

  return (
    <aside className={'pb-left-sidebar pb-flex-col'}>
      <div className={'pb-blocks-header pb-flex-between'}>
        <span className={'pb-blocks-header-title'}>Uploads</span>
        <IconButton variant="close" onClick={onClose} title="Close">✕</IconButton>
      </div>

      <div className={'pb-blocks-search'}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search..." />
      </div>

      <div className={'pb-uploads-tabs'}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={['pb-uploads-tab', filter === key && 'pb-active'].filter(Boolean).join(' ')}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={'pb-uploads-grid'}>
        {filtered.length === 0 ? (
          <p className={'pb-uploads-empty'}>
            {files.length === 0 ? 'No uploads yet' : 'No files match your search'}
          </p>
        ) : (
          filtered.map(file => (
            <div key={file.id} className={'pb-uploads-item'}>
              {file.kind === 'video' ? (
                <video src={file.url} className={'pb-uploads-media'} />
              ) : (
                <img src={file.url} alt={file.name} className={'pb-uploads-media'} />
              )}
              <div className={'pb-uploads-item-overlay pb-abs-fill'}>
                <span className={'pb-uploads-item-name'}>{file.name}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
