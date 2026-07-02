import type { SectionBackground } from '../types';

export function sectionBgProps(bg: SectionBackground): {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
} {
  if (bg.type === 'transparent') {
    return { backgroundColor: 'transparent' };
  }
  if (bg.type === 'linear-gradient') {
    return { backgroundImage: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` };
  }
  if (bg.type === 'radial-gradient') {
    return { backgroundImage: `radial-gradient(circle, ${bg.from}, ${bg.to})` };
  }
  // Video backgrounds render via a <video> layer (see sectionHasVideoBg); the
  // surface itself falls back to the color so there's no flash before the video loads.
  if (bg.type === 'video') {
    return { backgroundColor: bg.color || '#000000' };
  }
  if (bg.image) {
    return { backgroundImage: `url(${bg.image})`, backgroundSize: 'cover', backgroundPosition: bg.position || 'center' };
  }
  return { backgroundColor: bg.color || '#ffffff' };
}

/** True when the section should render a full-bleed background <video> layer. */
export function sectionHasVideoBg(bg: SectionBackground): boolean {
  return bg.type === 'video' && !!bg.video;
}

/**
 * Background <video> markup for the HTML export. Returns '' when the section has
 * no video background. Mirrors the autoplay/muted/loop/cover layer used in the editor.
 */
export function sectionVideoBgHtml(bg: SectionBackground): string {
  if (!sectionHasVideoBg(bg)) return '';
  const pos = bg.position || 'center';
  const src = (bg.video ?? '').replace(/"/g, '&quot;');
  return `<video src="${src}" autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos};z-index:0;pointer-events:none"></video>`;
}

// Serializes sectionBgProps() to a CSS string — used by the HTML export.
export function sectionBgCssStr(bg: SectionBackground): string {
  const p = sectionBgProps(bg);
  if (p.backgroundImage) {
    const parts = [`background-image:${p.backgroundImage}`];
    if (p.backgroundSize) parts.push(`background-size:${p.backgroundSize}`);
    if (p.backgroundPosition) parts.push(`background-position:${p.backgroundPosition}`);
    return parts.join(';');
  }
  return `background-color:${p.backgroundColor ?? '#ffffff'}`;
}
