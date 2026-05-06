/**
 * Demo page state — showcases grid layout, responsiveness, and styling.
 * Demonstrates Phase 1 (section padding, cell border, responsive min-height)
 * and Phase 2 (letterSpacing, textTransform) features.
 */
import type {
  BuilderState, CanvasElement, GridCell, GridSection,
  ElementBackground, SectionBackground, Padding, Border, Shadow,
  FlexItemLayout, ElementResponsive, TextTransform,
} from '../types';

// ─── Tiny helpers ──────────────────────────────────────────────────────────────

const fl = (
  mode: FlexItemLayout['widthMode'],
  grow = 0,
  self: FlexItemLayout['alignSelf'] = 'auto',
): FlexItemLayout => ({ widthMode: mode, widthValue: 0, flexGrow: grow, alignSelf: self });

const pad = (t: number, r = t, b = t, l = r): Padding => ({ top: t, right: r, bottom: b, left: l });

const elBg = (color = 'transparent'): ElementBackground => ({
  type: 'solid', color, image: '', position: 'center',
  from: '#006e75', to: '#0b978e', angle: 135,
});

const elBgGrad = (from: string, to: string, angle = 135): ElementBackground => ({
  type: 'linear-gradient', color: 'transparent', image: '', position: 'center',
  from, to, angle,
});

const secSolid = (color: string, overlay = 0): SectionBackground => ({
  type: 'solid', color, image: '', position: 'center',
  from: '#006e75', to: '#0b978e', angle: 135, overlay,
});

const secGrad = (from: string, to: string, angle = 135, overlay = 0): SectionBackground => ({
  type: 'linear-gradient', color: 'transparent', image: '', position: 'center',
  from, to, angle, overlay,
});

const bdr = (radius = 0, width = 0, color = '#cccccc', style: Border['style'] = 'solid'): Border =>
  ({ radius, width, color, style });

const shad = (enabled = false, x = 0, y = 20, blur = 60, spread = -10, color = 'rgba(0,0,0,0.15)'): Shadow =>
  ({ enabled, x, y, blur, spread, color });

// letterSpacing and textTransform are now first-class typography fields (Phase 2)
const typo = (
  size: number, weight: string, color: string,
  align: 'left' | 'center' | 'right' = 'left',
  lineHeight = 1.5,
  letterSpacing = 0,
  textTransform: TextTransform = 'none',
) => ({ family: 'Inter, sans-serif', size, weight, color, align, lineHeight, letterSpacing, textTransform });

const noanim = () => ({ type: 'none' as const, trigger: 'load' as const, duration: 600, delay: 0 });
const nostate = () => ({ hidden: false, locked: false });
const nolink = () => ({ linkUrl: '', linkTarget: '_self' as const });

// ─── Element factories ────────────────────────────────────────────────────────

function mkText(
  id: string, parent: string, text: string,
  size: number, weight: string, color: string,
  align: 'left' | 'center' | 'right' = 'left',
  height = 48, lineHeight = 1.5,
  padding_ = pad(0),
  flex: FlexItemLayout = fl('fill'),
  responsive: ElementResponsive = {},
  letterSpacing = 0,
  textTransform: TextTransform = 'none',
): CanvasElement {
  return {
    id, type: 'text', parent,
    layout: { x: 0, y: 0, width: 200, height, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1, background: elBg(), padding: padding_,
      border: bdr(), shadow: shad(),
      typography: typo(size, weight, color, align, lineHeight, letterSpacing, textTransform),
    },
    content: { plain: text, rich: '' },
    interaction: nolink(), animation: noanim(), state: nostate(),
    responsive, flexLayout: flex,
  };
}

function mkBtn(
  id: string, parent: string, label: string,
  bgColor = '#006e75', textColor = '#ffffff',
  size = 15, radius = 8,
  padding_ = pad(12, 28, 12, 28),
  flex: FlexItemLayout = fl('auto'),
  letterSpacing = 0.5,
): CanvasElement {
  return {
    id, type: 'button', parent,
    layout: { x: 0, y: 0, width: 160, height: 44, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1, background: elBg(bgColor), padding: padding_,
      border: bdr(radius), shadow: shad(),
      typography: typo(size, '600', textColor, 'center', 1, letterSpacing),
    },
    content: { plain: label, label, rich: '' },
    interaction: nolink(), animation: noanim(), state: nostate(),
    responsive: {}, flexLayout: flex,
  };
}

function mkSpacer(id: string, parent: string, height = 20): CanvasElement {
  return {
    id, type: 'spacer', parent,
    layout: { x: 0, y: 0, width: 200, height, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1, background: elBg(), padding: pad(0),
      border: bdr(), shadow: shad(),
      typography: typo(16, 'normal', '#333'),
    },
    content: {}, interaction: nolink(), animation: noanim(), state: nostate(),
    responsive: {}, flexLayout: fl('fill'),
  };
}

function mkBox(
  id: string, parent: string, height = 300,
  bgFrom = '#006e75', bgTo = '#0b978e', angle = 135, radius = 16,
  flex: FlexItemLayout = fl('fill', 1, 'stretch'),
): CanvasElement {
  return {
    id, type: 'box', parent,
    layout: { x: 0, y: 0, width: 200, height, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1, background: elBgGrad(bgFrom, bgTo, angle), padding: pad(24),
      border: bdr(radius), shadow: shad(true),
      typography: typo(16, 'normal', '#333'),
    },
    content: { plain: '', rich: '' },
    interaction: nolink(), animation: noanim(), state: nostate(),
    responsive: {}, flexLayout: flex,
  };
}

function mkIcon(
  id: string, parent: string, iconName: string,
  iconSize = 36, color = '#006e75',
): CanvasElement {
  return {
    id, type: 'icon', parent,
    layout: { x: 0, y: 0, width: 60, height: iconSize + 8, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1, background: elBg(), padding: pad(0),
      border: bdr(), shadow: shad(),
      typography: { family: 'Inter, sans-serif', size: iconSize, weight: 'normal', color, align: 'left', lineHeight: 1, letterSpacing: 0, textTransform: 'none' },
    },
    content: { iconName, iconSize },
    interaction: nolink(), animation: noanim(), state: nostate(),
    responsive: {}, flexLayout: fl('auto'),
  };
}

function mkDivider(id: string, parent: string, color = '#334155'): CanvasElement {
  return {
    id, type: 'divider', parent,
    layout: { x: 0, y: 0, width: 400, height: 2, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1, background: elBg(color), padding: pad(8, 0, 8, 0),
      border: bdr(2), shadow: shad(),
      typography: typo(16, 'normal', '#333'),
    },
    content: {}, interaction: nolink(), animation: noanim(), state: nostate(),
    responsive: {}, flexLayout: fl('fill'),
  };
}

// ─── Cell / section factories ─────────────────────────────────────────────────

// Phase 1: border_ and minHeight_ are now first-class cell properties
function mkCell(
  id: string, parent: string, span: number, children: string[],
  layoutMode: GridCell['style']['layoutMode'] = 'column',
  align: GridCell['style']['alignItems'] = 'flex-start',
  justify: GridCell['style']['justifyContent'] = 'flex-start',
  gap_ = 0, padding_ = pad(0), bgColor = 'transparent',
  responsive: GridCell['responsive'] = {},
  border_: Border = bdr(0, 0, '#cccccc', 'none'),
  minHeight_?: number,
): GridCell {
  return {
    id, type: 'grid-cell', parent, columnSpan: span,
    style: {
      layoutMode, gap: gap_, padding: padding_,
      background: { type: 'solid', color: bgColor, image: '', position: 'center', from: '#006e75', to: '#0b978e', angle: 135, overlay: 0 },
      border: border_,
      minHeight: minHeight_,
      alignItems: align, justifyContent: justify,
    },
    children, responsive,
  };
}

// Phase 1: secPad demonstrates section-level padding
function mkSection(
  id: string, role: GridSection['role'], label: string,
  children: string[], bg: SectionBackground, gap_ = 24, rowGap = 0,
  secPad: Padding = pad(0),
): GridSection {
  return {
    id, type: 'section', layoutMode: 'grid', role, label,
    layout: { height: 600 },
    style: { background: bg, columns: { count: 1, widths: [100], styles: {} }, padding: secPad },
    children, grid: { gap: gap_, rowGap },
  };
}

// ─── Colour / sizing constants ────────────────────────────────────────────────

const C = {
  dark:    '#0f172a',
  navy:    '#1e293b',
  teal:    '#006e75',
  teal2:   '#0b978e',
  light:   '#f1f5f9',
  white:   '#ffffff',
  txtDark: '#0f172a',
  txtMid:  '#475569',
  txtLt:   '#94a3b8',
  muted:   '#64748b',
  border:  '#334155',
};

// ─── Build the full state ─────────────────────────────────────────────────────

export function makeDemoState(): BuilderState {
  const nodes: Record<string, CanvasElement | GridCell | GridSection> = {};

  const add = <T extends CanvasElement | GridCell | GridSection>(n: T) => { nodes[n.id] = n; return n; };

  // ══════════════════════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════════════════════
  const H = 'sec_d_header';
  const gcHL = 'gc_d_hdr_logo'; const gcHN = 'gc_d_hdr_nav';

  add(mkText('el_d_logo', gcHL, 'Buildify', 22, '700', C.white, 'left', 32, 1, pad(0), fl('auto')));
  // Nav links — slight letter-spacing for horizontal rhythm (Phase 2)
  add(mkText('el_d_nav_links', gcHN, 'Features · Pricing · About', 14, 'normal', C.txtLt, 'left', 32, 1, pad(0), fl('auto'), {}, 0.3));
  add(mkBtn('el_d_nav_btn', gcHN, 'Get Started', C.teal, C.white, 14, 6, pad(8, 20, 8, 20)));

  add(mkCell(gcHL, H, 3,  ['el_d_logo'],
    'row', 'center', 'flex-start', 0, pad(16, 24, 16, 24), 'transparent',
    { tablet: { columnSpan: 6 }, mobile: { columnSpan: 7 } }));
  add(mkCell(gcHN, H, 9,  ['el_d_nav_links', 'el_d_nav_btn'],
    'row', 'center', 'flex-end', 24, pad(16, 24, 16, 24), 'transparent',
    { tablet: { columnSpan: 6 }, mobile: { columnSpan: 5 } }));

  add(mkSection(H, 'header', 'Header', [gcHL, gcHN], secSolid(C.dark), 0, 0));

  // ══════════════════════════════════════════════════════════════════════════
  // HERO
  // ══════════════════════════════════════════════════════════════════════════
  const HERO = 'sec_d_hero';
  const gcHeroMain = 'gc_d_hero_main';

  // Eyebrow: textTransform + letterSpacing demonstrates Phase 2 (source text is lowercase)
  add(mkText('el_d_hero_eye', gcHeroMain, '✦  next-gen page builder  ✦',
    11, '700', C.teal2, 'center', 18, 1, pad(0), fl('fill'), {}, 2.5, 'uppercase',
  ));
  add(mkSpacer('el_d_hero_sp1', gcHeroMain, 16));
  add(mkText('el_d_hero_h1', gcHeroMain, 'Design Pages That Convert',
    54, '700', C.white, 'center', 76, 1.15, pad(0), fl('fill'), {
      tablet: { style: { typography: { size: 40 } } },
      mobile: { style: { typography: { size: 30 } } },
    },
  ));
  add(mkSpacer('el_d_hero_sp2', gcHeroMain, 20));
  add(mkText('el_d_hero_sub', gcHeroMain,
    'Create beautiful, responsive websites in minutes with our intuitive drag-and-drop builder. No design skills required.',
    18, 'normal', C.txtLt, 'center', 60, 1.75, pad(0), fl('fill'), {
      tablet: { style: { typography: { size: 16 } } },
      mobile: { style: { typography: { size: 15 } } },
    },
  ));
  add(mkSpacer('el_d_hero_sp3', gcHeroMain, 36));
  add(mkBtn('el_d_hero_btn', gcHeroMain, 'Start Building Free  →', C.teal, C.white, 16, 8, pad(16, 36, 16, 36)));
  add(mkSpacer('el_d_hero_sp4', gcHeroMain, 16));
  add(mkText('el_d_hero_note', gcHeroMain, 'No credit card required  ·  Free forever plan',
    13, 'normal', '#475569', 'center', 20, 1, pad(0), fl('fill'),
  ));

  add(mkCell(gcHeroMain, HERO, 12, [
    'el_d_hero_eye', 'el_d_hero_sp1', 'el_d_hero_h1', 'el_d_hero_sp2',
    'el_d_hero_sub', 'el_d_hero_sp3', 'el_d_hero_btn', 'el_d_hero_sp4', 'el_d_hero_note',
  ], 'column', 'center', 'flex-start', 0, pad(96, 40, 96, 40)));

  add(mkSection(HERO, 'section', 'Hero', [gcHeroMain], secGrad(C.dark, C.navy, 160), 0, 0));

  // ══════════════════════════════════════════════════════════════════════════
  // FEATURES
  // ══════════════════════════════════════════════════════════════════════════
  // Phase 1 demo: section padding (top/bottom) replaces eyebrow-cell top padding.
  // Phase 1 demo: feature cards use cell border (radius + 1px border).
  // Phase 2 demo: eyebrow uses textTransform + letterSpacing.
  const FEAT = 'sec_d_features';
  const gcFH = 'gc_d_feat_hdr';

  // Eyebrow — source text is sentence-case; textTransform renders it UPPERCASE
  add(mkText('el_d_feat_eye', gcFH, 'What we offer',
    11, '700', C.teal, 'center', 18, 1, pad(0), fl('fill'), {}, 2.5, 'uppercase',
  ));
  add(mkSpacer('el_d_feat_sp1', gcFH, 8));
  add(mkText('el_d_feat_h2', gcFH, 'Everything You Need to Build',
    38, '700', C.txtDark, 'center', 56, 1.2, pad(0), fl('fill'), {
      tablet: { style: { typography: { size: 30 } } },
      mobile: { style: { typography: { size: 26 } } },
    },
  ));
  add(mkSpacer('el_d_feat_sp2', gcFH, 12));
  add(mkText('el_d_feat_sub', gcFH,
    'Powerful tools designed to help you create, publish, and grow your online presence.',
    16, 'normal', C.muted, 'center', 48, 1.7,
  ));

  // Section padding handles top breathing room; cell only needs bottom gap
  add(mkCell(gcFH, FEAT, 12,
    ['el_d_feat_eye', 'el_d_feat_sp1', 'el_d_feat_h2', 'el_d_feat_sp2', 'el_d_feat_sub'],
    'column', 'center', 'flex-start', 0, pad(0, 40, 48, 40),
  ));

  const features = [
    { icon: '⚡', title: 'Lightning Fast',      desc: 'Build and publish pages in minutes, not days. Our optimized platform delivers blazing-fast performance out of the box.' },
    { icon: '🎨', title: 'Beautiful Design',     desc: 'Access professional design tools and templates. Create stunning visual experiences with full creative control.' },
    { icon: '📱', title: 'Fully Responsive',     desc: 'Every page you build automatically adapts to any screen size — desktop, tablet, and mobile — without extra effort.' },
    { icon: '🔧', title: 'Highly Customizable', desc: 'Fine-tune every detail with advanced controls. Customize colors, typography, spacing, and animations to match your brand.' },
  ] as const;

  const featCellIds = ['gc_d_feat_1', 'gc_d_feat_2', 'gc_d_feat_3', 'gc_d_feat_4'] as const;

  features.forEach((f, i) => {
    const cid = featCellIds[i];
    const icon  = add(mkIcon(`el_d_fi${i}_icon`,  cid, f.icon, 32, C.teal));
    const sp1   = add(mkSpacer(`el_d_fi${i}_sp1`, cid, 16));
    const title = add(mkText(`el_d_fi${i}_title`, cid, f.title, 17, '700', C.txtDark, 'left', 26));
    const sp2   = add(mkSpacer(`el_d_fi${i}_sp2`, cid, 8));
    const desc  = add(mkText(`el_d_fi${i}_desc`,  cid, f.desc,  14, 'normal', C.muted, 'left', 88, 1.75));

    // Phase 1: card-style cell — border radius 16px, 1px border, white background
    add(mkCell(cid, FEAT, 3, [icon.id, sp1.id, title.id, sp2.id, desc.id],
      'column', 'flex-start', 'flex-start', 0, pad(32, 28, 32, 28), C.white, {
        tablet: { columnSpan: 6 }, mobile: { columnSpan: 12 },
      },
      bdr(16, 1, '#e2e8f0'),
    ));
  });

  // Phase 1: section padding top+bottom = 72px; cells provide only horizontal/internal spacing
  add(mkSection(FEAT, 'section', 'Features',
    [gcFH, ...featCellIds], secSolid(C.light), 20, 20, pad(72, 0, 72, 0)));

  // ══════════════════════════════════════════════════════════════════════════
  // CONTENT  (text left · visual right)
  // ══════════════════════════════════════════════════════════════════════════
  const CONT = 'sec_d_content';
  const gcCL = 'gc_d_cont_left';
  const gcCR = 'gc_d_cont_right';

  // Eyebrow — Phase 2: textTransform + letterSpacing on a left-aligned label
  add(mkText('el_d_cl_eye', gcCL, 'Why choose us',
    11, '700', C.teal, 'left', 18, 1, pad(0), fl('fill'), {}, 2.5, 'uppercase',
  ));
  add(mkSpacer('el_d_cl_sp1', gcCL, 12));
  add(mkText('el_d_cl_h2', gcCL, 'Built for Speed,\nDesigned for Growth',
    36, '700', C.txtDark, 'left', 90, 1.2, pad(0), fl('fill'), {
      tablet: { style: { typography: { size: 28 } } },
      mobile: { style: { typography: { size: 24 } } },
    },
  ));
  add(mkSpacer('el_d_cl_sp2', gcCL, 20));
  add(mkText('el_d_cl_body', gcCL,
    'Our platform combines the power of visual editing with professional-grade tools. Whether you\'re a freelancer, agency, or enterprise — we have everything you need to succeed online.',
    16, 'normal', C.txtMid, 'left', 84, 1.75,
  ));
  add(mkSpacer('el_d_cl_sp3', gcCL, 12));
  add(mkText('el_d_cl_list', gcCL, '✓  No coding required\n✓  99.9% uptime guaranteed\n✓  24/7 customer support',
    15, 'normal', C.txtMid, 'left', 76, 2.1,
  ));
  add(mkSpacer('el_d_cl_sp4', gcCL, 32));
  add(mkBtn('el_d_cl_btn', gcCL, 'Learn More  →', C.dark, C.white, 15, 8, pad(14, 28, 14, 28)));

  add(mkCell(gcCL, CONT, 6,
    ['el_d_cl_eye', 'el_d_cl_sp1', 'el_d_cl_h2', 'el_d_cl_sp2',
     'el_d_cl_body', 'el_d_cl_sp3', 'el_d_cl_list', 'el_d_cl_sp4', 'el_d_cl_btn'],
    'column', 'flex-start', 'center', 0, pad(80, 60, 80, 60), 'transparent', {
      tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 },
    },
  ));

  add(mkBox('el_d_cr_img', gcCR, 400, C.teal, C.teal2, 135, 20, fl('fill', 1, 'stretch')));

  add(mkCell(gcCR, CONT, 6, ['el_d_cr_img'],
    'column', 'stretch', 'center', 0, pad(48, 60, 48, 40), 'transparent', {
      tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 },
    },
  ));

  add(mkSection(CONT, 'section', 'Content', [gcCL, gcCR], secSolid(C.white), 0, 0));

  // ══════════════════════════════════════════════════════════════════════════
  // STATS
  // ══════════════════════════════════════════════════════════════════════════
  // Phase 1 demo: section padding handles all vertical breathing room.
  // Phase 2 demo: large numbers use negative letterSpacing; labels use uppercase + wide spacing.
  const STATS = 'sec_d_stats';
  const statCellIds = ['gc_d_st_1', 'gc_d_st_2', 'gc_d_st_3'] as const;

  const statsData = [
    { num: '10,000+', label: 'Happy Customers' },
    { num: '50+',     label: 'Ready Templates' },
    { num: '99.9%',   label: 'Uptime Guarantee' },
  ] as const;

  statsData.forEach((s, i) => {
    const cid = statCellIds[i];
    // Large numbers: tight tracking reads as bold and confident (Phase 2)
    const numEl = add(mkText(`el_d_st${i}_num`, cid, s.num,
      44, '700', C.white, 'center', 56, 1.1, pad(0), fl('fill'), {
        tablet: { style: { typography: { size: 36 } } },
        mobile: { style: { typography: { size: 30 } } },
      }, -1.5,
    ));
    const sp  = add(mkSpacer(`el_d_st${i}_sp`, cid, 8));
    // Labels: wide-spaced uppercase — standard pattern for stat captions (Phase 2)
    const lbl = add(mkText(`el_d_st${i}_lbl`, cid, s.label.toLowerCase(),
      11, '600', C.txtLt, 'center', 22, 1, pad(0), fl('fill'), {}, 2, 'uppercase',
    ));
    // Phase 1: section handles vertical padding; cell only needs horizontal
    // Phase 1: responsive minHeight on mobile prevents collapsed cells
    add(mkCell(cid, STATS, 4, [numEl.id, sp.id, lbl.id],
      'column', 'center', 'flex-start', 0, pad(0, 24, 0, 24), 'transparent', {
        tablet: { columnSpan: 4 },
        mobile: { columnSpan: 12, minHeight: 120 },
      },
    ));
  });

  // Phase 1: section padding = 64px top + bottom
  add(mkSection(STATS, 'section', 'Stats', [...statCellIds], secSolid(C.dark), 0, 0, pad(64, 0, 64, 0)));

  // ══════════════════════════════════════════════════════════════════════════
  // CTA
  // ══════════════════════════════════════════════════════════════════════════
  const CTA = 'sec_d_cta';
  const gcCTA = 'gc_d_cta_main';

  add(mkText('el_d_cta_h2', gcCTA, 'Ready to Start Building?',
    42, '700', C.white, 'center', 58, 1.2, pad(0), fl('fill'), {
      tablet: { style: { typography: { size: 32 } } },
      mobile: { style: { typography: { size: 26 } } },
    },
  ));
  add(mkSpacer('el_d_cta_sp1', gcCTA, 16));
  add(mkText('el_d_cta_sub', gcCTA,
    'Join thousands of creators building stunning pages with Buildify.',
    18, 'normal', 'rgba(255,255,255,0.8)', 'center', 28, 1.6, pad(0), fl('fill'), {
      mobile: { style: { typography: { size: 16 } } },
    },
  ));
  add(mkSpacer('el_d_cta_sp2', gcCTA, 36));
  // CTA button: wider letter-spacing reinforces the call-to-action weight (Phase 2)
  add(mkBtn('el_d_cta_btn', gcCTA, 'Get Started Free', C.white, C.teal, 16, 8, pad(16, 36, 16, 36), fl('auto'), 1));

  add(mkCell(gcCTA, CTA, 12,
    ['el_d_cta_h2', 'el_d_cta_sp1', 'el_d_cta_sub', 'el_d_cta_sp2', 'el_d_cta_btn'],
    'column', 'center', 'flex-start', 0, pad(96, 40, 96, 40),
  ));

  add(mkSection(CTA, 'section', 'CTA', [gcCTA], secGrad(C.teal, C.teal2, 135), 0, 0));

  // ══════════════════════════════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════════════════════════════
  const FOOT = 'sec_d_footer';
  const gcF1 = 'gc_d_foot_1'; const gcF2 = 'gc_d_foot_2'; const gcF3 = 'gc_d_foot_3';

  add(mkText('el_d_f1_logo', gcF1, 'Buildify', 22, '700', C.white, 'left', 32, 1, pad(0), fl('auto')));
  add(mkSpacer('el_d_f1_sp1', gcF1, 12));
  add(mkText('el_d_f1_desc', gcF1,
    'The easiest way to build beautiful, responsive web pages without writing a single line of code.',
    14, 'normal', C.muted, 'left', 68, 1.75,
  ));
  add(mkSpacer('el_d_f1_sp2', gcF1, 24));
  add(mkText('el_d_f1_copy', gcF1, '© 2025 Buildify Inc. All rights reserved.', 12, 'normal', '#475569', 'left', 20));

  add(mkCell(gcF1, FOOT, 5,
    ['el_d_f1_logo', 'el_d_f1_sp1', 'el_d_f1_desc', 'el_d_f1_sp2', 'el_d_f1_copy'],
    'column', 'flex-start', 'flex-start', 0, pad(48, 40, 48, 24), 'transparent', {
      tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 },
    },
  ));

  // Footer column headings: wide-spaced uppercase (Phase 2)
  add(mkText('el_d_f2_title', gcF2, 'Quick links',
    11, '700', '#e2e8f0', 'left', 22, 1, pad(0), fl('fill'), {}, 2, 'uppercase',
  ));
  add(mkDivider('el_d_f2_div', gcF2, C.border));
  add(mkText('el_d_f2_links', gcF2, 'Home\nFeatures\nPricing\nAbout Us\nContact', 14, 'normal', C.muted, 'left', 120, 2.2));

  add(mkCell(gcF2, FOOT, 3,
    ['el_d_f2_title', 'el_d_f2_div', 'el_d_f2_links'],
    'column', 'flex-start', 'flex-start', 0, pad(48, 24, 48, 24), 'transparent', {
      tablet: { columnSpan: 6 }, mobile: { columnSpan: 6 },
    },
  ));

  add(mkText('el_d_f3_title', gcF3, 'Contact us',
    11, '700', '#e2e8f0', 'left', 22, 1, pad(0), fl('fill'), {}, 2, 'uppercase',
  ));
  add(mkDivider('el_d_f3_div', gcF3, C.border));
  add(mkText('el_d_f3_email', gcF3, 'hello@buildify.com',    14, 'normal', C.muted, 'left', 24, 1.5));
  add(mkSpacer('el_d_f3_sp1', gcF3, 6));
  add(mkText('el_d_f3_phone', gcF3, '+1 (555) 123-4567',     14, 'normal', C.muted, 'left', 24, 1.5));
  add(mkSpacer('el_d_f3_sp2', gcF3, 6));
  add(mkText('el_d_f3_addr',  gcF3, '123 Builder Street\nSan Francisco, CA 94102', 14, 'normal', C.muted, 'left', 44, 1.75));

  add(mkCell(gcF3, FOOT, 4,
    ['el_d_f3_title', 'el_d_f3_div', 'el_d_f3_email', 'el_d_f3_sp1',
     'el_d_f3_phone', 'el_d_f3_sp2', 'el_d_f3_addr'],
    'column', 'flex-start', 'flex-start', 0, pad(48, 24, 48, 24), 'transparent', {
      tablet: { columnSpan: 6 }, mobile: { columnSpan: 6 },
    },
  ));

  add(mkSection(FOOT, 'footer', 'Footer', [gcF1, gcF2, gcF3], secSolid(C.dark), 0, 0));

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE + STATE
  // ══════════════════════════════════════════════════════════════════════════
  const pageId = 'page_demo_1';

  return {
    schema: '2.0',
    site: { name: 'Buildify', favicon: '', language: 'en' },
    theme: {
      colors: {
        primary: C.teal, secondary: C.teal2,
        text: C.txtDark, background: C.white, light: C.light, accent: '#e74c3c',
      },
      fonts: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif' },
    },
    pages: [{
      id: pageId, name: 'Demo Page', slug: '/',
      seo: {
        title: 'Buildify — Design Pages That Convert',
        description: 'Create beautiful, responsive websites in minutes with our intuitive drag-and-drop builder.',
        ogImage: '',
      },
      header: H, footer: FOOT,
      sections: [HERO, FEAT, CONT, STATS, CTA],
    }],
    activePageId: pageId,
    nodes: nodes as BuilderState['nodes'],
  };
}
