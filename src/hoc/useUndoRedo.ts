// // import { useRef, useState, useCallback } from "react";
// // import {  GlobalStyles, IBlocksState } from "../types";

// // interface StateSnapshot {
// //   blocks: IBlocksState;
// //   rootOrder: string[];
// //   globalStyles: GlobalStyles;
// // }

// // interface UseUndoRedoOptions {
// //   maxEntries?: number;
// //   isEqual?: (a: StateSnapshot, b: StateSnapshot) => boolean;
// // }

// // const defaultIsEqual = (a: StateSnapshot, b: StateSnapshot): boolean => {
// //   return (
// //     a === b ||
// //     (a.blocks === b.blocks &&
// //       a.rootOrder === b.rootOrder &&
// //       a.globalStyles === b.globalStyles)
// //   );
// // };

// // export const useUndoRedo = (
// //   initialState: StateSnapshot,
// //   options: UseUndoRedoOptions = {}
// // ) => {
// //   const maxEntries = Math.max(1, options.maxEntries ?? 20000);
// //   const isEqual = options.isEqual ?? defaultIsEqual;

// //   const past = useRef<StateSnapshot[]>([]);
// //   const future = useRef<StateSnapshot[]>([]);

// //   const [canUndo, setCanUndo] = useState(false);
// //   const [canRedo, setCanRedo] = useState(false);

// //   const push = useCallback((newState: StateSnapshot) => {
// //     const lastState = past.current[past.current.length - 1];

// //     // Avoid duplicate consecutive states using fast reference equality
// //     if (lastState && isEqual(newState, lastState)) {
// //       return;
// //     }

// //     // Shallow container copy to freeze references without deep cloning
// //     past.current.push({ ...newState });

// //     if (past.current.length > maxEntries) {
// //       past.current.shift();
// //     }

// //     // clear redo stack
// //     if (future.current.length) future.current = [];
// //     setCanUndo(past.current.length > 0);
// //     setCanRedo(false);
// //   }, [isEqual, maxEntries]);

// //   const undo = useCallback((currentState: StateSnapshot): StateSnapshot | null => {
// //     if (past.current.length === 0) return null;

// //     const previousState = past.current.pop()!;
// //     // Shallow container copy to preserve references
// //     future.current.push({ ...currentState });

// //     setCanUndo(past.current.length > 0);
// //     setCanRedo(true);

// //     return previousState;
// //   }, []);

// //   const redo = useCallback((currentState: StateSnapshot): StateSnapshot | null => {
// //     if (future.current.length === 0) return null;

// //     const nextState = future.current.pop()!;
// //     past.current.push({ ...currentState });

// //     setCanUndo(true);
// //     setCanRedo(future.current.length > 0);

// //     return nextState;
// //   }, []);

// //   return {
// //     push,
// //     undo,
// //     redo,
// //     canUndo,
// //     canRedo,
// //   };
// // };


// import { useCallback, useRef, useState } from "react";
// import { GlobalStyles, IBlocksState } from "../types";

// interface StateSnapshot {
//   blocks: IBlocksState;
//   rootOrder: string[];
//   globalStyles: GlobalStyles;
// }

// interface ChangeEntry {
//   // map of blockId -> previous value (undefined means the block did not exist previously)
//   prevBlocks: { [blockId: string]: any };
//   // only present if rootOrder changed
//   prevRootOrder?: string[] | undefined;
//   // only present if globalStyles changed
//   prevGlobalStyles?: GlobalStyles | undefined;
// }

// interface UseUndoRedoOptions {
//   // we keep unlimited by default; but user may still supply a number to cap entries
//   maxEntries?: number | null;
//   // allow custom equality if caller needs to override (optional)
//   isEqual?: (a: StateSnapshot, b: StateSnapshot) => boolean;
// }

// const defaultIsEqual = (a: StateSnapshot, b: StateSnapshot): boolean => {
//   return a === b;
// };

// export const useUndoRedo = (
//   initialState: StateSnapshot,
//   options: UseUndoRedoOptions = {}
// ) => {
//   // allow optional cap; null means unlimited
//   const maxEntries = options.maxEntries ?? null;
//   const isEqual = options.isEqual ?? defaultIsEqual;

//   // store change diffs (previous values)
//   const past = useRef<ChangeEntry[]>([]);
//   const future = useRef<ChangeEntry[]>([]);

//   // lastSnapshotRef stores the last fully-pushed snapshot (to compute diffs vs new push)
//   const lastSnapshotRef = useRef<StateSnapshot>({ ...initialState });

//   const [canUndo, setCanUndo] = useState(false);
//   const [canRedo, setCanRedo] = useState(false);

//   /**
//    * push(newState)
//    * - computes the minimal delta between lastSnapshotRef.current and newState
//    * - stores an entry containing previous values only for changed keys/blocks
//    */
//   const push = useCallback(
//     (newState: StateSnapshot) => {
//       const prev = lastSnapshotRef.current;

//       // quick equal check if user provided custom isEqual
//       if (isEqual(prev, newState)) return;

//       const prevBlocks = prev.blocks || {};
//       const nextBlocks = newState.blocks || {};

//       const changedBlockIds: string[] = [];

//       // union of keys (cheap: object keys)
//       const prevKeys = Object.keys(prevBlocks);
//       const nextKeys = Object.keys(nextBlocks);
//       const keySet = new Set<string>([...prevKeys, ...nextKeys]);

//       keySet.forEach((id) => {
//         // reference equality — if the block object reference changed, record previous
//         if (prevBlocks[id] !== nextBlocks[id]) {
//           changedBlockIds.push(id);
//         }
//       });

//       const changeEntry: ChangeEntry = {
//         prevBlocks: {},
//       };

//       // store previous values for changed blocks only (may be undefined)
//       for (const id of changedBlockIds) {
//         if (Object.prototype.hasOwnProperty.call(prevBlocks, id)) {
//           changeEntry.prevBlocks[id] = prevBlocks[id];
//         } else {
//           // previously didn't exist
//           changeEntry.prevBlocks[id] = undefined;
//         }
//       }

//       // store previous rootOrder only if reference changed
//       if (prev.rootOrder !== newState.rootOrder) {
//         changeEntry.prevRootOrder = prev.rootOrder;
//       }

//       // store previous globalStyles only if reference changed
//       if (prev.globalStyles !== newState.globalStyles) {
//         changeEntry.prevGlobalStyles = prev.globalStyles;
//       }

//       // if nothing changed, no-op
//       const hasMeaningfulChange =
//         Object.keys(changeEntry.prevBlocks).length > 0 ||
//         changeEntry.prevRootOrder !== undefined ||
//         changeEntry.prevGlobalStyles !== undefined;

//       if (!hasMeaningfulChange) {
//         // update the lastSnapshotRef but don't add an entry
//         lastSnapshotRef.current = { ...newState };
//         return;
//       }

//       // push to past
//       past.current.push(changeEntry);

//       // enforce maxEntries cap if provided
//       if (maxEntries !== null && past.current.length > maxEntries) {
//         past.current.shift();
//       }

//       // clear redo stack
//       if (future.current.length) future.current = [];

//       // update last snapshot
//       lastSnapshotRef.current = { ...newState };

//       setCanUndo(past.current.length > 0);
//       setCanRedo(false);
//     },
//     [isEqual, maxEntries]
//   );

//   /**
//    * undo(currentState)
//    * - returns a previous full StateSnapshot or null
//    * - also prepares the redo stack entry by capturing the current values of changed ids
//    */
//   const undo = useCallback(
//     (currentState: StateSnapshot): Promise<StateSnapshot | null> => {
//       if (past.current.length === 0) {
//         return Promise.resolve(null);
//       }

//       const entry = past.current.pop()!;
//       // Build the previous full snapshot by applying prev values onto a shallow copy of currentState
//       const newBlocks: IBlocksState = { ...currentState.blocks };

//       // For redo, capture the "current" values for the keys in this entry
//       const redoEntry: ChangeEntry = { prevBlocks: {} };

//       // apply previous blocks
//       for (const id of Object.keys(entry.prevBlocks)) {
//         // capture current for redo
//         if (Object.prototype.hasOwnProperty.call(currentState.blocks, id)) {
//           redoEntry.prevBlocks[id] = currentState.blocks[id];
//         } else {
//           redoEntry.prevBlocks[id] = undefined;
//         }

//         const prevVal = entry.prevBlocks[id];
//         if (prevVal === undefined) {
//           // previously didn't exist -> remove
//           if (Object.prototype.hasOwnProperty.call(newBlocks, id)) {
//             delete newBlocks[id];
//           }
//         } else {
//           // restore previous value
//           newBlocks[id] = prevVal;
//         }
//       }

//       // handle rootOrder
//       let newRootOrder = currentState.rootOrder;
//       if (entry.prevRootOrder !== undefined) {
//         // capture for redo
//         redoEntry.prevRootOrder = currentState.rootOrder;
//         newRootOrder = entry.prevRootOrder!;
//       }

//       // handle globalStyles
//       let newGlobalStyles = currentState.globalStyles;
//       if (entry.prevGlobalStyles !== undefined) {
//         // capture for redo
//         redoEntry.prevGlobalStyles = currentState.globalStyles;
//         newGlobalStyles = entry.prevGlobalStyles!;
//       }

//       // push redo entry to future
//       future.current.push(redoEntry);

//       // update lastSnapshotRef to the snapshot we are returning (so next push diffs compare correctly)
//       const previousSnapshot: StateSnapshot = {
//         blocks: newBlocks,
//         rootOrder: newRootOrder,
//         globalStyles: newGlobalStyles,
//       };
//       lastSnapshotRef.current = { ...previousSnapshot };

//       setCanUndo(past.current.length > 0);
//       setCanRedo(future.current.length > 0);

//       return Promise.resolve(previousSnapshot);
//     },
//     []
//   );

//   /**
//    * redo(currentState)
//    * - returns the "next" snapshot if available
//    */
//   const redo = useCallback(
//     (currentState: StateSnapshot): Promise<StateSnapshot | null> => {
//       if (future.current.length === 0) {
//         return Promise.resolve(null);
//       }

//       const entry = future.current.pop()!;

//       // apply entry.prev* values onto a shallow copy of currentState to produce the next snapshot
//       const nextBlocks: IBlocksState = { ...currentState.blocks };

//       // capture an inverse (for past) from currentState for the keys changed (so we can undo redo)
//       const inverseEntry: ChangeEntry = { prevBlocks: {} };

//       for (const id of Object.keys(entry.prevBlocks)) {
//         // capture current state for inverse (past)
//         if (Object.prototype.hasOwnProperty.call(currentState.blocks, id)) {
//           inverseEntry.prevBlocks[id] = currentState.blocks[id];
//         } else {
//           inverseEntry.prevBlocks[id] = undefined;
//         }

//         const val = entry.prevBlocks[id];
//         if (val === undefined) {
//           // entry says previously undefined -> remove this id
//           if (Object.prototype.hasOwnProperty.call(nextBlocks, id)) {
//             delete nextBlocks[id];
//           }
//         } else {
//           // restore the value carried by the entry
//           nextBlocks[id] = val;
//         }
//       }

//       let nextRootOrder = currentState.rootOrder;
//       if (entry.prevRootOrder !== undefined) {
//         inverseEntry.prevRootOrder = currentState.rootOrder;
//         nextRootOrder = entry.prevRootOrder!;
//       }

//       let nextGlobalStyles = currentState.globalStyles;
//       if (entry.prevGlobalStyles !== undefined) {
//         inverseEntry.prevGlobalStyles = currentState.globalStyles;
//         nextGlobalStyles = entry.prevGlobalStyles!;
//       }

//       // push inverse into past (so undo will work)
//       past.current.push(inverseEntry);
//       // enforce cap if needed
//       if (maxEntries !== null && past.current.length > maxEntries) {
//         past.current.shift();
//       }

//       // update last snapshot
//       const nextSnapshot: StateSnapshot = {
//         blocks: nextBlocks,
//         rootOrder: nextRootOrder,
//         globalStyles: nextGlobalStyles,
//       };
//       lastSnapshotRef.current = { ...nextSnapshot };

//       setCanUndo(past.current.length > 0);
//       setCanRedo(future.current.length > 0);

//       return Promise.resolve(nextSnapshot);
//     },
//     [maxEntries]
//   );

//   return {
//     push,
//     undo,
//     redo,
//     canUndo,
//     canRedo,
//   };
// };

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
  };
};
