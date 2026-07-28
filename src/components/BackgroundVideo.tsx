import { useEffect, useRef } from 'react';
import type { SectionBackground } from '../types';
import { videoBgFlags } from '../utils/sectionStyle';

/**
 * Full-bleed background <video> layer for a section / row / container.
 *
 * Rendered behind the content (z-index 0) and always click-through, so it never
 * interferes with canvas selection or dragging. Playback is driven by the
 * autoplay/loop/muted flags on the background, each defaulting to on.
 */
export function BackgroundVideo({ bg, zIndex = 0, borderRadius }: {
  bg: SectionBackground;
  /** Grid cells have no positioned content wrapper, so they layer the video at -1. */
  zIndex?: number;
  borderRadius?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const { autoplay, loop, muted } = videoBgFlags(bg);

  // `muted` as a React prop doesn't reliably reach the DOM attribute, and an
  // unmuted video is blocked from autoplaying — so set it on the element itself.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = muted;
    if (autoplay) void el.play().catch(() => { /* browser refused autoplay — nothing to do */ });
    else el.pause();
  }, [muted, autoplay, bg.video]);

  return (
    <video
      ref={ref}
      key={bg.video}
      src={bg.video}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      playsInline
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: bg.position || 'center',
        zIndex, pointerEvents: 'none',
        ...(borderRadius ? { borderRadius } : {}),
      }}
    />
  );
}
