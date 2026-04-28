import type { BuilderState, CanvasElement, ColumnStyle, NodeMap, Section } from '../types';

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
  const add = (ff: string) => {
    const name = extractFontName(ff);
    if (name && !SYSTEM_FONTS.has(name)) fonts.add(name);
  };
  for (const sec of sections) {
    for (const elId of sec.children) {
      const el = state.nodes[elId] as CanvasElement | undefined;
      if (el) add(el.style.typography.family);
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
  const textBase = `${cStyle};padding:${pad};font-family:${typography.family};font-size:${typography.size}px;font-weight:${typography.weight};color:${typography.color};text-align:${typography.align};line-height:${typography.lineHeight};word-break:break-word`;

  switch (el.type) {
    case 'text': {
      const content = el.content.rich || esc(el.content.plain ?? '');
      inner = `<div class="ec-${el.id}" style="${textBase};white-space:pre-wrap">${content}</div>`;
      break;
    }
    case 'button': {
      const btnStyle = `${cStyle};display:flex;align-items:center;justify-content:center;padding:${pad};font-family:${typography.family};font-size:${typography.size}px;font-weight:${typography.weight};color:${typography.color};letter-spacing:0.02em;cursor:pointer`;
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

  // .sc class provides max-width and centering; min-height stays inline (per-section value)
  return `  <div style="${sectionBgStyle(sec)};position:relative;width:100%">
    ${overlay}
    <div class="sc" style="min-height:${sec.layout.height}px">
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
      if (el.animation.type !== 'none') {
        base.push(`--anim-duration:${el.animation.duration}ms`);
        base.push(`--anim-delay:${el.animation.delay}ms`);
      }
      baseRules.push(`.el-${el.id}{${base.join(';')}}`);

      // Tablet overrides
      const to = el.responsive.tablet;
      if (to?.state?.hidden) {
        tabletRules.push(`.el-${el.id}{display:none}`);
      } else {
        const tx = to?.layout?.x ?? Math.round(el.layout.x * tScale);
        const ty = to?.layout?.y ?? el.layout.y;
        const tw = to?.layout?.width ?? Math.max(20, Math.round(el.layout.width * tScale));
        const th = to?.layout?.height ?? el.layout.height;
        tabletRules.push(`.el-${el.id}{left:${tx}px;top:${ty}px;width:${tw}px;height:${th}px}`);
        const tTypo = to?.style?.typography;
        if (tTypo) {
          const parts: string[] = [];
          if (tTypo.size) parts.push(`font-size:${tTypo.size}px`);
          if (tTypo.weight) parts.push(`font-weight:${tTypo.weight}`);
          if (tTypo.align) parts.push(`text-align:${tTypo.align}`);
          if (parts.length) tabletRules.push(`.ec-${el.id}{${parts.join(';')}}`);
        }
      }

      // Mobile overrides
      const mo = el.responsive.mobile;
      if (mo?.state?.hidden) {
        mobileRules.push(`.el-${el.id}{display:none}`);
      } else {
        const mx = mo?.layout?.x ?? Math.round(el.layout.x * mScale);
        const my = mo?.layout?.y ?? el.layout.y;
        const mw = mo?.layout?.width ?? Math.max(20, Math.round(el.layout.width * mScale));
        const mh = mo?.layout?.height ?? el.layout.height;
        mobileRules.push(`.el-${el.id}{left:${mx}px;top:${my}px;width:${mw}px;height:${mh}px}`);
        const mTypo = mo?.style?.typography;
        if (mTypo) {
          const parts: string[] = [];
          if (mTypo.size) parts.push(`font-size:${mTypo.size}px`);
          if (mTypo.weight) parts.push(`font-weight:${mTypo.weight}`);
          if (mTypo.align) parts.push(`text-align:${mTypo.align}`);
          if (parts.length) mobileRules.push(`.ec-${el.id}{${parts.join(';')}}`);
        }
      }
    }
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
