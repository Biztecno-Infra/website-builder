import type { CanvasElement, ElementHover } from '../types';

// ── Button hover (Phase 1) ───────────────────────────────────────────────────
// Single source of truth for hover CSS, shared by the in-editor canvas, preview
// mode, published sites, and downloaded HTML exports — so the four targets are
// always byte-for-byte consistent.
//
// Why a CSS string (not inline styles): a `:hover` pseudo-class can only be
// expressed in a stylesheet, and the element's base background/text colors are
// applied as *inline* styles. Inline styles beat ordinary class selectors, so
// the hover overrides use `!important` to win on the hovered state only; the
// non-hover state is untouched and falls back to the element's default styles.

export const DEFAULT_TRANSITION_MS = 200;

// Builds the hover CSS for one element scoped to `selector` (e.g. `.ec-abc123`).
// Returns '' when there's nothing to emit, so callers can concatenate freely.
//   selector            -> base transition (smooth state change)
//   selector:hover      -> background / color overrides (only the set ones)
export function hoverCss(el: CanvasElement, selector: string): string {
  const h: ElementHover | undefined = el.style.hover;
  if (!h || !h.enabled || (!h.backgroundColor && !h.textColor)) return '';

  const dur = h.transitionDuration ?? DEFAULT_TRANSITION_MS;
  const hoverDecls: string[] = [];
  if (h.backgroundColor) hoverDecls.push(`background:${h.backgroundColor} !important`);
  if (h.textColor) hoverDecls.push(`color:${h.textColor} !important`);

  return `${selector}{transition:all ${dur}ms ease}${selector}:hover{${hoverDecls.join(';')}}`;
}
