import { useRef, useState } from 'react';
import { PageBuilder, hydrateNodes } from 'page-builder';
import type {
  BuilderState, PageBuilderRef,
  UploadedImage, ImageSearchResponse, UploadLibraryResponse,
} from 'page-builder';
import 'page-builder/styles';

const SITE_KEY     = 'example-site';
const UPLOADS_KEY  = 'example-uploads';

// ── Simulated API helpers ──────────────────────────────────────────────────

function loadFromApi(): BuilderState | undefined {
  try {
    const raw = localStorage.getItem(SITE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return { ...parsed, nodes: hydrateNodes(parsed.nodes) };
  } catch { return undefined; }
}

async function saveToApi(_websiteName: string, websiteJson: BuilderState) {
  localStorage.setItem(SITE_KEY, JSON.stringify(websiteJson));
  // real app: await fetch('/api/sites/1', { method: 'PUT', body: JSON.stringify({ websiteName, websiteJson }) })
}

// Simulated upload library stored in localStorage
function getUploadLibrary(): UploadedImage[] {
  try {
    const raw = localStorage.getItem(UPLOADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveUploadLibrary(uploads: UploadedImage[]) {
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads));
}

// ── Callback implementations (replace with real fetchRequest calls) ─────────

async function handleImageUpload(file: File): Promise<UploadedImage> {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 800));

  // Real app: POST to your backend which uploads to Widen and returns the result
  // const res = await fetch('/api/assets/upload', { method: 'POST', body: formData });
  // const data = await res.json();
  // return { imageUrl: data.imageUrl, assetId: data.assetId, assetUrl: data.assetUrl };

  // Demo: create a local object URL so the image renders on canvas immediately
  const imageUrl = URL.createObjectURL(file);
  const assetId  = `demo_${Date.now()}`;
  const result: UploadedImage = { imageUrl, assetId };

  // Persist to simulated upload library so onFetchUploads returns it later
  const library = getUploadLibrary();
  library.unshift(result);
  saveUploadLibrary(library.slice(0, 100));

  return result;
}

async function handleImageSearch(query: string, offset: number, limit: number): Promise<ImageSearchResponse> {
  // Real app: GET /api/assets/search?query=...&offset=...&limit=...
  // const res = await fetch(`/api/assets/search?query=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}`);
  // const data = await res.json();
  // return { items: data.items, totalCount: data.totalCount };

  // Demo: return placeholder tiles so the picker shows something
  await new Promise(r => setTimeout(r, 400));
  const DEMO_IMAGES = [
    { imageUrl: 'https://picsum.photos/seed/knight1/400/300', name: 'Hero Banner',   assetId: 'demo_s1' },
    { imageUrl: 'https://picsum.photos/seed/knight2/400/300', name: 'Product Shot',  assetId: 'demo_s2' },
    { imageUrl: 'https://picsum.photos/seed/knight3/400/300', name: 'Team Photo',    assetId: 'demo_s3' },
    { imageUrl: 'https://picsum.photos/seed/knight4/400/300', name: 'Background',    assetId: 'demo_s4' },
    { imageUrl: 'https://picsum.photos/seed/knight5/400/300', name: 'Office',        assetId: 'demo_s5' },
    { imageUrl: 'https://picsum.photos/seed/knight6/400/300', name: 'Conference',    assetId: 'demo_s6' },
    { imageUrl: 'https://picsum.photos/seed/knight7/400/300', name: 'Abstract',      assetId: 'demo_s7' },
    { imageUrl: 'https://picsum.photos/seed/knight8/400/300', name: 'Landscape',     assetId: 'demo_s8' },
  ];
  const filtered = query
    ? DEMO_IMAGES.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
    : DEMO_IMAGES;
  const page = filtered.slice(offset, offset + limit);
  return { items: page, totalCount: filtered.length };
}

async function handleFetchUploads(offset: number, limit: number): Promise<UploadLibraryResponse> {
  // Real app: GET /api/assets/uploads?offset=...&limit=...
  // const res = await fetch(`/api/assets/uploads?offset=${offset}&limit=${limit}`);
  // const data = await res.json();
  // return { items: data.items, totalCount: data.totalCount };

  // Demo: return uploads saved to localStorage during this session
  await new Promise(r => setTimeout(r, 200));
  const all  = getUploadLibrary();
  const page = all.slice(offset, offset + limit);
  return {
    items: page.map(u => ({ imageUrl: u.imageUrl, assetId: u.assetId, assetUrl: u.assetUrl })),
    totalCount: all.length,
  };
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [initialState] = useState<BuilderState | undefined>(loadFromApi);
  const builderRef = useRef<PageBuilderRef>(null);

  const handleSave = async () => {
    const builder = builderRef.current;
    if (!builder) return;
    const { isValid, errors } = builder.validate();
    if (!isValid) { alert(errors.join('\n')); return; }
    const { websiteName, websiteJson } = builder.getWebsiteData();
    await saveToApi(websiteName, websiteJson);
    console.log('saved', websiteName, websiteJson);
  };

  const handlePublish = async () => {
    await handleSave();
    alert('Published!');
  };

  const handleCreateNew = () => {
    builderRef.current?.clearDraft();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', gap: 8, padding: 8, borderBottom: '1px solid #e2e8f0' }}>
        <button onClick={handleCreateNew}>Create New Website</button>
        <button onClick={handleSave}>Save</button>
        <button onClick={handlePublish}>Publish</button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <PageBuilder
          ref={builderRef}
          initialState={initialState}
          onImageUpload={handleImageUpload}
          onImageSearch={handleImageSearch}
          onFetchUploads={handleFetchUploads}
        />
      </div>
    </div>
  );
}
