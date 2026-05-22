/**
 * Demo page 3 — Alex Chen Portfolio
 * Warm cream / charcoal / emerald. Tests: personal tone, case study grid,
 * numbered process steps, warm palette, mixed content density.
 */
import type {
  BuilderState, CanvasElement, GridCell, GridSection,
  ElementBackground, SectionBackground, Padding, Border, Shadow,
  FlexItemLayout, ElementResponsive, TextTransform, AnyNode,
} from '../types';

const C = {
  cream:  '#faf6f0',
  char:   '#1a1a1a',
  green:  '#059669',
  greenL: '#d1fae5',
  muted:  '#78716c',
  border: '#ede9e3',
  dark:   '#111827',
  white:  '#ffffff',
  stone:  '#f5f0e8',
  teal:   '#0d9488',
};

const fl = (m: FlexItemLayout['widthMode'], grow = 0, self: FlexItemLayout['alignSelf'] = 'auto'): FlexItemLayout =>
  ({ widthMode: m, widthValue: 0, flexGrow: grow, alignSelf: self });
const pad = (t: number, r = t, b = t, l = r): Padding => ({ top: t, right: r, bottom: b, left: l });
const elBg = (color = 'transparent'): ElementBackground =>
  ({ type: 'solid', color, image: '', position: 'center', from: '#059669', to: '#0d9488', angle: 135 });
const elGrad = (from: string, to: string, angle = 135): ElementBackground =>
  ({ type: 'linear-gradient', color: 'transparent', image: '', position: 'center', from, to, angle });
const secSolid = (color: string): SectionBackground =>
  ({ type: 'solid', color, image: '', position: 'center', from: '#059669', to: '#0d9488', angle: 135, overlay: 0 });
const secGrad = (from: string, to: string, angle = 135): SectionBackground =>
  ({ type: 'linear-gradient', color: 'transparent', image: '', position: 'center', from, to, angle, overlay: 0 });
const bdr = (radius = 0, width = 0, color = '#cccccc', style: Border['style'] = 'solid'): Border =>
  ({ radius, width, color, style });
const shad = (on = false, x = 0, y = 6, blur = 24, spread = -4, color = 'rgba(0,0,0,0.08)'): Shadow =>
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
  sz = 15, radius = 8, p = pad(12, 28), flex = fl('auto'), bdColor?: string, bdW = 0): CanvasElement {
  return { id, type: 'button', parent, layout: { x: 0, y: 0, width: 160, height: 44, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(bg), padding: p, border: bdr(radius, bdW, bdColor ?? bg), shadow: shad(), typography: typo(sz, '600', color, 'center', 1, 0.3) },
    content: { plain: label, label, rich: '' }, interaction: nolink(), animation: noanim(), state: nostate(), responsive: {}, flexLayout: flex };
}
function s(id: string, parent: string, h = 20): CanvasElement {
  return { id, type: 'spacer', parent, layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elBg(), padding: pad(0), border: bdr(), shadow: shad(), typography: typo(16, 'normal', '#333') },
    content: {}, interaction: nolink(), animation: noanim(), state: nostate(), responsive: {}, flexLayout: fl('fill') };
}
function bx(id: string, parent: string, h: number, from: string, to: string, angle = 135, radius = 12,
  flex = fl('fill', 1, 'stretch')): CanvasElement {
  return { id, type: 'box', parent, layout: { x: 0, y: 0, width: 200, height: h, zIndex: 0, rotation: 0 },
    style: { opacity: 1, background: elGrad(from, to, angle), padding: pad(0), border: bdr(radius), shadow: shad(true, 0, 8, 32, -4, 'rgba(0,0,0,0.1)'), typography: typo(16, 'normal', '#fff') },
    content: { plain: '', rich: '' }, interaction: nolink(), animation: noanim(), state: nostate(), responsive: {}, flexLayout: flex };
}
function dv(id: string, parent: string, color = '#ede9e3'): CanvasElement {
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
      background: { type: 'solid', color: bg, image: '', position: 'center', from: '#059669', to: '#0d9488', angle: 135, overlay: 0 },
      border: border_, minHeight: minH, alignItems: align, justifyContent: justify },
    children, responsive: res };
}
function sec(id: string, role: GridSection['role'], label: string, children: string[],
  bg: SectionBackground, gap_ = 24, rowGap = 0, p: Padding = pad(0)): GridSection {
  return { id, type: 'section', layoutMode: 'grid', role, label, layout: { height: 600 },
    style: { background: bg, columns: { count: 1, widths: [100], styles: {} }, padding: p },
    children, grid: { gap: gap_, rowGap } };
}

export function makePortfolioState(): BuilderState {
  const nodes: Record<string, AnyNode> = {};
  const add = <T extends AnyNode>(n: T): T => { nodes[n.id] = n; return n; };

  // ══ HEADER ══
  const HDR = 's3_hdr';
  add(t('e3_hname', 'c3_hl', 'Alex Chen', 16, '700', C.char, 'left', 26, 1, pad(0), fl('auto')));
  add(cell('c3_hl', HDR, 3, ['e3_hname'], 'row', 'center', 'flex-start', 0, pad(20, 40)));
  add(t('e3_hnav', 'c3_hm', 'Work  ·  Process  ·  About  ·  Writing', 14, 'normal', C.muted, 'center', 24, 1, pad(0), fl('auto')));
  add(cell('c3_hm', HDR, 6, ['e3_hnav'], 'row', 'center', 'center', 0, pad(20, 0)));
  add(t('e3_havail', 'c3_hr', '● Available for work', 13, '500', C.green, 'right', 22, 1, pad(0), fl('auto')));
  add(cell('c3_hr', HDR, 3, ['e3_havail'], 'row', 'center', 'flex-end', 0, pad(20, 40)));
  add(sec(HDR, 'header', 'Header', ['c3_hl', 'c3_hm', 'c3_hr'], secSolid(C.cream), 0, 0));

  // ══ INTRO ══
  const INTRO = 's3_intro';
  // Left: name + role + desc
  add(t('e3_irole', 'c3_il', 'Product Designer', 13, '600', C.green, 'left', 22, 1, pad(0), fl('fill'), {}, 1.5, 'uppercase'));
  add(s('e3_isp1', 'c3_il', 20));
  add(t('e3_iname', 'c3_il', 'Hello, I\'m Alex.\nI design products\npeople love to use.', 52, '700', C.char, 'left', 192, 1.15, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 40 } } }, mobile: { style: { typography: { size: 32 } } },
  }, -0.5));
  add(s('e3_isp2', 'c3_il', 24));
  add(t('e3_ibody', 'c3_il',
    '6 years designing digital products at the intersection of usability and craft. Currently open to full-time and contract roles in product design.',
    17, 'normal', C.muted, 'left', 68, 1.8, pad(0), fl('fill'), {
      tablet: { style: { typography: { size: 15 } } },
    }));
  add(s('e3_isp3', 'c3_il', 36));
  add(b('e3_iview', 'c3_il', 'View my work ↓', C.char, C.white, 15, 8, pad(14, 28)));
  add(cell('c3_il', INTRO, 7,
    ['e3_irole', 'e3_isp1', 'e3_iname', 'e3_isp2', 'e3_ibody', 'e3_isp3', 'e3_iview'],
    'column', 'flex-start', 'center', 0, pad(0, 60, 0, 60), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  // Right: decorative portrait placeholder
  add(bx('e3_iimg', 'c3_ir', 440, C.green, C.teal, 145, 12));
  add(cell('c3_ir', INTRO, 5, ['e3_iimg'], 'column', 'stretch', 'center', 0, pad(0, 60, 0, 0), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  add(sec(INTRO, 'section', 'Intro', ['c3_il', 'c3_ir'], secSolid(C.cream), 0, 0, pad(80, 0)));

  // ══ CASE STUDIES ══
  const CASES = 's3_cases';
  add(t('e3_csh', 'c3_cshdr', 'Selected Work', 38, '700', C.char, 'left', 50, 1.1, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 30 } } },
  }));
  add(cell('c3_cshdr', CASES, 12, ['e3_csh'], 'column', 'flex-start', 'flex-start', 0, pad(0, 60, 48, 60)));

  const cases = [
    { id: 'c3_cs1', tag: 'SaaS · Mobile App', title: 'Beacon Analytics', desc: 'Redesigned the core reporting experience for 50,000 users, reducing time-to-insight by 40%.', year: '2024', from: '#0f172a', to: '#1e293b' },
    { id: 'c3_cs2', tag: 'E-commerce · Web', title: 'Petal Marketplace', desc: 'Built a multi-vendor marketplace from zero to $2M GMV in 6 months through systematic UX testing.', year: '2023', from: '#14532d', to: '#166534' },
    { id: 'c3_cs3', tag: 'Fintech · iOS',     title: 'Vault Savings',    desc: 'Simplified a complex savings product for Gen Z, resulting in 3× increase in weekly active users.', year: '2023', from: '#1e1b4b', to: '#312e81' },
  ];
  cases.forEach(cs => {
    add(bx(`e3_csbx_${cs.id}`, cs.id, 260, cs.from, cs.to, 155, 12));
    add(s(`e3_cssp1_${cs.id}`, cs.id, 20));
    add(t(`e3_cstag_${cs.id}`, cs.id, cs.tag, 12, '600', C.green, 'left', 20, 1, pad(0), fl('fill'), {}, 1));
    add(s(`e3_cssp2_${cs.id}`, cs.id, 8));
    add(t(`e3_cstl_${cs.id}`, cs.id, cs.title, 22, '700', C.char, 'left', 30, 1.1));
    add(s(`e3_cssp3_${cs.id}`, cs.id, 10));
    add(t(`e3_csdsc_${cs.id}`, cs.id, cs.desc, 14, 'normal', C.muted, 'left', 72, 1.7));
    add(s(`e3_cssp4_${cs.id}`, cs.id, 20));
    add(t(`e3_csyr_${cs.id}`, cs.id, `View case study → (${cs.year})`, 13, '600', C.char, 'left', 22, 1));
    add(cell(cs.id, CASES, 4,
      [`e3_csbx_${cs.id}`, `e3_cssp1_${cs.id}`, `e3_cstag_${cs.id}`, `e3_cssp2_${cs.id}`, `e3_cstl_${cs.id}`, `e3_cssp3_${cs.id}`, `e3_csdsc_${cs.id}`, `e3_cssp4_${cs.id}`, `e3_csyr_${cs.id}`],
      'column', 'flex-start', 'flex-start', 0, pad(0, 24, 0, 24), 'transparent',
      { tablet: { columnSpan: 6 }, mobile: { columnSpan: 12 } }));
  });
  add(sec(CASES, 'section', 'Work', ['c3_cshdr', 'c3_cs1', 'c3_cs2', 'c3_cs3'], secSolid(C.stone), 24, 24, pad(80, 0)));

  // ══ PROCESS ══
  const PROC = 's3_proc';
  add(t('e3_prh', 'c3_prhdr', 'How I work', 38, '700', C.char, 'left', 50, 1.1, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 30 } } },
  }));
  add(s('e3_prhsp', 'c3_prhdr', 8));
  add(t('e3_prsub', 'c3_prhdr', 'A lightweight, research-first process that adapts to your team and timeline.', 16, 'normal', C.muted, 'left', 28, 1.6));
  add(cell('c3_prhdr', PROC, 12, ['e3_prh', 'e3_prhsp', 'e3_prsub'], 'column', 'flex-start', 'flex-start', 0, pad(0, 60, 48, 60)));

  const steps = [
    { id: 'c3_pr1', n: '01', title: 'Discover',  desc: 'User interviews, analytics review, and competitive audit to understand the real problem.' },
    { id: 'c3_pr2', n: '02', title: 'Define',    desc: 'Problem framing, user journey maps, and alignment with stakeholders before any pixels.' },
    { id: 'c3_pr3', n: '03', title: 'Design',    desc: 'Wireframes → prototype → high-fidelity. Iterating fast with user feedback at every stage.' },
    { id: 'c3_pr4', n: '04', title: 'Deliver',   desc: 'Handoff-ready specs, component libraries, and support through engineering implementation.' },
  ];
  steps.forEach(st => {
    add(t(`e3_pnum_${st.id}`, st.id, st.n, 13, '700', C.green, 'left', 20, 1, pad(0), fl('fill'), {}, 1.5, 'uppercase'));
    add(s(`e3_pnsp_${st.id}`, st.id, 20));
    add(dv(`e3_pdv_${st.id}`, st.id, C.border));
    add(s(`e3_pdsp_${st.id}`, st.id, 20));
    add(t(`e3_ptl_${st.id}`, st.id, st.title, 22, '700', C.char, 'left', 30, 1.1));
    add(s(`e3_ptsp_${st.id}`, st.id, 12));
    add(t(`e3_pdsc_${st.id}`, st.id, st.desc, 15, 'normal', C.muted, 'left', 68, 1.7));
    add(cell(st.id, PROC, 3,
      [`e3_pnum_${st.id}`, `e3_pnsp_${st.id}`, `e3_pdv_${st.id}`, `e3_pdsp_${st.id}`, `e3_ptl_${st.id}`, `e3_ptsp_${st.id}`, `e3_pdsc_${st.id}`],
      'column', 'flex-start', 'flex-start', 0, pad(0, 40, 0, 40), 'transparent',
      { tablet: { columnSpan: 6 }, mobile: { columnSpan: 12 } }));
  });
  add(sec(PROC, 'section', 'Process', ['c3_prhdr', 'c3_pr1', 'c3_pr2', 'c3_pr3', 'c3_pr4'], secSolid(C.cream), 0, 0, pad(80, 0)));

  // ══ ABOUT + SKILLS ══
  const ABOUT = 's3_about';
  add(t('e3_abeye', 'c3_abt', 'A bit about me', 11, '700', C.green, 'left', 18, 1, pad(0), fl('fill'), {}, 2.5, 'uppercase'));
  add(s('e3_absp1', 'c3_abt', 16));
  add(t('e3_abh2', 'c3_abt', 'Design is thinking\nmade visual.', 38, '700', C.char, 'left', 96, 1.2, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 30 } } }, mobile: { style: { typography: { size: 26 } } },
  }));
  add(s('e3_absp2', 'c3_abt', 20));
  add(t('e3_abbody', 'c3_abt',
    'Based in San Francisco. Previously at Stripe, Notion, and Linear. I believe the best product design is invisible — it gets out of the user\'s way and lets them do what they came to do.',
    16, 'normal', C.muted, 'left', 100, 1.8));
  add(s('e3_absp3', 'c3_abt', 32));
  add(b('e3_abres', 'c3_abt', 'Download Resume', C.green, C.white, 15, 8, pad(12, 24)));
  add(cell('c3_abt', ABOUT, 6,
    ['e3_abeye', 'e3_absp1', 'e3_abh2', 'e3_absp2', 'e3_abbody', 'e3_absp3', 'e3_abres'],
    'column', 'flex-start', 'center', 0, pad(0, 60, 0, 60), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));

  add(t('e3_skh', 'c3_skl', 'Skills & tools', 11, '700', C.green, 'left', 18, 1, pad(0), fl('fill'), {}, 2.5, 'uppercase'));
  add(s('e3_sksp1', 'c3_skl', 16));
  add(t('e3_skdesign', 'c3_skl', 'Design', 15, '700', C.char, 'left', 22, 1));
  add(s('e3_sksp2', 'c3_skl', 8));
  add(t('e3_skdt', 'c3_skl', 'Figma · Framer · Principle\nProtopie · Adobe CC', 14, 'normal', C.muted, 'left', 48, 2));
  add(s('e3_sksp3', 'c3_skl', 20));
  add(t('e3_skresearch', 'c3_skl', 'Research', 15, '700', C.char, 'left', 22, 1));
  add(s('e3_sksp4', 'c3_skl', 8));
  add(t('e3_skrt', 'c3_skl', 'User interviews · Usability testing\nCard sorting · A/B analysis', 14, 'normal', C.muted, 'left', 48, 2));
  add(s('e3_sksp5', 'c3_skl', 20));
  add(t('e3_skcode', 'c3_skl', 'Code', 15, '700', C.char, 'left', 22, 1));
  add(s('e3_sksp6', 'c3_skl', 8));
  add(t('e3_skct', 'c3_skl', 'HTML/CSS · React basics\nDeveloper handoff', 14, 'normal', C.muted, 'left', 48, 2));
  add(cell('c3_skl', ABOUT, 6,
    ['e3_skh', 'e3_sksp1', 'e3_skdesign', 'e3_sksp2', 'e3_skdt', 'e3_sksp3', 'e3_skresearch', 'e3_sksp4', 'e3_skrt', 'e3_sksp5', 'e3_skcode', 'e3_sksp6', 'e3_skct'],
    'column', 'flex-start', 'flex-start', 0, pad(0, 60, 0, 0), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  add(sec(ABOUT, 'section', 'About', ['c3_abt', 'c3_skl'], secSolid(C.stone), 0, 0, pad(80, 0)));

  // ══ TESTIMONIAL ══
  const QUOTE = 's3_quote';
  add(t('e3_qtxt', 'c3_qmain',
    '"Alex is the best designer I\'ve worked with in 10 years of building products. She makes the complex feel obvious."',
    26, '400', C.white, 'center', 116, 1.7, pad(0), fl('fill'), {
      tablet: { style: { typography: { size: 20 } } }, mobile: { style: { typography: { size: 18 } } },
    }));
  add(s('e3_qsp1', 'c3_qmain', 32));
  add(dv('e3_qdv', 'c3_qmain', 'rgba(255,255,255,0.2)'));
  add(s('e3_qsp2', 'c3_qmain', 24));
  add(t('e3_qname', 'c3_qmain', 'Jordan Park', 16, '700', C.white, 'center', 24, 1));
  add(t('e3_qrole', 'c3_qmain', 'VP Product, Beacon Analytics', 14, 'normal', 'rgba(255,255,255,0.65)', 'center', 22, 1));
  add(cell('c3_qmain', QUOTE, 12,
    ['e3_qtxt', 'e3_qsp1', 'e3_qdv', 'e3_qsp2', 'e3_qname', 'e3_qrole'],
    'column', 'center', 'flex-start', 0, pad(80, 40)));
  add(sec(QUOTE, 'section', 'Testimonial', ['c3_qmain'], secGrad(C.green, C.teal, 135), 0, 0));

  // ══ CONTACT ══
  const CONTACT = 's3_contact';
  add(t('e3_cth', 'c3_ctmain', "Let's work together", 48, '700', C.white, 'center', 64, 1.1, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 36 } } }, mobile: { style: { typography: { size: 28 } } },
  }, -0.5));
  add(s('e3_ctsp1', 'c3_ctmain', 16));
  add(t('e3_ctsub', 'c3_ctmain',
    "I'm currently available for full-time roles and selected freelance projects. Let's talk.",
    18, 'normal', 'rgba(255,255,255,0.7)', 'center', 28, 1.6));
  add(s('e3_ctsp2', 'c3_ctmain', 40));
  add(b('e3_ctbtn', 'c3_ctmain', 'Say hello →', C.white, C.char, 16, 8, pad(16, 36), fl('auto')));
  add(s('e3_ctsp3', 'c3_ctmain', 12));
  add(t('e3_ctemail', 'c3_ctmain', 'alex@alexchen.design  ·  @alexchendesign', 14, 'normal', 'rgba(255,255,255,0.5)', 'center', 22, 1));
  add(cell('c3_ctmain', CONTACT, 12,
    ['e3_cth', 'e3_ctsp1', 'e3_ctsub', 'e3_ctsp2', 'e3_ctbtn', 'e3_ctsp3', 'e3_ctemail'],
    'column', 'center', 'flex-start', 0, pad(96, 40)));
  add(sec(CONTACT, 'section', 'Contact', ['c3_ctmain'], secSolid(C.dark), 0, 0));

  // ══ FOOTER ══
  const FOOT = 's3_foot';
  add(t('e3_fn', 'c3_fl', 'Alex Chen', 16, '700', C.white, 'left', 24, 1, pad(0), fl('auto')));
  add(cell('c3_fl', FOOT, 4, ['e3_fn'], 'row', 'center', 'flex-start', 0, pad(32, 40)));
  add(t('e3_fcopy', 'c3_fc', '© 2025 Alex Chen. All rights reserved.', 13, 'normal', '#6b7280', 'center', 20, 1, pad(0), fl('fill')));
  add(cell('c3_fc', FOOT, 4, ['e3_fcopy'], 'row', 'center', 'center', 0, pad(32, 0)));
  add(t('e3_fsocial', 'c3_fr', 'Dribbble  ·  LinkedIn  ·  Twitter', 13, 'normal', '#6b7280', 'right', 20, 1, pad(0), fl('fill')));
  add(cell('c3_fr', FOOT, 4, ['e3_fsocial'], 'row', 'center', 'flex-end', 0, pad(32, 40)));
  add(sec(FOOT, 'footer', 'Footer', ['c3_fl', 'c3_fc', 'c3_fr'], secSolid(C.dark), 0, 0));

  const pageId = 'page_portfolio';
  return {
    schema: '2.0',
    site: { name: 'Alex Chen', favicon: '', language: 'en' },
    theme: {
      colors: { primary: C.green, secondary: C.teal, text: C.char, background: C.cream, light: C.stone, accent: C.teal, sectionBg: '#f8f9fa' },
      fonts: { body: 'Inter, sans-serif' },
    },
    pages: [{ id: pageId, name: 'Alex Chen – Product Designer', slug: '/',
      seo: { title: 'Alex Chen — Product Designer', description: '6 years designing digital products people love to use.', ogImage: '' },
      sections: [HDR, INTRO, CASES, PROC, ABOUT, QUOTE, CONTACT, FOOT],
    }],
    activePageId: pageId,
    nodes: nodes as BuilderState['nodes'],
  };
}
