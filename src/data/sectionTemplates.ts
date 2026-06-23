/**
 * Section templates — pre-built grid sections users can insert in one click.
 * Each template is a pure factory: call it with ID generators, get back nodes + sectionId.
 */
import type {
  AnyNode, CanvasElement, GridCell, GridSection,
  ElementBackground, SectionBackground, Padding, Border, Shadow,
  FlexItemLayout, TextTransform, SiteTheme,
} from '../types';
import { DEFAULT_THEME } from '../utils/builderDefaults';

// ─── ID generator contract ───────────────────────────────────────────────────
export interface TemplateIds {
  el: () => string;
  cell: () => string;
  sec: () => string;
}

export interface TemplateResult {
  sectionId: string;
  nodes: Record<string, AnyNode>;
}

export interface SectionTemplate {
  key: string;
  label: string;
  desc: string;
  icon: string;
  build: (ids: TemplateIds, theme: SiteTheme) => TemplateResult;
}

// ─── Shared helpers (identical signature to demoState helpers) ───────────────
const fl = (m: FlexItemLayout['widthMode'], grow = 0, self: FlexItemLayout['alignSelf'] = 'auto'): FlexItemLayout =>
  ({ widthMode: m, widthValue: 0, flexGrow: grow, alignSelf: self });
const pad = (t: number, r = t, b = t, l = r): Padding => ({ top: t, right: r, bottom: b, left: l });
const elBg = (color = 'transparent'): ElementBackground =>
  ({ type: 'solid', color, image: '', position: 'center', from: '#006e75', to: '#0b978e', angle: 135 });
const elGrad = (from: string, to: string, angle = 135): ElementBackground =>
  ({ type: 'linear-gradient', color: 'transparent', image: '', position: 'center', from, to, angle });
const secSolid = (color: string): SectionBackground =>
  ({ type: 'solid', color, image: '', position: 'center', from: '#006e75', to: '#0b978e', angle: 135, overlay: 0 });
const secGrad = (from: string, to: string, angle = 135): SectionBackground =>
  ({ type: 'linear-gradient', color: 'transparent', image: '', position: 'center', from, to, angle, overlay: 0 });
const bdr = (radius = 0, width = 0, color = '#cccccc', style: Border['style'] = 'solid'): Border =>
  ({ radius, width, color, style });
const shad = (on = false, x = 0, y = 8, blur = 24, spread = -4, color = 'rgba(0,0,0,0.08)'): Shadow =>
  ({ enabled: on, x, y, blur, spread, color });
const nostate = () => ({ hidden: false });
const nolink = () => ({ type: 'link' as const, linkUrl: '', linkTarget: '_self' as const, smoothScroll: false });
type A3 = 'left' | 'center' | 'right';
const typo = (sz: number, w: string, color: string, align: A3 = 'left', lh = 1.5, ls = 0, tt: TextTransform = 'none') =>
  ({ family: 'Inter, sans-serif', size: sz, weight: w, color, align, lineHeight: lh, letterSpacing: ls, textTransform: tt });

function mkText(id: string, parent: string, text: string, sz: number, w: string, color: string,
  align: A3 = 'left', h = 48, lh = 1.5, p = pad(0), flex = fl('fill')): CanvasElement {
  return { id, type: 'text', parent, layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(), padding: p, border: bdr(), shadow: shad(), typography: typo(sz, w, color, align, lh) },
    content: { plain: text, rich: '' }, interaction: nolink(), state: nostate(),
    responsive: {}, flexLayout: flex };
}
function mkBtn(id: string, parent: string, label: string, bg: string, color: string,
  sz = 15, radius = 8, p = pad(12, 28), flex = fl('auto'), bdColor?: string, bdW = 0): CanvasElement {
  return { id, type: 'button', parent, layout: { x: 0, y: 0, width: 160, height: 44, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(bg), padding: p, border: bdr(radius, bdW, bdColor ?? bg), shadow: shad(), typography: typo(sz, '600', color, 'center', 1, 0.3) },
    content: { plain: label, label, rich: '' }, interaction: nolink(), state: nostate(),
    responsive: {}, flexLayout: flex };
}
function mkSp(id: string, parent: string, h = 16): CanvasElement {
  return { id, type: 'spacer', parent, layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(), padding: pad(0), border: bdr(), shadow: shad(), typography: typo(16, 'normal', '#333') },
    content: {}, interaction: nolink(), state: nostate(), responsive: {}, flexLayout: fl('fill') };
}
function mkBox(id: string, parent: string, h: number, from: string, to: string, radius = 12,
  flex = fl('fill', 1, 'stretch')): CanvasElement {
  return { id, type: 'box', parent, layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elGrad(from, to), padding: pad(0), border: bdr(radius), shadow: shad(true, 0, 8, 32, -4, 'rgba(0,0,0,0.12)'), typography: typo(16, 'normal', '#fff') },
    content: { plain: '', rich: '' }, interaction: nolink(), state: nostate(),
    responsive: {}, flexLayout: flex };
}
function mkIcon(id: string, parent: string, icon: string, sz = 32, color = '#006e75'): CanvasElement {
  return { id, type: 'icon', parent, layout: { x: 0, y: 0, width: 60, height: sz + 8, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(), padding: pad(0), border: bdr(), shadow: shad(),
      typography: { family: 'Inter, sans-serif', size: sz, weight: 'normal', color, align: 'left', lineHeight: 1, letterSpacing: 0, textTransform: 'none' } },
    content: { iconName: icon, iconSize: sz }, interaction: nolink(), state: nostate(),
    responsive: {}, flexLayout: fl('auto') };
}
function mkImg(id: string, parent: string, h: number, radius = 16): CanvasElement {
  return { id, type: 'image', parent, layout: { x: 0, y: 0, width: 400, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg('#e2e8f0'), padding: pad(0), border: bdr(radius), shadow: shad(true, 0, 8, 32, -4, 'rgba(0,0,0,0.12)'), typography: typo(16, 'normal', '#64748b') },
    content: { src: 'https://placehold.co/800x500/e2e8f0/94a3b8?text=Your+Image', plain: '' },
    interaction: nolink(), state: nostate(), responsive: {}, flexLayout: fl('fill') };
}
function mkDivider(id: string, parent: string, color = '#e2e8f0'): CanvasElement {
  return { id, type: 'divider', parent, layout: { x: 0, y: 0, width: 400, height: 2, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(color), padding: pad(8, 0), border: bdr(), shadow: shad(), typography: typo(16, 'normal', '#333') },
    content: {}, interaction: nolink(), state: nostate(), responsive: {}, flexLayout: fl('fill') };
}
function mkCell(id: string, parent: string, span: number, children: string[],
  mode: GridCell['style']['layoutMode'] = 'column',
  align: GridCell['style']['alignItems'] = 'flex-start',
  justify: GridCell['style']['justifyContent'] = 'flex-start',
  gap_ = 0, p = pad(0), bg = 'transparent',
  res: GridCell['responsive'] = {}, border_ = bdr(0, 0, '#ccc', 'none'), minH?: number): GridCell {
  return { id, type: 'grid-cell', parent, columnSpan: span, rowSpan: 1,
    style: { layoutMode: mode, gap: gap_, padding: p,
      background: { type: 'solid', color: bg, image: '', position: 'center', from: '#006e75', to: '#0b978e', angle: 135, overlay: 0 },
      border: border_, minHeight: minH, alignItems: align, justifyContent: justify },
    children, responsive: res };
}
function mkSec(id: string, children: string[], bg: SectionBackground, gap_ = 24, rowGap = 0,
  p: Padding = pad(0), label = 'Section'): GridSection {
  return { id, type: 'section', layoutMode: 'grid', role: 'section', label,
    layout: { height: 600 },
    style: { background: bg, columns: { count: 1, widths: [100], styles: {} }, padding: p },
    children, grid: { gap: gap_, rowGap, maxWidth: 1280 } };
}

function reg(nodes: Record<string, AnyNode>, ...items: AnyNode[]): void {
  items.forEach(n => { nodes[n.id] = n; });
}

// ─── Template definitions ────────────────────────────────────────────────────

function buildHero(ids: TemplateIds, theme: SiteTheme = DEFAULT_THEME): TemplateResult {
  const nodes: Record<string, AnyNode> = {};
  const T = theme.colors;
  const secId = ids.sec();
  const cid = ids.cell();

  const e1 = mkText(ids.el(), cid, 'YOUR HEADLINE GOES HERE', 54, '700', T.text, 'center', 140, 1.1);
  const sp1 = mkSp(ids.el(), cid, 20);
  const e2 = mkText(ids.el(), cid, 'Add a supporting subtitle that tells visitors what you do and why they should care.', 18, 'normal', T.text, 'center', 60, 1.7);
  const sp2 = mkSp(ids.el(), cid, 36);
  const btn = mkBtn(ids.el(), cid, 'Get Started →', T.primary, '#ffffff', 16, 8, pad(16, 36));
  const sp3 = mkSp(ids.el(), cid, 12);
  const note = mkText(ids.el(), cid, 'No credit card required', 13, 'normal', T.text, 'center', 20, 1);

  const cell = mkCell(cid, secId, 12, [e1.id, sp1.id, e2.id, sp2.id, btn.id, sp3.id, note.id],
    'column', 'center', 'flex-start', 0, pad(100, 40), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });
  const sec = mkSec(secId, [cid], secSolid(T.sectionBg), 0, 0, pad(0), 'Hero');

  reg(nodes, e1, sp1, e2, sp2, btn, sp3, note, cell, sec);
  return { sectionId: secId, nodes };
}

function buildHeroSplit(ids: TemplateIds): TemplateResult {
  const nodes: Record<string, AnyNode> = {};
  const secId = ids.sec();
  const cleft = ids.cell();
  const cright = ids.cell();

  const eye = mkText(ids.el(), cleft, 'YOUR TAGLINE', 11, '700', '#006e75', 'left', 18, 1);
  const sp1 = mkSp(ids.el(), cleft, 16);
  const h1 = mkText(ids.el(), cleft, 'A Headline That Captures Attention', 44, '700', '#0f172a', 'left', 120, 1.15);
  const sp2 = mkSp(ids.el(), cleft, 20);
  const sub = mkText(ids.el(), cleft, 'Describe your product or service in two or three sentences. Focus on the benefit, not the feature.', 17, 'normal', '#64748b', 'left', 72, 1.75);
  const sp3 = mkSp(ids.el(), cleft, 36);
  const btn = mkBtn(ids.el(), cleft, 'Get Started', '#006e75', '#ffffff');

  const box = mkBox(ids.el(), cright, 440, '#006e75', '#0b978e', 12);

  const cellL = mkCell(cleft, secId, 6, [eye.id, sp1.id, h1.id, sp2.id, sub.id, sp3.id, btn.id],
    'column', 'flex-start', 'center', 0, pad(0, 60, 0, 60), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });
  const cellR = mkCell(cright, secId, 6, [box.id],
    'column', 'stretch', 'center', 0, pad(0, 60, 0, 0), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });
  const sec = mkSec(secId, [cleft, cright], secSolid('#ffffff'), 0, 0, pad(80, 0), 'Hero Split');

  reg(nodes, eye, sp1, h1, sp2, sub, sp3, btn, box, cellL, cellR, sec);
  return { sectionId: secId, nodes };
}

function buildFeatures3(ids: TemplateIds): TemplateResult {
  const nodes: Record<string, AnyNode> = {};
  const secId = ids.sec();
  const hdrCell = ids.cell();

  const hEye = mkText(ids.el(), hdrCell, 'FEATURES', 11, '700', '#006e75', 'center', 18, 1);
  const hSp1 = mkSp(ids.el(), hdrCell, 8);
  const hTitle = mkText(ids.el(), hdrCell, 'Everything you need to succeed', 36, '700', '#0f172a', 'center', 48, 1.2);
  const hSp2 = mkSp(ids.el(), hdrCell, 10);
  const hSub = mkText(ids.el(), hdrCell, 'Powerful features that help you build, ship, and grow.', 16, 'normal', '#64748b', 'center', 28, 1.6);
  const hCell = mkCell(hdrCell, secId, 12, [hEye.id, hSp1.id, hTitle.id, hSp2.id, hSub.id],
    'column', 'center', 'flex-start', 0, pad(0, 40, 48, 40));

  const items = [
    { icon: '⚡', title: 'Fast Performance', desc: 'Optimised for speed from the ground up. Your users will notice the difference.' },
    { icon: '🔒', title: 'Secure by Default', desc: 'Enterprise-grade security built in. No configuration required to get started.' },
    { icon: '📊', title: 'Powerful Analytics', desc: 'Real-time insights into how your product is performing across all metrics.' },
  ];
  const cardCells: string[] = [];
  items.forEach(item => {
    const cid = ids.cell();
    cardCells.push(cid);
    const ic = mkIcon(ids.el(), cid, item.icon, 28, '#006e75');
    const sp1 = mkSp(ids.el(), cid, 14);
    const tl = mkText(ids.el(), cid, item.title, 17, '700', '#0f172a', 'left', 26, 1.1);
    const sp2 = mkSp(ids.el(), cid, 8);
    const ds = mkText(ids.el(), cid, item.desc, 14, 'normal', '#64748b', 'left', 68, 1.7);
    const cardCell = mkCell(cid, secId, 4, [ic.id, sp1.id, tl.id, sp2.id, ds.id],
      'column', 'flex-start', 'flex-start', 0, pad(32, 28), '#ffffff',
      { tablet: { columnSpan: 6 }, mobile: { columnSpan: 12 } },
      bdr(16, 1, '#e2e8f0'), 200);
    reg(nodes, ic, sp1, tl, sp2, ds, cardCell);
  });

  const sec = mkSec(secId, [hdrCell, ...cardCells], secSolid('#f8fafc'), 20, 20, pad(72, 0), 'Features 3-col');
  reg(nodes, hEye, hSp1, hTitle, hSp2, hSub, hCell, sec);
  return { sectionId: secId, nodes };
}

function buildFeatures4(ids: TemplateIds, theme: SiteTheme = DEFAULT_THEME): TemplateResult {
  const nodes: Record<string, AnyNode> = {};
  const T = theme.colors;
  const secId = ids.sec();

  const items = [
    { icon: '🎨', title: 'Beautiful Design',  desc: 'Professionally designed components you can customise to match your brand.' },
    { icon: '⚡', title: 'Lightning Fast',     desc: 'Performance-first architecture ensures pages load instantly on any device.' },
    { icon: '📱', title: 'Fully Responsive',   desc: 'Every layout adapts perfectly to desktop, tablet, and mobile screens.' },
    { icon: '🔧', title: 'Easy to Customise', desc: 'Intuitive controls let you change colours, fonts, and spacing in seconds.' },
  ];
  const cardCells: string[] = [];
  items.forEach(item => {
    const cid = ids.cell();
    cardCells.push(cid);
    const ic = mkIcon(ids.el(), cid, item.icon, 26, T.primary);
    const sp1 = mkSp(ids.el(), cid, 12);
    const tl = mkText(ids.el(), cid, item.title, 15, '700', T.text, 'left', 22, 1.1);
    const sp2 = mkSp(ids.el(), cid, 6);
    const ds = mkText(ids.el(), cid, item.desc, 13, 'normal', T.text, 'left', 60, 1.7);
    const cardCell = mkCell(cid, secId, 3, [ic.id, sp1.id, tl.id, sp2.id, ds.id],
      'column', 'flex-start', 'flex-start', 0, pad(28, 24), T.background,  /* card bg = page bg */
      { tablet: { columnSpan: 6 }, mobile: { columnSpan: 12 } },
      bdr(12, 1, T.light), 180);
    reg(nodes, ic, sp1, tl, sp2, ds, cardCell);
  });

  const sec = mkSec(secId, cardCells, secSolid(T.sectionBg), 20, 20, pad(72, 40), 'Features 4-col');
  reg(nodes, sec);
  return { sectionId: secId, nodes };
}

function buildTwoColumn(ids: TemplateIds, theme: SiteTheme = DEFAULT_THEME): TemplateResult {
  const nodes: Record<string, AnyNode> = {};
  const T = theme.colors;
  const secId = ids.sec();
  const cleft = ids.cell();
  const cright = ids.cell();

  const eye = mkText(ids.el(), cleft, 'WHY CHOOSE US', 11, '700', T.primary, 'left', 18, 1);
  const sp1 = mkSp(ids.el(), cleft, 14);
  const h2 = mkText(ids.el(), cleft, 'Built for speed,\ndesigned for growth.', 36, '700', T.text, 'left', 96, 1.2);
  const sp2 = mkSp(ids.el(), cleft, 18);
  const body = mkText(ids.el(), cleft, 'Describe the value you provide in a couple of sentences. Focus on outcomes your customers care about most.', 16, 'normal', T.text, 'left', 72, 1.75);
  const sp3 = mkSp(ids.el(), cleft, 12);
  const chk1 = mkText(ids.el(), cleft, '✓  Benefit one',   15, 'normal', T.text, 'left', 26, 1.6);
  const chk2 = mkText(ids.el(), cleft, '✓  Benefit two',   15, 'normal', T.text, 'left', 26, 1.6);
  const chk3 = mkText(ids.el(), cleft, '✓  Benefit three', 15, 'normal', T.text, 'left', 26, 1.6);
  const sp4 = mkSp(ids.el(), cleft, 32);
  const btn = mkBtn(ids.el(), cleft, 'Learn More →', T.text, '#ffffff');

  const img = mkImg(ids.el(), cright, 380);

  const cellL = mkCell(cleft, secId, 6, [eye.id, sp1.id, h2.id, sp2.id, body.id, sp3.id, chk1.id, chk2.id, chk3.id, sp4.id, btn.id],
    'column', 'flex-start', 'center', 6, pad(0, 60, 0, 60), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });
  const cellR = mkCell(cright, secId, 6, [img.id],
    'column', 'center', 'center', 0, pad(20, 40), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });
  const sec = mkSec(secId, [cleft, cright], secSolid(T.sectionBg), 0, 0, pad(80, 0), 'Two Column');

  reg(nodes, eye, sp1, h2, sp2, body, sp3, chk1, chk2, chk3, sp4, btn, img, cellL, cellR, sec);
  return { sectionId: secId, nodes };
}

function buildStats(ids: TemplateIds): TemplateResult {
  const nodes: Record<string, AnyNode> = {};
  const secId = ids.sec();

  const stats = [
    { n: '10K+', l: 'Happy customers' },
    { n: '99.9%', l: 'Uptime guarantee' },
    { n: '50+',  l: 'Countries served' },
    { n: '24/7', l: 'Support available' },
  ];
  const statCells: string[] = [];
  stats.forEach(st => {
    const cid = ids.cell();
    statCells.push(cid);
    const num = mkText(ids.el(), cid, st.n, 44, '700', '#ffffff', 'center', 56, 1.1);
    const sp = mkSp(ids.el(), cid, 8);
    const lbl = mkText(ids.el(), cid, st.l, 11, '600', 'rgba(255,255,255,0.6)', 'center', 20, 1);
    const c = mkCell(cid, secId, 3, [num.id, sp.id, lbl.id], 'column', 'center', 'flex-start', 0, pad(0, 24),
      'transparent', { tablet: { columnSpan: 6, minHeight: 100 }, mobile: { columnSpan: 6, minHeight: 80 } });
    reg(nodes, num, sp, lbl, c);
  });

  const sec = mkSec(secId, statCells, secSolid('#0f172a'), 0, 0, pad(56, 0), 'Stats');
  reg(nodes, sec);
  return { sectionId: secId, nodes };
}

function buildTestimonial(ids: TemplateIds): TemplateResult {
  const nodes: Record<string, AnyNode> = {};
  const secId = ids.sec();
  const cid = ids.cell();

  const mark = mkText(ids.el(), cid, '❝', 48, '700', '#006e75', 'center', 56, 1);
  const sp1 = mkSp(ids.el(), cid, 8);
  const quote = mkText(ids.el(), cid, '"Add a compelling customer quote here. One or two sentences that capture the transformation your product delivered."', 22, '400', '#0f172a', 'center', 96, 1.7);
  const sp2 = mkSp(ids.el(), cid, 32);
  const dv = mkDivider(ids.el(), cid, '#e2e8f0');
  const sp3 = mkSp(ids.el(), cid, 24);
  const name = mkText(ids.el(), cid, 'Customer Name', 15, '700', '#0f172a', 'center', 24, 1);
  const role = mkText(ids.el(), cid, 'Job Title, Company', 14, 'normal', '#64748b', 'center', 22, 1);

  const cell = mkCell(cid, secId, 12, [mark.id, sp1.id, quote.id, sp2.id, dv.id, sp3.id, name.id, role.id],
    'column', 'center', 'flex-start', 0, pad(80, 40));
  const sec = mkSec(secId, [cid], secSolid('#f8fafc'), 0, 0, pad(0), 'Testimonial');

  reg(nodes, mark, sp1, quote, sp2, dv, sp3, name, role, cell, sec);
  return { sectionId: secId, nodes };
}

function buildCTA(ids: TemplateIds, theme: SiteTheme = DEFAULT_THEME): TemplateResult {
  const nodes: Record<string, AnyNode> = {};
  const T = theme.colors;
  const secId = ids.sec();
  const cid = ids.cell();

  const h2 = mkText(ids.el(), cid, 'Ready to get started?', 42, '700', T.background, 'center', 56, 1.2);
  const sp1 = mkSp(ids.el(), cid, 16);
  const sub = mkText(ids.el(), cid, 'Join thousands of users who are already seeing results. Start your free trial today.', 18, 'normal', T.background, 'center', 28, 1.6);
  const sp2 = mkSp(ids.el(), cid, 40);
  const btn = mkBtn(ids.el(), cid, 'Start Free Trial →', T.background, T.primary, 16, 8, pad(16, 36));

  const cell = mkCell(cid, secId, 12, [h2.id, sp1.id, sub.id, sp2.id, btn.id],
    'column', 'center', 'flex-start', 0, pad(96, 40), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });
  const sec = mkSec(secId, [cid], secGrad(T.primary, T.accent || T.primary, 135), 0, 0, pad(0), 'CTA Banner');

  reg(nodes, h2, sp1, sub, sp2, btn, cell, sec);
  return { sectionId: secId, nodes };
}

function buildPricing(ids: TemplateIds): TemplateResult {
  const nodes: Record<string, AnyNode> = {};
  const secId = ids.sec();
  const hdrCell = ids.cell();

  const hEye = mkText(ids.el(), hdrCell, 'PRICING', 11, '700', '#006e75', 'center', 18, 1);
  const hSp1 = mkSp(ids.el(), hdrCell, 8);
  const hTl = mkText(ids.el(), hdrCell, 'Simple, transparent pricing', 36, '700', '#0f172a', 'center', 48, 1.2);
  const hSp2 = mkSp(ids.el(), hdrCell, 10);
  const hSub = mkText(ids.el(), hdrCell, 'Start for free. Upgrade when you\'re ready.', 16, 'normal', '#64748b', 'center', 28, 1.6);
  const hCell = mkCell(hdrCell, secId, 12, [hEye.id, hSp1.id, hTl.id, hSp2.id, hSub.id],
    'column', 'center', 'flex-start', 0, pad(0, 40, 48, 40));

  const plans = [
    { name: 'Starter', price: '$0', period: 'Free forever', features: '✓  5 projects\n✓  1 GB storage\n✓  Community support', btnLabel: 'Get started free', btnBg: 'transparent', btnColor: '#006e75', bdColor: '#006e75', bdW: 2 },
    { name: 'Pro', price: '$29', period: 'per month', features: '✓  Unlimited projects\n✓  50 GB storage\n✓  Priority support\n✓  Custom domain', btnLabel: 'Start Pro trial', btnBg: '#006e75', btnColor: '#fff', bdColor: '#006e75', bdW: 0 },
    { name: 'Enterprise', price: 'Custom', period: 'contact us', features: '✓  Everything in Pro\n✓  SSO / SAML\n✓  Dedicated support\n✓  SLA guarantee', btnLabel: 'Talk to sales', btnBg: '#0f172a', btnColor: '#fff', bdColor: '#0f172a', bdW: 0 },
  ];
  const planCells: string[] = [];
  plans.forEach(plan => {
    const cid = ids.cell();
    planCells.push(cid);
    const nm = mkText(ids.el(), cid, plan.name, 12, '700', '#64748b', 'left', 20, 1);
    const pr = mkText(ids.el(), cid, plan.price, 44, '800', '#0f172a', 'left', 56, 1);
    const pd = mkText(ids.el(), cid, plan.period, 13, 'normal', '#64748b', 'left', 22, 1);
    const sp1 = mkSp(ids.el(), cid, 20);
    const dv = mkDivider(ids.el(), cid, '#e2e8f0');
    const sp2 = mkSp(ids.el(), cid, 20);
    const ft = mkText(ids.el(), cid, plan.features, 14, 'normal', '#475569', 'left', 96, 2.1);
    const sp3 = mkSp(ids.el(), cid, 28);
    const btn = mkBtn(ids.el(), cid, plan.btnLabel, plan.btnBg, plan.btnColor, 14, 8, pad(12, 20), fl('fill'), plan.bdColor, plan.bdW);
    const c = mkCell(cid, secId, 4, [nm.id, pr.id, pd.id, sp1.id, dv.id, sp2.id, ft.id, sp3.id, btn.id],
      'column', 'flex-start', 'flex-start', 0, pad(36, 28), '#ffffff',
      { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }, bdr(20, 1, '#e2e8f0'));
    reg(nodes, nm, pr, pd, sp1, dv, sp2, ft, sp3, btn, c);
  });

  const sec = mkSec(secId, [hdrCell, ...planCells], secSolid('#f8fafc'), 24, 24, pad(80, 0), 'Pricing');
  reg(nodes, hEye, hSp1, hTl, hSp2, hSub, hCell, sec);
  return { sectionId: secId, nodes };
}

function buildNavbar(ids: TemplateIds, theme: SiteTheme = DEFAULT_THEME): TemplateResult {
  const nodes: Record<string, AnyNode> = {};
  const T = theme.colors;
  const secId = ids.sec();
  const clogo = ids.cell();
  const cnav  = ids.cell();
  const cbtn  = ids.cell();

  const logo     = mkText(ids.el(), clogo, 'Your Brand', 20, '700',    T.text,    'center', 30, 1, pad(0), fl('auto'));
  const lnkHome  = mkText(ids.el(), cnav,  'Home',       14, 'normal', T.text, 'center', 24, 1, pad(0), fl('auto'));
  const lnkAbout = mkText(ids.el(), cnav,  'About',      14, 'normal', T.text, 'center', 24, 1, pad(0), fl('auto'));
  const lnkFeats = mkText(ids.el(), cnav,  'Features',   14, 'normal', T.text, 'center', 24, 1, pad(0), fl('auto'));
  const lnkPrice = mkText(ids.el(), cnav,  'Pricing',    14, 'normal', T.text, 'center', 24, 1, pad(0), fl('auto'));
  const btn      = mkBtn(ids.el(),  cbtn,  'Sign Up', T.primary, '#ffffff', 13, 6, pad(8, 16));

  // Desktop: [Logo:3] [Nav links (4 texts, row):7] [Sign Up:2] = 12 cols
  // Mobile: all span 12, stack vertically, centered
  const cellLogo = mkCell(clogo, secId, 3, [logo.id], 'row', 'center', 'center', 0, pad(16, 24),
    'transparent', { tablet: { columnSpan: 3 }, mobile: { columnSpan: 12 } });
  const cellNav  = mkCell(cnav,  secId, 7,
    [lnkHome.id, lnkAbout.id, lnkFeats.id, lnkPrice.id],
    'row', 'center', 'center', 28, pad(16, 16),
    'transparent', { tablet: { columnSpan: 6 }, mobile: { columnSpan: 12 } });
  const cellBtn  = mkCell(cbtn,  secId, 2, [btn.id], 'row', 'center', 'center', 0, pad(16, 24),
    'transparent', { tablet: { columnSpan: 3 }, mobile: { columnSpan: 12 } });

  const sec = mkSec(secId, [clogo, cnav, cbtn], secSolid(T.sectionBg), 0, 0, pad(0), 'Navbar');

  reg(nodes, logo, lnkHome, lnkAbout, lnkFeats, lnkPrice, btn, cellLogo, cellNav, cellBtn, sec);
  return { sectionId: secId, nodes };
}

function buildFooter(ids: TemplateIds, theme: SiteTheme = DEFAULT_THEME): TemplateResult {
  const nodes: Record<string, AnyNode> = {};
  const T = theme.colors;
  const secId = ids.sec();
  const cl = ids.cell();
  const cm = ids.cell();
  const cr = ids.cell();

  const logo = mkText(ids.el(), cl, 'Your Brand', 20, '700', T.primary, 'left', 30, 1, pad(0), fl('auto'));
  const sp1 = mkSp(ids.el(), cl, 10);
  const desc = mkText(ids.el(), cl, 'A short description of your product or company that explains what you do.', 13, 'normal', T.text, 'left', 52, 1.7);
  const sp2 = mkSp(ids.el(), cl, 20);
  const copy = mkText(ids.el(), cl, `© ${new Date().getFullYear()} Your Brand. All rights reserved.`, 12, 'normal', T.text, 'left', 20);
  const cellL = mkCell(cl, secId, 5, [logo.id, sp1.id, desc.id, sp2.id, copy.id], 'column', 'flex-start', 'flex-start', 0, pad(48, 40, 48, 32),
    'transparent', { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });

  const colTitle1 = mkText(ids.el(), cm, 'PRODUCT', 11, '700', T.text, 'left', 20, 1);
  const dv1 = mkDivider(ids.el(), cm, T.light);
  const lnk1a = mkText(ids.el(), cm, 'Features',  13, 'normal', T.text, 'left', 24, 1.6, pad(0), fl('fill'));
  const lnk1b = mkText(ids.el(), cm, 'Pricing',   13, 'normal', T.text, 'left', 24, 1.6, pad(0), fl('fill'));
  const lnk1c = mkText(ids.el(), cm, 'Changelog', 13, 'normal', T.text, 'left', 24, 1.6, pad(0), fl('fill'));
  const lnk1d = mkText(ids.el(), cm, 'Docs',      13, 'normal', T.text, 'left', 24, 1.6, pad(0), fl('fill'));
  const cellM = mkCell(cm, secId, 3, [colTitle1.id, dv1.id, lnk1a.id, lnk1b.id, lnk1c.id, lnk1d.id],
    'column', 'flex-start', 'flex-start', 6, pad(48, 24),
    'transparent', { tablet: { columnSpan: 6 }, mobile: { columnSpan: 6 } });

  const colTitle2 = mkText(ids.el(), cr, 'COMPANY', 11, '700', T.text, 'left', 20, 1);
  const dv2 = mkDivider(ids.el(), cr, T.light);
  const lnk2a = mkText(ids.el(), cr, 'About',   13, 'normal', T.text, 'left', 24, 1.6, pad(0), fl('fill'));
  const lnk2b = mkText(ids.el(), cr, 'Blog',    13, 'normal', T.text, 'left', 24, 1.6, pad(0), fl('fill'));
  const lnk2c = mkText(ids.el(), cr, 'Careers', 13, 'normal', T.text, 'left', 24, 1.6, pad(0), fl('fill'));
  const lnk2d = mkText(ids.el(), cr, 'Contact', 13, 'normal', T.text, 'left', 24, 1.6, pad(0), fl('fill'));
  const cellR = mkCell(cr, secId, 4, [colTitle2.id, dv2.id, lnk2a.id, lnk2b.id, lnk2c.id, lnk2d.id],
    'column', 'flex-start', 'flex-start', 6, pad(48, 32, 48, 24),
    'transparent', { tablet: { columnSpan: 6 }, mobile: { columnSpan: 6 } });

  const sec = mkSec(secId, [cl, cm, cr], secSolid(T.sectionBg), 0, 0, pad(0), 'Footer');
  reg(nodes, logo, sp1, desc, sp2, copy, cellL,
    colTitle1, dv1, lnk1a, lnk1b, lnk1c, lnk1d, cellM,
    colTitle2, dv2, lnk2a, lnk2b, lnk2c, lnk2d, cellR, sec);
  return { sectionId: secId, nodes };
}

// ─── Exported template list ──────────────────────────────────────────────────

export const SECTION_TEMPLATES: SectionTemplate[] = [
  { key: 'navbar',      label: 'Navbar',          desc: 'Logo + nav links + CTA button',      icon: '☰',  build: buildNavbar      },
  { key: 'hero',        label: 'Hero – Centered', desc: 'Full-width headline, sub & CTA',     icon: '⬛', build: buildHero        },
  { key: 'features-4',  label: 'Features 4-col',  desc: '4 compact feature cards',             icon: '⊟',  build: buildFeatures4   },
  { key: 'two-column',  label: 'Two Column',       desc: 'Text left + visual block right',     icon: '◫',  build: buildTwoColumn   },
  { key: 'cta',         label: 'CTA Banner',       desc: 'Full-width call to action + button', icon: '→',  build: buildCTA         },
  { key: 'footer',      label: 'Footer',           desc: 'Brand + 2 link columns, dark bg',   icon: '⬇',  build: buildFooter      },
  // { key: 'hero-split',  label: 'Hero – Split',    desc: 'Text left, visual right',             icon: '◧',  build: buildHeroSplit   },
  // { key: 'features-3',  label: 'Features 3-col',  desc: '3 icon + title + description cards', icon: '⊞',  build: buildFeatures3   },
  // { key: 'stats',        label: 'Stats Bar',       desc: '4 key numbers on dark background',   icon: '★',  build: buildStats       },
  // { key: 'testimonial',  label: 'Testimonial',     desc: 'Centered quote with name & role',    icon: '❝',  build: buildTestimonial },
  // { key: 'pricing',      label: 'Pricing',         desc: '3-tier pricing cards',               icon: '◈',  build: buildPricing     },
];
