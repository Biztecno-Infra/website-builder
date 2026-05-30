import type { BuilderState, CanvasElement, CellLayoutMode, ColumnStyle, Container, ContainerLayoutMode, FlexItemLayout, GridCell, GridSection, NodeMap, Section } from '../types';
import { sectionBgCssStr } from './sectionStyle';

const CANVAS_W = 1280;
const TABLET_W = 768;
const MOBILE_W = 375;

function toYouTubeEmbedUrl(url: string): string {
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

const SYSTEM_FONTS = new Set([
  'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New',
  'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy',
  'Inter', 'system-ui', '-apple-system',
]);

function extractFontName(fontFamily: string): string {
  return fontFamily.split(',')[0].trim().replace(/['"]/g, '');
}

function collectGoogleFonts(state: BuilderState, sections: Section[]): string[] {
  const fonts = new Set<string>();
  const nodes = state.nodes;
  const add = (ff: string) => {
    const name = extractFontName(ff);
    if (name && !SYSTEM_FONTS.has(name)) fonts.add(name);
  };
  const collectFromCell = (cell: GridCell) => {
    for (const childId of cell.children) {
      const child = nodes[childId];
      if (!child) continue;
      if (child.type === 'container') {
        const block = child as Container;
        for (const subCellId of block.children) {
          const sub = nodes[subCellId] as GridCell | undefined;
          if (sub) collectFromCell(sub);
        }
      } else if (child.type !== 'section' && child.type !== 'grid-cell') {
        add((child as CanvasElement).style.typography.family);
      }
    }
  };

  for (const sec of sections) {
    if (sec.layoutMode === 'grid') {
      for (const cellId of sec.children) {
        const cell = nodes[cellId] as GridCell | undefined;
        if (cell) collectFromCell(cell);
      }
    } else {
      for (const elId of sec.children) {
        const el = nodes[elId] as CanvasElement | undefined;
        if (el) add(el.style.typography.family);
      }
    }
  }
  add(state.theme.fonts.body);
  return Array.from(fonts);
}


function elContentStyle(el: CanvasElement): string {
  const parts = ['width:100%', 'height:100%', 'box-sizing:border-box', 'overflow:hidden'];
  const bg = el.style.background;
  const border = el.style.border;

  if (bg.type === 'linear-gradient') {
    parts.push(`background-image:linear-gradient(${bg.angle}deg,${bg.from},${bg.to})`);
  } else if (bg.type === 'radial-gradient') {
    parts.push(`background-image:radial-gradient(circle,${bg.from},${bg.to})`);
  } else if (bg.image) {
    parts.push(`background-image:url(${bg.image});background-size:cover;background-position:${bg.position}`);
  } else {
    parts.push(`background-color:${bg.color || 'transparent'}`);
  }

  parts.push(`border-radius:${border.radius}px`);
  if (border.width > 0) {
    parts.push(`border:${border.width}px ${border.style} ${border.color}`);
  } else {
    parts.push('border:none');
  }
  return parts.join(';');
}

function esc(str: string): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveElementHref(el: CanvasElement): { href: string; target: string; onclick?: string } | null {
  const type = el.interaction?.type ?? 'link';
  if (type === 'scroll-to-section') {
    const tid = el.interaction?.targetSectionId;
    if (!tid) return null;
    return { href: `#sec-${tid}`, target: '_self' };
  }
  if (type === 'scroll-to-top') {
    return { href: '#', target: '_self', onclick: "window.scrollTo({top:0,behavior:'smooth'});return false;" };
  }
  const url = el.interaction?.linkUrl;
  if (!url) return null;
  return { href: esc(url), target: el.interaction?.linkTarget ?? '_self' };
}

function hasSmoothScrollAnywhere(nodes: NodeMap): boolean {
  return Object.values(nodes).some(n =>
    n.type !== 'section' && n.type !== 'grid-cell' && !!(n as CanvasElement).interaction?.smoothScroll,
  );
}

// Element HTML: position/size come from CSS class .el-{id}, NOT inline style.
// This allows media query class rules to override without !important.
function renderElement(el: CanvasElement): string {
  if (el.state.hidden) return '';

  const { padding, typography } = el.style;
  const pad = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  const cStyle = elContentStyle(el);

  let animClass = '';
  let animData = '';
  if (el.animation.type !== 'none') {
    if (el.animation.trigger === 'load') {
      animClass = ` anim-${el.animation.type}`;
    } else {
      animClass = ' anim-pending';
      animData = ` data-anim="${el.animation.type}"`;
    }
  }

  let inner = '';
  const textBase = `${cStyle};padding:${pad};word-break:break-word`;

  switch (el.type) {
    case 'text': {
      const content = el.content.rich || esc(el.content.plain ?? '');
      inner = `<div class="ec-${el.id}" style="${textBase};white-space:pre-wrap">${content}</div>`;
      break;
    }
    case 'button': {
      const btnStyle = `${cStyle};display:flex;align-items:center;justify-content:center;padding:${pad};cursor:pointer`;
      inner = `<div class="ec-${el.id}" style="${btnStyle}">${esc(el.content.label ?? '')}</div>`;
      break;
    }
    case 'image': {
      if (!el.content.src) {
        inner = `<div style="${cStyle};display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:13px;background:#f1f5f9">No image</div>`;
      } else {
        inner = `<div style="${cStyle}"><img src="${esc(el.content.src)}" alt="${esc(el.content.alt ?? '')}" style="width:100%;height:100%;object-fit:${el.content.objectFit};display:block" /></div>`;
      }
      break;
    }
    case 'divider': {
      const innerH = Math.max(2, el.layout.height - padding.top - padding.bottom);
      inner = `<div style="${cStyle};display:flex;align-items:center;padding:${pad}"><div style="width:100%;height:${innerH}px;background-color:${el.style.background.color || '#dddddd'};border-radius:${el.style.border.radius}px"></div></div>`;
      break;
    }
    case 'video': {
      if (!el.content.videoUrl) {
        inner = `<div style="${cStyle};display:flex;align-items:center;justify-content:center;background:#111;color:#888;font-size:13px">&#9654; Add video URL</div>`;
      } else {
        const embedUrl = toYouTubeEmbedUrl(el.content.videoUrl ?? '');
        inner = `<div style="${cStyle}"><iframe src="${esc(embedUrl)}" style="width:100%;height:100%;border:none;display:block" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="video"></iframe></div>`;
      }
      break;
    }
    case 'icon': {
      const iconSz = el.content.iconSize ?? 40;
      const iconInner = el.content.iconSvg
        ? `<span style="display:inline-flex;width:${iconSz}px;height:${iconSz}px;color:${typography.color}">${el.content.iconSvg}</span>`
        : `<span style="font-size:${iconSz}px;color:${typography.color};line-height:1">${esc(el.content.iconName ?? '★')}</span>`;
      inner = `<div style="${cStyle};display:flex;align-items:center;justify-content:center;padding:${pad}">${iconInner}</div>`;
      break;
    }
    case 'spacer': {
      inner = `<div style="width:100%;height:100%"></div>`;
      break;
    }
    default:
      inner = `<div style="${cStyle};padding:${pad}"></div>`;
  }

  const link = resolveElementHref(el);
  // No inline position/size — the CSS class .el-{id} supplies position:absolute, left, top, width, height
  const wrapper = link
    ? `<a href="${link.href}" target="${link.target}"${link.onclick ? ` onclick="${link.onclick}"` : ''} style="display:block;text-decoration:none;color:inherit" class="el-${el.id}${animClass}"${animData}>${inner}</a>`
    : `<div class="el-${el.id}${animClass}"${animData}>${inner}</div>`;
  return wrapper;
}

// Flex-sizing CSS for a single breakpoint's effective layout.
// Returns only the flex/width/align-self declarations that go in a class rule.
function flexItemClassCss(fl: FlexItemLayout, cellMode: CellLayoutMode): string {
  const grow = fl.flexGrow === 1 ? ';flex-grow:1' : '';
  let sizing: string;
  switch (fl.widthMode) {
    // fill already implies grow via flex shorthand — the flexGrow field has no additional effect
    case 'fill':    sizing = cellMode === 'column' ? 'width:100%' : 'flex:1 1 0;min-width:0'; break;
    case 'auto':    sizing = `width:auto;flex-shrink:1${grow}`; break;
    case 'fixed':   sizing = `width:${fl.widthValue}px;flex-shrink:0${grow}`; break;
    case 'percent': sizing = `width:${fl.widthValue}%;flex-shrink:1${grow}`; break;
  }
  const alignSelf = fl.alignSelf !== 'auto' ? `;align-self:${fl.alignSelf}` : '';
  return `${sizing}${alignSelf}`;
}

// Flex-direction + flex-wrap for a cell layoutMode.
function cellDirectionCss(mode: CellLayoutMode): string {
  if (mode === 'free') return 'position:relative;overflow:hidden';
  return `flex-direction:${mode === 'column' ? 'column' : 'row'};flex-wrap:${mode === 'wrap' ? 'wrap' : 'nowrap'}`;
}

// Render a grid element in free (absolute) mode — position inlined, no class-based sizing.
function renderFreeElement(el: CanvasElement): string {
  if (el.state.hidden) return '';
  const { padding, typography } = el.style;
  const pad = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  const cStyle = elContentStyle(el);
  const s = el.style.shadow;
  const shadowCss = s.enabled ? `;box-shadow:${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}` : '';
  const rotateCss = el.layout.rotation ? `;transform:rotate(${el.layout.rotation}deg)` : '';
  const wrapStyle = `position:absolute;left:${el.layout.x}px;top:${el.layout.y}px;width:${el.layout.width}px;height:${el.layout.height}px;z-index:${el.layout.zIndex ?? 0};box-sizing:border-box;opacity:${el.style.opacity}${shadowCss}${rotateCss}`;

  let inner = '';
  const textBase = `${cStyle};padding:${pad};word-break:break-word`;
  switch (el.type) {
    case 'text':   inner = `<div class="ec-${el.id}" style="${textBase};white-space:pre-wrap">${(el.content.rich || el.content.plain) ?? ''}</div>`; break;
    case 'button': inner = `<div class="ec-${el.id}" style="${cStyle};display:flex;align-items:center;justify-content:center;padding:${pad};cursor:pointer">${el.content.label ?? ''}</div>`; break;
    case 'image':  inner = el.content.src ? `<div style="${cStyle}"><img src="${el.content.src}" alt="${el.content.alt ?? ''}" style="width:100%;height:100%;object-fit:${el.content.objectFit};display:block" /></div>` : ''; break;
    case 'divider': { const ih = Math.max(2, el.layout.height - padding.top - padding.bottom); inner = `<div style="${cStyle};display:flex;align-items:center;padding:${pad}"><div style="width:100%;height:${ih}px;background-color:${el.style.background.color || '#ddd'};border-radius:${el.style.border.radius}px"></div></div>`; break; }
    case 'icon': { const isz = el.content.iconSize ?? 40; inner = `<div style="${cStyle};display:flex;align-items:center;justify-content:center;padding:${pad}">${el.content.iconSvg ? `<span style="display:inline-flex;width:${isz}px;height:${isz}px;color:${typography.color}">${el.content.iconSvg}</span>` : `<span style="font-size:${isz}px;color:${typography.color};line-height:1">${el.content.iconName ?? '★'}</span>`}</div>`; break; }
    case 'spacer': inner = `<div style="width:100%;height:${el.layout.height}px"></div>`; break;
    default:       inner = `<div style="${cStyle};padding:${pad}"></div>`;
  }

  const link = resolveElementHref(el);
  if (link) return `<a href="${link.href}" target="${link.target}"${link.onclick ? ` onclick="${link.onclick}"` : ''} style="${wrapStyle};display:block;text-decoration:none;color:inherit" class="ge-${el.id}">${inner}</a>`;
  return `<div class="ge-${el.id}" style="${wrapStyle}">${inner}</div>`;
}

// Render a grid element. Flex-sizing lives in class ge-{id} (generated by CSS).
function renderGridElement(el: CanvasElement): string {
  if (el.state.hidden) return '';

  const { padding, typography } = el.style;
  const pad = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  const cStyle = elContentStyle(el);

  const s = el.style.shadow;
  const shadowCss = s.enabled ? `;box-shadow:${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}` : '';
  const rotateCss = el.layout.rotation ? `;transform:rotate(${el.layout.rotation}deg)` : '';
  const animVars = el.animation.type !== 'none'
    ? `;--anim-duration:${el.animation.duration}ms;--anim-delay:${el.animation.delay}ms`
    : '';

  const wrapRadiusCss = el.style.border.radius > 0 ? `;border-radius:${el.style.border.radius}px` : '';
  // text/button are content-sized in grid mode; all other types keep explicit height
  const heightCss = (el.type === 'text' || el.type === 'button')
    ? ''
    : `${el.type === 'image' || el.type === 'video' ? 'height' : 'min-height'}:${el.layout.height}px;`;
  // Flex-sizing is class-based (ge-{id}); only non-flex properties here
  const wrapStyle = `${heightCss}box-sizing:border-box;opacity:${el.style.opacity}${shadowCss}${rotateCss}${wrapRadiusCss}${animVars}`;

  let animClass = '';
  let animData = '';
  if (el.animation.type !== 'none') {
    if (el.animation.trigger === 'load') animClass = ` anim-${el.animation.type}`;
    else { animClass = ' anim-pending'; animData = ` data-anim="${el.animation.type}"`; }
  }

  const textBase = `${cStyle};padding:${pad};word-break:break-word`;

  let inner = '';
  switch (el.type) {
    case 'text': {
      const content = el.content.rich || esc(el.content.plain ?? '');
      inner = `<div class="ec-${el.id}" style="${textBase};white-space:pre-wrap">${content}</div>`;
      break;
    }
    case 'button': {
      const btnStyle = `${cStyle};display:flex;align-items:center;justify-content:center;padding:${pad};cursor:pointer`;
      inner = `<div class="ec-${el.id}" style="${btnStyle}">${esc(el.content.label ?? '')}</div>`;
      break;
    }
    case 'image': {
      if (!el.content.src) {
        inner = `<div style="${cStyle};display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:13px;background:#f1f5f9">No image</div>`;
      } else {
        inner = `<div style="${cStyle}"><img src="${esc(el.content.src)}" alt="${esc(el.content.alt ?? '')}" style="width:100%;height:100%;object-fit:${el.content.objectFit};display:block" /></div>`;
      }
      break;
    }
    case 'divider': {
      const innerH = Math.max(2, el.layout.height - padding.top - padding.bottom);
      inner = `<div style="${cStyle};display:flex;align-items:center;padding:${pad}"><div style="width:100%;height:${innerH}px;background-color:${el.style.background.color || '#dddddd'};border-radius:${el.style.border.radius}px"></div></div>`;
      break;
    }
    case 'video': {
      if (!el.content.videoUrl) {
        inner = `<div style="${cStyle};display:flex;align-items:center;justify-content:center;background:#111;color:#888;font-size:13px">&#9654; Add video URL</div>`;
      } else {
        const embedUrl = toYouTubeEmbedUrl(el.content.videoUrl ?? '');
        inner = `<div style="${cStyle}"><iframe src="${esc(embedUrl)}" style="width:100%;height:100%;border:none;display:block" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="video"></iframe></div>`;
      }
      break;
    }
    case 'icon': {
      const isz2 = el.content.iconSize ?? 40;
      inner = `<div style="${cStyle};display:flex;align-items:center;justify-content:center;padding:${pad}">${el.content.iconSvg ? `<span style="display:inline-flex;width:${isz2}px;height:${isz2}px;color:${typography.color}">${el.content.iconSvg}</span>` : `<span style="font-size:${isz2}px;color:${typography.color};line-height:1">${esc(el.content.iconName ?? '★')}</span>`}</div>`;
      break;
    }
    case 'spacer':
      inner = `<div style="width:100%;height:${el.layout.height}px"></div>`;
      break;
    default:
      inner = `<div style="${cStyle};padding:${pad}"></div>`;
  }

  const link = resolveElementHref(el);
  const cls = `ge-${el.id}${animClass}`;
  if (link) {
    return `<a href="${link.href}" target="${link.target}"${link.onclick ? ` onclick="${link.onclick}"` : ''} style="${wrapStyle};display:block;text-decoration:none;color:inherit" class="${cls}"${animData}>${inner}</a>`;
  }
  return `<div class="${cls}" style="${wrapStyle}"${animData}>${inner}</div>`;
}

function containerModeCSS(mode: ContainerLayoutMode, block: Container): string {
  if (mode === 'flex-col') return `display:flex;flex-direction:column;gap:${block.gap}px;width:100%;box-sizing:border-box`;
  if (mode === 'flex-row') return `display:flex;flex-direction:row;flex-wrap:wrap;gap:${block.gap}px;width:100%;box-sizing:border-box`;
  return `display:grid;grid-template-columns:repeat(12,1fr);gap:${block.rowGap}px ${block.gap}px;width:100%;box-sizing:border-box`;
}

function renderColumnsBlock(block: Container, nodes: NodeMap): string {
  const subCells = block.children
    .map(id => nodes[id] as GridCell | undefined)
    .filter((c): c is GridCell => !!c);
  const inner = subCells.map(sub => renderGridCell(sub, nodes)).join('\n');
  return `<div class="cb-${block.id}">${inner}</div>`;
}

function renderGridCell(cell: GridCell, nodes: NodeMap): string {
  const bg = cell.style.background;
  let bgCss = '';
  if (bg.type === 'linear-gradient') bgCss = `background-image:linear-gradient(${bg.angle}deg,${bg.from},${bg.to})`;
  else if (bg.type === 'radial-gradient') bgCss = `background-image:radial-gradient(circle,${bg.from},${bg.to})`;
  else if (bg.image) bgCss = `background-image:url(${bg.image});background-size:cover;background-position:center`;
  else if (bg.color && bg.color !== 'transparent') bgCss = `background-color:${bg.color}`;

  const { padding, gap, border, minHeight } = cell.style;
  const padStr = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;

  const borderCss = border && border.width > 0 && border.style !== 'none'
    ? `border:${border.width}px ${border.style} ${border.color}`
    : '';
  const radiusCss = border?.radius ? `border-radius:${border.radius}px` : '';

  const cellOverlay = bg.overlay > 0
    ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${bg.overlay});pointer-events:none;border-radius:inherit"></div>`
    : '';

  // Free-canvas mode — children are absolutely positioned
  if (cell.style.layoutMode === 'free') {
    const freeH = cell.freeHeight ?? 320;
    const freeCellStyle = [
      'position:relative', `height:${freeH}px`, 'overflow:hidden',
      bgCss, borderCss, radiusCss, 'box-sizing:border-box',
    ].filter(Boolean).join(';');
    const freeElements = cell.children
      .map(id => nodes[id] as CanvasElement | undefined)
      .filter((el): el is CanvasElement => !!el)
      .map(el => renderFreeElement(el))
      .join('\n');
    return `<div class="gc-${cell.id}" style="${freeCellStyle}">${cellOverlay}${freeElements}</div>`;
  }

  // Normal flex elements mode — align-items/justify-content live in the CSS class, not inline
  const cellStyle = [
    'position:relative', bgCss,
    `gap:${gap}px`, `padding:${padStr}`,
    `box-sizing:border-box`, `min-height:${minHeight ?? 80}px`,
    borderCss, radiusCss,
  ].filter(Boolean).join(';');

  const childrenHtml = cell.children.map(id => {
    const child = nodes[id];
    if (!child) return '';
    if (child.type === 'container') return renderColumnsBlock(child as Container, nodes);
    if (child.type !== 'section' && child.type !== 'grid-cell') return renderGridElement(child as CanvasElement);
    return '';
  }).join('\n');

  return `<div class="gc-${cell.id}" style="${cellStyle}">${cellOverlay}${childrenHtml}</div>`;
}

function sectionPositionCss(sec: Section): string {
  if (sec.scrollBehavior === 'sticky') return `position:sticky;top:${sec.stickyOffset ?? 0}px;z-index:50`;
  if (sec.scrollBehavior === 'fixed')  return `position:fixed;top:${sec.stickyOffset ?? 0}px;left:0;right:0;z-index:50`;
  return 'position:relative';
}

function renderGridSection(sec: GridSection, nodes: NodeMap, pageFixed: boolean, pageMaxWidth: number): string {
  const bg = sec.style.background;
  const overlay = bg.overlay > 0
    ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${bg.overlay});pointer-events:none;z-index:0"></div>`
    : '';
  const cells = sec.children
    .map(id => nodes[id] as GridCell | undefined)
    .filter((c): c is GridCell => !!c)
    .map(cell => renderGridCell(cell, nodes))
    .join('\n      ');

  const pad = sec.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const padCss = `${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px`;

  // Per-section override wins; fall back to page layout mode
  const hasExplicitMode = sec.grid.contentWidth != null;
  const contentMode = hasExplicitMode ? sec.grid.contentWidth! : (pageFixed ? 'constrained' : 'full');
  const maxW = sec.grid.maxWidth ?? pageMaxWidth;
  const widthCss = contentMode === 'constrained'
    ? `width:100%;max-width:${maxW}px;margin:0 auto`
    : `width:100%`;

  return `  <div id="sec-${sec.id}" style="${sectionBgCssStr(sec.style.background)};${sectionPositionCss(sec)};width:100%">
    ${overlay}
    <div class="sc-grid-${sec.id}" style="display:grid;grid-template-columns:repeat(12,1fr);${widthCss};padding:${padCss};box-sizing:border-box">
      ${cells}
    </div>
  </div>`;
}

function colBgStyle(cs: ColumnStyle): string {
  const csb = cs.background;
  if (!csb) return '';
  if (csb.type === 'linear-gradient' && csb.from && csb.to) {
    return `background-image:linear-gradient(${csb.angle ?? 135}deg,${csb.from},${csb.to})`;
  }
  if (csb.type === 'radial-gradient' && csb.from && csb.to) {
    return `background-image:radial-gradient(circle,${csb.from},${csb.to})`;
  }
  if (csb.image) {
    return `background-image:url(${csb.image});background-size:cover;background-position:center`;
  }
  if (csb.color) return `background-color:${csb.color}`;
  return '';
}

function renderColumnBgs(sec: Section): string {
  const cols = sec.style.columns;
  if (cols.count <= 1 || !cols.widths.length) return '';
  const colDivs = cols.widths.map((w, i) => {
    const cs = cols.styles[i];
    if (!cs) return '';
    const bgCss = colBgStyle(cs);
    if (!bgCss) return '';
    const left = cols.widths.slice(0, i).reduce((a, b) => a + b, 0);
    const overlay = (cs.background?.overlay ?? 0) > 0
      ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${cs.background!.overlay})"></div>`
      : '';
    return `<div style="position:absolute;left:${left}%;width:${w}%;height:100%;${bgCss};overflow:hidden">${overlay}</div>`;
  }).filter(Boolean).join('');
  return colDivs ? `<div style="position:absolute;inset:0;pointer-events:none">${colDivs}</div>` : '';
}

function renderSection(sec: Section, nodes: NodeMap, pageFixed: boolean, pageMaxWidth: number): string {
  if (sec.layoutMode === 'grid') return renderGridSection(sec as GridSection, nodes, pageFixed, pageMaxWidth);

  const bg = sec.style.background;
  const overlay = bg.overlay > 0
    ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${bg.overlay});pointer-events:none;z-index:0"></div>`
    : '';

  const columnBgs = renderColumnBgs(sec);

  const elements = sec.children
    .map(id => nodes[id] as CanvasElement | undefined)
    .filter((el): el is CanvasElement => !!el)
    .map(renderElement)
    .join('\n      ');

  const freePad = sec.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const freePadCss = (freePad.top || freePad.right || freePad.bottom || freePad.left)
    ? `;padding:${freePad.top}px ${freePad.right}px ${freePad.bottom}px ${freePad.left}px`
    : '';
  return `  <div id="sec-${sec.id}" style="${sectionBgCssStr(sec.style.background)};${sectionPositionCss(sec)};width:100%">
    ${overlay}
    <div class="sc sc-free-${sec.id}" style="min-height:${sec.layout.height}px${freePadCss}">
      ${columnBgs}
      ${elements}
    </div>
  </div>`;
}

// Generate CSS class rules for one GridCell and all its children (recursive for nested grids).
function generateCellCSS(
  cell: GridCell,
  nodes: NodeMap,
  baseRules: string[],
  tabletRules: string[],
  mobileRules: string[],
): void {
  const desktopMode = cell.style.layoutMode ?? 'column';
  const isFreeCell = desktopMode === 'free';
  const rowSpanCss = (cell.rowSpan ?? 1) > 1 ? `;grid-row:span ${cell.rowSpan}` : '';

  if (isFreeCell) {
    const freeH = cell.freeHeight ?? 320;
    baseRules.push(`.gc-${cell.id}{grid-column:span ${Math.min(cell.columnSpan, 12)}${rowSpanCss};position:relative;height:${freeH}px;overflow:hidden}`);
  } else {
    baseRules.push(`.gc-${cell.id}{grid-column:span ${Math.min(cell.columnSpan, 12)}${rowSpanCss};display:flex;${cellDirectionCss(desktopMode)};align-items:${cell.style.alignItems};justify-content:${cell.style.justifyContent}}`);
  }

  // Tablet cell overrides
  const tCell = cell.responsive.tablet;
  if (tCell?.hidden) {
    tabletRules.push(`.gc-${cell.id}{display:none}`);
  } else {
    const tParts: string[] = [];
    if (tCell?.columnSpan !== undefined) tParts.push(`grid-column:span ${Math.min(tCell.columnSpan, 12)}`);
    if (tCell?.layoutMode !== undefined) {
      if (tCell.layoutMode === 'free') {
        const freeH = tCell.freeHeight ?? cell.freeHeight ?? 320;
        tParts.push(`position:relative;height:${freeH}px;overflow:hidden;display:block`);
      } else {
        tParts.push(`display:flex;${cellDirectionCss(tCell.layoutMode)}`);
      }
    }
    if (tCell?.minHeight !== undefined && tCell.layoutMode !== 'free') tParts.push(`min-height:${tCell.minHeight}px`);
    // freeHeight override when cell stays in free mode across breakpoints
    if (isFreeCell && tCell?.layoutMode === undefined && tCell?.freeHeight !== undefined) tParts.push(`height:${tCell.freeHeight}px`);
    if (tCell?.alignItems !== undefined) tParts.push(`align-items:${tCell.alignItems}`);
    if (tCell?.justifyContent !== undefined) tParts.push(`justify-content:${tCell.justifyContent}`);
    if (tParts.length) tabletRules.push(`.gc-${cell.id}{${tParts.join(';')}}`);
  }

  // Mobile cell overrides
  const mCell = cell.responsive.mobile;
  const effectiveTabletMode = tCell?.layoutMode ?? desktopMode;
  const isFreeAtMobile = effectiveTabletMode === 'free';
  if (mCell?.hidden) {
    mobileRules.push(`.gc-${cell.id}{display:none}`);
  } else {
    const mParts: string[] = [];
    if (mCell?.columnSpan !== undefined) mParts.push(`grid-column:span ${Math.min(mCell.columnSpan, 12)}`);
    if (mCell?.layoutMode !== undefined) {
      if (mCell.layoutMode === 'free') {
        const freeH = mCell.freeHeight ?? tCell?.freeHeight ?? cell.freeHeight ?? 320;
        mParts.push(`position:relative;height:${freeH}px;overflow:hidden;display:block`);
      } else {
        mParts.push(`display:flex;${cellDirectionCss(mCell.layoutMode)}`);
      }
    }
    if (mCell?.minHeight !== undefined && mCell.layoutMode !== 'free') mParts.push(`min-height:${mCell.minHeight}px`);
    // freeHeight override when cell stays in free mode across breakpoints
    if (isFreeAtMobile && mCell?.layoutMode === undefined && mCell?.freeHeight !== undefined) mParts.push(`height:${mCell.freeHeight}px`);
    if (mCell?.alignItems !== undefined) mParts.push(`align-items:${mCell.alignItems}`);
    if (mCell?.justifyContent !== undefined) mParts.push(`justify-content:${mCell.justifyContent}`);
    if (mParts.length) mobileRules.push(`.gc-${cell.id}{${mParts.join(';')}}`);
  }

  // Per-element sizing + responsive hidden classes
  for (const elId of cell.children) {
    const child = nodes[elId];
    if (!child) continue;

    // Container child — emit cb-{id} layout CSS (+ responsive overrides), then recurse into sub-cells
    if (child.type === 'container') {
      const block = child as Container;
      const baseMode = block.layoutMode;
      const tabletMode = block.responsive?.tablet?.layoutMode ?? baseMode;
      const mobileMode = block.responsive?.mobile?.layoutMode ?? tabletMode;

      baseRules.push(`.cb-${block.id}{${containerModeCSS(baseMode, block)}}`);
      if (tabletMode !== baseMode) {
        tabletRules.push(`.cb-${block.id}{${containerModeCSS(tabletMode, block)}}`);
      }
      if (mobileMode !== tabletMode) {
        mobileRules.push(`.cb-${block.id}{${containerModeCSS(mobileMode, block)}}`);
      }

      for (const subCellId of block.children) {
        const sub = nodes[subCellId] as GridCell | undefined;
        if (!sub) continue;
        generateCellCSS(sub, nodes, baseRules, tabletRules, mobileRules);

        // Flex-basis overrides: only emit per breakpoint when that breakpoint is still flex-row
        if (baseMode === 'flex-row') {
          const pct = Math.round((Math.min(sub.columnSpan, 12) / 12) * 100);
          baseRules.push(`.gc-${sub.id}{flex:0 0 ${pct}%;min-width:0}`);
        }
        const tSub = sub.responsive.tablet;
        if (tabletMode === 'flex-row') {
          if (tSub?.hidden) {
            tabletRules.push(`.gc-${sub.id}{display:none}`);
          } else {
            const tSpan = tSub?.columnSpan ?? sub.columnSpan;
            tabletRules.push(`.gc-${sub.id}{flex:0 0 ${Math.round((Math.min(tSpan, 12) / 12) * 100)}%}`);
          }
        }
        const mSub = sub.responsive.mobile;
        if (mobileMode === 'flex-row') {
          if (mSub?.hidden ?? tSub?.hidden) {
            mobileRules.push(`.gc-${sub.id}{display:none}`);
          } else {
            const mSpan = mSub?.columnSpan ?? tSub?.columnSpan ?? sub.columnSpan;
            mobileRules.push(`.gc-${sub.id}{flex:0 0 ${Math.round((Math.min(mSpan, 12) / 12) * 100)}%}`);
          }
        }
      }
      continue;
    }

    const el = child as CanvasElement | undefined;
    if (!el || el.state.hidden) continue;

    // Overlay elements — absolutely positioned inside the cell, revert to static at tablet/mobile
    if (el.overlayInCell) {
      const base: string[] = [
        'position:absolute',
        `left:${el.layout.x}px`,
        `top:${el.layout.y}px`,
        `width:${el.layout.width}px`,
        `height:${el.layout.height}px`,
        `z-index:${el.layout.zIndex ?? 1}`,
        `opacity:${el.style.opacity}`,
        'box-sizing:border-box',
      ];
      if (el.layout.rotation) base.push(`transform:rotate(${el.layout.rotation}deg)`);
      if (el.style.border.radius > 0) base.push(`border-radius:${el.style.border.radius}px`);
      if (el.style.shadow.enabled) {
        const s = el.style.shadow;
        base.push(`box-shadow:${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`);
      }
      baseRules.push(`.ge-${el.id}{${base.join(';')}}`);
      const typo = el.style.typography;
      const tyLs = typo.letterSpacing ? `;letter-spacing:${typo.letterSpacing}px` : '';
      const tyTt = (typo.textTransform && typo.textTransform !== 'none') ? `;text-transform:${typo.textTransform}` : '';
      baseRules.push(`.ec-${el.id}{font-family:${typo.family};font-size:${typo.size}px;font-weight:${typo.weight};color:${typo.color};text-align:${typo.align};line-height:${typo.lineHeight}${tyLs}${tyTt}}`);
      if (!tCell?.hidden) tabletRules.push(`.ge-${el.id}{position:static;width:100%}`);
      if (!mCell?.hidden && !tCell?.hidden) mobileRules.push(`.ge-${el.id}{position:static;width:100%}`);
      continue;
    }

    // Free-mode elements have inlined absolute positioning — no class-based flex sizing needed
    if (!isFreeCell) baseRules.push(`.ge-${el.id}{${flexItemClassCss(el.flexLayout, desktopMode)}}`);
    const typo = el.style.typography;
    const tyLs = typo.letterSpacing ? `;letter-spacing:${typo.letterSpacing}px` : '';
    const tyTt = (typo.textTransform && typo.textTransform !== 'none') ? `;text-transform:${typo.textTransform}` : '';
    baseRules.push(`.ec-${el.id}{font-family:${typo.family};font-size:${typo.size}px;font-weight:${typo.weight};color:${typo.color};text-align:${typo.align};line-height:${typo.lineHeight}${tyLs}${tyTt}}`);

    const tElOverride = el.responsive.tablet;
    const mElOverride = el.responsive.mobile;
    // Cascade: mobile.hidden ?? tablet.hidden ?? false
    const tElHidden = tElOverride?.state?.hidden ?? false;
    const mElHidden = mElOverride?.state?.hidden ?? tElHidden;

    // Height cascade: mobile ?? tablet ?? desktop
    const desktopH    = el.layout.height;
    const tHeight     = tElOverride?.layout?.height;
    const mHeight     = mElOverride?.layout?.height;
    const effectiveTH = tHeight ?? desktopH;
    const effectiveMH = mHeight ?? effectiveTH;

    // Tablet element overrides
    if (!tCell?.hidden) {
      if (tElHidden) {
        tabletRules.push(`.ge-${el.id}{display:none}`);
      } else {
        const tFl   = tElOverride?.flexLayout ? { ...el.flexLayout, ...tElOverride.flexLayout } : el.flexLayout;
        const tMode = tCell?.layoutMode ?? desktopMode;
        const tCss  = flexItemClassCss(tFl, tMode);
        if (tCss !== flexItemClassCss(el.flexLayout, desktopMode)) {
          tabletRules.push(`.ge-${el.id}{${tCss}}`);
        }
        if (tHeight !== undefined && tHeight !== desktopH) {
          tabletRules.push(`.ge-${el.id}{min-height:${tHeight}px}`);
        }
        const tTypo = tElOverride?.style?.typography;
        if (tTypo) {
          const tp: string[] = [];
          if (tTypo.size)   tp.push(`font-size:${tTypo.size}px`);
          if (tTypo.weight) tp.push(`font-weight:${tTypo.weight}`);
          if (tTypo.align)  tp.push(`text-align:${tTypo.align}`);
          if (tTypo.letterSpacing != null) tp.push(`letter-spacing:${tTypo.letterSpacing}px`);
          if (tTypo.textTransform) tp.push(`text-transform:${tTypo.textTransform}`);
          if (tp.length) tabletRules.push(`.ec-${el.id}{${tp.join(';')}}`);
        }
      }
    }

    // Mobile element overrides — cascade: mobile ?? tablet ?? desktop
    if (!mCell?.hidden && !tCell?.hidden) {
      if (mElHidden) {
        mobileRules.push(`.ge-${el.id}{display:none}`);
      } else if (!tElHidden) {
        const tFlResolved = tElOverride?.flexLayout ? { ...el.flexLayout, ...tElOverride.flexLayout } : el.flexLayout;
        const mFl = mElOverride?.flexLayout ? { ...tFlResolved, ...mElOverride.flexLayout } : tFlResolved;
        const mMode = mCell?.layoutMode ?? tCell?.layoutMode ?? desktopMode;
        const mCss  = flexItemClassCss(mFl, mMode);
        const tMode = tCell?.layoutMode ?? desktopMode;
        const tCss  = flexItemClassCss(tFlResolved, tMode);
        if (mCss !== tCss) {
          mobileRules.push(`.ge-${el.id}{${mCss}}`);
        }
        if (effectiveMH !== effectiveTH) {
          mobileRules.push(`.ge-${el.id}{min-height:${effectiveMH}px}`);
        }
        const mTypo = mElOverride?.style?.typography;
        if (mTypo) {
          const mp: string[] = [];
          if (mTypo.size)   mp.push(`font-size:${mTypo.size}px`);
          if (mTypo.weight) mp.push(`font-weight:${mTypo.weight}`);
          if (mTypo.align)  mp.push(`text-align:${mTypo.align}`);
          if (mTypo.letterSpacing != null) mp.push(`letter-spacing:${mTypo.letterSpacing}px`);
          if (mTypo.textTransform) mp.push(`text-transform:${mTypo.textTransform}`);
          if (mp.length) mobileRules.push(`.ec-${el.id}{${mp.join(';')}}`);
        }
      }
    }
  }
}

// All element CSS lives here as classes — no inline position styles on elements.
// Desktop class = base rule. Tablet/mobile in @media blocks.
// Same-specificity class rules: later in stylesheet wins → media queries win automatically, no !important.
function generateElementCSS(sections: Section[], nodes: NodeMap): string {
  const tScale = TABLET_W / CANVAS_W;
  const mScale = MOBILE_W / CANVAS_W;
  const baseRules: string[] = [];
  const tabletRules: string[] = [];
  const mobileRules: string[] = [];

  for (const sec of sections) {
    if (sec.layoutMode === 'grid') {
      const gSec = sec as GridSection;
      const cfg = gSec.grid;
      const scBaseParts = [`gap:${cfg.rowGap}px ${cfg.gap}px`];
      if (cfg.minHeight) scBaseParts.push(`min-height:${cfg.minHeight}px`);
      if (cfg.rowHeight) scBaseParts.push(`grid-auto-rows:${cfg.rowHeight}px`);
      baseRules.push(`.sc-grid-${gSec.id}{${scBaseParts.join(';')}}`);
      const tGap    = gSec.responsive?.tablet?.gap    ?? cfg.gap;
      const tRowGap = gSec.responsive?.tablet?.rowGap ?? cfg.rowGap;
      const mGap    = gSec.responsive?.mobile?.gap    ?? tGap;
      const mRowGap = gSec.responsive?.mobile?.rowGap ?? tRowGap;
      if (tGap !== cfg.gap || tRowGap !== cfg.rowGap)
        tabletRules.push(`.sc-grid-${gSec.id}{gap:${tRowGap}px ${tGap}px}`);
      if (mGap !== tGap || mRowGap !== tRowGap)
        mobileRules.push(`.sc-grid-${gSec.id}{gap:${mRowGap}px ${mGap}px}`);
      for (const cellId of sec.children) {
        const cell = nodes[cellId] as GridCell | undefined;
        if (cell) generateCellCSS(cell, nodes, baseRules, tabletRules, mobileRules);
      }
      continue;
    }

    for (const elId of sec.children) {
      const el = nodes[elId] as CanvasElement | undefined;
      if (!el || el.state.hidden) continue;

      // Desktop base class — position, size, z-index, opacity, transform, shadow, anim vars
      const base: string[] = [
        'position:absolute',
        `left:${el.layout.x}px`,
        `top:${el.layout.y}px`,
        `width:${el.layout.width}px`,
        `height:${el.layout.height}px`,
        `z-index:${el.layout.zIndex}`,
        `opacity:${el.style.opacity}`,
        'box-sizing:border-box',
      ];
      if (el.layout.rotation) base.push(`transform:rotate(${el.layout.rotation}deg)`);
      if (el.style.shadow.enabled) {
        const s = el.style.shadow;
        base.push(`box-shadow:${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`);
      }
      if (el.style.border.radius > 0) base.push(`border-radius:${el.style.border.radius}px`);
      if (el.animation.type !== 'none') {
        base.push(`--anim-duration:${el.animation.duration}ms`);
        base.push(`--anim-delay:${el.animation.delay}ms`);
      }
      baseRules.push(`.el-${el.id}{${base.join(';')}}`);
      const typo = el.style.typography;
      const tyLs = typo.letterSpacing ? `;letter-spacing:${typo.letterSpacing}px` : '';
      const tyTt = (typo.textTransform && typo.textTransform !== 'none') ? `;text-transform:${typo.textTransform}` : '';
      baseRules.push(`.ec-${el.id}{font-family:${typo.family};font-size:${typo.size}px;font-weight:${typo.weight};color:${typo.color};text-align:${typo.align};line-height:${typo.lineHeight}${tyLs}${tyTt}}`);

      // Tablet overrides
      const to = el.responsive.tablet;
      if (to?.state?.hidden) {
        tabletRules.push(`.el-${el.id}{display:none}`);
      } else {
        const tx = to?.layout?.x ?? Math.round(el.layout.x * tScale);
        const ty = to?.layout?.y ?? Math.round(el.layout.y * tScale);
        const tw = to?.layout?.width ?? Math.max(20, Math.round(el.layout.width * tScale));
        const th = to?.layout?.height ?? Math.max(4, Math.round(el.layout.height * tScale));
        tabletRules.push(`.el-${el.id}{left:${tx}px;top:${ty}px;width:${tw}px;height:${th}px}`);
        const tTypo = to?.style?.typography;
        if (tTypo) {
          const parts: string[] = [];
          if (tTypo.size) parts.push(`font-size:${tTypo.size}px`);
          if (tTypo.weight) parts.push(`font-weight:${tTypo.weight}`);
          if (tTypo.align) parts.push(`text-align:${tTypo.align}`);
          if (tTypo.letterSpacing != null) parts.push(`letter-spacing:${tTypo.letterSpacing}px`);
          if (tTypo.textTransform) parts.push(`text-transform:${tTypo.textTransform}`);
          if (parts.length) tabletRules.push(`.ec-${el.id}{${parts.join(';')}}`);
        }
      }

      // Mobile overrides — cascade: mobile ?? tablet ?? desktop
      const mo = el.responsive.mobile;
      if (mo?.state?.hidden ?? to?.state?.hidden) {
        mobileRules.push(`.el-${el.id}{display:none}`);
      } else {
        // Cascade tablet explicit overrides as intermediate fallback before auto-scaling
        const mx = mo?.layout?.x ?? to?.layout?.x ?? Math.round(el.layout.x * mScale);
        const my = mo?.layout?.y ?? to?.layout?.y ?? Math.round(el.layout.y * mScale);
        const mw = mo?.layout?.width ?? to?.layout?.width ?? Math.max(20, Math.round(el.layout.width * mScale));
        const mh = mo?.layout?.height ?? to?.layout?.height ?? Math.max(4, Math.round(el.layout.height * mScale));
        mobileRules.push(`.el-${el.id}{left:${mx}px;top:${my}px;width:${mw}px;height:${mh}px}`);
        // Only emit mobile typography rules for properties with an explicit mobile override
        // (tablet typography already cascades via CSS max-width:768px covering mobile)
        const mTypo = mo?.style?.typography;
        if (mTypo) {
          const parts: string[] = [];
          if (mTypo.size) parts.push(`font-size:${mTypo.size}px`);
          if (mTypo.weight) parts.push(`font-weight:${mTypo.weight}`);
          if (mTypo.align) parts.push(`text-align:${mTypo.align}`);
          if (mTypo.letterSpacing != null) parts.push(`letter-spacing:${mTypo.letterSpacing}px`);
          if (mTypo.textTransform) parts.push(`text-transform:${mTypo.textTransform}`);
          if (parts.length) mobileRules.push(`.ec-${el.id}{${parts.join(';')}}`);
        }
      }
    }

    // Free section responsive heights — explicit override, else proportional fallback
    const tSH = sec.responsive?.tablet?.height ?? Math.round(sec.layout.height * tScale);
    const mSH = sec.responsive?.mobile?.height ?? sec.responsive?.tablet?.height ?? Math.round(sec.layout.height * mScale);
    tabletRules.push(`.sc-free-${sec.id}{min-height:${tSH}px}`);
    mobileRules.push(`.sc-free-${sec.id}{min-height:${mSH}px}`);
  }

  const base = baseRules.join('');
  const tablet = tabletRules.length ? `@media(max-width:${TABLET_W}px){${tabletRules.join('')}}` : '';
  const mobile = mobileRules.length ? `@media(max-width:${TABLET_W - 1}px){${mobileRules.join('')}}` : '';

  return [base, tablet, mobile].filter(Boolean).join('\n');
}

const ANIM_CSS = `
@keyframes fade-in{from{opacity:0}to{opacity:1}}
@keyframes slide-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes slide-left{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
@keyframes zoom-in{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
.anim-pending{opacity:0}
.anim-fade-in{animation:fade-in var(--anim-duration,600ms) var(--anim-delay,0ms) both ease-out}
.anim-slide-up{animation:slide-up var(--anim-duration,600ms) var(--anim-delay,0ms) both ease-out}
.anim-slide-left{animation:slide-left var(--anim-duration,600ms) var(--anim-delay,0ms) both ease-out}
.anim-zoom-in{animation:zoom-in var(--anim-duration,600ms) var(--anim-delay,0ms) both ease-out}`.trim();

const SCROLL_ANIM_SCRIPT = `<script>
(function(){
  var els=document.querySelectorAll('.anim-pending[data-anim]');
  if(!els.length)return;
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var el=e.target;
        el.classList.remove('anim-pending');
        el.classList.add('anim-'+el.getAttribute('data-anim'));
        io.unobserve(el);
      }
    });
  },{threshold:0.15});
  els.forEach(function(el){io.observe(el);});
})();
</script>`;

export function exportHtml(state: BuilderState, pageName: string): string {
  const page = state.pages.find(p => p.id === state.activePageId) ?? state.pages[0];
  const nodes = state.nodes;
  const sections = page.sections.map(id => nodes[id] as Section).filter(Boolean);

  const pageFixed = (page.layoutWidth ?? 'fixed') === 'fixed';
  const pageMaxWidth = page.maxWidth ?? 1200;

  const googleFonts = collectGoogleFonts(state, sections);
  const fontLinks = googleFonts
    .map(f => `  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap">`)
    .join('\n');

  const sectionsHtml = sections.map(sec => renderSection(sec, nodes, pageFixed, pageMaxWidth)).join('\n');
  const elementCss = generateElementCSS(sections, nodes);
  const smoothScrollCss = hasSmoothScrollAnywhere(nodes) ? 'html{scroll-behavior:smooth}' : '';

  const seoTitle = esc(page.seo?.title || pageName);
  const seoDesc = esc(page.seo?.description || '');
  const seoOg   = esc(page.seo?.ogImage || '');
  const seoMeta = [
    seoDesc ? `  <meta name="description" content="${seoDesc}" />` : '',
    seoOg   ? `  <meta property="og:image" content="${seoOg}" />` : '',
    seoDesc ? `  <meta property="og:description" content="${seoDesc}" />` : '',
    `  <meta property="og:title" content="${seoTitle}" />`,
  ].filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html lang="${state.site?.language || 'en'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${seoTitle}</title>
${seoMeta}
${fontLinks}
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{overflow-x:clip}
    body{font-family:${state.theme.fonts.body};background-color:${state.theme.colors.background}}
    ${pageFixed ? `.sc{width:100%;max-width:${pageMaxWidth}px;margin:0 auto;position:relative;overflow:hidden}` : `.sc{width:100%;position:relative;overflow:hidden}`}
    ${smoothScrollCss}
    ${ANIM_CSS}
    ${elementCss}
  </style>
</head>
<body>
${sectionsHtml}
${SCROLL_ANIM_SCRIPT}
</body>
</html>`;
}
