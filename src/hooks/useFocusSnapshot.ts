import { useRef } from 'react';
import type { BuilderState } from '../types';

export function useFocusSnapshot(snapshot: BuilderState, onPushSnapshot: (s: BuilderState) => void) {
  const ref = useRef<BuilderState | null>(null);
  const onFocus = () => { if (!ref.current) ref.current = snapshot; };
  const onBlur  = () => { if (ref.current) { onPushSnapshot(ref.current); ref.current = null; } };
  const isFocused = () => ref.current !== null;
  return { onFocus, onBlur, isFocused };
}
