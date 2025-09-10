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
import { Block, GlobalStyles, IBlocksState, RootLayout } from "../types";

interface StateSnapshot {
  blocks: IBlocksState;
  rootOrder: string[];
  globalStyles: GlobalStyles;
}

const MAX_HISTORY_SIZE = 50;

export const useUndoRedo = (initialState: StateSnapshot) => {
  const past = useRef<StateSnapshot[]>([]);
  const future = useRef<StateSnapshot[]>([]);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const push = useCallback((newState: StateSnapshot) => {
    const lastState = past.current[past.current.length - 1];

    // Avoid duplicate consecutive states
    if (JSON.stringify(newState) === JSON.stringify(lastState)) {
      return;
    }

    past.current.push({ ...newState });

    if (past.current.length > MAX_HISTORY_SIZE) {
      past.current.shift();
    }

    future.current = []; // clear redo stack
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback((currentState: StateSnapshot): StateSnapshot | null => {
    if (past.current.length === 0) return null;

    const previousState = past.current.pop()!;
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
