import type { SectionBackground } from '../types';
import { gradientStopsCss } from './gradient';

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
    return { backgroundImage: `linear-gradient(${bg.angle}deg, ${gradientStopsCss(bg)})` };
  }
  if (bg.type === 'radial-gradient') {
    return { backgroundImage: `radial-gradient(circle, ${gradientStopsCss(bg)})` };
  }
  // Video backgrounds render via a <video> layer (see sectionHasVideoBg); the
  // surface itself falls back to the color so there's no flash before the video loads.
  if (bg.type === 'video') {
    return { backgroundColor: bg.color || '#000000' };
  }
  // Only paint the image when it's the selected type — otherwise a URL left over
  // from a previous choice keeps showing after switching back to Solid.
  if (bg.type === 'image' && bg.image) {
    return { backgroundImage: `url(${bg.image})`, backgroundSize: 'cover', backgroundPosition: bg.position || 'center' };
  }
  return { backgroundColor: bg.color || '#ffffff' };
}

/** True when the section should render a full-bleed background <video> layer. */
export function sectionHasVideoBg(bg: SectionBackground): boolean {
  return bg.type === 'video' && !!bg.video;
}

/**
 * Resolved playback flags for a background video. All three default to on, so a
 * background saved before these were configurable behaves exactly as before.
 */
export function videoBgFlags(bg: SectionBackground): { autoplay: boolean; loop: boolean; muted: boolean } {
  return {
    autoplay: bg.videoAutoplay !== false,
    loop: bg.videoLoop !== false,
    // An autoplaying video must stay muted or browsers block playback outright.
    muted: bg.videoMuted !== false || bg.videoAutoplay !== false,
  };
}

/**
 * Background <video> markup for the HTML export. Returns '' when the section has
 * no video background. Mirrors the autoplay/muted/loop/cover layer used in the editor.
 */
export function sectionVideoBgHtml(bg: SectionBackground): string {
  if (!sectionHasVideoBg(bg)) return '';
  const pos = bg.position || 'center';
  const src = (bg.video ?? '').replace(/"/g, '&quot;');
  const f = videoBgFlags(bg);
  const attrs = [
    `src="${src}"`,
    f.autoplay && 'autoplay',
    f.muted && 'muted',
    f.loop && 'loop',
    'playsinline',
    // Without autoplay the viewer needs a way to start it.
    !f.autoplay && 'controls',
  ].filter(Boolean).join(' ');
  // Controls need pointer events; a decorative autoplaying layer must not eat clicks.
  const pe = f.autoplay ? 'none' : 'auto';
  return `<video ${attrs} style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos};z-index:0;pointer-events:${pe}"></video>`;
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
