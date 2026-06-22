import { useState } from 'react';
import { PageBuilder, sparsifyNodes, hydrateNodes } from 'page-builder';
import type { BuilderState } from 'page-builder';
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

// Simulate API save — sparsify nodes so only changed values are stored
async function saveToApi(state: BuilderState) {
  const payload = { ...state, nodes: sparsifyNodes(state.nodes) };
  localStorage.setItem(SITE_KEY, JSON.stringify(payload));
  // real app: await fetch('/api/sites/1', { method: 'PUT', body: JSON.stringify(payload) })
}

export default function App() {
  // useState with lazy initializer — runs loadFromApi only once on mount
  const [initialState] = useState<BuilderState | undefined>(loadFromApi);

  const handleSave = async (state: BuilderState) => {
    await saveToApi(state);
    console.log('saved ', state);
  };

  const handlePublish = async (state: BuilderState) => {
    await saveToApi(state);
    // real app: await fetch('/api/sites/1/publish', { method: 'POST' })
    alert('Published!');
  };

  return (
    <PageBuilder
      initialState={initialState}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
