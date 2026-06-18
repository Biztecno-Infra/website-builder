import { useState, useEffect, useRef } from 'react';
import type React from 'react';
import { useDrag } from 'react-dnd';
import { SearchInput } from './SearchInput';
import { uploadStore, type StoredFile } from '../utils/uploadStore';
import { IconButton } from './IconButton';
import { UPLOAD_IMAGE_DND_TYPE, type UploadImageDragItem } from './LeftSidebar';
import { useWidenUpload, UPLOAD_STAGE_LABEL } from '../hooks/useWidenUpload';

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
  const fileRef = useRef<HTMLInputElement>(null);
  // Same upload flow as the Image Properties panel — saving to the library
  // (and the subscription below) keeps both entry points in sync.
  const { upload, status: uploadStatus, error: uploadError, isUploading } = useWidenUpload();

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
            // Upload + save to library only — no auto-insert into the canvas.
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

      <div className={'pb-uploads-grid'}>
        {filtered.length === 0 ? (
          <p className={'pb-uploads-empty'}>
            {files.length === 0 ? 'No uploads yet' : 'No files match your search'}
          </p>
        ) : (
          filtered.map(file => <UploadItem key={file.id} file={file} />)
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
    // Only images/gifs become canvas image elements; videos aren't draggable.
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
