/**
 * Demo page 2 — Studio Craft Agency Page
 * Off-white / near-black / electric orange. Tests: large typography, asymmetric
 * hero layout, portfolio work grid, dark services section, image elements.
 */
import type {
  BuilderState, CanvasElement, GridCell, GridSection,
  ElementBackground, SectionBackground, Padding, Border, Shadow,
  FlexItemLayout, ElementResponsive, TextTransform, AnyNode,
} from '../types';

const C = {
  warm:    '#fafaf8',
  black:   '#0a0a0a',
  orange:  '#ff4f1f',
  gray:    '#888884',
  border:  '#e5e5e0',
  dark:    '#111111',
  darkAlt: '#1a1a1a',
  white:   '#ffffff',
  offW:    '#f5f5f0',
};

const fl = (m: FlexItemLayout['widthMode'], grow = 0, self: FlexItemLayout['alignSelf'] = 'auto'): FlexItemLayout =>
  ({ widthMode: m, widthValue: 0, flexGrow: grow, alignSelf: self });
const pad = (t: number, r = t, b = t, l = r): Padding => ({ top: t, right: r, bottom: b, left: l });
const elBg = (color = 'transparent'): ElementBackground =>
  ({ type: 'solid', color, image: '', position: 'center', from: '#ff4f1f', to: '#e03d0f', angle: 135 });
const elGrad = (from: string, to: string, angle = 135): ElementBackground =>
  ({ type: 'linear-gradient', color: 'transparent', image: '', position: 'center', from, to, angle });
const secSolid = (color: string): SectionBackground =>
  ({ type: 'solid', color, image: '', position: 'center', from: '#ff4f1f', to: '#e03d0f', angle: 135, overlay: 0 });
const bdr = (radius = 0, width = 0, color = '#cccccc', style: Border['style'] = 'solid'): Border =>
  ({ radius, width, color, style });
const shad = (on = false, x = 0, y = 8, blur = 32, spread = -4, color = 'rgba(0,0,0,0.1)'): Shadow =>
  ({ enabled: on, x, y, blur, spread, color });
const noanim = () => ({ type: 'none' as const, trigger: 'load' as const, duration: 600, delay: 0 });
const nostate = () => ({ hidden: false, locked: false });
const nolink = () => ({ type: 'link' as const, linkUrl: '', linkTarget: '_self' as const, smoothScroll: false });
type A3 = 'left' | 'center' | 'right';
const typo = (sz: number, w: string, color: string, align: A3 = 'left', lh = 1.5, ls = 0, tt: TextTransform = 'none', fam = 'Inter, sans-serif') =>
  ({ family: fam, size: sz, weight: w, color, align, lineHeight: lh, letterSpacing: ls, textTransform: tt });

function t(id: string, parent: string, text: string, sz: number, w: string, color: string,
  align: A3 = 'left', h = 48, lh = 1.5, p = pad(0), flex = fl('fill'),
  r: ElementResponsive = {}, ls = 0, tt: TextTransform = 'none', fam = 'Inter, sans-serif'): CanvasElement {
  return { id, type: 'text', parent, layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(), padding: p, border: bdr(), shadow: shad(), typography: typo(sz, w, color, align, lh, ls, tt, fam) },
    content: { plain: text, rich: '' }, interaction: nolink(), animation: noanim(), state: nostate(), responsive: r, flexLayout: flex };
}
function b(id: string, parent: string, label: string, bg: string, color: string,
  sz = 15, radius = 0, p = pad(14, 28), flex = fl('auto'), bdColor?: string, bdW = 0): CanvasElement {
  return { id, type: 'button', parent, layout: { x: 0, y: 0, width: 160, height: 48, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(bg), padding: p, border: bdr(radius, bdW, bdColor ?? bg), shadow: shad(), typography: typo(sz, '600', color, 'center', 1, 0.5) },
    content: { plain: label, label, rich: '' }, interaction: nolink(), animation: noanim(), state: nostate(), responsive: {}, flexLayout: flex };
}
function s(id: string, parent: string, h = 20): CanvasElement {
  return { id, type: 'spacer', parent, layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(), padding: pad(0), border: bdr(), shadow: shad(), typography: typo(16, 'normal', '#333') },
    content: {}, interaction: nolink(), animation: noanim(), state: nostate(), responsive: {}, flexLayout: fl('fill') };
}
function bx(id: string, parent: string, h: number, from: string, to: string, angle = 135, radius = 8,
  flex = fl('fill', 1, 'stretch')): CanvasElement {
  return { id, type: 'box', parent, layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elGrad(from, to, angle), padding: pad(0), border: bdr(radius), shadow: shad(true, 0, 12, 40, -8, 'rgba(0,0,0,0.15)'), typography: typo(16, 'normal', '#fff') },
    content: { plain: '', rich: '' }, interaction: nolink(), animation: noanim(), state: nostate(), responsive: {}, flexLayout: flex };
}
function dv(id: string, parent: string, color = '#e5e5e0'): CanvasElement {
  return { id, type: 'divider', parent, layout: { x: 0, y: 0, width: 400, height: 2, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(color), padding: pad(8, 0), border: bdr(), shadow: shad(), typography: typo(16, 'normal', '#333') },
    content: {}, interaction: nolink(), animation: noanim(), state: nostate(), responsive: {}, flexLayout: fl('fill') };
}
function cell(id: string, parent: string, span: number, children: string[],
  mode: GridCell['style']['layoutMode'] = 'column',
  align: GridCell['style']['alignItems'] = 'flex-start',
  justify: GridCell['style']['justifyContent'] = 'flex-start',
  gap_ = 0, p = pad(0), bg = 'transparent',
  res: GridCell['responsive'] = {}, border_ = bdr(0, 0, '#ccc', 'none'), minH?: number): GridCell {
  return { id, type: 'grid-cell', parent, columnSpan: span, rowSpan: 1,
    style: { layoutMode: mode, gap: gap_, padding: p,
      background: { type: 'solid', color: bg, image: '', position: 'center', from: '#ff4f1f', to: '#e03d0f', angle: 135, overlay: 0 },
      border: border_, minHeight: minH, alignItems: align, justifyContent: justify },
    children, responsive: res };
}
function sec(id: string, role: GridSection['role'], label: string, children: string[],
  bg: SectionBackground, gap_ = 24, rowGap = 0, p: Padding = pad(0)): GridSection {
  return { id, type: 'section', layoutMode: 'grid', role, label, layout: { height: 600 },
    style: { background: bg, columns: { count: 1, widths: [100], styles: {} }, padding: p },
    children, grid: { gap: gap_, rowGap } };
}

export function makeAgencyState(): BuilderState {
  const nodes: Record<string, AnyNode> = {};
  const add = <T extends AnyNode>(n: T): T => { nodes[n.id] = n; return n; };

  // ══ HEADER ══
  const HDR = 's2_hdr';
  add(t('e2_hlogo', 'c2_hl', 'STUDIO CRAFT', 14, '700', C.black, 'left', 28, 1, pad(0), fl('auto'), {}, 3, 'uppercase'));
  ['Work', 'Services', 'About', 'Contact'].forEach((link, i) => {
    add(t(`e2_hnav_${i}`, 'c2_hn', link, 14, 'normal', C.gray, 'center', 24, 1, pad(0), fl('auto')));
  });
  add(b('e2_hcta', 'c2_hc', 'Hire Us', C.black, C.white, 14, 0, pad(12, 24), fl('auto')));
  add(cell('c2_hl', HDR, 3, ['e2_hlogo'], 'row', 'center', 'flex-start', 0, pad(20, 40),
    'transparent', { mobile: { columnSpan: 12, justifyContent: 'center' } }));
  add(cell('c2_hn', HDR, 6, ['e2_hnav_0', 'e2_hnav_1', 'e2_hnav_2', 'e2_hnav_3'], 'row', 'center', 'center', 0, pad(20, 0),
    'transparent', { mobile: { columnSpan: 12, layoutMode: 'column', alignItems: 'center', justifyContent: 'flex-start' } }));
  add(cell('c2_hc', HDR, 3, ['e2_hcta'], 'row', 'center', 'flex-end', 0, pad(20, 40),
    'transparent', { mobile: { columnSpan: 12, justifyContent: 'center' } }));
  add(sec(HDR, 'header', 'Header', ['c2_hl', 'c2_hn', 'c2_hc'], secSolid(C.warm), 0, 0));

  // ══ HERO ══
  const HERO = 's2_hero';
  // Left: oversized headline
  add(t('e2_htag', 'c2_hleft', 'Creative Studio  ✦  Est. 2018', 12, '600', C.orange, 'left', 20, 1, pad(0), fl('fill'), {}, 1));
  add(s('e2_hsp1', 'c2_hleft', 32));
  add(t('e2_hh1', 'c2_hleft', 'We Design\nExperiences\nThat Stick.', 82, '800', C.black, 'left', 280, 1.0, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 56 } } }, mobile: { style: { typography: { size: 40 } } },
  }, -1));
  add(s('e2_hsp2', 'c2_hleft', 32));
  add(t('e2_hsub', 'c2_hleft',
    'Brand strategy, digital design, and web development for companies that refuse to be ordinary.',
    17, 'normal', C.gray, 'left', 56, 1.7, pad(0), fl('fill'), {
      tablet: { style: { typography: { size: 15 } } },
    }));
  add(s('e2_hsp3', 'c2_hleft', 40));
  add(t('e2_hwork', 'c2_hleft', 'View Selected Work ↓', 15, '600', C.black, 'left', 24, 1, pad(0), fl('auto')));
  add(cell('c2_hleft', HERO, 7,
    ['e2_htag', 'e2_hsp1', 'e2_hh1', 'e2_hsp2', 'e2_hsub', 'e2_hsp3', 'e2_hwork'],
    'column', 'flex-start', 'center', 0, pad(80, 60, 80, 60), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  // Right: tall decorative block
  add(bx('e2_himg', 'c2_hright', 520, C.black, C.darkAlt, 145, 4));
  add(cell('c2_hright', HERO, 5, ['e2_himg'],
    'column', 'stretch', 'center', 0, pad(80, 60, 80, 0), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  add(sec(HERO, 'section', 'Hero', ['c2_hleft', 'c2_hright'], secSolid(C.warm), 0, 0));

  // ══ WORK INTRO ROW ══
  const WINTR = 's2_workintro';
  add(t('e2_wih', 'c2_wihl', 'Selected Work', 42, '700', C.black, 'left', 52, 1.1, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 32 } } },
  }));
  add(cell('c2_wihl', WINTR, 8, ['e2_wih'], 'column', 'center', 'flex-start', 0, pad(0, 60)));
  add(t('e2_wicnt', 'c2_wihr', '06 projects →', 14, '600', C.gray, 'right', 22, 1, pad(0), fl('fill'), {}, 0.5));
  add(cell('c2_wihr', WINTR, 4, ['e2_wicnt'], 'row', 'center', 'flex-end', 0, pad(0, 60)));
  add(dv('e2_widv', 'c2_widv_cell', C.border));
  add(cell('c2_widv_cell', WINTR, 12, ['e2_widv'], 'column', 'flex-start', 'flex-start', 0, pad(0, 0)));
  add(sec(WINTR, 'section', 'Work Intro', ['c2_wihl', 'c2_wihr', 'c2_widv_cell'], secSolid(C.warm), 0, 0, pad(64, 0, 0, 0)));

  // ══ WORK GRID (2 large + 3 smaller) ══
  const WORK = 's2_work';
  // Large cards (span:6)
  const workLarge = [
    { id: 'c2_wl1', label: 'Meridian Finance', type: 'Brand Identity · Web Design', from: '#1a1a2e', to: '#16213e' },
    { id: 'c2_wl2', label: 'Oasis Skincare', type: 'E-commerce · Packaging', from: '#2d4a22', to: '#1a2e14' },
  ];
  workLarge.forEach(w => {
    add(bx(`e2_wlb_${w.id}`, w.id, 380, w.from, w.to, 145, 4));
    add(s(`e2_wlsp_${w.id}`, w.id, 20));
    add(t(`e2_wltl_${w.id}`, w.id, w.label, 22, '700', C.black, 'left', 30, 1));
    add(t(`e2_wltp_${w.id}`, w.id, w.type, 13, 'normal', C.gray, 'left', 20, 1, pad(0), fl('fill'), {}, 0.5));
    add(cell(w.id, WORK, 6, [`e2_wlb_${w.id}`, `e2_wlsp_${w.id}`, `e2_wltl_${w.id}`, `e2_wltp_${w.id}`],
      'column', 'flex-start', 'flex-start', 0, pad(0, 0, 32, 0), 'transparent',
      { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  });
  // Smaller cards (span:4)
  const workSmall = [
    { id: 'c2_ws1', label: 'Volta EV', type: 'Campaign · Motion', from: '#1c1c3a', to: '#2d2d5e' },
    { id: 'c2_ws2', label: 'Bloom Foods', type: 'Brand · Print', from: '#3a1c1c', to: '#5e2d2d' },
    { id: 'c2_ws3', label: 'Nomad Studio', type: 'Web · App', from: '#1c3a1c', to: '#2d5e2d' },
  ];
  workSmall.forEach(w => {
    add(bx(`e2_wsb_${w.id}`, w.id, 260, w.from, w.to, 145, 4));
    add(s(`e2_wssp_${w.id}`, w.id, 16));
    add(t(`e2_wstl_${w.id}`, w.id, w.label, 18, '700', C.black, 'left', 26, 1));
    add(t(`e2_wstp_${w.id}`, w.id, w.type, 13, 'normal', C.gray, 'left', 20, 1, pad(0), fl('fill'), {}, 0.5));
    add(cell(w.id, WORK, 4, [`e2_wsb_${w.id}`, `e2_wssp_${w.id}`, `e2_wstl_${w.id}`, `e2_wstp_${w.id}`],
      'column', 'flex-start', 'flex-start', 0, pad(0, 0, 24, 0), 'transparent',
      { tablet: { columnSpan: 6 }, mobile: { columnSpan: 12 } }));
  });
  add(sec(WORK, 'section', 'Work', [
    'c2_wl1', 'c2_wl2', 'c2_ws1', 'c2_ws2', 'c2_ws3',
  ], secSolid(C.warm), 24, 24, pad(32, 60, 80, 60)));

  // ══ SERVICES ══
  const SVC = 's2_svc';
  add(t('e2_svch', 'c2_svchdr', 'What we do', 42, '700', C.white, 'left', 52, 1.1, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 32 } } },
  }));
  add(s('e2_svchsp', 'c2_svchdr', 8));
  add(t('e2_svcsub', 'c2_svchdr', 'End-to-end creative and digital services for ambitious brands.', 16, 'normal', '#888884', 'left', 28, 1.6));
  add(cell('c2_svchdr', SVC, 12, ['e2_svch', 'e2_svchsp', 'e2_svcsub'],
    'column', 'flex-start', 'flex-start', 0, pad(0, 60, 56, 60)));

  const services = [
    { id: 'c2_sv1', num: '01', title: 'Brand Strategy', desc: 'Positioning, messaging, visual identity, and guidelines that set you apart in any market.' },
    { id: 'c2_sv2', num: '02', title: 'Web Design',     desc: 'Custom websites and landing pages that convert visitors into customers.' },
    { id: 'c2_sv3', num: '03', title: 'Development',    desc: 'React, Next.js, and headless CMS implementations built for speed and scale.' },
    { id: 'c2_sv4', num: '04', title: 'Motion & Video', desc: 'Animations, brand films, and social content that bring your story to life.' },
  ];
  services.forEach(sv => {
    add(t(`e2_snum_${sv.id}`, sv.id, sv.num, 11, '700', C.orange, 'left', 18, 1, pad(0), fl('fill'), {}, 2, 'uppercase'));
    add(s(`e2_snsp_${sv.id}`, sv.id, 20));
    add(dv(`e2_sdv_${sv.id}`, sv.id, '#2d2d2d'));
    add(s(`e2_sdsp_${sv.id}`, sv.id, 20));
    add(t(`e2_stl_${sv.id}`, sv.id, sv.title, 22, '700', C.white, 'left', 30, 1.1));
    add(s(`e2_stsp_${sv.id}`, sv.id, 12));
    add(t(`e2_sdsc_${sv.id}`, sv.id, sv.desc, 15, 'normal', '#888884', 'left', 68, 1.7));
    add(cell(sv.id, SVC, 3,
      [`e2_snum_${sv.id}`, `e2_snsp_${sv.id}`, `e2_sdv_${sv.id}`, `e2_sdsp_${sv.id}`, `e2_stl_${sv.id}`, `e2_stsp_${sv.id}`, `e2_sdsc_${sv.id}`],
      'column', 'flex-start', 'flex-start', 0, pad(0, 40, 0, 40), 'transparent',
      { tablet: { columnSpan: 6 }, mobile: { columnSpan: 12 } }));
  });
  add(sec(SVC, 'section', 'Services',
    ['c2_svchdr', 'c2_sv1', 'c2_sv2', 'c2_sv3', 'c2_sv4'],
    secSolid(C.dark), 0, 0, pad(80, 0)));

  // ══ ABOUT / PROCESS ══
  const ABOUT = 's2_about';
  add(bx('e2_abimg', 'c2_abl', 440, '#111', '#333', 135, 8));
  add(cell('c2_abl', ABOUT, 5, ['e2_abimg'], 'column', 'stretch', 'center', 0, pad(0, 60, 0, 60), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));

  add(t('e2_abeye', 'c2_abr', 'About the studio', 11, '700', C.orange, 'left', 18, 1, pad(0), fl('fill'), {}, 2, 'uppercase'));
  add(s('e2_absp1', 'c2_abr', 16));
  add(t('e2_abh2', 'c2_abr', 'Small team,\nbig ideas.', 44, '700', C.black, 'left', 116, 1.1, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 34 } } }, mobile: { style: { typography: { size: 28 } } },
  }));
  add(s('e2_absp2', 'c2_abr', 20));
  add(t('e2_abbody', 'c2_abr',
    'Studio Craft was founded in 2018 by two designers tired of agencies that over-promised and under-delivered. We\'re a team of 8 creatives — brand strategists, designers, and engineers — who move fast without compromising quality.',
    16, 'normal', C.gray, 'left', 104, 1.8));
  add(s('e2_absp3', 'c2_abr', 12));
  add(t('e2_abstats', 'c2_abr', '120+ projects delivered  ·  98% client retention  ·  6 countries', 14, '600', C.black, 'left', 22, 1));
  add(s('e2_absp4', 'c2_abr', 36));
  add(b('e2_abbtn', 'c2_abr', 'Meet the team →', C.black, C.white, 15, 0, pad(14, 28)));
  add(cell('c2_abr', ABOUT, 7,
    ['e2_abeye', 'e2_absp1', 'e2_abh2', 'e2_absp2', 'e2_abbody', 'e2_absp3', 'e2_abstats', 'e2_absp4', 'e2_abbtn'],
    'column', 'flex-start', 'center', 0, pad(0, 60, 0, 40), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  add(sec(ABOUT, 'section', 'About', ['c2_abl', 'c2_abr'], secSolid(C.offW), 0, 0, pad(80, 0)));

  // ══ CTA ══
  const CTA = 's2_cta';
  add(t('e2_ctah', 'c2_cta', 'Have a project in mind?', 48, '700', C.white, 'center', 64, 1.1, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 36 } } }, mobile: { style: { typography: { size: 28 } } },
  }, -0.5));
  add(s('e2_ctasp1', 'c2_cta', 16));
  add(t('e2_ctasub', 'c2_cta', 'Let\'s talk about your vision. No pitch decks, no sales calls — just an honest conversation.', 18, 'normal', 'rgba(255,255,255,0.7)', 'center', 28, 1.6));
  add(s('e2_ctasp2', 'c2_cta', 40));
  add(b('e2_ctabtn', 'c2_cta', 'Start a Project →', C.white, C.orange, 16, 0, pad(16, 36), fl('auto')));
  add(cell('c2_cta', CTA, 12,
    ['e2_ctah', 'e2_ctasp1', 'e2_ctasub', 'e2_ctasp2', 'e2_ctabtn'],
    'column', 'center', 'flex-start', 0, pad(96, 40)));
  add(sec(CTA, 'section', 'CTA', ['c2_cta'], secSolid(C.orange), 0, 0));

  // ══ FOOTER ══
  const FOOT = 's2_foot';
  add(t('e2_flogo', 'c2_fl', 'STUDIO CRAFT', 14, '700', C.white, 'left', 24, 1, pad(0), fl('auto'), {}, 3, 'uppercase'));
  add(s('e2_fsp1', 'c2_fl', 16));
  add(t('e2_fdesc', 'c2_fl', 'Creative studio for brands that want to be remembered.', 14, 'normal', '#6b7280', 'left', 40, 1.7));
  add(s('e2_fsp2', 'c2_fl', 24));
  add(t('e2_fcopy', 'c2_fl', '© 2025 Studio Craft. All rights reserved.', 12, 'normal', '#4b5563', 'left', 20));
  add(cell('c2_fl', FOOT, 6, ['e2_flogo', 'e2_fsp1', 'e2_fdesc', 'e2_fsp2', 'e2_fcopy'],
    'column', 'flex-start', 'flex-start', 0, pad(48, 40, 48, 40), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  add(t('e2_fnav', 'c2_fr', 'Work  ·  Services  ·  About  ·  Contact  ·  Instagram', 14, 'normal', '#6b7280', 'right', 24, 1, pad(0), fl('fill')));
  add(cell('c2_fr', FOOT, 6, ['e2_fnav'], 'row', 'center', 'flex-end', 0, pad(48, 40), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  add(sec(FOOT, 'footer', 'Footer', ['c2_fl', 'c2_fr'], secSolid(C.dark), 0, 0));

  const pageId = 'page_agency';
  return {
    schema: '2.0',
    site: { name: 'Studio Craft', favicon: '', language: 'en' },
    theme: {
      colors: { primary: C.orange, secondary: C.black, text: C.black, background: C.warm, light: C.offW, accent: C.orange, sectionBg: '#f8f9fa' },
      fonts: { body: 'Inter, sans-serif' },
    },
    pages: [{ id: pageId, name: 'Studio Craft – Agency', slug: '/',
      seo: { title: 'Studio Craft — Creative Experiences For Ambitious Brands', description: 'Brand strategy, digital design, and web development.', ogImage: '' },
      sections: [HDR, HERO, WINTR, WORK, SVC, ABOUT, CTA, FOOT],
    }],
    activePageId: pageId,
    nodes: nodes as BuilderState['nodes'],
  };
}
