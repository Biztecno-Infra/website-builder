import type { BuilderState, CanvasElement, Carousel, CellLayoutMode, ColumnStyle, Container, ContainerLayoutMode, ElementAction, FlexItemLayout, FormField, GridCell, GridSection, NodeMap, Page, Section } from '../types';
import { sectionBgCssStr } from './sectionStyle';
import { interactionToAction } from './builderDefaults';
import { fieldHelpNote } from './formFormat';

const CANVAS_W = 1280;
const TABLET_W = 768;
const MOBILE_W = 375;
const MOBILE_BREAK = TABLET_W - 1; // 767 — matches the mobile @media boundary used elsewhere

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
      } else if (child.type === 'carousel') {
        for (const slideId of (child as Carousel).children) {
          const slide = nodes[slideId] as GridCell | undefined;
          if (slide) collectFromCell(slide);
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
        const node = nodes[elId];
        if (!node) continue;
        if (node.type === 'carousel') {
          for (const slideId of (node as Carousel).children) {
            const slide = nodes[slideId] as GridCell | undefined;
            if (slide) collectFromCell(slide);
          }
        } else {
          add((node as CanvasElement).style.typography.family);
        }
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

// Background + border declarations only (no width/height) — for wrappers that
// already get their sizing elsewhere (e.g. grid flex classes).
function elBgBorderCss(el: CanvasElement): string {
  const parts: string[] = [];
  const bg = el.style.background;
  const border = el.style.border;
  if (bg.type === 'linear-gradient') parts.push(`background-image:linear-gradient(${bg.angle}deg,${bg.from},${bg.to})`);
  else if (bg.type === 'radial-gradient') parts.push(`background-image:radial-gradient(circle,${bg.from},${bg.to})`);
  else if (bg.image) parts.push(`background-image:url(${bg.image});background-size:cover;background-position:${bg.position}`);
  else if (bg.color && bg.color !== 'transparent') parts.push(`background-color:${bg.color}`);
  if (border.width > 0) parts.push(`border:${border.width}px ${border.style} ${border.color}`);
  return parts.join(';');
}

function esc(str: string): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Page slug lookup for internal-page actions — set at the start of exportHtml().
let PAGE_SLUGS: Record<string, string> = {};

// The element's effective action: prefer the unified `action`, else migrate the
// legacy `interaction` model so older docs still export working links.
function actionOf(el: CanvasElement): ElementAction | null {
  if (el.action && el.action.type !== 'none') return el.action;
  return interactionToAction(el.interaction);
}

function smsHref(phone: string, body?: string): string {
  const num = phone.replace(/[^+\d]/g, '');
  const q = body ? `?&body=${encodeURIComponent(body)}` : '';
  return `sms:${num}${q}`;
}

function mailtoHref(email: string, subject?: string, body?: string): string {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${params.length ? `?${params.join('&')}` : ''}`;
}

// Resolve a non-form action into an anchor href/target/onclick. Returns null for
// actions that don't map to a link (none / submit-form / unconfigured / inert).
function resolveAction(a: ElementAction | null): { href: string; target: string; onclick?: string } | null {
  if (!a) return null;
  switch (a.type) {
    case 'scroll-to-section':
      if (!a.targetSectionId) return null;
      return { href: `#sec-${a.targetSectionId}`, target: '_self' };
    case 'scroll-to-top':
      return { href: '#', target: '_self', onclick: "window.scrollTo({top:0,behavior:'smooth'});return false;" };
    case 'external-url':
      if (!a.url) return null;
      return { href: esc(a.url), target: a.target ?? '_self' };
    case 'download-file':
      if (!a.url) return null;
      return { href: esc(a.url), target: '_blank' };
    case 'internal-page': {
      if (!a.pageId) return null;
      const slug = PAGE_SLUGS[a.pageId];
      return slug ? { href: esc(slug), target: '_self' } : null;
    }
    case 'send-email':
      if (!a.email) return null;
      return { href: esc(mailtoHref(a.email, a.subject, a.body)), target: '_self' };
    case 'make-call':
      if (!a.phone) return null;
      return { href: `tel:${esc(a.phone.replace(/[^+\d]/g, ''))}`, target: '_self' };
    case 'send-sms':
      if (!a.phone) return null;
      return { href: esc(smsHref(a.phone, a.body)), target: '_self' };
    case 'submit-api': {
      // On a <form> this is consumed by renderForm() before we ever get here, so
      // reaching this case means a standalone button: fire a fire-and-forget fetch
      // on click. An optional static JSON body is sent as application/json.
      if (!a.apiUrl) return null;
      const method = a.apiMethod ?? 'POST';
      const body = (a.apiBody ?? '').trim();
      const init = body
        ? `{method:'${method}',headers:{'Content-Type':'application/json'},body:${JSON.stringify(body)}}`
        : `{method:'${method}'}`;
      const onclick = `fetch(${JSON.stringify(a.apiUrl)},${init}).catch(function(e){console.error(e);});return false;`;
      return { href: '#', target: '_self', onclick: esc(onclick) };
    }
    case 'open-popup':   // not yet functional in static export
    case 'submit-form':  // handled by the <form> element, not as a link
    case 'none':
    default:
      return null;
  }
}

function resolveElementHref(el: CanvasElement): { href: string; target: string; onclick?: string } | null {
  return resolveAction(actionOf(el));
}

function hasSmoothScrollAnywhere(nodes: NodeMap): boolean {
  return Object.values(nodes).some(n => {
    if (n.type === 'section' || n.type === 'grid-cell' || n.type === 'container' || n.type === 'carousel') return false;
    const a = actionOf(n as CanvasElement);
    return !!a && (a.type === 'scroll-to-section' || a.type === 'scroll-to-top') && a.smoothScroll !== false;
  });
}

// ── Form rendering ──────────────────────────────────────────────────────
// True when the exported page contains at least one form — gates the validation
// + mailto submit script.
let HAS_FORM = false;

// True when the exported page contains at least one carousel — gates the slider
// CSS + the vanilla-JS controller that drives arrows/dots/autoplay/loop.
let HAS_CAROUSEL = false;

// Base CSS for carousels — emitted once per page when a carousel exists.
const CAROUSEL_CSS = `
.crs{position:relative;width:100%;height:var(--crs-h,420px);min-height:var(--crs-min-h,0)}
.crs-viewport{position:relative;width:100%;height:100%;overflow:hidden}
.crs-track{display:flex;width:100%;height:100%;transition-property:transform;transition-timing-function:ease}
.crs-slide{overflow:hidden}
.crs-slide>*{width:100%;height:100%}
.crs-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:5;width:40px;height:40px;border:none;border-radius:50%;background:rgba(0,0,0,0.45);color:#fff;font-size:24px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
.crs-arrow:hover{background:rgba(0,0,0,0.7)}
.crs-prev{left:12px}
.crs-next{right:12px}
.crs-dots{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);z-index:5;display:flex;gap:8px}
.crs-dot{width:10px;height:10px;border-radius:50%;border:none;background:var(--crs-dot,#fff);opacity:0.55;cursor:pointer;padding:0;transition:opacity .2s,transform .2s}
.crs-dot-active{opacity:1;transform:scale(1.2)}
@media (max-width:${TABLET_W}px){.crs{height:var(--crs-h-tablet,var(--crs-h,420px))}}
@media (max-width:${MOBILE_BREAK}px){.crs{height:var(--crs-h-mobile,var(--crs-h-tablet,var(--crs-h,420px)))}}
`;

// Vanilla-JS controller — drives every [data-carousel] on the page. Self-contained,
// no dependencies; safe to run once on DOMContentLoaded.
const CAROUSEL_SCRIPT = `<script>
(function(){
  function initCarousel(root){
    var track = root.querySelector('[data-crs-track]');
    if(!track) return;
    var slides = track.children;
    var count = slides.length;
    if(count === 0) return;
    var dots = root.querySelectorAll('[data-crs-dot]');
    var loop = root.getAttribute('data-crs-loop') === '1';
    var autoplay = root.getAttribute('data-crs-autoplay') === '1';
    var interval = parseInt(root.getAttribute('data-crs-interval'),10) || 5000;
    var pauseHover = root.getAttribute('data-crs-pause-hover') === '1';
    var index = 0, timer = null;
    function render(){
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      for(var i=0;i<dots.length;i++){ dots[i].classList.toggle('crs-dot-active', i === index); }
    }
    function go(i){
      if(i < 0) i = loop ? count - 1 : 0;
      if(i >= count) i = loop ? 0 : count - 1;
      index = i; render();
    }
    var prev = root.querySelector('[data-crs-prev]');
    var next = root.querySelector('[data-crs-next]');
    if(prev) prev.addEventListener('click', function(){ go(index - 1); restart(); });
    if(next) next.addEventListener('click', function(){ go(index + 1); restart(); });
    for(var d=0; d<dots.length; d++){ (function(di){ dots[di].addEventListener('click', function(){ go(di); restart(); }); })(d); }
    function start(){ if(autoplay && count > 1){ timer = setInterval(function(){ go(index + 1); }, interval); } }
    function stop(){ if(timer){ clearInterval(timer); timer = null; } }
    function restart(){ stop(); start(); }
    if(pauseHover){ root.addEventListener('mouseenter', stop); root.addEventListener('mouseleave', start); }
    render(); start();
  }
  function initAll(){ var list = document.querySelectorAll('[data-carousel]'); for(var i=0;i<list.length;i++){ initCarousel(list[i]); } }
  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', initAll); } else { initAll(); }
})();
</script>`;

// Base CSS for form fields — emitted once per page when a form exists.
// Half-width fields sit two-per-row on desktop/tablet and stack to full width at
// the mobile breakpoint (max-width:767px), matching the canvas mobile preview.
const FORM_BASE_CSS = `
.pb-ff{flex:1 1 100%;min-width:0}
.pb-ff-half{flex:1 1 calc(50% - 8px)}
@media(max-width:${MOBILE_BREAK}px){.pb-form .pb-ff-half{flex:1 1 100%}}`.trim();

function fieldInputCss(): string {
  return 'width:100%;padding:9px 10px;font-size:14px;color:#374151;background:#fff;border:1px solid #d1d5db;border-radius:6px;box-sizing:border-box;line-height:1.4;font-family:inherit';
}

function validationAttrs(f: FormField): string {
  const v = f.validation ?? {};
  const attrs: string[] = [];
  if (f.required) attrs.push('required');
  if (v.minLength != null) attrs.push(`minlength="${v.minLength}"`);
  if (v.maxLength != null) attrs.push(`maxlength="${v.maxLength}"`);
  if (v.min != null) attrs.push(`min="${esc(String(v.min))}"`);
  if (v.max != null) attrs.push(`max="${esc(String(v.max))}"`);
  // Pattern: explicit regex wins, else derive from a preset.
  let pattern = v.pattern;
  if (!pattern && v.preset === 'url') pattern = 'https?://.+';
  if (!pattern && v.preset === 'number') pattern = '\\d+';
  if (pattern) attrs.push(`pattern="${esc(pattern)}"`);
  if (v.errorMessage) attrs.push(`title="${esc(v.errorMessage)}"`);
  return attrs.length ? ' ' + attrs.join(' ') : '';
}

// Map our field type → HTML input type (email preset also forces type=email for native validation).
function htmlInputType(f: FormField): string {
  if (f.type === 'email' || f.validation?.preset === 'email') return 'email';
  if (f.type === 'number') return 'number';
  if (f.type === 'date') return 'date';
  return 'text';
}

function renderFormField(f: FormField): string {
  const labelHtml = f.label
    ? `<label style="display:block;margin-bottom:5px;font-size:13px;font-weight:600;color:inherit">${esc(f.label)}${f.required ? '<span style="color:#dc2626;margin-left:3px">*</span>' : ''}</label>`
    : '';
  const help = fieldHelpNote(f);
  const helpHtml = help ? `<div style="margin-top:4px;font-size:11px;color:#9ca3af">${esc(help)}</div>` : '';
  const name = esc(f.name || f.id);
  const ph = esc(f.placeholder ?? '');
  const inp = fieldInputCss();
  const va = validationAttrs(f);

  let control = '';
  switch (f.type) {
    case 'textarea':
      control = `<textarea name="${name}" rows="${f.rows ?? 4}" placeholder="${ph}" style="${inp};resize:vertical"${va}>${esc(f.defaultValue ?? '')}</textarea>`;
      break;
    case 'select': {
      const opts = (f.options ?? []).map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('');
      const placeholderOpt = ph ? `<option value="" disabled selected>${ph}</option>` : '';
      control = `<select name="${name}" style="${inp}"${f.required ? ' required' : ''}>${placeholderOpt}${opts}</select>`;
      break;
    }
    case 'checkbox':
    case 'radio': {
      const opts = (f.options && f.options.length) ? f.options : [{ label: f.label || 'Option', value: 'option' }];
      const inputType = f.type;
      // radio shares one name; checkbox uses name[] so multiple values post.
      // `name` is already escaped above, so groupName needs no further escaping.
      const groupName = f.type === 'radio' ? name : `${name}[]`;
      control = `<div style="display:flex;flex-direction:column;gap:6px">` + opts.map((o, i) =>
        `<label style="display:flex;align-items:center;gap:8px;font-size:13px;color:inherit;font-weight:400"><input type="${inputType}" name="${groupName}" value="${esc(o.value)}"${(f.required && i === 0 && f.type === 'radio') ? ' required' : ''} style="width:15px;height:15px;flex-shrink:0" />${esc(o.label)}</label>`,
      ).join('') + `</div>`;
      break;
    }
    default:
      control = `<input type="${htmlInputType(f)}" name="${name}" placeholder="${ph}" value="${esc(f.defaultValue ?? '')}" style="${inp}"${va} />`;
  }

  // Width is class-driven so the mobile @media rule (in FORM_BASE_CSS) can stack
  // half-width fields to full-width — inline styles couldn't be overridden.
  const widthClass = f.width === 'half' ? 'pb-ff pb-ff-half' : 'pb-ff pb-ff-full';
  return `<div class="${widthClass}">${labelHtml}${control}${helpHtml}</div>`;
}

// Render a Form element as a <form> wrapper. `className`/`extraAttrs` let the
// caller attach the same positioning class an <a>/<div> wrapper would have used.
function renderForm(el: CanvasElement, wrapperCss: string, className: string, extraAttrs = ''): string {
  HAS_FORM = true;
  const fields = el.content.formFields ?? [];
  const gap = el.content.fieldGap ?? 14;
  const submitLabel = esc(el.content.submitLabel || 'Submit');
  const action = actionOf(el);
  const recipient = action?.type === 'submit-form' ? (action.email ?? '') : '';
  const subject = action?.type === 'submit-form' ? (action.subject ?? '') : '';
  const apiUrl = action?.type === 'submit-api' ? (action.apiUrl ?? '') : '';
  const apiMethod = action?.type === 'submit-api' ? (action.apiMethod ?? 'POST') : '';

  const fieldsHtml = fields.map(renderFormField).join('');
  const typo = el.style.typography;
  const btnBg = el.style.background.color && el.style.background.color !== 'transparent' ? el.style.background.color : '#006e75';
  const submitBtn = `<button type="submit" style="width:100%;margin-top:2px;padding:11px 18px;font-size:15px;font-weight:600;font-family:inherit;color:#fff;background:${esc(btnBg)};border:none;border-radius:6px;cursor:pointer">${submitLabel}</button>`;

  // data-form-email / data-form-subject drive the client-side mailto submit;
  // data-form-api-url / data-form-api-method drive the fetch() API submit.
  const cls = ['pb-form', className].filter(Boolean).join(' ');
  return `<form class="${cls}"${extraAttrs} data-form-email="${esc(recipient)}" data-form-subject="${esc(subject)}" data-form-api-url="${esc(apiUrl)}" data-form-api-method="${esc(apiMethod)}" style="${wrapperCss};display:flex;flex-wrap:wrap;gap:${gap}px;align-content:flex-start;overflow:auto;color:${esc(typo.color)};font-family:${esc(typo.family)}">${fieldsHtml}${submitBtn}</form>`;
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

  // Form: the positioned wrapper IS the <form> (can't sit inside an <a>).
  if (el.type === 'form') {
    return renderForm(el, `${cStyle};padding:${pad}`, `el-${el.id}${animClass}`, animData);
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
      if (el.content.orientation === 'vertical') {
        const innerW = Math.max(2, el.layout.width - padding.left - padding.right);
        inner = `<div style="${cStyle};display:flex;justify-content:center;align-items:stretch;padding:${pad}"><div style="width:${innerW}px;height:100%;background-color:${el.style.background.color || '#dddddd'};border-radius:${el.style.border.radius}px"></div></div>`;
      } else {
        const innerH = Math.max(2, el.layout.height - padding.top - padding.bottom);
        inner = `<div style="${cStyle};display:flex;align-items:center;padding:${pad}"><div style="width:100%;height:${innerH}px;background-color:${el.style.background.color || '#dddddd'};border-radius:${el.style.border.radius}px"></div></div>`;
      }
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
      inner = `<div style="${cStyle}"></div>`;
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
  // In a column cell, clamp every item to the column width and let it shrink
  // below its content so content-sized children never overflow a narrow column.
  const colClamp = cellMode === 'column' ? ';max-width:100%;min-width:0' : '';
  let sizing: string;
  switch (fl.widthMode) {
    // fill already implies grow via flex shorthand — the flexGrow field has no additional effect
    case 'fill':    sizing = cellMode === 'column' ? `width:100%${colClamp}` : 'flex:1 1 0;min-width:0'; break;
    case 'auto':    sizing = `width:auto;flex-shrink:1${colClamp}${grow}`; break;
    case 'fixed':   sizing = `width:${fl.widthValue}px;flex-shrink:0${colClamp}${grow}`; break;
    case 'percent': sizing = `width:${fl.widthValue}%;flex-shrink:1${colClamp}${grow}`; break;
  }
  const alignSelf = fl.alignSelf !== 'auto' ? `;align-self:${fl.alignSelf}` : '';
  return `${sizing}${alignSelf}`;
}

// Flex-direction + flex-wrap for a cell layoutMode.
function cellDirectionCss(mode: CellLayoutMode): string {
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
  const animVars = el.animation.type !== 'none'
    ? `;--anim-duration:${el.animation.duration}ms;--anim-delay:${el.animation.delay}ms`
    : '';
  let animClass = '';
  let animData = '';
  if (el.animation.type !== 'none') {
    if (el.animation.trigger === 'load') animClass = ` anim-${el.animation.type}`;
    else { animClass = ' anim-pending'; animData = ` data-anim="${el.animation.type}"`; }
  }
  const wrapStyle = `position:absolute;left:${el.layout.x}px;top:${el.layout.y}px;width:${el.layout.width}px;height:${el.layout.height}px;z-index:${el.layout.zIndex ?? 0};box-sizing:border-box;opacity:${el.style.opacity}${shadowCss}${rotateCss}${animVars}`;

  if (el.type === 'form') {
    return renderForm(el, `${cStyle};${wrapStyle};padding:${pad}`, `ge-${el.id}${animClass}`, animData);
  }

  let inner = '';
  const textBase = `${cStyle};padding:${pad};word-break:break-word`;
  switch (el.type) {
    case 'text':   inner = `<div class="ec-${el.id}" style="${textBase};white-space:pre-wrap">${(el.content.rich || el.content.plain) ?? ''}</div>`; break;
    case 'button': inner = `<div class="ec-${el.id}" style="${cStyle};display:flex;align-items:center;justify-content:center;padding:${pad};cursor:pointer">${esc(el.content.label ?? '')}</div>`; break;
    case 'image':  inner = el.content.src ? `<div style="${cStyle}"><img src="${esc(el.content.src)}" alt="${esc(el.content.alt ?? '')}" style="width:100%;height:100%;object-fit:${el.content.objectFit};display:block" /></div>` : ''; break;
    case 'divider': { if (el.content.orientation === 'vertical') { const iw = Math.max(2, el.layout.width - padding.left - padding.right); inner = `<div style="${cStyle};display:flex;justify-content:center;align-items:stretch;padding:${pad}"><div style="width:${iw}px;height:100%;background-color:${el.style.background.color || '#ddd'};border-radius:${el.style.border.radius}px"></div></div>`; } else { const ih = Math.max(2, el.layout.height - padding.top - padding.bottom); inner = `<div style="${cStyle};display:flex;align-items:center;padding:${pad}"><div style="width:100%;height:${ih}px;background-color:${el.style.background.color || '#ddd'};border-radius:${el.style.border.radius}px"></div></div>`; } break; }
    case 'icon': { const isz = el.content.iconSize ?? 40; inner = `<div style="${cStyle};display:flex;align-items:center;justify-content:center;padding:${pad}">${el.content.iconSvg ? `<span style="display:inline-flex;width:${isz}px;height:${isz}px;color:${esc(typography.color)}">${el.content.iconSvg}</span>` : `<span style="font-size:${isz}px;color:${esc(typography.color)};line-height:1">${esc(el.content.iconName ?? '★')}</span>`}</div>`; break; }
    case 'spacer': inner = `<div style="${cStyle}"></div>`; break;
    default:       inner = `<div style="${cStyle};padding:${pad}"></div>`;
  }

  const link = resolveElementHref(el);
  if (link) return `<a href="${link.href}" target="${link.target}"${link.onclick ? ` onclick="${link.onclick}"` : ''} style="${wrapStyle};display:block;text-decoration:none;color:inherit" class="ge-${el.id}${animClass}"${animData}>${inner}</a>`;
  return `<div class="ge-${el.id}${animClass}" style="${wrapStyle}"${animData}>${inner}</div>`;
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

  // Form: the flex/positioned wrapper IS the <form>. Sizing comes from the
  // ge-{id} flex class + min-height in wrapStyle; only background/border here.
  if (el.type === 'form') {
    const bgb = elBgBorderCss(el);
    return renderForm(el, `${bgb ? bgb + ';' : ''}${wrapStyle};padding:${pad}`, `ge-${el.id}${animClass}`, animData);
  }

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
      if (el.content.orientation === 'vertical') {
        const innerW = Math.max(2, el.layout.width - padding.left - padding.right);
        inner = `<div style="${cStyle};display:flex;justify-content:center;align-items:stretch;padding:${pad}"><div style="width:${innerW}px;height:100%;background-color:${el.style.background.color || '#dddddd'};border-radius:${el.style.border.radius}px"></div></div>`;
      } else {
        const innerH = Math.max(2, el.layout.height - padding.top - padding.bottom);
        inner = `<div style="${cStyle};display:flex;align-items:center;padding:${pad}"><div style="width:100%;height:${innerH}px;background-color:${el.style.background.color || '#dddddd'};border-radius:${el.style.border.radius}px"></div></div>`;
      }
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
  else if (bg.image) bgCss = `background-image:url(${bg.image});background-size:cover;background-position:${bg.position || 'center'}`;
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

  // Flex elements mode — align-items/justify-content live in the CSS class, not inline
  const cellStyle = [
    'position:relative', bgCss,
    `gap:${gap}px`, `padding:${padStr}`,
    'box-sizing:border-box',
    minHeight ? `min-height:${minHeight}px` : '',
    borderCss, radiusCss,
  ].filter(Boolean).join(';');

  const childrenHtml = cell.children.map(id => {
    const child = nodes[id];
    if (!child) return '';
    if (child.type === 'container') return renderColumnsBlock(child as Container, nodes);
    if (child.type === 'carousel') return renderCarousel(child as Carousel, nodes);
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

  const secBorder = sec.style.border;
  const borderCss = secBorder && secBorder.width > 0
    ? `;border:${secBorder.width}px ${secBorder.style ?? 'solid'} ${secBorder.color}${secBorder.radius ? `;border-radius:${secBorder.radius}px` : ''}`
    : secBorder?.radius ? `;border-radius:${secBorder.radius}px` : '';

  return `  <div id="sec-${sec.id}" style="${sectionBgCssStr(sec.style.background)};${sectionPositionCss(sec)};width:100%${borderCss}">
    ${overlay}
    <div class="sc-grid-${sec.id} sc-pad-${sec.id}" style="display:grid;grid-template-columns:repeat(12,1fr);${widthCss};padding:${padCss};box-sizing:border-box">
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

// Render a carousel as a track of slides (each slide is a GridCell). One slide is
// visible at a time; the controller below handles arrows/dots/autoplay/loop.
function renderCarousel(carousel: Carousel, nodes: NodeMap): string {
  HAS_CAROUSEL = true;
  const p = carousel.props;
  const slides = carousel.children
    .map(id => nodes[id] as GridCell | undefined)
    .filter((c): c is GridCell => !!c);

  const h = carousel.layout.height;
  const minH = carousel.layout.minHeight;
  const tabletH = carousel.responsive?.tablet?.height;
  const mobileH = carousel.responsive?.mobile?.height;

  const slideItems = slides.map(slide =>
    `<div class="crs-slide" style="flex:0 0 100%;width:100%;height:100%">${renderGridCell(slide, nodes)}</div>`
  ).join('');

  const arrows = (p.showArrows && slides.length > 1)
    ? `<button class="crs-arrow crs-prev" aria-label="Previous slide" data-crs-prev>‹</button>
       <button class="crs-arrow crs-next" aria-label="Next slide" data-crs-next>›</button>`
    : '';

  const dots = (p.showDots && slides.length > 1)
    ? `<div class="crs-dots">${slides.map((_, i) => `<button class="crs-dot${i === 0 ? ' crs-dot-active' : ''}" data-crs-dot="${i}" aria-label="Go to slide ${i + 1}"></button>`).join('')}</div>`
    : '';

  // Responsive height via inline custom properties consumed by the media-query CSS.
  const heightVars = [
    `--crs-h:${h}px`,
    minH ? `--crs-min-h:${minH}px` : '',
    tabletH ? `--crs-h-tablet:${tabletH}px` : '',
    mobileH ? `--crs-h-mobile:${mobileH}px` : '',
    p.dotColor ? `--crs-dot:${p.dotColor}` : '',
  ].filter(Boolean).join(';');

  const dataAttrs = [
    `data-carousel`,
    `data-crs-autoplay="${p.autoplay ? 1 : 0}"`,
    `data-crs-interval="${Math.max(1, p.autoplayInterval) * 1000}"`,
    `data-crs-loop="${p.loop ? 1 : 0}"`,
    `data-crs-pause-hover="${p.pauseOnHover ? 1 : 0}"`,
    `data-crs-duration="${p.transitionDuration ?? 400}"`,
  ].join(' ');

  return `<div class="crs crs-${carousel.id}" ${dataAttrs} style="${heightVars}">
    <div class="crs-viewport">
      <div class="crs-track" data-crs-track style="transition-duration:${p.transitionDuration ?? 400}ms">${slideItems}</div>
      ${arrows}
      ${dots}
    </div>
  </div>`;
}

// Wrap a carousel in an absolutely-positioned box matching its free layout.
// Position/size live in a per-carousel CSS class (crs-wrap-${id}) so tablet/mobile
// media queries can override x/y/width — the same model as free elements.
function renderFreeCarousel(carousel: Carousel, nodes: NodeMap): string {
  return `<div class="crs-wrap-${carousel.id}">${renderCarousel(carousel, nodes)}</div>`;
}

function renderSection(sec: Section, nodes: NodeMap, pageFixed: boolean, pageMaxWidth: number): string {
  if (sec.layoutMode === 'grid') return renderGridSection(sec as GridSection, nodes, pageFixed, pageMaxWidth);

  const bg = sec.style.background;
  const overlay = bg.overlay > 0
    ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${bg.overlay});pointer-events:none;z-index:0"></div>`
    : '';

  const columnBgs = renderColumnBgs(sec);

  const elements = sec.children
    .map(id => nodes[id])
    .filter(Boolean)
    .map(node => node!.type === 'carousel'
      ? renderFreeCarousel(node as Carousel, nodes)
      : renderElement(node as CanvasElement))
    .join('\n      ');

  const freePad = sec.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const freePadCss = (freePad.top || freePad.right || freePad.bottom || freePad.left)
    ? `;padding:${freePad.top}px ${freePad.right}px ${freePad.bottom}px ${freePad.left}px`
    : '';
  const fb = sec.style.border;
  const freeBorderCss = fb && fb.width > 0 && fb.style !== 'none'
    ? `;border:${fb.width}px ${fb.style} ${fb.color}${fb.radius ? `;border-radius:${fb.radius}px` : ''}`
    : (fb?.radius ? `;border-radius:${fb.radius}px` : '');
  return `  <div id="sec-${sec.id}" style="${sectionBgCssStr(sec.style.background)};${sectionPositionCss(sec)};width:100%${freeBorderCss}">
    ${overlay}
    <div class="sc sc-free-${sec.id} sc-pad-${sec.id}" style="min-height:${sec.layout.height}px${freePadCss}">
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
  const rowSpanCss = (cell.rowSpan ?? 1) > 1 ? `;grid-row:span ${cell.rowSpan}` : '';

  baseRules.push(`.gc-${cell.id}{grid-column:span ${Math.min(cell.columnSpan, 12)}${rowSpanCss};display:flex;${cellDirectionCss(desktopMode)};align-items:${cell.style.alignItems};justify-content:${cell.style.justifyContent}}`);

  // Tablet cell overrides
  const tCell = cell.responsive.tablet;
  if (tCell?.hidden) {
    tabletRules.push(`.gc-${cell.id}{display:none}`);
  } else {
    const tParts: string[] = [];
    if (tCell?.columnSpan !== undefined) tParts.push(`grid-column:span ${Math.min(tCell.columnSpan, 12)}`);
    if (tCell?.layoutMode !== undefined) tParts.push(`display:flex;${cellDirectionCss(tCell.layoutMode)}`);
    if (tCell?.minHeight !== undefined) tParts.push(`min-height:${tCell.minHeight}px`);
    if (tCell?.alignItems !== undefined) tParts.push(`align-items:${tCell.alignItems}`);
    if (tCell?.justifyContent !== undefined) tParts.push(`justify-content:${tCell.justifyContent}`);
    if (tCell?.padding !== undefined) {
      const p = { ...cell.style.padding, ...tCell.padding };
      tParts.push(`padding:${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`);
    }
    if (tParts.length) tabletRules.push(`.gc-${cell.id}{${tParts.join(';')}}`);
  }

  // Mobile cell overrides
  const mCell = cell.responsive.mobile;
  if (mCell?.hidden) {
    mobileRules.push(`.gc-${cell.id}{display:none}`);
  } else {
    const mParts: string[] = [];
    if (mCell?.columnSpan !== undefined) mParts.push(`grid-column:span ${Math.min(mCell.columnSpan, 12)}`);
    if (mCell?.layoutMode !== undefined) mParts.push(`display:flex;${cellDirectionCss(mCell.layoutMode)}`);
    if (mCell?.minHeight !== undefined) mParts.push(`min-height:${mCell.minHeight}px`);
    if (mCell?.padding !== undefined) {
      const p = { ...cell.style.padding, ...tCell?.padding, ...mCell.padding };
      mParts.push(`padding:${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`);
    }
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

    // Carousel child — generate CSS for each slide cell (slides are GridCells), same as free-section carousels.
    if (child.type === 'carousel') {
      for (const slideId of (child as Carousel).children) {
        const slide = nodes[slideId] as GridCell | undefined;
        if (slide) generateCellCSS(slide, nodes, baseRules, tabletRules, mobileRules);
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
      // Tablet/mobile: stay absolutely positioned but default to top-left if no explicit override
      const tO = el.responsive.tablet?.layout;
      const mO = el.responsive.mobile?.layout;
      if (!tCell?.hidden) {
        const tx = tO?.x ?? 0; const ty = tO?.y ?? 0;
        const tw = tO?.width ?? el.layout.width; const th = tO?.height ?? el.layout.height;
        tabletRules.push(`.ge-${el.id}{position:absolute;left:${tx}px;top:${ty}px;width:${tw}px;height:${th}px}`);
      }
      if (!mCell?.hidden && !tCell?.hidden) {
        const mx = mO?.x ?? tO?.x ?? 0; const my = mO?.y ?? tO?.y ?? 0;
        const mw = mO?.width ?? tO?.width ?? el.layout.width; const mh = mO?.height ?? tO?.height ?? el.layout.height;
        mobileRules.push(`.ge-${el.id}{position:absolute;left:${mx}px;top:${my}px;width:${mw}px;height:${mh}px}`);
      }
      continue;
    }

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

function emitSectionSharedCSS(sec: Section, _base: string[], tablet: string[], mobile: string[]) {
  if (sec.responsive?.tablet?.hidden) tablet.push(`#sec-${sec.id}{display:none}`);
  if (sec.responsive?.mobile?.hidden) mobile.push(`#sec-${sec.id}{display:none}`);
  const dp = sec.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const tPad = sec.responsive?.tablet?.padding;
  const mPad = sec.responsive?.mobile?.padding;
  if (tPad) {
    const p = { ...dp, ...tPad };
    tablet.push(`.sc-pad-${sec.id}{padding:${p.top}px ${p.right}px ${p.bottom}px ${p.left}px !important}`);
  }
  if (mPad) {
    const p = { ...dp, ...tPad, ...mPad };
    mobile.push(`.sc-pad-${sec.id}{padding:${p.top}px ${p.right}px ${p.bottom}px ${p.left}px !important}`);
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
      emitSectionSharedCSS(sec, baseRules, tabletRules, mobileRules);
      continue;
    }

    for (const elId of sec.children) {
      const node = nodes[elId];
      if (!node) continue;
      // Carousels: emit the wrapper position box (with responsive overrides) +
      // generate CSS for each slide cell (slides are GridCells).
      if (node.type === 'carousel') {
        const car = node as Carousel;
        const cl = car.layout;
        const ct = car.responsive?.tablet;
        const cm = car.responsive?.mobile;
        // Desktop base box. x/y/width are stored in CANVAS_W space (like elements' base layout).
        baseRules.push(`.crs-wrap-${car.id}{position:absolute;left:${cl.x}px;top:${cl.y}px;width:${cl.width}px;z-index:${cl.zIndex ?? 0};box-sizing:border-box}`);
        // Tablet: explicit override (CANVAS_W space) ?? auto-scaled desktop.
        if (ct?.hidden) {
          tabletRules.push(`.crs-wrap-${car.id}{display:none}`);
        } else {
          const tx = Math.round((ct?.x ?? cl.x) * tScale);
          const ty = Math.round((ct?.y ?? cl.y) * tScale);
          const tw = Math.round((ct?.width ?? cl.width) * tScale);
          tabletRules.push(`.crs-wrap-${car.id}{left:${tx}px;top:${ty}px;width:${tw}px}`);
        }
        // Mobile: cascade mobile ?? tablet ?? desktop, then auto-scale.
        if (cm?.hidden ?? ct?.hidden) {
          mobileRules.push(`.crs-wrap-${car.id}{display:none}`);
        } else {
          const mx = Math.round((cm?.x ?? ct?.x ?? cl.x) * mScale);
          const my = Math.round((cm?.y ?? ct?.y ?? cl.y) * mScale);
          const mw = Math.round((cm?.width ?? ct?.width ?? cl.width) * mScale);
          mobileRules.push(`.crs-wrap-${car.id}{left:${mx}px;top:${my}px;width:${mw}px}`);
        }
        for (const slideId of car.children) {
          const slide = nodes[slideId] as GridCell | undefined;
          if (slide) generateCellCSS(slide, nodes, baseRules, tabletRules, mobileRules);
        }
        continue;
      }
      const el = node as CanvasElement;
      if (el.state.hidden) continue;

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
        // Dividers are thin lines, so they bypass the usual 20px scaled-width floor.
        const minW = el.type === 'divider' ? 1 : 20;
        const tx = to?.layout?.x ?? Math.round(el.layout.x * tScale);
        const ty = to?.layout?.y ?? Math.round(el.layout.y * tScale);
        const tw = to?.layout?.width ?? Math.max(minW, Math.round(el.layout.width * tScale));
        const th = to?.layout?.height ?? Math.max(1, Math.round(el.layout.height * tScale));
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
        const minMW = el.type === 'divider' ? 1 : 20;
        const mx = mo?.layout?.x ?? to?.layout?.x ?? Math.round(el.layout.x * mScale);
        const my = mo?.layout?.y ?? to?.layout?.y ?? Math.round(el.layout.y * mScale);
        const mw = mo?.layout?.width ?? to?.layout?.width ?? Math.max(minMW, Math.round(el.layout.width * mScale));
        const mh = mo?.layout?.height ?? to?.layout?.height ?? Math.max(1, Math.round(el.layout.height * mScale));
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

    emitSectionSharedCSS(sec, baseRules, tabletRules, mobileRules);
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

// Client-side form handler: native validation runs first (required/pattern/etc).
// If an API endpoint is configured we POST the field values as JSON; otherwise we
// build a mailto: to the configured recipient with all field values.
const FORM_SUBMIT_SCRIPT = `<script>
(function(){
  function collect(form){
    var data={}, els=form.querySelectorAll('input,textarea,select');
    els.forEach(function(el){
      if(!el.name) return;
      var key=el.name.replace(/\\[\\]$/,'');
      if((el.type==='checkbox'||el.type==='radio')&&!el.checked) return;
      if(data[key]!==undefined){ data[key]=[].concat(data[key],el.value); }
      else { data[key]=el.value; }
    });
    return data;
  }
  function note(form,msg,color){
    var n=form.querySelector('.pb-form-note');
    if(!n){ n=document.createElement('div'); n.className='pb-form-note'; n.style.cssText='flex:1 1 100%;margin-top:8px;font-size:13px'; form.appendChild(n); }
    n.style.color=color; n.textContent=msg;
  }
  document.querySelectorAll('form.pb-form').forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!form.reportValidity()) return;
      var data=collect(form);
      var apiUrl=form.getAttribute('data-form-api-url')||'';
      if(apiUrl){
        var method=form.getAttribute('data-form-api-method')||'POST';
        var btn=form.querySelector('button[type=submit]');
        if(btn) btn.disabled=true;
        note(form,'Sending…','#64748b');
        fetch(apiUrl,{method:method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
          .then(function(r){
            if(!r.ok) throw new Error('HTTP '+r.status);
            note(form,'Thanks! Your message has been sent.','#059669');
            form.reset();
          })
          .catch(function(){ note(form,'Sorry, something went wrong. Please try again.','#dc2626'); })
          .then(function(){ if(btn) btn.disabled=false; });
        return;
      }
      var email=form.getAttribute('data-form-email')||'';
      var subject=form.getAttribute('data-form-subject')||'Form submission';
      var lines=Object.keys(data).map(function(k){return k+': '+[].concat(data[k]).join(', ');});
      var body=lines.join('\\n');
      if(email){
        window.location.href='mailto:'+email+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      }
      note(form,email?'Opening your email app…':'Thanks! Your message has been recorded.','#059669');
    });
  });
})();
</script>`;

export function exportHtml(state: BuilderState, pageName: string): string {
  const page = state.pages.find(p => p.id === state.activePageId) ?? state.pages[0];
  const nodes = state.nodes;
  const sections = page.sections.map(id => nodes[id] as Section).filter(Boolean);

  // Reset module render state (PAGE_SLUGS for internal-page links, HAS_FORM gate).
  PAGE_SLUGS = Object.fromEntries(state.pages.map((p: Page) => [p.id, p.slug]));
  HAS_FORM = false;
  HAS_CAROUSEL = false;

  const pageFixed = (page.layoutWidth ?? 'fixed') === 'fixed';
  const pageMaxWidth = page.maxWidth ?? 1280;

  const googleFonts = collectGoogleFonts(state, sections);
  const fontLinks = googleFonts
    .map(f => `  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap">`)
    .join('\n');

  const sectionsHtml = sections.map(sec => renderSection(sec, nodes, pageFixed, pageMaxWidth)).join('\n');
  const formScript = HAS_FORM ? FORM_SUBMIT_SCRIPT : '';
  const formCss = HAS_FORM ? FORM_BASE_CSS : '';
  const carouselScript = HAS_CAROUSEL ? CAROUSEL_SCRIPT : '';
  const carouselCss = HAS_CAROUSEL ? CAROUSEL_CSS : '';
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
    body{font-family:${state.theme.fonts.body};color:${state.theme.colors.text};background-color:${state.theme.colors.background}}
    ${pageFixed ? `.sc{width:100%;max-width:${pageMaxWidth}px;margin:0 auto;position:relative;overflow:hidden}` : `.sc{width:100%;position:relative;overflow:hidden}`}
    ${smoothScrollCss}
    ${ANIM_CSS}
    ${formCss}
    ${carouselCss}
    ${elementCss}
  </style>
</head>
<body>
${sectionsHtml}
${SCROLL_ANIM_SCRIPT}
${formScript}
${carouselScript}
</body>
</html>`;
}
