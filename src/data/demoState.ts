import type {
  AnyNode, Border, BuilderState, CanvasElement, ElementBackground,
  ElementResponsive, FlexItemLayout, GridCell, GridSection, Padding,
  SectionBackground, Shadow, TextTransform,
} from '../types';

const C = {
  ink: '#111827',
  slate: '#334155',
  muted: '#64748b',
  soft: '#f6fbf8',
  line: '#d9e8e0',
  mint: '#36c7a0',
  teal: '#0f766e',
  deep: '#063b3b',
  aqua: '#d7fbef',
  coral: '#f9735b',
  gold: '#e9b949',
  lavender: '#7566f1',
  white: '#ffffff',
};

const fl = (
  widthMode: FlexItemLayout['widthMode'],
  flexGrow = 0,
  alignSelf: FlexItemLayout['alignSelf'] = 'auto',
  widthValue = 0,
): FlexItemLayout => ({ widthMode, widthValue, flexGrow, alignSelf });

const pad = (top: number, right = top, bottom = top, left = right): Padding =>
  ({ top, right, bottom, left });

const elBg = (color = 'transparent'): ElementBackground => ({
  type: 'solid', color, image: '', position: 'center', from: C.mint, to: C.teal, angle: 135,
});

const elGrad = (from: string, to: string, angle = 135): ElementBackground => ({
  type: 'linear-gradient', color: 'transparent', image: '', position: 'center', from, to, angle,
});

const secSolid = (color: string): SectionBackground => ({
  type: 'solid', color, image: '', position: 'center', from: C.mint, to: C.teal, angle: 135, overlay: 0,
});

const secGrad = (from: string, to: string, angle = 135): SectionBackground => ({
  type: 'linear-gradient', color: 'transparent', image: '', position: 'center', from, to, angle, overlay: 0,
});

const bdr = (radius = 0, width = 0, color = C.line, style: Border['style'] = 'solid'): Border =>
  ({ radius, width, color, style });

const shad = (
  enabled = false,
  x = 0,
  y = 18,
  blur = 48,
  spread = -18,
  color = 'rgba(17,24,39,0.16)',
): Shadow => ({ enabled, x, y, blur, spread, color });

const noanim = () => ({ type: 'none' as const, trigger: 'load' as const, duration: 600, delay: 0 });
const nostate = () => ({ hidden: false, locked: false });
const nolink = () => ({ type: 'link' as const, linkUrl: '', linkTarget: '_self' as const, smoothScroll: false });

const typo = (
  size: number,
  weight: string,
  color: string,
  align: 'left' | 'center' | 'right' = 'left',
  lineHeight = 1.5,
  letterSpacing = 0,
  textTransform: TextTransform = 'none',
) => ({
  family: 'Inter, sans-serif',
  size,
  weight,
  color,
  align,
  lineHeight,
  letterSpacing,
  textTransform,
});

function text(
  id: string,
  parent: string,
  plain: string,
  size: number,
  weight: string,
  color: string,
  align: 'left' | 'center' | 'right' = 'left',
  height = 48,
  lineHeight = 1.5,
  padding = pad(0),
  flex = fl('fill'),
  responsive: ElementResponsive = {},
  letterSpacing = 0,
  textTransform: TextTransform = 'none',
): CanvasElement {
  return {
    id, type: 'text', parent,
    layout: { x: 0, y: 0, width: 200, height, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1,
      background: elBg(),
      padding,
      border: bdr(),
      shadow: shad(),
      typography: typo(size, weight, color, align, lineHeight, letterSpacing, textTransform),
    },
    content: { plain, rich: '' },
    interaction: nolink(),
    animation: noanim(),
    state: nostate(),
    responsive,
    flexLayout: flex,
  };
}

function button(
  id: string,
  parent: string,
  label: string,
  bg: string,
  color: string,
  padding = pad(14, 24),
  flex = fl('auto'),
  borderColor = bg,
  borderWidth = 0,
): CanvasElement {
  return {
    id, type: 'button', parent,
    layout: { x: 0, y: 0, width: 170, height: 48, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1,
      background: elBg(bg),
      padding,
      border: bdr(8, borderWidth, borderColor),
      shadow: shad(),
      typography: typo(15, '700', color, 'center', 1, 0),
    },
    content: { plain: label, label, rich: '' },
    interaction: nolink(),
    animation: noanim(),
    state: nostate(),
    responsive: {},
    flexLayout: flex,
  };
}

function spacer(id: string, parent: string, height: number): CanvasElement {
  return {
    id, type: 'spacer', parent,
    layout: { x: 0, y: 0, width: 200, height, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1,
      background: elBg(),
      padding: pad(0),
      border: bdr(),
      shadow: shad(),
      typography: typo(16, '400', C.ink),
    },
    content: {},
    interaction: nolink(),
    animation: noanim(),
    state: nostate(),
    responsive: {},
    flexLayout: fl('fill'),
  };
}

function box(
  id: string,
  parent: string,
  height: number,
  from: string,
  to: string,
  angle = 135,
  radius = 8,
  flex = fl('fill', 1, 'stretch'),
  shadow = true,
): CanvasElement {
  return {
    id, type: 'box', parent,
    layout: { x: 0, y: 0, width: 240, height, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1,
      background: elGrad(from, to, angle),
      padding: pad(0),
      border: bdr(radius, 0, 'transparent'),
      shadow: shadow ? shad(true) : shad(),
      typography: typo(16, '400', C.ink),
    },
    content: { plain: '', rich: '' },
    interaction: nolink(),
    animation: noanim(),
    state: nostate(),
    responsive: {},
    flexLayout: flex,
  };
}

function icon(id: string, parent: string, iconName: string, color = C.teal, size = 26): CanvasElement {
  return {
    id, type: 'icon', parent,
    layout: { x: 0, y: 0, width: 48, height: 42, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1,
      background: elBg(C.aqua),
      padding: pad(8),
      border: bdr(8, 1, '#b8eadb'),
      shadow: shad(),
      typography: typo(size, '700', color, 'center', 1),
    },
    content: { iconName, iconSize: size },
    interaction: nolink(),
    animation: noanim(),
    state: nostate(),
    responsive: {},
    flexLayout: fl('auto'),
  };
}

function divider(id: string, parent: string, color = C.line): CanvasElement {
  return {
    id, type: 'divider', parent,
    layout: { x: 0, y: 0, width: 400, height: 2, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1,
      background: elBg(color),
      padding: pad(8, 0),
      border: bdr(),
      shadow: shad(),
      typography: typo(16, '400', C.ink),
    },
    content: {},
    interaction: nolink(),
    animation: noanim(),
    state: nostate(),
    responsive: {},
    flexLayout: fl('fill'),
  };
}

function image(id: string, parent: string, src: string, alt: string, height: number): CanvasElement {
  return {
    id, type: 'image', parent,
    layout: { x: 0, y: 0, width: 520, height, zIndex: 0, rotation: 0 },
    style: {
      opacity: 1,
      background: elBg('#eef8f4'),
      padding: pad(0),
      border: bdr(8, 1, '#cae8df'),
      shadow: shad(true),
      typography: typo(16, '400', C.ink),
    },
    content: { src, alt, objectFit: 'cover' },
    interaction: nolink(),
    animation: noanim(),
    state: nostate(),
    responsive: {},
    flexLayout: fl('fill', 1, 'stretch'),
  };
}

function cell(
  id: string,
  parent: string,
  span: number,
  children: string[],
  mode: GridCell['style']['layoutMode'] = 'column',
  align: GridCell['style']['alignItems'] = 'flex-start',
  justify: GridCell['style']['justifyContent'] = 'flex-start',
  gap = 0,
  padding = pad(0),
  bg = 'transparent',
  responsive: GridCell['responsive'] = {},
  border = bdr(0, 0, 'transparent', 'none'),
  minHeight?: number,
): GridCell {
  return {
    id, type: 'grid-cell', parent, columnSpan: span, rowSpan: 1,
    style: {
      layoutMode: mode,
      gap,
      padding,
      background: { type: 'solid', color: bg, image: '', position: 'center', from: C.mint, to: C.teal, angle: 135, overlay: 0 },
      border,
      minHeight,
      alignItems: align,
      justifyContent: justify,
    },
    children,
    responsive,
  };
}

function section(
  id: string,
  role: GridSection['role'],
  label: string,
  children: string[],
  bg: SectionBackground,
  gap = 24,
  rowGap = 24,
  padding = pad(0),
): GridSection {
  return {
    id, type: 'section', role, label, layoutMode: 'grid',
    layout: { height: 600 },
    style: { background: bg, columns: { count: 1, widths: [100], styles: {} }, padding },
    children,
    grid: { gap, rowGap },
  };
}

export function makeDemoState(): BuilderState {
  const nodes: Record<string, AnyNode> = {};
  const add = <T extends AnyNode>(node: T): T => { nodes[node.id] = node; return node; };

  const HDR = 'demo_header';
  add(text('demo_logo', 'demo_header_brand', 'Clearbase', 22, '800', C.deep, 'left', 32, 1, pad(0), fl('auto')));
  ['Product', 'Features', 'Pricing', 'Stories'].forEach((link, i) => {
    add(text(`demo_nav_${i}`, 'demo_header_nav', link, 14, '600', C.slate, 'center', 24, 1, pad(0), fl('auto')));
  });
  add(button('demo_nav_btn', 'demo_header_nav', 'Start free', C.deep, C.white, pad(10, 18), fl('auto')));
  add(cell('demo_header_brand', HDR, 3, ['demo_logo'], 'row', 'center', 'flex-start', 0, pad(20, 32),
    'transparent', { mobile: { columnSpan: 12, justifyContent: 'center' } }));
  add(cell('demo_header_nav', HDR, 9, ['demo_nav_0', 'demo_nav_1', 'demo_nav_2', 'demo_nav_3', 'demo_nav_btn'], 'row', 'center', 'flex-end', 22, pad(20, 32),
    'transparent', { tablet: { columnSpan: 9 }, mobile: { columnSpan: 12, layoutMode: 'column', alignItems: 'center', justifyContent: 'flex-start' } }));
  add(section(HDR, 'header', 'Header', ['demo_header_brand', 'demo_header_nav'], secSolid(C.white), 0, 0));

  const HERO = 'demo_hero';
  add(text('demo_hero_kicker', 'demo_hero_copy', 'MODERN WEBSITE BUILDER', 12, '800', C.teal, 'left', 18, 1, pad(0), fl('fill'), {}, 0));
  add(spacer('demo_hero_sp1', 'demo_hero_copy', 18));
  add(text('demo_hero_title', 'demo_hero_copy', 'Launch polished landing pages without leaving the builder.', 58, '800', C.ink, 'left', 210, 1.12, pad(0), fl('fill'), {
    tablet: { style: { typography: { size: 42 } } },
    mobile: { style: { typography: { size: 32, align: 'left' } } },
  }));
  add(spacer('demo_hero_sp2', 'demo_hero_copy', 20));
  add(text('demo_hero_body', 'demo_hero_copy',
    'Clearbase gives founders, marketers, and agencies a realistic no-code workflow for building conversion-ready pages with clean sections, responsive grids, and brand-safe styling.',
    18, '400', C.slate, 'left', 102, 1.65, pad(0), fl('fill'), {
      mobile: { style: { typography: { size: 16 } } },
    }));
  add(spacer('demo_hero_sp3', 'demo_hero_copy', 30));
  add(button('demo_hero_primary', 'demo_hero_copy', 'Start building', C.deep, C.white, pad(15, 26), fl('auto')));
  add(button('demo_hero_secondary', 'demo_hero_copy', 'View templates', 'transparent', C.deep, pad(15, 24), fl('auto'), C.deep, 1));
  add(spacer('demo_hero_sp4', 'demo_hero_copy', 24));
  add(text('demo_hero_note', 'demo_hero_copy', 'Trusted by launch teams at Northstar, Pixelwave, Orbitly, and Studio Nine.', 13, '600', C.muted, 'left', 24, 1.4));

  add(text('demo_dash_label', 'demo_hero_visual', 'Live campaign dashboard', 13, '800', C.deep, 'left', 20, 1, pad(0), fl('fill'), {}, 0, 'uppercase'));
  add(spacer('demo_dash_sp1', 'demo_hero_visual', 16));
  add(text('demo_dash_metric', 'demo_hero_visual', '+38%', 52, '800', C.deep, 'left', 62, 1));
  add(text('demo_dash_caption', 'demo_hero_visual', 'Qualified signups after publishing the new landing page.', 15, '500', C.slate, 'left', 48, 1.55));
  add(spacer('demo_dash_sp2', 'demo_hero_visual', 24));
  add(box('demo_dash_bar1', 'demo_hero_visual', 16, C.mint, C.teal, 90, 8, fl('fill'), false));
  add(box('demo_dash_bar2', 'demo_hero_visual', 16, C.coral, '#ffb199', 90, 8, fl('percent', 0, 'auto', 72), false));
  add(box('demo_dash_bar3', 'demo_hero_visual', 16, C.gold, '#f8dfa0', 90, 8, fl('percent', 0, 'auto', 54), false));
  add(spacer('demo_dash_sp3', 'demo_hero_visual', 26));
  add(text('demo_dash_rows', 'demo_hero_visual', 'Lead quality      94/100\nSpeed score       98/100\nMobile fit        Passed', 14, '600', C.slate, 'left', 84, 2));
  add(box('demo_visual_accent', 'demo_hero_visual', 80, C.coral, C.gold, 135, 8, fl('percent', 0, 'flex-end', 36), false));
  add(cell('demo_hero_visual', HERO, 6,
    ['demo_visual_accent', 'demo_dash_label', 'demo_dash_sp1', 'demo_dash_metric', 'demo_dash_caption', 'demo_dash_sp2', 'demo_dash_bar1', 'demo_dash_bar2', 'demo_dash_bar3', 'demo_dash_sp3', 'demo_dash_rows'],
    'column', 'stretch', 'center', 10, pad(54, 52, 54, 52),
    C.white, { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }, bdr(8, 1, C.line), 520));
  add(cell('demo_hero_copy', HERO, 6,
    ['demo_hero_kicker', 'demo_hero_sp1', 'demo_hero_title', 'demo_hero_sp2', 'demo_hero_body', 'demo_hero_sp3', 'demo_hero_primary', 'demo_hero_secondary', 'demo_hero_sp4', 'demo_hero_note'],
    'column', 'flex-start', 'center', 12, pad(96, 44, 96, 56), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  add(section(HERO, 'section', 'Hero', ['demo_hero_copy', 'demo_hero_visual'], secGrad('#f6fbf8', '#e3fff4', 145), 0, 0));

  const LOGOS = 'demo_logos';
  ['NORTHSTAR', 'PIXELWAVE', 'ORBITLY', 'STUDIO NINE'].forEach((name, i) => {
    const cid = `demo_logo_cell_${i}`;
    add(text(`demo_logo_text_${i}`, cid, name, 13, '800', i === 1 ? C.coral : i === 2 ? C.lavender : C.teal, 'center', 24, 1, pad(0), fl('fill'), {}, 0));
    add(cell(cid, LOGOS, 3, [`demo_logo_text_${i}`], 'column', 'center', 'center', 0, pad(26, 16), C.white,
      { tablet: { columnSpan: 6 }, mobile: { columnSpan: 6 } }, bdr(8, 1, C.line), 80));
  });
  add(section(LOGOS, 'section', 'Trust Logos', ['demo_logo_cell_0', 'demo_logo_cell_1', 'demo_logo_cell_2', 'demo_logo_cell_3'], secSolid(C.soft), 18, 18, pad(42, 48)));

  const FEATURES = 'demo_features';
  add(text('demo_features_kicker', 'demo_features_head', 'FEATURES', 12, '800', C.teal, 'center', 18, 1, pad(0), fl('fill'), {}, 0));
  add(spacer('demo_features_sp1', 'demo_features_head', 12));
  add(text('demo_features_title', 'demo_features_head', 'Built for production-looking pages', 40, '800', C.ink, 'center', 54, 1.2, pad(0), fl('fill'), {
    mobile: { style: { typography: { size: 28 } } },
  }));
  add(spacer('demo_features_sp2', 'demo_features_head', 12));
  add(text('demo_features_body', 'demo_features_head', 'Use real landing-page sections, not isolated parts, to show clients exactly what your builder can create today.', 16, '400', C.muted, 'center', 52, 1.65));
  add(cell('demo_features_head', FEATURES, 12, ['demo_features_kicker', 'demo_features_sp1', 'demo_features_title', 'demo_features_sp2', 'demo_features_body'],
    'column', 'center', 'flex-start', 0, pad(0, 60, 42, 60)));

  const featureData = [
    ['01', 'Responsive grid sections', 'Stack sections gracefully across desktop, tablet, and mobile without relying on complex effects.'],
    ['02', 'Reusable content blocks', 'Combine text, buttons, dividers, icons, cards, and media into polished marketing sections.'],
    ['03', 'Brand-ready styling', 'Control typography, color, spacing, borders, shadows, and background treatments from the builder.'],
    ['04', 'Export-friendly structure', 'The page can be exported as clean responsive HTML that keeps the designed hierarchy intact.'],
  ] as const;
  const featureCells: string[] = [];
  featureData.forEach(([num, title, body], i) => {
    const cid = `demo_feature_${i}`;
    featureCells.push(cid);
    add(text(`demo_feature_num_${i}`, cid, num, 13, '800', i === 1 ? C.coral : i === 2 ? C.lavender : C.teal, 'left', 20, 1, pad(0), fl('fill'), {}, 0));
    add(spacer(`demo_feature_sp_${i}`, cid, 14));
    add(text(`demo_feature_title_${i}`, cid, title, 20, '800', C.ink, 'left', 30, 1.2));
    add(spacer(`demo_feature_spb_${i}`, cid, 10));
    add(text(`demo_feature_body_${i}`, cid, body, 15, '400', C.slate, 'left', 82, 1.65));
    add(cell(cid, FEATURES, 3, [`demo_feature_num_${i}`, `demo_feature_sp_${i}`, `demo_feature_title_${i}`, `demo_feature_spb_${i}`, `demo_feature_body_${i}`],
      'column', 'flex-start', 'flex-start', 0, pad(30, 26), C.white,
      { tablet: { columnSpan: 6 }, mobile: { columnSpan: 12 } }, bdr(8, 1, C.line), 210));
  });
  add(section(FEATURES, 'section', 'Features', ['demo_features_head', ...featureCells], secSolid(C.white), 22, 22, pad(86, 48)));

  const PRODUCT = 'demo_product';
  add(text('demo_product_kicker', 'demo_product_copy', 'VISUAL WORKFLOW', 12, '800', C.teal, 'left', 18, 1, pad(0), fl('fill'), {}, 0));
  add(spacer('demo_product_sp1', 'demo_product_copy', 14));
  add(text('demo_product_title', 'demo_product_copy', 'A calm editing flow for fast marketing launches.', 38, '800', C.ink, 'left', 104, 1.2, pad(0), fl('fill'), {
    mobile: { style: { typography: { size: 28 } } },
  }));
  add(spacer('demo_product_sp2', 'demo_product_copy', 18));
  add(text('demo_product_body', 'demo_product_copy',
    'Plan the story, refine the layout, and publish a page that looks intentional across every viewport. Clearbase keeps marketing teams moving without turning launches into a design bottleneck.',
    16, '400', C.slate, 'left', 90, 1.7));
  add(spacer('demo_product_sp3', 'demo_product_copy', 22));
  add(text('demo_product_list', 'demo_product_copy', '+ Guided launch structure\n+ Card-based feature blocks\n+ Branded pricing sections\n+ Mobile-ready page flow', 15, '700', C.deep, 'left', 116, 2));
  add(cell('demo_product_copy', PRODUCT, 5,
    ['demo_product_kicker', 'demo_product_sp1', 'demo_product_title', 'demo_product_sp2', 'demo_product_body', 'demo_product_sp3', 'demo_product_list'],
    'column', 'flex-start', 'center', 0, pad(72, 56), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  add(image('demo_product_image', 'demo_product_visual',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1000&q=80',
    'Team reviewing a website dashboard', 420));
  add(cell('demo_product_visual', PRODUCT, 7, ['demo_product_image'], 'column', 'stretch', 'center', 0, pad(72, 56, 72, 0),
    'transparent', { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  add(section(PRODUCT, 'section', 'Product Story', ['demo_product_copy', 'demo_product_visual'], secSolid(C.soft), 36, 0));

  const TEST = 'demo_testimonials';
  add(text('demo_test_title', 'demo_test_head', 'Launch teams use Clearbase to move faster', 38, '800', C.white, 'center', 52, 1.2, pad(0), fl('fill'), {
    mobile: { style: { typography: { size: 27 } } },
  }));
  add(spacer('demo_test_sp1', 'demo_test_head', 12));
  add(text('demo_test_body', 'demo_test_head', 'Three short stories from teams building real campaigns with a visual builder.', 16, '400', '#bfe3dc', 'center', 32, 1.6));
  add(cell('demo_test_head', TEST, 12, ['demo_test_title', 'demo_test_sp1', 'demo_test_body'], 'column', 'center', 'flex-start', 0, pad(0, 60, 42, 60)));

  const quotes = [
    ['"We rebuilt our launch page in one afternoon and the exported HTML still looked like something our design team would approve."', 'Mira Patel', 'Growth Lead, Northstar'],
    ['"The section hierarchy is the win. We can show a full customer journey instead of dropping random components onto a page."', 'Owen Reed', 'Founder, Pixelwave'],
    ['"It feels realistic. Pricing, testimonials, CTAs, mobile structure, all the parts a client asks to see during a demo."', 'Leah Stone', 'Agency Partner, Studio Nine'],
  ] as const;
  const quoteCells: string[] = [];
  quotes.forEach(([quote, name, role], i) => {
    const cid = `demo_quote_${i}`;
    quoteCells.push(cid);
    add(text(`demo_quote_mark_${i}`, cid, '"', 44, '800', i === 1 ? C.coral : i === 2 ? C.gold : C.mint, 'left', 42, 1));
    add(text(`demo_quote_text_${i}`, cid, quote, 16, '500', C.ink, 'left', 124, 1.65));
    add(spacer(`demo_quote_sp_${i}`, cid, 22));
    add(divider(`demo_quote_div_${i}`, cid, C.line));
    add(spacer(`demo_quote_spb_${i}`, cid, 16));
    add(text(`demo_quote_name_${i}`, cid, name, 15, '800', C.ink, 'left', 22, 1));
    add(text(`demo_quote_role_${i}`, cid, role, 14, '400', C.muted, 'left', 22, 1));
    add(cell(cid, TEST, 4,
      [`demo_quote_mark_${i}`, `demo_quote_text_${i}`, `demo_quote_sp_${i}`, `demo_quote_div_${i}`, `demo_quote_spb_${i}`, `demo_quote_name_${i}`, `demo_quote_role_${i}`],
      'column', 'flex-start', 'flex-start', 0, pad(32, 28), C.white,
      { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }, bdr(8, 1, '#214f4a'), 340));
  });
  add(section(TEST, 'section', 'Testimonials', ['demo_test_head', ...quoteCells], secGrad(C.deep, '#092f42', 145), 22, 22, pad(84, 48)));

  const PRICING = 'demo_pricing';
  add(text('demo_price_kicker', 'demo_price_head', 'PRICING', 12, '800', C.teal, 'center', 18, 1, pad(0), fl('fill'), {}, 0));
  add(spacer('demo_price_sp1', 'demo_price_head', 12));
  add(text('demo_price_title', 'demo_price_head', 'Simple plans for every launch rhythm', 38, '800', C.ink, 'center', 52, 1.2, pad(0), fl('fill'), {
    mobile: { style: { typography: { size: 27 } } },
  }));
  add(spacer('demo_price_sp2', 'demo_price_head', 10));
  add(text('demo_price_body', 'demo_price_head', 'Show full pricing tables with clear hierarchy, useful details, and a focused call to action.', 16, '400', C.muted, 'center', 34, 1.6));
  add(cell('demo_price_head', PRICING, 12, ['demo_price_kicker', 'demo_price_sp1', 'demo_price_title', 'demo_price_sp2', 'demo_price_body'], 'column', 'center', 'flex-start', 0, pad(0, 60, 42, 60)));

  const plans = [
    ['Starter', '$19', 'For solo creators', '+ 3 published sites\n+ Basic templates\n+ Email support', 'Choose Starter', C.white, C.deep, C.teal],
    ['Studio', '$49', 'For growing teams', '+ Unlimited sites\n+ Shared brand styles\n+ Priority support\n+ Export HTML', 'Start Studio', C.deep, C.white, C.mint],
    ['Scale', 'Custom', 'For agencies', '+ Client workspaces\n+ Advanced permissions\n+ Launch support', 'Talk to sales', C.white, C.deep, C.coral],
  ] as const;
  const planCells: string[] = [];
  plans.forEach(([name, price, desc, features, cta, bg, fg, accent], i) => {
    const cid = `demo_plan_${i}`;
    planCells.push(cid);
    add(text(`demo_plan_name_${i}`, cid, name.toUpperCase(), 12, '800', accent, 'left', 18, 1, pad(0), fl('fill'), {}, 0));
    add(spacer(`demo_plan_sp_${i}`, cid, 12));
    add(text(`demo_plan_price_${i}`, cid, price, price === 'Custom' ? 38 : 48, '800', fg, 'left', 58, 1));
    add(text(`demo_plan_desc_${i}`, cid, desc, 14, '500', i === 1 ? '#bfe3dc' : C.muted, 'left', 24, 1));
    add(spacer(`demo_plan_spb_${i}`, cid, 20));
    add(divider(`demo_plan_div_${i}`, cid, i === 1 ? '#315d58' : C.line));
    add(spacer(`demo_plan_spc_${i}`, cid, 20));
    add(text(`demo_plan_features_${i}`, cid, features, 15, '600', i === 1 ? '#ecfffb' : C.slate, 'left', 118, 2));
    add(spacer(`demo_plan_spd_${i}`, cid, 28));
    add(button(`demo_plan_btn_${i}`, cid, cta, i === 1 ? C.white : C.deep, i === 1 ? C.deep : C.white, pad(13, 22), fl('fill')));
    add(cell(cid, PRICING, 4,
      [`demo_plan_name_${i}`, `demo_plan_sp_${i}`, `demo_plan_price_${i}`, `demo_plan_desc_${i}`, `demo_plan_spb_${i}`, `demo_plan_div_${i}`, `demo_plan_spc_${i}`, `demo_plan_features_${i}`, `demo_plan_spd_${i}`, `demo_plan_btn_${i}`],
      'column', 'stretch', 'flex-start', 0, pad(34, 30), bg,
      { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }, bdr(8, 1, i === 1 ? C.deep : C.line), 430));
  });
  add(section(PRICING, 'section', 'Pricing', ['demo_price_head', ...planCells], secSolid(C.white), 22, 22, pad(86, 48)));

  const CTA = 'demo_cta';
  add(text('demo_cta_kicker', 'demo_cta_main', 'READY TO SHOWCASE THE BUILDER?', 12, '800', C.aqua, 'center', 18, 1, pad(0), fl('fill'), {}, 0));
  add(spacer('demo_cta_sp1', 'demo_cta_main', 14));
  add(text('demo_cta_title', 'demo_cta_main', 'Build a page that feels finished from the first screen to the footer.', 42, '800', C.white, 'center', 108, 1.2, pad(0), fl('fill'), {
    mobile: { style: { typography: { size: 28 } } },
  }));
  add(spacer('demo_cta_sp2', 'demo_cta_main', 18));
  add(text('demo_cta_body', 'demo_cta_main', 'This demo is intentionally realistic: strong spacing, clear hierarchy, testimonials, pricing, CTA, footer, and responsive section behavior.', 17, '400', '#c7eee5', 'center', 56, 1.65));
  add(spacer('demo_cta_sp3', 'demo_cta_main', 34));
  add(button('demo_cta_btn', 'demo_cta_main', 'Start a free build', C.white, C.deep, pad(15, 28), fl('auto')));
  add(cell('demo_cta_main', CTA, 12,
    ['demo_cta_kicker', 'demo_cta_sp1', 'demo_cta_title', 'demo_cta_sp2', 'demo_cta_body', 'demo_cta_sp3', 'demo_cta_btn'],
    'column', 'center', 'flex-start', 0, pad(92, 80), 'transparent'));
  add(section(CTA, 'section', 'CTA', ['demo_cta_main'], secGrad(C.teal, C.deep, 135), 0, 0));

  const FOOT = 'demo_footer';
  add(text('demo_foot_brand', 'demo_foot_about', 'Clearbase', 22, '800', C.white, 'left', 32, 1, pad(0), fl('auto')));
  add(spacer('demo_foot_sp1', 'demo_foot_about', 12));
  add(text('demo_foot_desc', 'demo_foot_about', 'A focused workspace for teams that need to launch thoughtful, responsive marketing pages without slowing down.', 14, '400', '#9cc9c0', 'left', 72, 1.7));
  add(spacer('demo_foot_sp2', 'demo_foot_about', 18));
  add(text('demo_foot_copy', 'demo_foot_about', 'Copyright 2026 Clearbase Inc. All rights reserved.', 12, '600', '#6da79b', 'left', 22, 1.4));
  add(cell('demo_foot_about', FOOT, 5, ['demo_foot_brand', 'demo_foot_sp1', 'demo_foot_desc', 'demo_foot_sp2', 'demo_foot_copy'],
    'column', 'flex-start', 'flex-start', 0, pad(48, 42), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  add(text('demo_foot_product_title', 'demo_foot_product', 'PRODUCT', 12, '800', C.white, 'left', 18, 1, pad(0), fl('fill'), {}, 0));
  add(divider('demo_foot_product_div', 'demo_foot_product', '#245d55'));
  add(text('demo_foot_product_links', 'demo_foot_product', 'Builder\nTemplates\nExport\nResponsive', 14, '500', '#9cc9c0', 'left', 92, 2.2));
  add(cell('demo_foot_product', FOOT, 3, ['demo_foot_product_title', 'demo_foot_product_div', 'demo_foot_product_links'],
    'column', 'flex-start', 'flex-start', 0, pad(48, 28), 'transparent',
    { tablet: { columnSpan: 6 }, mobile: { columnSpan: 6 } }));
  add(text('demo_foot_company_title', 'demo_foot_company', 'COMPANY', 12, '800', C.white, 'left', 18, 1, pad(0), fl('fill'), {}, 0));
  add(divider('demo_foot_company_div', 'demo_foot_company', '#245d55'));
  add(text('demo_foot_company_links', 'demo_foot_company', 'About\nCustomers\nPricing\nContact', 14, '500', '#9cc9c0', 'left', 92, 2.2));
  add(cell('demo_foot_company', FOOT, 2, ['demo_foot_company_title', 'demo_foot_company_div', 'demo_foot_company_links'],
    'column', 'flex-start', 'flex-start', 0, pad(48, 28), 'transparent',
    { tablet: { columnSpan: 6 }, mobile: { columnSpan: 6 } }));
  add(text('demo_foot_contact_title', 'demo_foot_contact', 'CONTACT', 12, '800', C.white, 'left', 18, 1, pad(0), fl('fill'), {}, 0));
  add(divider('demo_foot_contact_div', 'demo_foot_contact', '#245d55'));
  add(text('demo_foot_contact_links', 'demo_foot_contact', 'hello@clearbase.io\nSan Francisco, CA\nLinkedIn / X', 14, '500', '#9cc9c0', 'left', 74, 2.1));
  add(cell('demo_foot_contact', FOOT, 2, ['demo_foot_contact_title', 'demo_foot_contact_div', 'demo_foot_contact_links'],
    'column', 'flex-start', 'flex-start', 0, pad(48, 28, 48, 12), 'transparent',
    { tablet: { columnSpan: 12 }, mobile: { columnSpan: 12 } }));
  add(section(FOOT, 'footer', 'Footer', ['demo_foot_about', 'demo_foot_product', 'demo_foot_company', 'demo_foot_contact'], secSolid(C.deep), 0, 0));

  const pageId = 'demo_page_clearbase';
  return {
    schema: '2.0',
    site: { name: 'Clearbase', favicon: '', language: 'en' },
    theme: {
      colors: {
        primary: C.teal,
        secondary: C.mint,
        text: C.ink,
        background: C.white,
        light: C.soft,
        accent: C.coral,
        sectionBg: '#f8f9fa',
      },
      fonts: { body: 'Inter, sans-serif' },
    },
    pages: [{
      id: pageId,
      name: 'Clearbase SaaS Demo',
      slug: '/',
      seo: {
        title: 'Clearbase - Modern SaaS Builder Demo',
        description: 'A polished production-style SaaS landing page built inside the microsite builder.',
        ogImage: '',
      },
      header: HDR,
      footer: FOOT,
      sections: [HERO, LOGOS, FEATURES, PRODUCT, TEST, PRICING, CTA],
    }],
    activePageId: pageId,
    nodes: nodes as BuilderState['nodes'],
  };
}
