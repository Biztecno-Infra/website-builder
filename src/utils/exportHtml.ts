import type { BuilderState, CanvasElement, CellLayoutMode, ColumnStyle, FlexItemLayout, GridCell, GridSection, NodeMap, Section } from '../types';

const CANVAS_W = 1280;
const TABLET_W = 768;
const MOBILE_W = 375;

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
    if (cell.nestedGrid) {
      for (const subId of cell.children) {
        const sub = nodes[subId] as GridCell | undefined;
        if (sub) collectFromCell(sub);
      }
    } else {
      for (const elId of cell.children) {
        const el = nodes[elId] as CanvasElement | undefined;
        if (el) add(el.style.typography.family);
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
  add(state.theme.fonts.heading);
  add(state.theme.fonts.body);
  return Array.from(fonts);
}

function sectionBgStyle(sec: Section): string {
  const bg = sec.style.background;
  if (bg.type === 'linear-gradient') {
    return `background-image:linear-gradient(${bg.angle}deg,${bg.from},${bg.to})`;
  }
  if (bg.type === 'radial-gradient') {
    return `background-image:radial-gradient(circle,${bg.from},${bg.to})`;
  }
  if (bg.image) {
    return `background-image:url(${bg.image});background-size:cover;background-position:center`;
  }
  return `background-color:${bg.color || '#ffffff'}`;
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
        const embedUrl = el.content.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
        inner = `<div style="${cStyle}"><iframe src="${esc(embedUrl)}" style="width:100%;height:100%;border:none;display:block" allowfullscreen title="video"></iframe></div>`;
      }
      break;
    }
    case 'icon': {
      inner = `<div style="${cStyle};display:flex;align-items:center;justify-content:center;padding:${pad}"><span style="font-size:${el.content.iconSize}px;color:${typography.color};line-height:1">${esc(el.content.iconName ?? '')}</span></div>`;
      break;
    }
    case 'spacer': {
      inner = `<div style="width:100%;height:100%"></div>`;
      break;
    }
    default:
      inner = `<div style="${cStyle};padding:${pad}"></div>`;
  }

  const linkUrl = el.interaction?.linkUrl;
  const linkTarget = el.interaction?.linkTarget ?? '_self';
  // No inline position/size — the CSS class .el-{id} supplies position:absolute, left, top, width, height
  const wrapper = linkUrl
    ? `<a href="${esc(linkUrl)}" target="${linkTarget}" style="display:block;text-decoration:none;color:inherit" class="el-${el.id}${animClass}"${animData}>${inner}</a>`
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
  return `flex-direction:${mode === 'column' ? 'column' : 'row'};flex-wrap:${mode === 'wrap' ? 'wrap' : 'nowrap'}`;
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
  // Flex-sizing is class-based (ge-{id}); only non-flex properties here
  const wrapStyle = `min-height:${el.layout.height}px;box-sizing:border-box;opacity:${el.style.opacity}${shadowCss}${rotateCss}${wrapRadiusCss}${animVars}`;

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
        const embedUrl = el.content.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
        inner = `<div style="${cStyle}"><iframe src="${esc(embedUrl)}" style="width:100%;height:100%;border:none;display:block" allowfullscreen title="video"></iframe></div>`;
      }
      break;
    }
    case 'icon':
      inner = `<div style="${cStyle};display:flex;align-items:center;justify-content:center;padding:${pad}"><span style="font-size:${el.content.iconSize}px;color:${typography.color};line-height:1">${esc(el.content.iconName ?? '')}</span></div>`;
      break;
    case 'spacer':
      inner = `<div style="width:100%;height:${el.layout.height}px"></div>`;
      break;
    default:
      inner = `<div style="${cStyle};padding:${pad}"></div>`;
  }

  const linkUrl = el.interaction?.linkUrl;
  const linkTarget = el.interaction?.linkTarget ?? '_self';
  const cls = `ge-${el.id}${animClass}`;
  if (linkUrl) {
    return `<a href="${esc(linkUrl)}" target="${linkTarget}" style="${wrapStyle};display:block;text-decoration:none;color:inherit" class="${cls}"${animData}>${inner}</a>`;
  }
  return `<div class="${cls}" style="${wrapStyle}"${animData}>${inner}</div>`;
}

function renderGridCell(cell: GridCell, nodes: NodeMap): string {
  const bg = cell.style.background;
  let bgCss = '';
  if (bg.type === 'linear-gradient') bgCss = `background-image:linear-gradient(${bg.angle}deg,${bg.from},${bg.to})`;
  else if (bg.type === 'radial-gradient') bgCss = `background-image:radial-gradient(circle,${bg.from},${bg.to})`;
  else if (bg.image) bgCss = `background-image:url(${bg.image});background-size:cover;background-position:center`;
  else if (bg.color && bg.color !== 'transparent') bgCss = `background-color:${bg.color}`;

  const { padding, gap, alignItems, justifyContent, border, minHeight } = cell.style;
  const padStr = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;

  const borderCss = border && border.width > 0 && border.style !== 'none'
    ? `border:${border.width}px ${border.style} ${border.color}`
    : '';
  const radiusCss = border?.radius ? `border-radius:${border.radius}px` : '';

  const cellOverlay = bg.overlay > 0
    ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${bg.overlay});pointer-events:none;border-radius:inherit"></div>`
    : '';

  // Nested grid mode — render sub-cells in a CSS grid
  if (cell.nestedGrid) {
    const { gap: ngGap, rowGap: ngRowGap } = cell.nestedGrid;
    const baseCellStyle = [
      'position:relative', bgCss, `padding:${padStr}`, `box-sizing:border-box`,
      `min-height:${minHeight ?? 80}px`, borderCss, radiusCss,
    ].filter(Boolean).join(';');

    const subCells = cell.children
      .map(id => nodes[id] as GridCell | undefined)
      .filter((c): c is GridCell => !!c);

    const subCellHtml = subCells.map(sub => {
      const subSpan = sub.columnSpan;
      return `<div style="grid-column:span ${subSpan}">${renderGridCell(sub, nodes)}</div>`;
    }).join('\n');

    const nestedGridStyle = `display:grid;grid-template-columns:repeat(12,1fr);gap:${ngRowGap}px ${ngGap}px;width:100%`;
    return `<div class="gc-${cell.id}" style="${baseCellStyle}">${cellOverlay}<div style="${nestedGridStyle}">${subCellHtml}</div></div>`;
  }

  // Normal elements mode
  const cellStyle = [
    'position:relative', bgCss,
    `gap:${gap}px`, `padding:${padStr}`,
    `align-items:${alignItems}`, `justify-content:${justifyContent}`,
    `box-sizing:border-box`, `min-height:${minHeight ?? 80}px`,
    borderCss, radiusCss,
  ].filter(Boolean).join(';');

  const elements = cell.children
    .map(id => nodes[id] as CanvasElement | undefined)
    .filter((el): el is CanvasElement => !!el)
    .map(el => renderGridElement(el))
    .join('\n');

  return `<div class="gc-${cell.id}" style="${cellStyle}">${cellOverlay}${elements}</div>`;
}

function renderGridSection(sec: GridSection, nodes: NodeMap): string {
  const bg = sec.style.background;
  const overlay = bg.overlay > 0
    ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${bg.overlay});pointer-events:none;z-index:0"></div>`
    : '';
  const gridCfg = sec.grid;

  const cells = sec.children
    .map(id => nodes[id] as GridCell | undefined)
    .filter((c): c is GridCell => !!c)
    .map(cell => renderGridCell(cell, nodes))
    .join('\n      ');

  const pad = sec.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const padCss = `${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px`;

  return `  <div style="${sectionBgStyle(sec)};position:relative;width:100%">
    ${overlay}
    <div class="sc" style="display:grid;grid-template-columns:repeat(12,1fr);gap:${gridCfg.rowGap}px ${gridCfg.gap}px;overflow:visible;padding:${padCss};box-sizing:border-box">
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

function renderSection(sec: Section, nodes: NodeMap): string {
  if (sec.layoutMode === 'grid') return renderGridSection(sec as GridSection, nodes);

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
  return `  <div style="${sectionBgStyle(sec)};position:relative;width:100%">
    ${overlay}
    <div class="sc sc-free-${sec.id}" style="min-height:${sec.layout.height}px${freePadCss}">
      ${columnBgs}
      ${elements}
    </div>
  </div>`;
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
      for (const cellId of sec.children) {
        const cell = nodes[cellId] as GridCell | undefined;
        if (!cell) continue;

        const desktopMode = cell.style.layoutMode ?? 'column';

        // Base: grid-column span, optional row span, flex display + direction
        const rowSpanCss = (cell.rowSpan ?? 1) > 1 ? `;grid-row:span ${cell.rowSpan}` : '';
        baseRules.push(`.gc-${cell.id}{grid-column:span ${Math.min(cell.columnSpan, 12)}${rowSpanCss};display:flex;${cellDirectionCss(desktopMode)}}`);

        // Tablet cell overrides
        const tCell = cell.responsive.tablet;
        if (tCell?.hidden) {
          tabletRules.push(`.gc-${cell.id}{display:none}`);
        } else {
          const tParts: string[] = [];
          if (tCell?.columnSpan !== undefined) tParts.push(`grid-column:span ${Math.min(tCell.columnSpan, 12)}`);
          if (tCell?.layoutMode !== undefined)  tParts.push(cellDirectionCss(tCell.layoutMode));
          if (tCell?.minHeight !== undefined)   tParts.push(`min-height:${tCell.minHeight}px`);
          if (tParts.length) tabletRules.push(`.gc-${cell.id}{${tParts.join(';')}}`);
        }

        // Mobile cell overrides
        const mCell = cell.responsive.mobile;
        if (mCell?.hidden) {
          mobileRules.push(`.gc-${cell.id}{display:none}`);
        } else {
          const mParts: string[] = [];
          if (mCell?.columnSpan !== undefined) mParts.push(`grid-column:span ${Math.min(mCell.columnSpan, 12)}`);
          if (mCell?.layoutMode !== undefined)  mParts.push(cellDirectionCss(mCell.layoutMode));
          if (mCell?.minHeight !== undefined)   mParts.push(`min-height:${mCell.minHeight}px`);
          if (mParts.length) mobileRules.push(`.gc-${cell.id}{${mParts.join(';')}}`);
        }

        // Per-element flex-sizing + responsive hidden classes
        for (const elId of cell.children) {
          const el = nodes[elId] as CanvasElement | undefined;
          if (!el || el.state.hidden) continue;

          baseRules.push(`.ge-${el.id}{${flexItemClassCss(el.flexLayout, desktopMode)}}`);
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
          const desktopH       = el.layout.height;
          const tHeight        = tElOverride?.layout?.height;
          const mHeight        = mElOverride?.layout?.height;
          const effectiveTH    = tHeight ?? desktopH;
          const effectiveMH    = mHeight ?? effectiveTH;

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

    // Free section container height scales proportionally with viewport
    const tSH = Math.round(sec.layout.height * tScale);
    const mSH = Math.round(sec.layout.height * mScale);
    tabletRules.push(`.sc-free-${sec.id}{min-height:${tSH}px}`);
    mobileRules.push(`.sc-free-${sec.id}{min-height:${mSH}px}`);
  }

  const base = baseRules.join('');
  // .sc max-width changes go inside the media queries too — same-specificity, later-wins
  const tablet = tabletRules.length
    ? `@media(max-width:${TABLET_W}px){.sc{max-width:${TABLET_W}px}${tabletRules.join('')}}`
    : `@media(max-width:${TABLET_W}px){.sc{max-width:${TABLET_W}px}}`;
  const mobile = mobileRules.length
    ? `@media(max-width:${TABLET_W - 1}px){.sc{max-width:${MOBILE_W}px}${mobileRules.join('')}}`
    : `@media(max-width:${TABLET_W - 1}px){.sc{max-width:${MOBILE_W}px}}`;

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
  const header = nodes[page.header] as Section;
  const footer = nodes[page.footer] as Section;
  const bodySections = page.sections.map(id => nodes[id] as Section).filter(Boolean);
  const sections = [header, ...bodySections, footer].filter(Boolean);

  const googleFonts = collectGoogleFonts(state, sections);
  const fontLinks = googleFonts
    .map(f => `  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap">`)
    .join('\n');

  const sectionsHtml = sections.map(sec => renderSection(sec, nodes)).join('\n');
  const elementCss = generateElementCSS(sections, nodes);

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
    html,body{overflow-x:hidden}
    body{font-family:${state.theme.fonts.body};background-color:${state.theme.colors.background}}
    .sc{width:100%;max-width:${CANVAS_W}px;margin:0 auto;position:relative;overflow:hidden}
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
