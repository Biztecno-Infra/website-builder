import html2canvas from 'html2canvas';

/** The canvas content node rasterized by {@link captureCanvasScreenshot}. */
const CANVAS_SELECTOR = '.pb-canvas-column';

interface CaptureOptions {
  /** Clears the active selection so selection chrome isn't baked into the image. */
  clearSelection?: () => void;
}

/**
 * Rasterizes the builder canvas to a PNG `File` (`screenshot.png`).
 *
 * Clears the current selection first, waits a frame so React can drop the
 * selection outlines/handles/quick-bars, then captures `.pb-canvas-column`.
 * Returns `null` if the canvas isn't mounted or capture fails.
 */
export async function captureCanvasScreenshot(opts: CaptureOptions = {}): Promise<File | null> {
  opts.clearSelection?.();

  // Let the selection-driven chrome unmount before we snapshot.
  await new Promise(resolve => setTimeout(resolve, 50));

  const target = document.querySelector(CANVAS_SELECTOR) as HTMLElement | null;
  if (!target) return null;

  try {
    const canvas = await html2canvas(target, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      // Match on-screen resolution; the canvas may be zoomed via CSS `zoom`,
      // but html2canvas reads layout box size so the output stays 1:1 with content.
      scale: window.devicePixelRatio || 1,
    });

    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });
    if (!blob) return null;

    return new File([blob], 'screenshot.png', { type: 'image/png' });
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return null;
  }
}
