import { useRef, useState } from 'react';
import { PageBuilder, hydrateNodes } from 'page-builder';
import type { BuilderState, PageBuilderRef } from 'page-builder';
import 'page-builder/styles';

const SITE_KEY = 'example-site';

// Simulate API load — hydrate nodes so the builder gets full defaults back
function loadFromApi(): BuilderState | undefined {
  try {
    const raw = localStorage.getItem(SITE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return { ...parsed, nodes: hydrateNodes(parsed.nodes) };
  } catch { return undefined; }
}

// Simulate API save — the builder already sparsifies nodes in getWebsiteData()
async function saveToApi(_websiteName: string, websiteJson: BuilderState) {
  localStorage.setItem(SITE_KEY, JSON.stringify(websiteJson));
  // real app: await fetch('/api/sites/1', { method: 'PUT', body: JSON.stringify({ websiteName, websiteJson }) })
}

export default function App() {
  // useState with lazy initializer — runs loadFromApi only once on mount
  const [initialState] = useState<BuilderState | undefined>(loadFromApi);

  // Drive the builder imperatively via its ref — the host triggers Save/Publish.
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
    // real app: await fetch('/api/sites/1/publish', { method: 'POST' })
    alert('Published!');
  };

  const handleCreateNew = () => {
    // Clears the persisted microsite-builder-v5 draft and resets the canvas to
    // empty, so the builder starts blank and re-fills as the user builds.
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
        <PageBuilder ref={builderRef} initialState={initialState} />
      </div>
    </div>
  );
}
