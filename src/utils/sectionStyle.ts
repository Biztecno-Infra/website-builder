import type { SectionBackground } from '../types';

export function sectionBgProps(bg: SectionBackground): {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
} {
  if (bg.type === 'linear-gradient') {
    return { backgroundImage: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` };
  }
  if (bg.type === 'radial-gradient') {
    return { backgroundImage: `radial-gradient(circle, ${bg.from}, ${bg.to})` };
  }
  if (bg.image) {
    return { backgroundImage: `url(${bg.image})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  return { backgroundColor: bg.color || '#ffffff' };
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
