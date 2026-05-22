import { useState, useRef, useEffect } from 'react';
import type { Page } from '../types';

interface Props {
  pages: Page[];
  activePageId: string;
  onSetActivePage: (id: string) => void;
  onAddPage: () => void;
  onDeletePage: (id: string) => void;
  onRenamePage: (id: string, name: string) => void;
}

export function PagePanel({ pages, activePageId, onSetActivePage, onAddPage, onDeletePage, onRenamePage }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startRename = (page: Page) => {
    setEditingId(page.id);
    setEditValue(page.name);
  };

  const commitRename = () => {
    if (editingId && editValue.trim()) {
      onRenamePage(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className={'pb-left-sidebar'}>
      <div className={'pb-sidebar-section-title'}>Pages</div>
      <div className={'pb-page-list'}>
        {pages.map((page, i) => (
          <div
            key={page.id}
            className={['pb-page-row', page.id === activePageId && 'pb-active'].filter(Boolean).join(' ')}
            onClick={() => onSetActivePage(page.id)}
          >
            <span className={'pb-page-index'}>{i + 1}</span>

            {editingId === page.id ? (
              <input
                ref={inputRef}
                className={'pb-page-name-input'}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setEditingId(null);
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                className={'pb-page-name'}
                onDoubleClick={e => { e.stopPropagation(); startRename(page); }}
                title="Double-click to rename"
              >
                {page.name}
              </span>
            )}

            <div className={'pb-page-actions'}>
              <button
                className={'pb-page-action-btn'}
                title="Rename"
                onClick={e => { e.stopPropagation(); startRename(page); }}
              >
                ✎
              </button>
              <button
                className={"pb-page-action-btn pb-danger"}
                title="Delete page"
                disabled={pages.length <= 1}
                onClick={e => { e.stopPropagation(); onDeletePage(page.id); }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className={'pb-add-page-btn'} onClick={onAddPage}>
        + Add Page
      </button>
    </aside>
  );
}
