import { useCallback, useRef, useState } from 'react';
import type { BuilderState } from '../types';

const MAX_HISTORY = 50;

export function useUndoRedo() {
  const past = useRef<BuilderState[]>([]);
  const future = useRef<BuilderState[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const push = useCallback((snapshot: BuilderState) => {
    past.current.push(snapshot);
    if (past.current.length > MAX_HISTORY) past.current.shift();
    future.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback((current: BuilderState): BuilderState | null => {
    if (!past.current.length) return null;
    const prev = past.current.pop()!;
    future.current.push(current);
    setCanUndo(past.current.length > 0);
    setCanRedo(true);
    return prev;
  }, []);

  const redo = useCallback((current: BuilderState): BuilderState | null => {
    if (!future.current.length) return null;
    const next = future.current.pop()!;
    past.current.push(current);
    setCanUndo(true);
    setCanRedo(future.current.length > 0);
    return next;
  }, []);

  return { push, undo, redo, canUndo, canRedo };
}
