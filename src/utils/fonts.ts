const SYSTEM_FONTS = new Set([
  'Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Segoe UI', 'Trebuchet MS',
  'Lucida Sans', 'Georgia', 'Times New Roman', 'Palatino Linotype', 'Palatino',
  'Courier New', 'Comic Sans MS', 'sans-serif', 'serif', 'monospace',
]);

const injected = new Set<string>();

export function injectGoogleFont(fontFamily: string) {
  const name = fontFamily.split(',')[0].trim().replace(/'/g, '');
  if (SYSTEM_FONTS.has(name) || injected.has(name)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
  injected.add(name);
}
