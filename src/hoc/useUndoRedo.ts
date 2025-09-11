// // hooks/useUndoRedo.ts
// import { useRef, useState } from "react";
// import { Block, GlobalStyles, IBlocksState, RootLayout } from "../types";

// interface StateSnapshot {
//   blocks: IBlocksState;
//   rootOrder: string[];
//   globalStyles: GlobalStyles;
//   selectedBlock: Block | RootLayout | null;
// }


// export const useUndoRedo = (initialState: StateSnapshot) => {
//   const past = useRef<StateSnapshot[]>([]);
//   const future = useRef<StateSnapshot[]>([]);

//   const [canUndo, setCanUndo] = useState(false);
//   const [canRedo, setCanRedo] = useState(false);

//   const push = (state: StateSnapshot) => {
//     past.current.push(JSON.parse(JSON.stringify(state)));
//     future.current = [];
//     setCanUndo(true);
//     setCanRedo(false);
//   };

//   const undo = (currentState: StateSnapshot): StateSnapshot | null => {
//     if (past.current.length === 0) return null;
//     const prev = past.current.pop()!;
//     future.current.push(JSON.parse(JSON.stringify(currentState)));
//     setCanUndo(past.current.length > 0);
//     setCanRedo(true);
//     return prev;
//   };

//   const redo = (currentState: StateSnapshot): StateSnapshot | null => {
//     if (future.current.length === 0) return null;
//     const next = future.current.pop()!;
//     past.current.push(JSON.parse(JSON.stringify(currentState)));
//     setCanUndo(true);
//     setCanRedo(future.current.length > 0);
//     return next;
//   };

//   return {
//     push,
//     undo,
//     redo,
//     canUndo,
//     canRedo,
//   };
// };


import { useRef, useState, useCallback } from "react";
import {  GlobalStyles, IBlocksState } from "../types";

interface StateSnapshot {
  blocks: IBlocksState;
  rootOrder: string[];
  globalStyles: GlobalStyles;
}

interface UseUndoRedoOptions {
  maxEntries?: number;
  isEqual?: (a: StateSnapshot, b: StateSnapshot) => boolean;
}

const defaultIsEqual = (a: StateSnapshot, b: StateSnapshot): boolean => {
  return (
    a === b ||
    (a.blocks === b.blocks &&
      a.rootOrder === b.rootOrder &&
      a.globalStyles === b.globalStyles)
  );
};

export const useUndoRedo = (
  initialState: StateSnapshot,
  options: UseUndoRedoOptions = {}
) => {
  const maxEntries = Math.max(1, options.maxEntries ?? 20000);
  const isEqual = options.isEqual ?? defaultIsEqual;

  const past = useRef<StateSnapshot[]>([]);
  const future = useRef<StateSnapshot[]>([]);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const push = useCallback((newState: StateSnapshot) => {
    const lastState = past.current[past.current.length - 1];

    // Avoid duplicate consecutive states using fast reference equality
    if (lastState && isEqual(newState, lastState)) {
      return;
    }

    // Shallow container copy to freeze references without deep cloning
    past.current.push({ ...newState });

    if (past.current.length > maxEntries) {
      past.current.shift();
    }

    // clear redo stack
    if (future.current.length) future.current = [];
    setCanUndo(past.current.length > 0);
    setCanRedo(false);
  }, [isEqual, maxEntries]);

  const undo = useCallback((currentState: StateSnapshot): StateSnapshot | null => {
    if (past.current.length === 0) return null;

    const previousState = past.current.pop()!;
    // Shallow container copy to preserve references
    future.current.push({ ...currentState });

    setCanUndo(past.current.length > 0);
    setCanRedo(true);

    return previousState;
  }, []);

  const redo = useCallback((currentState: StateSnapshot): StateSnapshot | null => {
    if (future.current.length === 0) return null;

    const nextState = future.current.pop()!;
    past.current.push({ ...currentState });

    setCanUndo(true);
    setCanRedo(future.current.length > 0);

    return nextState;
  }, []);

  return {
    push,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};


//Patches based undo redo using immer
// import { useRef, useState, useCallback } from "react";
// import { GlobalStyles, IBlocksState } from "../types";
// import { produceWithPatches, applyPatches, Patch } from "immer";

// interface StateSnapshot {
//   blocks: IBlocksState;
//   rootOrder: string[];
//   globalStyles: GlobalStyles;
// }

// interface HistoryEntry {
//   state: StateSnapshot;
//   patches: Patch[];
//   inversePatches: Patch[];
// }

// export const useUndoRedo = (initialState: StateSnapshot) => {
//   const past = useRef<HistoryEntry[]>([]);
//   const future = useRef<HistoryEntry[]>([]);

//   const [canUndo, setCanUndo] = useState(false);
//   const [canRedo, setCanRedo] = useState(false);

//   const push = useCallback(
//     (current: StateSnapshot, updater: (draft: StateSnapshot) => void) => {
//       const [next, patches, inversePatches] = produceWithPatches(
//         current,
//         updater
//       );

//       past.current.push({ state: next, patches, inversePatches });
//       future.current.length = 0; // clear redo stack

//       setCanUndo(past.current.length > 0);
//       setCanRedo(false);

//       return next;
//     },
//     []
//   );

//   const undo = useCallback((current: StateSnapshot): StateSnapshot | null => {
//     if (past.current.length === 0) return null;

//     const last = past.current.pop()!;
//     const prev = applyPatches(current, last.inversePatches);

//     future.current.push(last);
//     setCanUndo(past.current.length > 0);
//     setCanRedo(true);

//     return prev;
//   }, []);

//   const redo = useCallback((current: StateSnapshot): StateSnapshot | null => {
//     if (future.current.length === 0) return null;

//     const nextEntry = future.current.pop()!;
//     const next = applyPatches(current, nextEntry.patches);

//     past.current.push(nextEntry);
//     setCanUndo(true);
//     setCanRedo(future.current.length > 0);

//     return next;
//   }, []);

//   return {
//     push,
//     undo,
//     redo,
//     canUndo,
//     canRedo,
//   };
// };


