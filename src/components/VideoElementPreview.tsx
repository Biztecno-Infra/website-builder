import { useEffect, useRef } from 'react';
import type { CanvasElement as El } from '../types';

/**
 * Editor preview for a Video element pointed at a direct file URL (mp4/webm/…).
 * Rendered as a real <video> tag rather than an <iframe> — iframing a raw media
 * URL routinely gets refused by the host's X-Frame-Options, where a <video src>
 * request is unaffected by that header.
 */
export function VideoElementPreview({ el }: { el: El }) {
  const ref = useRef<HTMLVideoElement>(null);
  const autoplay = el.content.videoAutoplay !== false;
  const loop = el.content.videoLoop !== false;
  const muted = el.content.videoMuted === true || autoplay;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.muted = muted;
    if (autoplay) void node.play().catch(() => { /* browser refused autoplay — nothing to do */ });
    else node.pause();
  }, [muted, autoplay, el.content.videoUrl]);

  return (
    <video
      ref={ref}
      key={el.content.videoUrl}
      src={el.content.videoUrl}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      controls={!autoplay}
      playsInline
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}
