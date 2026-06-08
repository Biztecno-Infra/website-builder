/**
 * Knight showcase — rebuilt cleanly.
 * No empty offset cells. Centered sections use a single 12-col cell with padding.
 */

import type {
  AnyNode, Border, BuilderState, CanvasElement, ElementBackground,
  FlexItemLayout, GridCell, GridSection, NodeMap, Padding,
  SectionBackground, Shadow, TextTransform,
} from '../types';
import { DEFAULT_THEME } from '../utils/builderDefaults';

const K = {
  black:   '#000000',
  dark:    '#11171a',
  primary: '#1de9b6',
  body:    '#CFD8DC',
  muted:   '#607D8B',
  white:   '#ffffff',
  card:    '#1a2327',
  border:  '#2a3940',
};

let _id = 0;
const uid = () => `kn_${++_id}`;

const fl = (m: FlexItemLayout['widthMode'], grow = 0, self: FlexItemLayout['alignSelf'] = 'auto'): FlexItemLayout =>
  ({ widthMode: m, widthValue: 0, flexGrow: grow, alignSelf: self });
const pad = (t: number, r = t, b = t, l = r): Padding => ({ top: t, right: r, bottom: b, left: l });
const elBg = (color = 'transparent'): ElementBackground =>
  ({ type: 'solid', color, image: '', position: 'center', from: K.primary, to: '#0b978e', angle: 135 });
const secSolid = (color: string): SectionBackground =>
  ({ type: 'solid', color, image: '', position: 'center', from: K.primary, to: '#0b978e', angle: 135, overlay: 0 });
const bdr = (radius = 0, width = 0, color = K.border, style: Border['style'] = 'solid'): Border =>
  ({ radius, width, color, style });
const shad = (on = false, y = 8, blur = 24): Shadow =>
  ({ enabled: on, x: 0, y, blur, spread: -4, color: 'rgba(0,0,0,0.4)' });
const noanim = () => ({ type: 'none' as const, trigger: 'load' as const, duration: 600, delay: 0 });
const nostate = () => ({ hidden: false, locked: false });
const nolink = () => ({ type: 'link' as const, linkUrl: '', linkTarget: '_self' as const, smoothScroll: false });
const typo = (sz: number, w: string, color: string, align: 'left'|'center'|'right' = 'left', lh = 1.5) =>
  ({ family: 'Inter, sans-serif', size: sz, weight: w, color, align, lineHeight: lh, letterSpacing: 0, textTransform: 'none' as TextTransform });

// ── Element factories ──────────────────────────────────────────────────────

function T(parent: string, plain: string, sz: number, w: string, color: string,
  align: 'left'|'center'|'right' = 'left', h = 48, lh = 1.5,
  p = pad(0), flex = fl('fill')): CanvasElement {
  return {
    id: uid(), type: 'text', parent,
    layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(), padding: p, border: bdr(), shadow: shad(),
      typography: typo(sz, w, color, align, lh) },
    content: { plain, rich: '' },
    interaction: nolink(), animation: noanim(), state: nostate(),
    responsive: {}, flexLayout: flex,
  };
}

function Btn(parent: string, label: string, bg: string, color: string,
  p = pad(13, 28), radius = 6): CanvasElement {
  return {
    id: uid(), type: 'button', parent,
    layout: { x: 0, y: 0, width: 180, height: 48, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(bg), padding: p, border: bdr(radius),
      shadow: shad(), typography: typo(15, '600', color, 'center') },
    content: { plain: label, label, rich: '' },
    interaction: nolink(), animation: noanim(), state: nostate(),
    responsive: {}, flexLayout: fl('auto'),
  };
}

function Sp(parent: string, h: number): CanvasElement {
  return {
    id: uid(), type: 'spacer', parent,
    layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(), padding: pad(0), border: bdr(), shadow: shad(),
      typography: typo(16, '400', K.body) },
    content: {}, interaction: nolink(), animation: noanim(), state: nostate(),
    responsive: {}, flexLayout: fl('fill'),
  };
}

function Img(parent: string, src: string, h: number): CanvasElement {
  return {
    id: uid(), type: 'image', parent,
    layout: { x: 0, y: 0, width: 400, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg('#1a2327'), padding: pad(0), border: bdr(8),
      shadow: shad(true), typography: typo(16, '400', K.body) },
    content: { src, alt: '', objectFit: 'cover' as const },
    interaction: nolink(), animation: noanim(), state: nostate(),
    responsive: {}, flexLayout: fl('fill'),
  };
}

function Div(parent: string, color = K.border): CanvasElement {
  return {
    id: uid(), type: 'divider', parent,
    layout: { x: 0, y: 0, width: 400, height: 1, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(color), padding: pad(0), border: bdr(0),
      shadow: shad(), typography: typo(16, '400', K.body) },
    content: {}, interaction: nolink(), animation: noanim(), state: nostate(),
    responsive: {}, flexLayout: fl('fill'),
  };
}

// ── Grid helpers ──────────────────────────────────────────────────────────

function cell(
  parent: string, span: number, children: CanvasElement[] | string[],
  mode: 'column'|'row'|'wrap' = 'column',
  justify = 'flex-start', align = 'flex-start',
  gap = 0, p = pad(0), bg = 'transparent',
  responsive: GridCell['responsive'] = {},
): GridCell {
  const childIds = (children as any[]).map((c: any) => typeof c === 'string' ? c : c.id);
  const childItems = (children as any[]).filter((c: any) => typeof c !== 'string');
  const gc: GridCell = {
    id: uid(), type: 'grid-cell', parent,
    columnSpan: span, rowSpan: 1,
    style: {
      layoutMode: mode, gap, padding: p,
      background: { type: 'solid', color: bg, image: '', position: 'center',
        from: K.primary, to: '#0b978e', angle: 135, overlay: 0 },
      border: bdr(), justifyContent: justify as any, alignItems: align as any, minHeight: undefined,
    },
    children: childIds, responsive,
  };
  for (const el of childItems) el.parent = gc.id;
  return gc;
}

function section(
  cells: GridCell[], bg: SectionBackground,
  gap = 0, rowGap = 0, p = pad(0), label = 'Section',
  sticky = false,
): GridSection {
  const s: GridSection = {
    id: uid(), type: 'section', role: 'section', label,
    layout: { height: 400 },
    style: { background: bg, columns: { count: 1, widths: [], styles: {} }, padding: p },
    layoutMode: 'grid',
    children: cells.map(c => c.id),
    grid: { gap, rowGap, contentWidth: 'constrained', maxWidth: 1280 },
    scrollBehavior: sticky ? 'sticky' : 'normal',
  };
  for (const c of cells) c.parent = s.id;
  return s;
}

function reg(nodes: NodeMap, ...items: AnyNode[]): void {
  for (const item of items) nodes[item.id] = item;
}

// ─────────────────────────────────────────────────────────────────────────
// BUILD
// ─────────────────────────────────────────────────────────────────────────

export function makeKnightState(): BuilderState {
  const nodes: NodeMap = {};

  // ── NAVBAR ─────────────────────────────────────────────────────────────
  const logo   = T('', 'Knight', 20, '700', K.white, 'left', 30, 1, pad(0), fl('auto'));
  const nFeat  = T('', 'Features',     14, '400', K.body, 'center', 28, 1, pad(0), fl('auto'));
  const nPrice = T('', 'Pricing',      14, '400', K.body, 'center', 28, 1, pad(0), fl('auto'));
  const nFaq   = T('', 'FAQ',          14, '400', K.body, 'center', 28, 1, pad(0), fl('auto'));
  const nBlog  = T('', 'Blog',         14, '400', K.body, 'center', 28, 1, pad(0), fl('auto'));
  const nBtn   = Btn('', 'Try Generator', K.primary, K.dark, pad(7, 16), 4);

  const cLogo  = cell('', 2,  [logo], 'row', 'center', 'center', 0, pad(12, 0), 'transparent',
    { tablet: { columnSpan: 6 }, mobile: { columnSpan: 12 } });
  const cLinks = cell('', 10, [nFeat, nPrice, nFaq, nBlog, nBtn], 'row', 'flex-end', 'center', 16, pad(12, 0), 'transparent',
    { tablet: { columnSpan: 6 }, mobile: { columnSpan: 12, layoutMode: 'wrap' } });

  const secNav = section([cLogo, cLinks], secSolid(K.dark), 0, 0, pad(0), 'Navbar', true);
  reg(nodes, logo, nFeat, nPrice, nFaq, nBlog, nBtn, cLogo, cLinks, secNav);

  // ── HERO ───────────────────────────────────────────────────────────────
  // ❌ GAP: 100vh not supported — using 600px fixed height
  const hH1  = T('', 'Quickly build landing pages with Knight', 48, '700', K.white, 'center', 112, 1.2);
  const hSp1 = Sp('', 16);
  const hSub = T('', 'Knight is a platform that helps freelancers and companies build beautiful landing pages in minutes. Sign up for free.', 18, '400', K.body, 'center', 80, 1.7);
  const hSp2 = Sp('', 24);
  const hBtn = Btn('', 'Get started now →', K.primary, K.dark, pad(16, 36), 6);

  const cHero = cell('', 12, [hH1, hSp1, hSub, hSp2, hBtn], 'column', 'center', 'center', 0, pad(80, 40));
  const secHero = section([cHero], secSolid(K.black), 0, 0, pad(0), 'Hero');
  secHero.grid.minHeight = 600;
  reg(nodes, hH1, hSp1, hSub, hSp2, hBtn, cHero, secHero);

  // ── FEATURES HEADER ────────────────────────────────────────────────────
  // Single centered cell — no empty offset cells
  const fH2  = T('', 'Knight offers everything you need.', 34, '700', '#111827', 'center', 56, 1.2);
  const fSub = T('', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum in nisi commodo, tempus odio a, vestibulum nibh.', 17, '400', K.muted, 'center', 80, 1.7);

  // Use section padding + moderate cell padding so content stays centered on all sizes
  const cFHdr = cell('', 12, [fH2, fSub], 'column', 'center', 'center', 12, pad(0, 24));
  const secFHdr = section([cFHdr], secSolid('#ffffff'), 0, 0, pad(64, 80, 32, 80), 'Features Header');
  reg(nodes, fH2, fSub, cFHdr, secFHdr);

  // ── FEATURES 4 BOXES ───────────────────────────────────────────────────
  // ⚠️ APPROXIMATION: Icon colored circles → emoji + color text
  // ❌ GAP: No circular icon box shape. No per-feature accent colors via element.
  type FB = { icon: string; color: string; title: string; body: string };
  const boxes: FB[] = [
    { icon: '✏', color: K.primary,  title: 'Create once. Share everywhere.',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum in nisi commodo, tempus odio a, vestibulum nibh.' },
    { icon: '🖥', color: '#00e676', title: 'Unlimited devices',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum in nisi commodo, tempus odio a, vestibulum nibh.' },
    { icon: '⊞', color: '#ff1744', title: 'Beautiful templates & layouts',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum in nisi commodo, tempus odio a, vestibulum nibh.' },
    { icon: '🌐', color: '#00e5ff', title: 'Available globally',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum in nisi commodo, tempus odio a, vestibulum nibh.' },
  ];

  const boxCells = boxes.map(b => {
    const icon  = T('', b.icon, 28, '700', b.color, 'left', 36, 1, pad(0), fl('auto'));
    const sp1   = Sp('', 16);
    const title = T('', b.title, 17, '700', '#111827', 'left', 28, 1.3);
    const sp2   = Sp('', 8);
    const body  = T('', b.body, 15, '400', K.muted, 'left', 80, 1.7);
    const c = cell('', 6, [icon, sp1, title, sp2, body], 'column', 'flex-start', 'flex-start', 0,
      pad(0, 40, 40, 0), 'transparent',
      { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });
    reg(nodes, icon, sp1, title, sp2, body, c);
    return c;
  });

  const secBoxes = section(boxCells, secSolid('#ffffff'), 0, 0, pad(0, 60, 0, 60), 'Features Boxes');
  reg(nodes, secBoxes);

  // ── FEATURE HIGHLIGHT (two-column) ─────────────────────────────────────
  // ❌ GAP: Image carousel not possible — single static image
  const fhH2   = T('', 'Knight is more than just a page builder.', 30, '700', '#111827', 'left', 72, 1.3);
  const fhPara = T('', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis pulvinar vestibulum. Donec eleifend, sem sed dictum mattis, turpis purus placerat eros.', 16, '400', K.muted, 'left', 96, 1.7);
  const fhSp   = Sp('', 24);
  const fhBtn  = Btn('', 'Try the live demo', '#f1f5f9', '#111827', pad(12, 24), 4);

  const cFhL = cell('', 6, [fhH2, fhPara, fhSp, fhBtn], 'column', 'flex-start', 'center', 16,
    pad(64, 48, 64, 60), 'transparent', { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });

  const fhImg = Img('', 'https://picsum.photos/seed/knight1/600/400', 320);
  const cFhR  = cell('', 6, [fhImg], 'column', 'center', 'center', 0,
    pad(64, 60, 64, 48), 'transparent', { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });

  const secFh = section([cFhL, cFhR], secSolid('#ffffff'), 0, 0, pad(0), 'Feature Highlight');
  reg(nodes, fhH2, fhPara, fhSp, fhBtn, fhImg, cFhL, cFhR, secFh);

  // ── PRICING ────────────────────────────────────────────────────────────
  // ❌ GAP: section-angle diagonal clip-path not possible — plain dark bg
  const prH2  = T('', 'Choose your pricing plan.', 34, '700', K.white, 'center', 56, 1.2);
  const prSub = T('', 'Simple pricing — 7 Days free trial', 18, '400', K.body, 'center', 32, 1.5);
  const cPrHdr = cell('', 12, [prH2, prSub], 'column', 'center', 'center', 12, pad(0, 24));

  type PC = { plan: string; price: string; color: string; features: string[] };
  const plans: PC[] = [
    { plan: 'Personal',   price: '$59',  color: K.primary,
      features: ['1 user', '10 websites', 'Access to premium templates', 'Basic support'] },
    { plan: 'Agency',     price: '$159', color: '#00e5ff',
      features: ['2-15 users', '50 websites', 'Access to premium templates', 'Priority support'] },
    { plan: 'Enterprise', price: '$499', color: K.primary,
      features: ['Unlimited users', 'Unlimited websites', 'Access to premium templates', '24/7 support'] },
  ];

  const planCells = plans.map(p => {
    const name   = T('', p.plan, 20, '700', K.white, 'left', 32, 1);
    const price  = T('', p.price, 42, '700', p.color, 'left', 60, 1);
    const period = T('', 'per month', 14, '400', K.muted, 'left', 24, 1);
    const sp1    = Sp('', 16);
    const div    = Div('', K.border);
    const sp2    = Sp('', 16);
    const feats  = p.features.map(f => T('', f, 15, '400', K.body, 'left', 28, 1.5, pad(3, 0)));
    const sp3    = Sp('', 20);
    const btn    = Btn('', 'Start free trial', p.color, K.dark);
    const c = cell('', 4, [name, price, period, sp1, div, sp2, ...feats, sp3, btn],
      'column', 'flex-start', 'flex-start', 0, pad(32), K.card,
      { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });
    c.style.border = bdr(8, 1, K.border);
    reg(nodes, name, price, period, sp1, div, sp2, ...feats, sp3, btn, c);
    return c;
  });

  // Everything covered row
  const covH3   = T('', 'Everything is covered.', 24, '700', K.white, 'left', 40, 1.2);
  const covPara = T('', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum in nisi commodo, tempus odio a, vestibulum nibh.', 17, '400', K.body, 'left', 96, 1.7);
  const cCovL = cell('', 4, [covH3, covPara], 'column', 'flex-start', 'flex-start', 12,
    pad(0, 32, 0, 0), 'transparent', { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });

  // ❌ GAP: ::before bullet markers not possible — using → prefix
  const features = ['Weekly new templates','Access to new features','MailChimp integration',
    'Stripe integration','100% refund guarantee','Advance SEO tools','Free unlimited support'];
  const featEls = features.map(f => T('', `→  ${f}`, 15, '400', K.body, 'left', 28, 1.5, pad(4, 0)));
  const cCovR = cell('', 8, featEls, 'column', 'flex-start', 'flex-start', 0,
    pad(0, 0, 0, 32), 'transparent', { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });

  // Bottom CTA
  const ctaH3  = T('', 'Try Knight free for 7 days', 28, '700', K.white, 'center', 48, 1.2);
  const ctaPara = T('', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum in nisi commodo, tempus odio a, vestibulum nibh.', 16, '400', K.body, 'center', 64, 1.7);
  const ctaSp  = Sp('', 16);
  const ctaBtn = Btn('', 'Create your account', K.primary, K.dark);
  const cCta   = cell('', 12, [ctaH3, ctaPara, ctaSp, ctaBtn], 'column', 'center', 'center', 12, pad(48, 24, 0, 24));

  const secPricing = section(
    [cPrHdr, ...planCells, cCovL, cCovR, cCta],
    secSolid(K.dark), 24, 48, pad(80, 24), 'Pricing',
  );
  reg(nodes, prH2, prSub, cPrHdr, covH3, covPara, ...featEls, cCovL, cCovR,
      ctaH3, ctaPara, ctaSp, ctaBtn, cCta, secPricing);

  // ── FAQ ────────────────────────────────────────────────────────────────
  const faqH2  = T('', 'Frequently asked questions', 34, '700', '#111827', 'center', 56, 1.2);
  const faqSub = T('', 'Answers to most common questions.', 17, '400', K.muted, 'center', 32, 1.5);
  const cFaqHdr = cell('', 12, [faqH2, faqSub], 'column', 'center', 'center', 12, pad(0, 24, 32, 24));

  const faqs = [
    { q: 'Can I try it for free?',                       a: 'Nam liber tempor cum soluta nobis eleifend option congue nihil imper per tem por legere me doming.' },
    { q: 'Do you have hidden fees?',                     a: 'Nam liber tempor cum soluta nobis eleifend option congue nihil imper per tem por legere me doming.' },
    { q: 'What payment methods do you accept?',          a: 'Nam liber tempor cum soluta nobis eleifend option congue nihil imper per tem por legere me doming.' },
    { q: 'How often do you release updates?',            a: 'Nam liber tempor cum soluta nobis eleifend option congue nihil imper per tem por legere me doming.' },
    { q: 'What is your refund policy?',                  a: 'Nam liber tempor cum soluta nobis eleifend option congue nihil imper per tem por legere me doming.' },
    { q: 'How can I contact you?',                       a: 'Nam liber tempor cum soluta nobis eleifend option congue nihil imper per tem por legere me doming.' },
  ];

  // 2-col FAQ: each cell is span 6 — 2 per row = 12 columns ✓
  const faqCells = faqs.map(faq => {
    const q = T('', faq.q, 15, '700', '#111827', 'left', 28, 1.3);
    const a = T('', faq.a, 15, '400', K.muted, 'left', 80, 1.7);
    const c = cell('', 6, [q, a], 'column', 'flex-start', 'flex-start', 8,
      pad(0, 32, 32, 0), 'transparent', { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });
    reg(nodes, q, a, c);
    return c;
  });

  const faqCtaH = T('', 'Have questions?', 22, '700', '#111827', 'center', 40, 1.2);
  const faqCtaS = Sp('', 16);
  const faqCtaB = Btn('', 'Contact us', K.primary, K.dark);
  const cFaqCta = cell('', 12, [faqCtaH, faqCtaS, faqCtaB], 'column', 'center', 'center', 12, pad(32, 0, 0, 0));

  const secFaq = section([cFaqHdr, ...faqCells, cFaqCta], secSolid('#ffffff'), 0, 0, pad(80, 0), 'FAQ');
  reg(nodes, faqH2, faqSub, cFaqHdr, faqCtaH, faqCtaS, faqCtaB, cFaqCta, secFaq);

  // ── BLOG ───────────────────────────────────────────────────────────────
  // ❌ GAP: section-angle diagonal dividers not possible
  const blH2  = T('', 'News from Knight.', 34, '700', K.white, 'center', 56, 1.2);
  const blSub = T('', "What's new at Knight.", 17, '400', K.muted, 'center', 32, 1.5);
  const cBlHdr = cell('', 12, [blH2, blSub], 'column', 'center', 'center', 12, pad(0, 24, 32, 24));

  type BC = { img: string; title: string; date: string; body: string };
  const blogs: BC[] = [
    { img: 'https://picsum.photos/seed/k1/600/300', title: 'We launch new iOS & Android mobile apps', date: 'Sep 27, 2018',
      body: 'Nam liber tempor cum soluta nobis eleifend option congue nihil imper, consectetur adipiscing elit.' },
    { img: 'https://picsum.photos/seed/k2/600/300', title: 'New update is available for the editor', date: 'August 16, 2018',
      body: 'Nam liber tempor cum soluta nobis eleifend option congue nihil imper, consectetur adipiscing elit.' },
    { img: 'https://picsum.photos/seed/k3/600/300', title: 'The story of building #1 page builder', date: 'December 2nd, 2017',
      body: 'Nam liber tempor cum soluta nobis eleifend option congue nihil imper, consectetur adipiscing elit.' },
  ];

  const blogCells = blogs.map(b => {
    const img   = Img('', b.img, 200);
    const sp1   = Sp('', 12);
    const title = T('', b.title, 16, '700', K.white, 'left', 48, 1.3, pad(0, 20, 0, 20));
    const date  = T('', b.date, 13, '400', K.muted, 'left', 24, 1, pad(0, 20, 0, 20));
    const sp2   = Sp('', 8);
    const body  = T('', b.body, 14, '400', K.body, 'left', 60, 1.7, pad(0, 20, 20, 20));
    const c = cell('', 4, [img, sp1, title, date, sp2, body], 'column', 'flex-start', 'flex-start', 0,
      pad(0), K.card, { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });
    c.style.border = bdr(8, 1, K.border);
    img.style.border = bdr(0); img.style.padding = pad(0);
    reg(nodes, img, sp1, title, date, sp2, body, c);
    return c;
  });

  const blCtaS = Sp('', 8);
  const blCtaB = Btn('', 'View all posts', K.primary, K.dark);
  const cBlCta = cell('', 12, [blCtaS, blCtaB], 'column', 'center', 'center', 12, pad(32, 0, 0, 0));

  const secBlog = section([cBlHdr, ...blogCells, cBlCta], secSolid(K.dark), 24, 0, pad(80, 0), 'Blog');
  reg(nodes, blH2, blSub, cBlHdr, blCtaS, blCtaB, cBlCta, secBlog);

  // ── FOOTER ─────────────────────────────────────────────────────────────
  // ❌ GAP: Font Awesome social icons not possible — text placeholders
  const ftTitle = T('', 'About Knight', 15, '700', K.white, 'left', 28, 1);
  const ftDesc  = T('', 'Magnis modipsae que voloratati andigen daepeditem quiate conecus aut labore. Laceaque quiae sitiorem rest non restibusaes maio es dem tumquam explabo.', 14, '400', K.muted, 'left', 96, 1.7);
  const ftSoc   = T('', 'f   t   G+   ⛹', 17, '400', K.muted, 'left', 30, 1);
  const cFtAbout = cell('', 5, [ftTitle, ftDesc, ftSoc], 'column', 'flex-start', 'flex-start', 12,
    pad(0, 40, 0, 0), 'transparent', { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } });

  type LC = { title: string; links: string[] };
  const footerCols: LC[] = [
    { title: 'Legal',   links: ['Privacy', 'Terms', 'Refund policy'] },
    { title: 'Partner', links: ['Refer a friend', 'Affiliates'] },
    { title: 'Help',    links: ['Support', 'Log in'] },
  ];

  const footerLinkCells = footerCols.map(col => {
    const t = T('', col.title, 15, '700', K.white, 'left', 28, 1);
    const ls = col.links.map(l => T('', l, 14, '400', K.muted, 'left', 28, 1.5));
    const c = cell('', 2, [t, ...ls], 'column', 'flex-start', 'flex-start', 6,
      pad(0, 16), 'transparent', { tablet: { columnSpan: 6 }, mobile: { columnSpan: 12 } });
    reg(nodes, t, ...ls, c);
    return c;
  });

  const ftCopy = T('', '© 2019 Knight - All Rights Reserved', 13, '400', K.muted, 'center', 24, 1);
  const cFtCopy = cell('', 12, [ftCopy], 'column', 'center', 'center', 0, pad(32, 0, 0, 0));

  const secFooter = section(
    [cFtAbout, ...footerLinkCells, cFtCopy],
    secSolid(K.dark), 32, 0, pad(64, 0), 'Footer',
  );
  reg(nodes, ftTitle, ftDesc, ftSoc, ftCopy, cFtAbout, cFtCopy, secFooter);

  // ── Assemble ───────────────────────────────────────────────────────────
  const pageId = 'knight_page';
  const sectionIds = [
    secNav.id, secHero.id, secFHdr.id, secBoxes.id,
    secFh.id, secPricing.id, secFaq.id, secBlog.id, secFooter.id,
  ];

  return {
    schema: '2.0',
    activePageId: pageId,
    pages: [{
      id: pageId, name: 'Knight', slug: '/',
      seo: { title: 'Knight — Product Landing Page', description: '', ogImage: '' },
      sections: sectionIds, layoutWidth: 'fixed', maxWidth: 1200,
    }],
    nodes,
    site: { name: 'Knight', favicon: '', language: 'en' },
    theme: {
      ...DEFAULT_THEME,
      colors: {
        primary: K.primary, secondary: K.white, text: '#111827',
        background: K.white, light: '#f1f5f9', accent: '#ff1744', sectionBg: K.dark,
      },
      fonts: { body: 'Inter, sans-serif' },
    },
  };
}
