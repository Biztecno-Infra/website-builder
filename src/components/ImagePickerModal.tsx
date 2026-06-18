import { useState, useEffect, useRef, useCallback } from 'react';
import { ContentModal } from './ContentModal';
import { SearchInput } from './SearchInput';
import { searchAssets, getAssetThumbnailUrl, getAssetUrl, type AssetItem, type AssetSearchParams } from '../api';
import { useDebounce } from '../hooks/useDebounce';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  searchParams?: Omit<AssetSearchParams, 'query'>;
}

const LIMIT = 10;

export function ImagePickerModal({ isOpen, onClose, onSelect, searchParams }: Props) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<AssetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if (!isOpen) { setSearch(''); setResults([]); setOffset(0); setTotalCount(0); }
  }, [isOpen]);

  // Initial fetch and on search change — replaces results
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setOffset(0);
    setTotalCount(0);

    searchAssets({ ...searchParams, query: debouncedSearch, limit: LIMIT, offset: 0 })
      .then(res => {
        if (!cancelled) {
          setResults(res.items);
          setTotalCount(res.total_count);
          setOffset(LIMIT);
        }
      })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Search failed'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [isOpen, debouncedSearch]);

  const hasMore = results.length < totalCount;

  // Load next page using offset
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    searchAssets({ ...searchParams, query: debouncedSearch, limit: LIMIT, offset })
      .then(res => {
        setResults(prev => [...prev, ...res.items]);
        setOffset(prev => prev + LIMIT);
      })
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  }, [isLoadingMore, hasMore, offset, debouncedSearch, searchParams]);

  // Infinite scroll — trigger loadMore when near bottom
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const onScroll = () => {
      if (grid.scrollTop + grid.clientHeight >= grid.scrollHeight - 100) {
        loadMore();
      }
    };
    grid.addEventListener('scroll', onScroll);
    return () => grid.removeEventListener('scroll', onScroll);
  }, [loadMore]);

  const displayItems = results.map(r => ({
    id:       r.id,
    thumbUrl: getAssetThumbnailUrl(r),
    fullUrl:  getAssetUrl(r),
    name:     r.filename,
  }));

  return (
    <ContentModal isOpen={isOpen} onClose={onClose} title="Select image">
      <div className="pb-modal-search">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search Image"
          variant="modal"
          iconPosition="right"
        />
      </div>

      <div className="pb-modal-grid" ref={gridRef} aria-busy={isLoading}>
        {isLoading && (
          <>
            {Array.from({ length: LIMIT }).map((_, i) => (
              <div key={`skeleton-${i}`} className="pb-modal-img-skeleton" aria-hidden="true" />
            ))}
            <p className="pb-modal-loading-text" role="status">Searching images…</p>
          </>
        )}
        {!isLoading && error && (
          <p className="pb-modal-empty pb-modal-error">{error}</p>
        )}
        {!isLoading && !error && displayItems.length === 0 && (
          <p className="pb-modal-empty">No results found</p>
        )}
        {!isLoading && !error && displayItems.map((item, i) => (
          <div
            key={item.id || item.name || i}
            className={`pb-modal-img-item${!item.thumbUrl ? ' pb-modal-img-item--no-thumb pb-flex-center' : ''}`}
            title={item.name}
            onClick={() => { onSelect(item.fullUrl); onClose(); }}
          >
            {item.thumbUrl
              ? <img src={item.thumbUrl} alt={item.name} loading="lazy" />
              : <span className="pb-modal-img-placeholder">{item.name}</span>
            }
          </div>
        ))}
        {isLoadingMore && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-more-${i}`} className="pb-modal-img-skeleton" aria-hidden="true" />
            ))}
          </>
        )}
      </div>
    </ContentModal>
  );
}
