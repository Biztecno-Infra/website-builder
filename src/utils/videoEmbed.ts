/** True when a video URL is a YouTube link that must be rendered via iframe embed. */
export function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

export function toYouTubeEmbedUrl(url: string): string {
  if (!url) return url;
  if (url.includes('youtube.com/embed/')) return url;
  // youtu.be/VIDEO_ID
  const short = url.match(/youtu\.be\/([^?&\s]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  // youtube.com/watch?v=VIDEO_ID
  const standard = url.match(/[?&]v=([^&\s]+)/);
  if (standard) return `https://www.youtube.com/embed/${standard[1]}`;
  return url;
}
