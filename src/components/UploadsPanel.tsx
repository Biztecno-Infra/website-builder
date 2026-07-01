import { useState, useEffect, useRef } from 'react';
import type React from 'react';
import { useDrag } from 'react-dnd';
import { SearchInput } from './SearchInput';
import { uploadStore, type StoredFile } from '../utils/uploadStore';
import { IconButton } from './IconButton';
import { UPLOAD_IMAGE_DND_TYPE, type UploadImageDragItem } from './LeftSidebar';
import { useWidenUpload, UPLOAD_STAGE_LABEL } from '../hooks/useWidenUpload';
import { usePageBuilder } from '../context/PageBuilderContext';

type FilterTab = 'all' | 'images' | 'gif' | 'video';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',    label: 'All'    },
  { key: 'images', label: 'Images' },
  { key: 'gif',    label: 'Gif'    },
  { key: 'video',  label: 'Video'  },
];

const FETCH_LIMIT = 20;

interface Props {
  onClose: () => void;
}

export function UploadsPanel({ onClose }: Props) {
  const { onFetchUploads } = usePageBuilder();
  // When the host provides onFetchUploads, backend is the source of truth — skip localStorage seed.
  const [files, setFiles]   = useState<StoredFile[]>(() => onFetchUploads ? [] : uploadStore.getFiles());
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [fetchOffset, setFetchOffset] = useState(0);
  const [fetchTotal, setFetchTotal] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { upload, status: uploadStatus, error: uploadError, isUploading } = useWidenUpload();

  // Subscribe to uploadStore for newly uploaded files this session
  useEffect(() => {
    const unsub = uploadStore.subscribe(() => setFiles(uploadStore.getFiles()));
    return unsub;
  }, []);

  // On mount, seed the panel from the host's backend if callback is provided
  useEffect(() => {
    if (!onFetchUploads) return;
    setIsFetching(true);
    onFetchUploads(0, FETCH_LIMIT)
      .then(res => {
        const stored: StoredFile[] = res.items.map(r => ({
          id: r.assetId ?? r.imageUrl,
          name: r.name ?? '',
          url: r.imageUrl,
          kind: 'image' as const,
          assetUrl: r.assetUrl,
          fileName: r.name,
        }));
        uploadStore.addFiles(stored);
        setFetchTotal(res.totalCount);
        setFetchOffset(res.items.length);
      })
      .catch(() => {})
      .finally(() => setIsFetching(false));
  }, [onFetchUploads]);

  const hasMore = onFetchUploads ? fetchOffset < fetchTotal : false;

  const loadMore = () => {
    if (!onFetchUploads || isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    onFetchUploads(fetchOffset, FETCH_LIMIT)
      .then(res => {
        const stored: StoredFile[] = res.items.map(r => ({
          id: r.assetId ?? r.imageUrl,
          name: r.name ?? '',
          url: r.imageUrl,
          kind: 'image' as const,
          assetUrl: r.assetUrl,
          fileName: r.name,
        }));
        uploadStore.addFiles(stored);
        setFetchOffset(prev => prev + res.items.length);
      })
      .catch(() => {})
      .finally(() => setIsFetchingMore(false));
  };

  // Infinite scroll
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const onScroll = () => {
      if (grid.scrollTop + grid.clientHeight >= grid.scrollHeight - 100) loadMore();
    };
    grid.addEventListener('scroll', onScroll);
    return () => grid.removeEventListener('scroll', onScroll);
  }, [loadMore]);

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

      <div className={'pb-uploads-upload'}>
        <button
          className={'pb-img-action-btn pb-img-upload-btn'}
          disabled={isUploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploadStatus ? UPLOAD_STAGE_LABEL[uploadStatus] : 'Upload'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void upload(file);
          }}
        />
        {uploadError && (
          <div className={'pb-img-upload-error'} role="alert">{uploadError}</div>
        )}
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

      <div className={'pb-uploads-grid'} ref={gridRef}>
        {isFetching && (
          <p className={'pb-uploads-empty'} role="status">Loading uploads…</p>
        )}
        {!isFetching && filtered.length === 0 && (
          <p className={'pb-uploads-empty'}>
            {files.length === 0 ? 'No uploads yet' : 'No files match your search'}
          </p>
        )}
        {!isFetching && filtered.map(file => <UploadItem key={file.id} file={file} />)}
        {isFetchingMore && (
          <p className={'pb-uploads-empty'} role="status">Loading more…</p>
        )}
      </div>
    </aside>
  );
}

function UploadItem({ file }: { file: StoredFile }) {
  const isVideo = file.kind === 'video';

  const [{ isDragging }, dragRef] = useDrag<UploadImageDragItem, void, { isDragging: boolean }>({
    type: UPLOAD_IMAGE_DND_TYPE,
    item: {
      kind: 'upload-image',
      src: file.url,
      assetId: file.id,
      assetUrl: file.assetUrl,
      fileName: file.fileName ?? file.name,
    },
    canDrag: !isVideo,
    collect: m => ({ isDragging: m.isDragging() }),
  });

  return (
    <div
      ref={dragRef as unknown as React.Ref<HTMLDivElement>}
      className={'pb-uploads-item'}
      style={{ opacity: isDragging ? 0.4 : 1, cursor: isVideo ? 'default' : 'grab' }}
      title={isVideo ? file.name : 'Drag onto the canvas to add this image'}
    >
      {isVideo ? (
        <video src={file.url} className={'pb-uploads-media'} />
      ) : (
        <img src={file.url} alt={file.name} className={'pb-uploads-media'} draggable={false} />
      )}
      <div className={'pb-uploads-item-overlay pb-abs-fill'}>
        <span className={'pb-uploads-item-name'}>{file.name}</span>
      </div>
    </div>
  );
}
