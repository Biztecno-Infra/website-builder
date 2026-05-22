/**
 * Demo page 1 — Flowdesk SaaS Landing
 * Purple/violet theme. Tests: container grid (features panel), responsive breakpoints,
 * dark/light alternating sections, stat bar, pricing cards, testimonials.
 */
import type {
  BuilderState, CanvasElement, Container, GridCell, GridSection,
  ElementBackground, SectionBackground, Padding, Border, Shadow,
  FlexItemLayout, ElementResponsive, TextTransform, AnyNode,
} from '../types';

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  bgDark:   '#0d0820',
  bgMid:    '#150f3a',
  purple:   '#7c3aed',
  purpleLt: '#a78bfa',
  bgLight:  '#f5f3ff',
  bgCard:   '#fefefe',
  white:    '#ffffff',
  textDark: '#1e1b4b',
  textMid:  '#4b5563',
  muted:    '#6b7280',
  border:   '#e5e7eb',
  bdDark:   '#2d2657',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const fl = (m: FlexItemLayout['widthMode'], grow = 0, self: FlexItemLayout['alignSelf'] = 'auto'): FlexItemLayout =>
  ({ widthMode: m, widthValue: 0, flexGrow: grow, alignSelf: self });
const pad = (t: number, r = t, b = t, l = r): Padding => ({ top: t, right: r, bottom: b, left: l });
const elBg = (color = 'transparent'): ElementBackground =>
  ({ type: 'solid', color, image: '', position: 'center', from: '#7c3aed', to: '#6d28d9', angle: 135 });
const elGrad = (from: string, to: string, angle = 135): ElementBackground =>
  ({ type: 'linear-gradient', color: 'transparent', image: '', position: 'center', from, to, angle });
const secSolid = (color: string): SectionBackground =>
  ({ type: 'solid', color, image: '', position: 'center', from: '#7c3aed', to: '#6d28d9', angle: 135, overlay: 0 });
const secGrad = (from: string, to: string, angle = 135): SectionBackground =>
  ({ type: 'linear-gradient', color: 'transparent', image: '', position: 'center', from, to, angle, overlay: 0 });
const bdr = (radius = 0, width = 0, color = '#cccccc', style: Border['style'] = 'solid'): Border =>
  ({ radius, width, color, style });
const shad = (on = false, x = 0, y = 8, blur = 24, spread = -4, color = 'rgba(124,58,237,0.12)'): Shadow =>
  ({ enabled: on, x, y, blur, spread, color });
const noanim = () => ({ type: 'none' as const, trigger: 'load' as const, duration: 600, delay: 0 });
const nostate = () => ({ hidden: false, locked: false });
const nolink = () => ({ type: 'link' as const, linkUrl: '', linkTarget: '_self' as const, smoothScroll: false });
type A3 = 'left' | 'center' | 'right';
const typo = (sz: number, w: string, color: string, align: A3 = 'left', lh = 1.5, ls = 0, tt: TextTransform = 'none') =>
  ({ family: 'Inter, sans-serif', size: sz, weight: w, color, align, lineHeight: lh, letterSpacing: ls, textTransform: tt });

function t(id: string, parent: string, text: string, sz: number, w: string, color: string,
  align: A3 = 'left', h = 48, lh = 1.5, p = pad(0), flex = fl('fill'),
  r: ElementResponsive = {}, ls = 0, tt: TextTransform = 'none'): CanvasElement {
  return { id, type: 'text', parent, layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(), padding: p, border: bdr(), shadow: shad(), typography: typo(sz, w, color, align, lh, ls, tt) },
    content: { plain: text, rich: '' }, interaction: nolink(), animation: noanim(), state: nostate(), responsive: r, flexLayout: flex };
}
function b(id: string, parent: string, label: string, bg: string, color: string,
  sz = 15, radius = 8, p = pad(12, 28), flex = fl('auto'),
  bdColor?: string, bdW = 0, ls = 0.3): CanvasElement {
  return { id, type: 'button', parent, layout: { x: 0, y: 0, width: 160, height: 44, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(bg), padding: p, border: bdr(radius, bdW, bdColor ?? bg), shadow: shad(), typography: typo(sz, '600', color, 'center', 1, ls) },
    content: { plain: label, label, rich: '' }, interaction: nolink(), animation: noanim(), state: nostate(), responsive: {}, flexLayout: flex };
}
function s(id: string, parent: string, h = 20): CanvasElement {
  return { id, type: 'spacer', parent, layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(), padding: pad(0), border: bdr(), shadow: shad(), typography: typo(16, 'normal', '#333') },
    content: {}, interaction: nolink(), animation: noanim(), state: nostate(), responsive: {}, flexLayout: fl('fill') };
}
function bx(id: string, parent: string, h: number, from: string, to: string, angle = 135, radius = 16,
  flex = fl('fill', 1, 'stretch')): CanvasElement {
  return { id, type: 'box', parent, layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elGrad(from, to, angle), padding: pad(32), border: bdr(radius), shadow: shad(true, 0, 16, 48, -8, 'rgba(124,58,237,0.25)'), typography: typo(16, 'normal', '#fff') },
    content: { plain: '', rich: '' }, interaction: nolink(), animation: noanim(), state: nostate(), responsive: {}, flexLayout: flex };
}
function ic(id: string, parent: string, iconName: string, sz = 32, color = '#7c3aed'): CanvasElement {
  return { id, type: 'icon', parent, layout: { x: 0, y: 0, width: 60, height: sz + 8, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(), padding: pad(0), border: bdr(), shadow: shad(),
      typography: { family: 'Inter, sans-serif', size: sz, weight: 'normal', color, align: 'left', lineHeight: 1, letterSpacing: 0, textTransform: 'none' } },
    content: { iconName, iconSize: sz }, interaction: nolink(), animation: noanim(), state: nostate(), responsive: {}, flexLayout: fl('auto') };
}
function dv(id: string, parent: string, color = '#e5e7eb'): CanvasElement {
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
      background: { type: 'solid', color: bg, image: '', position: 'center', from: '#7c3aed', to: '#6d28d9', angle: 135, overlay: 0 },
      border: border_, minHeight: minH, alignItems: align, justifyContent: justify },
    children, responsive: res };
}
function cont(id: string, parent: string, mode: Container['layoutMode'], gap_: number, rowGap: number, children: string[]): Container {
  return { id, type: 'container', parent, layoutMode: mode, gap: gap_, rowGap, children };
}
function sec(id: string, role: GridSection['role'], label: string, children: string[],
  bg: SectionBackground, gap_ = 24, rowGap = 0, p: Padding = pad(0)): GridSection {
  return { id, type: 'section', layoutMode: 'grid', role, label, layout: { height: 600 },
    style: { background: bg, columns: { count: 1, widths: [100], styles: {} }, padding: p },
    children, grid: { gap: gap_, rowGap } };
}

// ─── Page builder ────────────────────────────────────────────────────────────
export function makeSaasLandingState(): BuilderState {
  const nodes: Record<string, AnyNode> = {};
  const add = <T extends AnyNode>(n: T): T => { nodes[n.id] = n; return n; };

  // ══ HEADER ══
  const HDR = 's1_hdr';
  add(t('e1_hlogo', 'c1_hdr_l', 'Flowdesk', 22, '700', C.purple, 'left', 32, 1, pad(0), fl('auto')));
  add(t('e1_hnav', 'c1_hdr_n', 'Product  ·  Pricing  ·  Docs  ·  Enterprise', 14, 'normal', C.muted, 'left', 24, 1, pad(0), fl('auto')));
  add(b('e1_hsigin', 'c1_hdr_n', 'Sign in', 'transparent', C.textMid, 14, 6, pad(8, 16), fl('auto'), C.border, 1));
  add(b('e1_hstart', 'c1_hdr_n', 'Start free →', C.purple, C.white, 14, 6, pad(8, 18), fl('auto')));
  add(cell('c1_hdr_l', HDR, 3, ['e1_hlogo'], 'row', 'center', 'flex-start', 0, pad(18, 32)));
  add(cell('c1_hdr_n', HDR, 9, ['e1_hnav', 'e1_hsigin', 'e1_hstart'], 'row', 'center', 'flex-end', 20, pad(18, 32),
    'transparent', { tablet: { columnSpan: 9 }, mobile: { columnSpan: 9 } }));
  add(sec(HDR, 'header', 'Header', ['c1_hdr_l', 'c1_hdr_n'], secSolid(C.white), 0, 0));

  // ══ HERO ══
  const HERO = 's1_hero';
  add(t('e1_heye', 'c1_hmain', '✦  Trusted by 10,000+ teams worldwide  ✦', 11, '600', C.purpleLt, 'center', 20, 1, pad(0), fl('fill'), {}, 1.5, 'uppercase'));
  add(s('e1_hsp1', 'c1_hmain', 20));
  add(t('e1_hh1', 'c1_hmain', 'Work Smarter,\nNot Harder', 68, '800', C.white, 'center', 156, 1.1, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 48 } } }, mobile: { style: { typography: { size: 36 } } },
  }));
  add(s('e1_hsp2', 'c1_hmain', 28));
  add(t('e1_hsub', 'c1_hmain',
    'Flowdesk brings tasks, docs, and team chat into one beautiful workspace. Ship faster and stay aligned.',
    20, 'normal', C.purpleLt, 'center', 68, 1.7, pad(0), fl('fill'), {
      tablet: { style: { typography: { size: 17 } } }, mobile: { style: { typography: { size: 16 } } },
    }));
  add(s('e1_hsp3', 'c1_hmain', 44));
  add(b('e1_hbtn', 'c1_hmain', 'Get Started Free →', C.purple, C.white, 17, 10, pad(18, 40), fl('auto'), undefined, 0, 0.5));
  add(s('e1_hsp4', 'c1_hmain', 14));
  add(t('e1_hnote', 'c1_hmain', 'Free 14-day trial  ·  No credit card  ·  Cancel anytime', 13, 'normal', '#4b5563', 'center', 20, 1));
  add(cell('c1_hmain', HERO, 12,
    ['e1_heye', 'e1_hsp1', 'e1_hh1', 'e1_hsp2', 'e1_hsub', 'e1_hsp3', 'e1_hbtn', 'e1_hsp4', 'e1_hnote'],
    'column', 'center', 'flex-start', 0, pad(120, 40, 100, 40)));
  add(sec(HERO, 'section', 'Hero', ['c1_hmain'], secGrad(C.bgDark, C.bgMid, 160), 0, 0));

  // ══ METRICS ══
  const MET = 's1_metrics';
  const metData = [
    { n: '10K+', l: 'Teams worldwide' },
    { n: '98%',  l: 'Customer satisfaction' },
    { n: '4.9★', l: 'Average rating' },
    { n: '<2s',  l: 'Average load time' },
  ];
  const metCells: string[] = [];
  metData.forEach((m, i) => {
    const cid = `c1_m${i}`;
    metCells.push(cid);
    add(t(`e1_mnum${i}`, cid, m.n, 44, '700', C.white, 'center', 56, 1.1, pad(0), fl('fill'), {
      tablet: { style: { typography: { size: 34 } } }, mobile: { style: { typography: { size: 28 } } },
    }, -1.5));
    add(s(`e1_msp${i}`, cid, 8));
    add(t(`e1_mlbl${i}`, cid, m.l, 11, '600', C.purpleLt, 'center', 20, 1, pad(0), fl('fill'), {}, 2, 'uppercase'));
    add(cell(cid, MET, 3, [`e1_mnum${i}`, `e1_msp${i}`, `e1_mlbl${i}`],
      'column', 'center', 'flex-start', 0, pad(0, 24), 'transparent',
      { tablet: { columnSpan: 6, minHeight: 100 }, mobile: { columnSpan: 6, minHeight: 80 } }));
  });
  add(sec(MET, 'section', 'Metrics', metCells, secSolid(C.bgMid), 0, 0, pad(56, 0)));

  // ══ FEATURES (left text + right 2×2 grid container) ══
  const FEAT = 's1_feat';
  // Left panel
  add(t('e1_feye', 'c1_fl', 'Why teams choose Flowdesk', 11, '700', C.purple, 'left', 18, 1, pad(0), fl('fill'), {}, 2.5, 'uppercase'));
  add(s('e1_fsp1', 'c1_fl', 16));
  add(t('e1_fh2', 'c1_fl', 'Everything your team\nneeds, in one place', 38, '700', C.textDark, 'left', 100, 1.2, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 30 } } }, mobile: { style: { typography: { size: 26 } } },
  }));
  add(s('e1_fsp2', 'c1_fl', 20));
  add(t('e1_fbody', 'c1_fl',
    'Stop juggling a dozen apps. Flowdesk consolidates project management, docs, and team chat so your team stays focused on what matters.',
    16, 'normal', C.textMid, 'left', 84, 1.75));
  add(s('e1_fsp3', 'c1_fl', 20));
  add(t('e1_fchk', 'c1_fl',
    '✓  Real-time collaboration\n✓  Automated workflows\n✓  Advanced analytics\n✓  Enterprise-grade security',
    15, 'normal', C.textMid, 'left', 104, 2.2));
  add(s('e1_fsp4', 'c1_fl', 36));
  add(b('e1_fbtn', 'c1_fl', 'Explore Features →', C.bgDark, C.white, 15, 8, pad(14, 28)));
  add(cell('c1_fl', FEAT, 5,
    ['e1_feye', 'e1_fsp1', 'e1_fh2', 'e1_fsp2', 'e1_fbody', 'e1_fsp3', 'e1_fchk', 'e1_fsp4', 'e1_fbtn'],
    'column', 'flex-start', 'center', 0, pad(0, 60, 0, 60), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));

  // Right panel: 2×2 grid of feature cards inside a Container
  const fcards = [
    { em: '⚡', title: 'Instant Sync',        desc: 'Changes sync across your team in real time. No more working from the wrong version.' },
    { em: '🤖', title: 'Smart Automation',    desc: 'Set up automations in seconds. Let Flowdesk handle repetitive tasks automatically.' },
    { em: '📊', title: 'Live Dashboards',     desc: 'See every project\'s health at a glance with team-wide customisable dashboards.' },
    { em: '🔒', title: 'Bank-Level Security', desc: 'SOC 2 Type II certified. End-to-end encryption. Granular permissions. Always.' },
  ];
  const subCells = ['c1_fr1', 'c1_fr2', 'c1_fr3', 'c1_fr4'];
  fcards.forEach((fc, i) => {
    const cid = subCells[i];
    add(ic(`e1_fic${i}`, cid, fc.em, 28, C.purple));
    add(s(`e1_fisp1${i}`, cid, 14));
    add(t(`e1_fitl${i}`, cid, fc.title, 16, '700', C.textDark, 'left', 24, 1));
    add(s(`e1_fisp2${i}`, cid, 8));
    add(t(`e1_fidsc${i}`, cid, fc.desc, 14, 'normal', C.muted, 'left', 72, 1.7));
    add(cell(cid, 'cb_fr_grid', 6, [`e1_fic${i}`, `e1_fisp1${i}`, `e1_fitl${i}`, `e1_fisp2${i}`, `e1_fidsc${i}`],
      'column', 'flex-start', 'flex-start', 0, pad(28, 24), C.bgCard,
      { tablet: { columnSpan: 6 }, mobile: { columnSpan: 12 } },
      bdr(16, 1, C.border), 180));
  });
  add(cont('cb_fr_grid', 'c1_fr', 'grid', 20, 20, subCells));
  add(cell('c1_fr', FEAT, 7, ['cb_fr_grid'], 'column', 'flex-start', 'flex-start', 0, pad(0, 48, 0, 0),
    'transparent', { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }, bdr(0, 0)));
  add(sec(FEAT, 'section', 'Features', ['c1_fl', 'c1_fr'], secSolid('#f8f7ff'), 48, 0, pad(96, 0)));

  // ══ PRICING ══
  const PRC = 's1_pricing';
  // Section header
  add(t('e1_peye', 'c1_phdr', 'Simple, transparent pricing', 11, '700', C.purple, 'center', 18, 1, pad(0), fl('fill'), {}, 2.5, 'uppercase'));
  add(s('e1_psp1', 'c1_phdr', 12));
  add(t('e1_ph2', 'c1_phdr', 'Choose the plan that fits your team', 38, '700', C.textDark, 'center', 52, 1.2, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 30 } } }, mobile: { style: { typography: { size: 26 } } },
  }));
  add(s('e1_psp2', 'c1_phdr', 10));
  add(t('e1_psub', 'c1_phdr', 'All plans include a 14-day free trial. No credit card required.', 16, 'normal', C.muted, 'center', 28, 1.6));
  add(cell('c1_phdr', PRC, 12, ['e1_peye', 'e1_psp1', 'e1_ph2', 'e1_psp2', 'e1_psub'],
    'column', 'center', 'flex-start', 0, pad(0, 40, 48, 40)));

  // Plan 1: Starter (free)
  add(t('e1_p1plan', 'c1_p1', 'Starter', 13, '700', C.muted, 'left', 20, 1, pad(0), fl('fill'), {}, 1.5, 'uppercase'));
  add(s('e1_p1sp1', 'c1_p1', 8));
  add(t('e1_p1price', 'c1_p1', '$0', 48, '800', C.textDark, 'left', 60, 1, pad(0), fl('fill')));
  add(t('e1_p1period', 'c1_p1', 'per month, up to 5 users', 14, 'normal', C.muted, 'left', 22, 1));
  add(s('e1_p1sp2', 'c1_p1', 20));
  add(dv('e1_p1dv', 'c1_p1', C.border));
  add(s('e1_p1sp3', 'c1_p1', 20));
  add(t('e1_p1feat', 'c1_p1',
    '✓  5 projects\n✓  Basic analytics\n✓  2 GB storage\n✓  Community support',
    15, 'normal', C.textMid, 'left', 100, 2.2));
  add(s('e1_p1sp4', 'c1_p1', 28));
  add(b('e1_p1btn', 'c1_p1', 'Get started free', 'transparent', C.purple, 15, 8, pad(12, 24), fl('fill'), C.purple, 2));
  add(cell('c1_p1', PRC, 4,
    ['e1_p1plan', 'e1_p1sp1', 'e1_p1price', 'e1_p1period', 'e1_p1sp2', 'e1_p1dv', 'e1_p1sp3', 'e1_p1feat', 'e1_p1sp4', 'e1_p1btn'],
    'column', 'flex-start', 'flex-start', 0, pad(36, 32), C.white,
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }, bdr(20, 1, C.border)));

  // Plan 2: Pro (highlighted, purple bg)
  add(t('e1_p2badge', 'c1_p2', '★  MOST POPULAR', 10, '700', '#ddd6fe', 'left', 18, 1, pad(0), fl('fill'), {}, 2, 'uppercase'));
  add(s('e1_p2sp0', 'c1_p2', 8));
  add(t('e1_p2plan', 'c1_p2', 'Pro', 13, '700', '#c4b5fd', 'left', 20, 1, pad(0), fl('fill'), {}, 1.5, 'uppercase'));
  add(s('e1_p2sp1', 'c1_p2', 8));
  add(t('e1_p2price', 'c1_p2', '$29', 48, '800', C.white, 'left', 60, 1, pad(0), fl('fill')));
  add(t('e1_p2period', 'c1_p2', 'per month, unlimited users', 14, 'normal', '#c4b5fd', 'left', 22, 1));
  add(s('e1_p2sp2', 'c1_p2', 20));
  add(dv('e1_p2dv', 'c1_p2', 'rgba(255,255,255,0.2)'));
  add(s('e1_p2sp3', 'c1_p2', 20));
  add(t('e1_p2feat', 'c1_p2',
    '✓  Unlimited projects\n✓  Advanced analytics\n✓  50 GB storage\n✓  Priority support\n✓  Custom workflows',
    15, 'normal', '#e0d9ff', 'left', 120, 2.2));
  add(s('e1_p2sp4', 'c1_p2', 28));
  add(b('e1_p2btn', 'c1_p2', 'Start Pro trial →', C.white, C.purple, 15, 8, pad(12, 24), fl('fill')));
  add(cell('c1_p2', PRC, 4,
    ['e1_p2badge', 'e1_p2sp0', 'e1_p2plan', 'e1_p2sp1', 'e1_p2price', 'e1_p2period', 'e1_p2sp2', 'e1_p2dv', 'e1_p2sp3', 'e1_p2feat', 'e1_p2sp4', 'e1_p2btn'],
    'column', 'flex-start', 'flex-start', 0, pad(36, 32), C.purple,
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }, bdr(20, 0, 'transparent')));

  // Plan 3: Enterprise
  add(t('e1_p3plan', 'c1_p3', 'Enterprise', 13, '700', C.muted, 'left', 20, 1, pad(0), fl('fill'), {}, 1.5, 'uppercase'));
  add(s('e1_p3sp1', 'c1_p3', 8));
  add(t('e1_p3price', 'c1_p3', 'Custom', 48, '800', C.textDark, 'left', 60, 1, pad(0), fl('fill')));
  add(t('e1_p3period', 'c1_p3', 'tailored to your organisation', 14, 'normal', C.muted, 'left', 22, 1));
  add(s('e1_p3sp2', 'c1_p3', 20));
  add(dv('e1_p3dv', 'c1_p3', C.border));
  add(s('e1_p3sp3', 'c1_p3', 20));
  add(t('e1_p3feat', 'c1_p3',
    '✓  Unlimited everything\n✓  SSO / SAML\n✓  SLA guarantee\n✓  Dedicated success manager\n✓  Custom integrations',
    15, 'normal', C.textMid, 'left', 120, 2.2));
  add(s('e1_p3sp4', 'c1_p3', 28));
  add(b('e1_p3btn', 'c1_p3', 'Talk to sales →', C.bgDark, C.white, 15, 8, pad(12, 24), fl('fill')));
  add(cell('c1_p3', PRC, 4,
    ['e1_p3plan', 'e1_p3sp1', 'e1_p3price', 'e1_p3period', 'e1_p3sp2', 'e1_p3dv', 'e1_p3sp3', 'e1_p3feat', 'e1_p3sp4', 'e1_p3btn'],
    'column', 'flex-start', 'flex-start', 0, pad(36, 32), C.white,
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }, bdr(20, 1, C.border)));
  add(sec(PRC, 'section', 'Pricing', ['c1_phdr', 'c1_p1', 'c1_p2', 'c1_p3'], secSolid(C.bgLight), 24, 24, pad(96, 0)));

  // ══ TESTIMONIALS ══
  const TEST = 's1_test';
  add(t('e1_th2', 'c1_thdr', 'Loved by 10,000+ teams', 36, '700', C.white, 'center', 48, 1.2, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 28 } } }, mobile: { style: { typography: { size: 24 } } },
  }));
  add(s('e1_tsp0', 'c1_thdr', 10));
  add(t('e1_tsub', 'c1_thdr', 'Here\'s what our customers say', 16, 'normal', C.purpleLt, 'center', 26, 1.5));
  add(cell('c1_thdr', TEST, 12, ['e1_th2', 'e1_tsp0', 'e1_tsub'], 'column', 'center', 'flex-start', 0, pad(0, 40, 48, 40)));

  const testimonials = [
    { q: '"Flowdesk cut our weekly status meeting time in half. Everyone always knows what\'s happening without needing to ask."',
      name: 'Sarah Chen', role: 'Head of Engineering, Vercel' },
    { q: '"We tried five project tools before Flowdesk. Nothing else comes close to the balance of power and simplicity."',
      name: 'Marcus Reid', role: 'Founder, StudioMReid' },
  ];
  const tCells = ['c1_t1', 'c1_t2'];
  testimonials.forEach((tm, i) => {
    const cid = tCells[i];
    add(t(`e1_tq${i}`, cid, '❝', 48, '700', C.purple, 'left', 56, 1));
    add(s(`e1_tqsp${i}`, cid, 8));
    add(t(`e1_tqtxt${i}`, cid, tm.q, 17, 'normal', C.textDark, 'left', 108, 1.75));
    add(s(`e1_tnsp${i}`, cid, 24));
    add(dv(`e1_tdv${i}`, cid, C.border));
    add(s(`e1_tnsp2${i}`, cid, 20));
    add(t(`e1_tname${i}`, cid, tm.name, 15, '700', C.textDark, 'left', 22, 1));
    add(t(`e1_trole${i}`, cid, tm.role, 14, 'normal', C.muted, 'left', 22, 1));
    add(cell(cid, TEST, 6,
      [`e1_tq${i}`, `e1_tqsp${i}`, `e1_tqtxt${i}`, `e1_tnsp${i}`, `e1_tdv${i}`, `e1_tnsp2${i}`, `e1_tname${i}`, `e1_trole${i}`],
      'column', 'flex-start', 'flex-start', 0, pad(40, 36), C.white,
      { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }, bdr(20, 1, C.bdDark)));
  });
  add(sec(TEST, 'section', 'Testimonials', ['c1_thdr', ...tCells], secSolid(C.bgDark), 24, 0, pad(80, 0)));

  // ══ CTA ══
  const CTA = 's1_cta';
  add(t('e1_ctah2', 'c1_cta', 'Ready to transform how your team works?', 42, '700', C.white, 'center', 56, 1.2, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 32 } } }, mobile: { style: { typography: { size: 26 } } },
  }));
  add(s('e1_ctasp1', 'c1_cta', 16));
  add(t('e1_ctasub', 'c1_cta', 'Join 10,000+ teams already using Flowdesk. Start free, upgrade anytime.', 18, 'normal', 'rgba(255,255,255,0.75)', 'center', 28, 1.6));
  add(s('e1_ctasp2', 'c1_cta', 40));
  add(b('e1_ctabtn', 'c1_cta', 'Start Building Free  →', C.white, C.purple, 16, 8, pad(16, 36), fl('auto'), undefined, 0, 1));
  add(cell('c1_cta', CTA, 12,
    ['e1_ctah2', 'e1_ctasp1', 'e1_ctasub', 'e1_ctasp2', 'e1_ctabtn'],
    'column', 'center', 'flex-start', 0, pad(96, 40)));
  add(sec(CTA, 'section', 'CTA', ['c1_cta'], secGrad(C.purple, '#4c1d95', 135), 0, 0));

  // ══ FOOTER ══
  const FOOT = 's1_foot';
  add(t('e1_flogo', 'c1_fb', 'Flowdesk', 22, '700', C.white, 'left', 32, 1, pad(0), fl('auto')));
  add(s('e1_fbsp1', 'c1_fb', 12));
  add(t('e1_fbdesc', 'c1_fb',
    'The all-in-one workspace for modern teams. Build, ship, and grow together.',
    14, 'normal', '#6b7280', 'left', 52, 1.75));
  add(s('e1_fbsp2', 'c1_fb', 24));
  add(t('e1_fbcopy', 'c1_fb', '© 2025 Flowdesk Inc.', 12, 'normal', '#4b5563', 'left', 20));
  add(cell('c1_fb', FOOT, 4, ['e1_flogo', 'e1_fbsp1', 'e1_fbdesc', 'e1_fbsp2', 'e1_fbcopy'],
    'column', 'flex-start', 'flex-start', 0, pad(48, 40, 48, 32), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));

  add(t('e1_fp1ttl', 'c1_fp1', 'Product', 11, '700', '#e2e8f0', 'left', 20, 1, pad(0), fl('fill'), {}, 2, 'uppercase'));
  add(dv('e1_fp1dv', 'c1_fp1', C.bdDark));
  add(t('e1_fp1lnk', 'c1_fp1', 'Features\nPricing\nChangelog\nRoadmap', 14, 'normal', '#6b7280', 'left', 96, 2.4));
  add(cell('c1_fp1', FOOT, 2, ['e1_fp1ttl', 'e1_fp1dv', 'e1_fp1lnk'],
    'column', 'flex-start', 'flex-start', 0, pad(48, 24), 'transparent',
    { tablet: { columnSpan: 4 }, mobile: { columnSpan: 6 } }));

  add(t('e1_fp2ttl', 'c1_fp2', 'Company', 11, '700', '#e2e8f0', 'left', 20, 1, pad(0), fl('fill'), {}, 2, 'uppercase'));
  add(dv('e1_fp2dv', 'c1_fp2', C.bdDark));
  add(t('e1_fp2lnk', 'c1_fp2', 'About\nBlog\nCareers\nPress', 14, 'normal', '#6b7280', 'left', 96, 2.4));
  add(cell('c1_fp2', FOOT, 2, ['e1_fp2ttl', 'e1_fp2dv', 'e1_fp2lnk'],
    'column', 'flex-start', 'flex-start', 0, pad(48, 24), 'transparent',
    { tablet: { columnSpan: 4 }, mobile: { columnSpan: 6 } }));

  add(t('e1_fp3ttl', 'c1_fp3', 'Contact', 11, '700', '#e2e8f0', 'left', 20, 1, pad(0), fl('fill'), {}, 2, 'uppercase'));
  add(dv('e1_fp3dv', 'c1_fp3', C.bdDark));
  add(t('e1_fp3email', 'c1_fp3', 'hello@flowdesk.io', 14, 'normal', '#6b7280', 'left', 24, 1.5));
  add(s('e1_fp3sp', 'c1_fp3', 6));
  add(t('e1_fp3social', 'c1_fp3', 'Twitter  ·  LinkedIn  ·  GitHub', 14, 'normal', '#6b7280', 'left', 24, 1.5));
  add(cell('c1_fp3', FOOT, 4, ['e1_fp3ttl', 'e1_fp3dv', 'e1_fp3email', 'e1_fp3sp', 'e1_fp3social'],
    'column', 'flex-start', 'flex-start', 0, pad(48, 32, 48, 24), 'transparent',
    { tablet: { columnSpan: 4 }, mobile: { columnSpan: 12 } }));

  add(sec(FOOT, 'footer', 'Footer', ['c1_fb', 'c1_fp1', 'c1_fp2', 'c1_fp3'], secSolid(C.bgDark), 0, 0));

  // ══ PAGE ══
  const pageId = 'page_saas';
  return {
    schema: '2.0',
    site: { name: 'Flowdesk', favicon: '', language: 'en' },
    theme: {
      colors: { primary: C.purple, secondary: C.purpleLt, text: C.textDark, background: C.white, light: C.bgLight, accent: '#10b981', sectionBg: '#f8f9fa' },
      fonts: { body: 'Inter, sans-serif' },
    },
    pages: [{ id: pageId, name: 'Flowdesk – SaaS Landing', slug: '/',
      seo: { title: 'Flowdesk — Work Smarter, Not Harder', description: 'Bring tasks, docs, and team chat into one beautiful workspace.', ogImage: '' },
      sections: [HDR, HERO, MET, FEAT, PRC, TEST, CTA, FOOT],
    }],
    activePageId: pageId,
    nodes: nodes as BuilderState['nodes'],
  };
}
