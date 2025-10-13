
import { useCallback, useRef, useState } from "react";
import { GlobalStyles, IBlocksState } from "../types";

interface StateSnapshot {
  blocks: IBlocksState;
  rootOrder: string[];
  globalStyles: GlobalStyles;
}

interface BlockDiff {
  [blockId: string]: any | undefined; // undefined = block removed
}

interface ChangeEntry {
  prevBlocks: BlockDiff;
  prevRootOrder?: string[];
  prevGlobalStyles?: GlobalStyles;
}

interface UseUndoRedoOptions {
  maxEntries?: number | null; // null = unlimited
}

const isShallowEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => a[k] === b[k]);
};

export const useUndoRedo = (
  initialState: StateSnapshot,
  options: UseUndoRedoOptions = {}
) => {
  const maxEntries = options.maxEntries ?? null;

  const past = useRef<ChangeEntry[]>([]);
  const future = useRef<ChangeEntry[]>([]);
  const lastSnapshotRef = useRef<StateSnapshot>({ ...initialState });

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // --- transaction support ---
  const transactionRef = useRef<Partial<StateSnapshot> | null>(null);

  const beginTransaction = useCallback(() => {
    transactionRef.current = {};
  }, []);

  const endTransaction = useCallback(
    (finalState: StateSnapshot) => {
      if (!transactionRef.current) return;
      transactionRef.current = null;
      push(finalState);
    },
    []
  );

  const push = useCallback(
    (newState: StateSnapshot) => {
      if (transactionRef.current) {
        // inside a transaction → just store latest state, don't push yet
        transactionRef.current = newState;
        return;
      }

      const prev = lastSnapshotRef.current;

      const prevBlocks = prev.blocks;
      const nextBlocks = newState.blocks;

      const changedIds: string[] = [];
      const keySet = new Set([...Object.keys(prevBlocks), ...Object.keys(nextBlocks)]);

      keySet.forEach((id) => {
        const a = prevBlocks[id];
        const b = nextBlocks[id];
        if (!isShallowEqual(a, b)) {
          changedIds.push(id);
        }
      });

      const entry: ChangeEntry = { prevBlocks: {} };
      for (const id of changedIds) {
        entry.prevBlocks[id] = prevBlocks[id]; // may be undefined if new block
      }

      if (prev.rootOrder !== newState.rootOrder) {
        entry.prevRootOrder = prev.rootOrder;
      }
      if (prev.globalStyles !== newState.globalStyles) {
        entry.prevGlobalStyles = prev.globalStyles;
      }

      const hasChange =
        Object.keys(entry.prevBlocks).length > 0 ||
        entry.prevRootOrder !== undefined ||
        entry.prevGlobalStyles !== undefined;

      if (!hasChange) {
        lastSnapshotRef.current = { ...newState };
        return;
      }

      past.current.push(entry);
      if (maxEntries !== null && past.current.length > maxEntries) {
        past.current.shift();
      }

      future.current = [];
      lastSnapshotRef.current = { ...newState };

      setCanUndo(past.current.length > 0);
      setCanRedo(false);
    },
    [maxEntries]
  );

  const undo = useCallback(
    (current: StateSnapshot): Promise<StateSnapshot | null> => {
      if (past.current.length === 0) return Promise.resolve(null);

      const entry = past.current.pop()!;
      const newBlocks: IBlocksState = { ...current.blocks };
      const redoEntry: ChangeEntry = { prevBlocks: {} };

      for (const id of Object.keys(entry.prevBlocks)) {
        redoEntry.prevBlocks[id] = current.blocks[id];
        const prevVal = entry.prevBlocks[id];
        if (prevVal === undefined) {
          delete newBlocks[id];
        } else {
          newBlocks[id] = prevVal;
        }
      }

      let newRootOrder = current.rootOrder;
      if (entry.prevRootOrder) {
        redoEntry.prevRootOrder = current.rootOrder;
        newRootOrder = entry.prevRootOrder;
      }

      let newGlobalStyles = current.globalStyles;
      if (entry.prevGlobalStyles) {
        redoEntry.prevGlobalStyles = current.globalStyles;
        newGlobalStyles = entry.prevGlobalStyles;
      }

      future.current.push(redoEntry);

      const snapshot: StateSnapshot = {
        blocks: newBlocks,
        rootOrder: newRootOrder,
        globalStyles: newGlobalStyles,
      };

      lastSnapshotRef.current = snapshot;
      setCanUndo(past.current.length > 0);
      setCanRedo(future.current.length > 0);

      return Promise.resolve(snapshot);
    },
    []
  );

  const redo = useCallback(
    (current: StateSnapshot): Promise<StateSnapshot | null> => {
      if (future.current.length === 0) return Promise.resolve(null);

      const entry = future.current.pop()!;
      const nextBlocks: IBlocksState = { ...current.blocks };
      const inverse: ChangeEntry = { prevBlocks: {} };

      for (const id of Object.keys(entry.prevBlocks)) {
        inverse.prevBlocks[id] = current.blocks[id];
        const val = entry.prevBlocks[id];
        if (val === undefined) {
          delete nextBlocks[id];
        } else {
          nextBlocks[id] = val;
        }
      }

      let nextRootOrder = current.rootOrder;
      if (entry.prevRootOrder) {
        inverse.prevRootOrder = current.rootOrder;
        nextRootOrder = entry.prevRootOrder;
      }

      let nextGlobalStyles = current.globalStyles;
      if (entry.prevGlobalStyles) {
        inverse.prevGlobalStyles = current.globalStyles;
        nextGlobalStyles = entry.prevGlobalStyles;
      }

      past.current.push(inverse);
      if (maxEntries !== null && past.current.length > maxEntries) {
        past.current.shift();
      }

      const snapshot: StateSnapshot = {
        blocks: nextBlocks,
        rootOrder: nextRootOrder,
        globalStyles: nextGlobalStyles,
      };

      lastSnapshotRef.current = snapshot;
      setCanUndo(past.current.length > 0);
      setCanRedo(future.current.length > 0);

      return Promise.resolve(snapshot);
    },
    [maxEntries]
  );

  const resetHistory = useCallback((state: StateSnapshot) => {
    past.current = [];
    future.current = [];
    lastSnapshotRef.current = { ...state };
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  return {
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    beginTransaction,
    endTransaction,
    historySize: past.current.length,
    futureSize: future.current.length,
    resetHistory,
  };
};
