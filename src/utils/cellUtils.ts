import type { Breakpoint, CellLayoutMode, GridCell, GridCellStyle } from '../types';

// ── Responsive cascade helpers for GridCell ────────────────────────────────
// Single source of truth for breakpoint cascade used by both the editor and export.

export function getCellColumnSpan(cell: GridCell, bp: Breakpoint): number {
  if (bp === 'mobile') return cell.responsive.mobile?.columnSpan ?? cell.responsive.tablet?.columnSpan ?? cell.columnSpan ?? 4;
  if (bp === 'tablet') return cell.responsive.tablet?.columnSpan ?? cell.columnSpan ?? 4;
  return cell.columnSpan ?? 4;
}

export function getCellLayoutMode(cell: GridCell, bp: Breakpoint): CellLayoutMode {
  if (bp === 'mobile') return cell.responsive.mobile?.layoutMode ?? cell.responsive.tablet?.layoutMode ?? cell.style.layoutMode;
  if (bp === 'tablet') return cell.responsive.tablet?.layoutMode ?? cell.style.layoutMode;
  return cell.style.layoutMode;
}

export function getCellAlignItems(cell: GridCell, bp: Breakpoint): GridCellStyle['alignItems'] {
  if (bp === 'mobile') return cell.responsive.mobile?.alignItems ?? cell.responsive.tablet?.alignItems ?? cell.style.alignItems;
  if (bp === 'tablet') return cell.responsive.tablet?.alignItems ?? cell.style.alignItems;
  return cell.style.alignItems;
}

export function getCellJustifyContent(cell: GridCell, bp: Breakpoint): GridCellStyle['justifyContent'] {
  if (bp === 'mobile') return cell.responsive.mobile?.justifyContent ?? cell.responsive.tablet?.justifyContent ?? cell.style.justifyContent;
  if (bp === 'tablet') return cell.responsive.tablet?.justifyContent ?? cell.style.justifyContent;
  return cell.style.justifyContent;
}

export function getCellMinHeight(cell: GridCell, bp: Breakpoint): number {
  const base = cell.style.minHeight ?? 80;
  if (bp === 'mobile') return cell.responsive.mobile?.minHeight ?? cell.responsive.tablet?.minHeight ?? base;
  if (bp === 'tablet') return cell.responsive.tablet?.minHeight ?? base;
  return base;
}

export function getCellFreeHeight(cell: GridCell, bp: Breakpoint): number {
  const base = cell.freeHeight ?? 320;
  if (bp === 'mobile') return cell.responsive.mobile?.freeHeight ?? cell.responsive.tablet?.freeHeight ?? base;
  if (bp === 'tablet') return cell.responsive.tablet?.freeHeight ?? base;
  return base;
}
