import type { AnyNode, CanvasElement, Container, ElementAction, GridCell, GridSection, NodeMap, Section } from '../types';
import {
  DEFAULT_ANIMATION, DEFAULT_CONTENT, DEFAULT_GRID_CELL_STYLE,
  DEFAULT_INTERACTION, DEFAULT_SECTION_BG, DEFAULT_STYLE, DEFAULT_FLEX_LAYOUT,
  interactionToAction,
} from './builderDefaults';

// ── Primitive helpers ──────────────────────────────────────────────────────

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// Returns val with all keys matching def stripped out.
// Returns undefined when the result would be entirely empty (all matched defaults).
function sparsifyVal(val: unknown, def: unknown): unknown {
  if (val === def) return undefined;
  if (Array.isArray(val)) return val; // arrays always kept verbatim
  if (isObj(val) && isObj(def)) {
    const out: Obj = {};
    for (const k of Object.keys(val)) {
      const s = sparsifyVal(val[k], def[k]);
      if (s !== undefined) out[k] = s;
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }
  return val; // different primitive or no default — keep
}

// Deep-merges sparse onto def. Sparse values win; missing keys fall back to def.
function hydrateVal(sparse: unknown, def: unknown): unknown {
  if (sparse === undefined) return def;
  if (Array.isArray(sparse)) return sparse;
  if (isObj(sparse) && isObj(def)) {
    const out: Obj = { ...def };
    for (const k of Object.keys(sparse)) {
      out[k] = hydrateVal(sparse[k], def[k]);
    }
    return out;
  }
  return sparse;
}

// ── Per-type defaults ──────────────────────────────────────────────────────

const ELEMENT_DEFAULTS = {
  layout:      { x: 0, y: 0, width: 200, height: 100, zIndex: 0, rotation: 0 },
  style:       DEFAULT_STYLE,
  content:     DEFAULT_CONTENT,
  interaction: DEFAULT_INTERACTION,
  animation:   DEFAULT_ANIMATION,
  state:       { hidden: false, locked: false },
  flexLayout:  DEFAULT_FLEX_LAYOUT,
};

const GRID_CELL_DEFAULTS = {
  columnSpan: 4,
  rowSpan:    1,
  style:      DEFAULT_GRID_CELL_STYLE,
};

const SECTION_DEFAULTS = {
  layout:     { height: 400 },
  style: {
    background: DEFAULT_SECTION_BG,
    columns:    { count: 1, widths: [] as number[], styles: {} as Record<string, unknown> },
    padding:    { top: 0, right: 0, bottom: 0, left: 0 },
  },
  layoutMode: 'free',
  grid:       { gap: 24, rowGap: 24 },
};

// ── Public API ─────────────────────────────────────────────────────────────

export function sparsifyNode(node: AnyNode): Obj {
  if (node.type === 'section') {
    const sec = node as Section;
    const out: Obj = {
      id: sec.id, type: sec.type, role: sec.role,
      label: sec.label, layoutMode: sec.layoutMode,
      children: sec.children,
    };
    const sl = sparsifyVal(sec.layout, SECTION_DEFAULTS.layout);
    if (sl !== undefined) out.layout = sl;
    const ss = sparsifyVal(sec.style, SECTION_DEFAULTS.style);
    if (ss !== undefined) out.style = ss;
    if ((sec as GridSection).grid) {
      const sg = sparsifyVal((sec as GridSection).grid, SECTION_DEFAULTS.grid);
      if (sg !== undefined) out.grid = sg;
    }
    if (sec.scrollBehavior && sec.scrollBehavior !== 'normal') out.scrollBehavior = sec.scrollBehavior;
    if (sec.stickyOffset !== undefined && sec.stickyOffset !== 0) out.stickyOffset = sec.stickyOffset;
    if (sec.responsive && (sec.responsive.tablet || sec.responsive.mobile)) out.responsive = sec.responsive;
    return out;
  }

  if (node.type === 'grid-cell') {
    const cell = node as GridCell;
    const out: Obj = {
      id: cell.id, type: cell.type, parent: cell.parent,
      children: cell.children,
    };
    const cs = sparsifyVal(cell.columnSpan, GRID_CELL_DEFAULTS.columnSpan);
    if (cs !== undefined) out.columnSpan = cs;
    const rs = sparsifyVal(cell.rowSpan, GRID_CELL_DEFAULTS.rowSpan);
    if (rs !== undefined) out.rowSpan = rs;
    const st = sparsifyVal(cell.style, GRID_CELL_DEFAULTS.style);
    if (st !== undefined) out.style = st;
    if (cell.responsive && Object.keys(cell.responsive).length > 0)
      out.responsive = cell.responsive;
    if (cell.freeHeight !== undefined) out.freeHeight = cell.freeHeight;
    return out;
  }

  if (node.type === 'container') {
    const c = node as Container;
    const result: Obj = { id: c.id, type: 'container', parent: c.parent, children: c.children, layoutMode: c.layoutMode, gap: c.gap, rowGap: c.rowGap };
    if (c.responsive && (c.responsive.tablet || c.responsive.mobile)) result.responsive = c.responsive;
    return result;
  }

  // CanvasElement
  const el = node as CanvasElement;
  const out: Obj = { id: el.id, type: el.type, parent: el.parent };
  const sl = sparsifyVal(el.layout, ELEMENT_DEFAULTS.layout);
  if (sl !== undefined) out.layout = sl;
  const ss = sparsifyVal(el.style, ELEMENT_DEFAULTS.style);
  if (ss !== undefined) out.style = ss;
  const sc = sparsifyVal(el.content, ELEMENT_DEFAULTS.content);
  if (sc !== undefined) out.content = sc;
  const si = sparsifyVal(el.interaction, ELEMENT_DEFAULTS.interaction);
  if (si !== undefined) out.interaction = si;
  const sa = sparsifyVal(el.animation, ELEMENT_DEFAULTS.animation);
  if (sa !== undefined) out.animation = sa;
  const sst = sparsifyVal(el.state, ELEMENT_DEFAULTS.state);
  if (sst !== undefined) out.state = sst;
  const sf = sparsifyVal(el.flexLayout, ELEMENT_DEFAULTS.flexLayout);
  if (sf !== undefined) out.flexLayout = sf;
  if (el.responsive && Object.keys(el.responsive).length > 0)
    out.responsive = el.responsive;
  if (el.overlayInCell) out.overlayInCell = true;
  // Always persist action when it has a real type, or when a legacy interaction exists
  // (preserves action.type='none' as a deliberate "clear this legacy link" override)
  if (el.action && (el.action.type !== 'none' || si !== undefined)) out.action = el.action;
  return out;
}

export function hydrateNode(raw: Obj): AnyNode {
  if (raw.type === 'section') {
    return {
      ...(hydrateVal(raw, SECTION_DEFAULTS) as Obj),
      id: raw.id, type: raw.type, role: raw.role,
      label: raw.label ?? '',
      layoutMode: raw.layoutMode ?? 'free',
      children: (raw.children as string[]) ?? [],
      ...(raw.responsive ? { responsive: raw.responsive } : {}),
    } as AnyNode;
  }

  if (raw.type === 'grid-cell') {
    return {
      ...(hydrateVal(raw, GRID_CELL_DEFAULTS) as Obj),
      id: raw.id, type: raw.type, parent: raw.parent,
      children: (raw.children as string[]) ?? [],
      responsive: raw.responsive ?? {},
    } as AnyNode;
  }

  if (raw.type === 'container' || raw.type === 'columns') {
    const c: AnyNode = {
      id: raw.id, type: 'container', parent: raw.parent,
      children: (raw.children as string[]) ?? [],
      layoutMode: (raw.layoutMode as string) ?? 'grid',
      gap: (raw.gap as number) ?? 16,
      rowGap: (raw.rowGap as number) ?? 0,
    } as AnyNode;
    if (raw.responsive) (c as import('../types').Container).responsive = raw.responsive as import('../types').ContainerResponsive;
    return c;
  }

  // CanvasElement
  const hydrated = {
    ...(hydrateVal(raw, ELEMENT_DEFAULTS) as Obj),
    id: raw.id, type: raw.type, parent: raw.parent,
    responsive: raw.responsive ?? {},
  } as CanvasElement;
  // Unify click behavior: explicit `action` wins; otherwise migrate the legacy
  // `interaction` model so older saved docs keep working with the new editor/export.
  if (raw.action) {
    hydrated.action = raw.action as ElementAction;
  } else {
    const migrated = interactionToAction(hydrated.interaction);
    if (migrated) hydrated.action = migrated;
  }
  return hydrated;
}

// ── NodeMap-level helpers ──────────────────────────────────────────────────

export function sparsifyNodes(nodes: NodeMap): Record<string, Obj> {
  const out: Record<string, Obj> = {};
  for (const [id, node] of Object.entries(nodes)) {
    out[id] = sparsifyNode(node);
  }
  return out;
}

export function hydrateNodes(raw: Record<string, unknown>): NodeMap {
  const out: NodeMap = {};
  for (const [id, node] of Object.entries(raw)) {
    if (isObj(node)) out[id] = hydrateNode(node);
  }
  return out;
}
