/**
 * Strips external styles, colors, backgrounds and links from pasted HTML.
 * Keeps: bold, italic, underline, line breaks.
 * Removes: block structure (converted to <br>), tables, inline styles, links.
 */
export function cleanPastedHTML(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;

  // Remove script/style/meta tags entirely first
  div.querySelectorAll('script, style, head, meta, link').forEach(el => el.remove());

  // Convert table rows to line-separated text, then remove tables
  div.querySelectorAll('table').forEach(table => {
    const fragment = document.createDocumentFragment();
    table.querySelectorAll('tr').forEach((tr, i) => {
      if (i > 0) fragment.appendChild(document.createElement('br'));
      const cells = Array.from(tr.querySelectorAll('td, th'));
      cells.forEach((cell, j) => {
        if (j > 0) fragment.appendChild(document.createTextNode(' '));
        fragment.appendChild(document.createTextNode(cell.textContent ?? ''));
      });
    });
    table.parentNode?.insertBefore(fragment, table);
    table.remove();
  });

  // Convert block-level elements (headings, divs, paragraphs, list items) to
  // inline text separated by <br> so pasted content doesn't create nested blocks.
  const BLOCK_TAGS = new Set(['P','DIV','H1','H2','H3','H4','H5','H6','LI','BLOCKQUOTE','PRE','ADDRESS']);
  div.querySelectorAll(Array.from(BLOCK_TAGS).join(',')).forEach(el => {
    const parent = el.parentNode;
    if (!parent) return;
    const br = document.createElement('br');
    parent.insertBefore(br, el);
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  });

  // Remove UL/OL wrappers (children already inlined above)
  div.querySelectorAll('ul, ol').forEach(el => {
    const parent = el.parentNode;
    while (el.firstChild) parent?.insertBefore(el.firstChild, el);
    parent?.removeChild(el);
  });

  // Walk remaining elements: strip attributes and unwrap non-semantic tags
  div.querySelectorAll('*').forEach(el => {
    el.removeAttribute('style');
    el.removeAttribute('class');
    el.removeAttribute('id');

    // Remove ALL links — keep the text content
    if (el.tagName === 'A') {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      }
      return;
    }

    // Unwrap styling-only wrapper elements (font, span, mark, etc.)
    const UNWRAP = new Set(['FONT','SPAN','MARK','S','DEL','INS','SUB','SUP','SMALL','BIG']);
    if (UNWRAP.has(el.tagName)) {
      const parent = el.parentNode;
      while (el.firstChild) parent?.insertBefore(el.firstChild, el);
      parent?.removeChild(el);
    }
  });

  // Trim leading/trailing <br> elements
  while (div.firstChild?.nodeName === 'BR') div.firstChild.remove();
  while (div.lastChild?.nodeName === 'BR') div.lastChild.remove();

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
