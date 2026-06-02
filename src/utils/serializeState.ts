import type { BuilderState } from '../types';
import { sparsifyNodes } from './sparse';

/**
 * Produces a lean JSON-safe representation of the builder state.
 * Strips default values from nodes so the file is small.
 * Import restores all defaults via hydrateNodes automatically.
 */
export function serializeState(state: BuilderState): object {
  return { ...state, nodes: sparsifyNodes(state.nodes) };
}
