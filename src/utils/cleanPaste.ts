/**
 * Strips external styles, colors, backgrounds and links from pasted HTML.
 * Keeps: bold, italic, underline, line breaks, paragraphs.
 * Removes: all style="" attributes, external href links, font tags, span colors.
 */
export function cleanPastedHTML(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;

  // Walk all elements and strip inline styles + external links
  div.querySelectorAll('*').forEach(el => {
    // Remove all inline styles (colors, backgrounds, font sizes etc.)
    el.removeAttribute('style');
    el.removeAttribute('class');
    el.removeAttribute('id');
    el.removeAttribute('data-*');

    // Remove ALL links — keep the text, discard the href
    if (el.tagName === 'A') {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      }
    }

    // Remove elements that only carry styling (font, span with no semantic value)
    if (el.tagName === 'FONT' || el.tagName === 'SPAN') {
      // Only unwrap if no semantic attributes remain
      const parent = el.parentNode;
      while (el.firstChild) parent?.insertBefore(el.firstChild, el);
      parent?.removeChild(el);
    }
  });

  // Remove script/style tags entirely
  div.querySelectorAll('script, style, head, meta, link').forEach(el => el.remove());

  return div.innerHTML;
}

/** Creates a paste handler that cleans pasted HTML before inserting */
export function createCleanPasteHandler() {
  return (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    let content: string;
    if (html) {
      content = cleanPastedHTML(html);
    } else {
      // No HTML — just plain text, preserve line breaks
      content = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    }

    // Insert at cursor using execCommand
    document.execCommand('insertHTML', false, content);
  };
}
