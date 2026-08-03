import type { TextTag } from '../types';
import { TEXT_STYLE_PRESETS } from './selectOptions';

/** h1-h6 are headings (drive the theme's heading font); p1-p3 are paragraph size presets (body font). */
export function isHeadingTag(tag?: TextTag): boolean {
  return !!tag && tag[0] === 'h';
}

/** The HTML tag a `text` element's content.tag renders as. Undefined (no style chosen) stays a plain div. */
export function textTagElement(tag?: TextTag): string {
  if (!tag) return 'div';
  return isHeadingTag(tag) ? tag : 'p';
}

/** Short "Heading 6 · 18px" label for the Layers panel — null when no style is set. */
export function textTagBadge(tag?: TextTag): string | null {
  if (!tag) return null;
  const preset = TEXT_STYLE_PRESETS[tag];
  return `${preset.label} · ${preset.size}px`;
}
