export type ElementType = 'text' | 'image' | 'button' | 'box' | 'divider' | 'video' | 'spacer' | 'icon';
export type TextAlign = 'left' | 'center' | 'right';
export type ObjectFit = 'cover' | 'contain' | 'fill';
export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted';
export type BgType = 'solid' | 'linear-gradient' | 'radial-gradient';
export type AnimationType = 'none' | 'fade-in' | 'slide-up' | 'slide-left' | 'zoom-in';
export type AnimationTrigger = 'load' | 'scroll';
export type Breakpoint = 'desktop' | 'tablet' | 'mobile';
export type SectionRole = 'header' | 'footer' | 'section';

// ── Style primitives ───────────────────────────────────────────────────

export interface ElementBackground {
  type: BgType;
  color: string;
  image: string;
  position: string;
  from: string;
  to: string;
  angle: number;
}

export interface SectionBackground extends ElementBackground {
  overlay: number;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Border {
  radius: number;
  width: number;
  color: string;
  style: BorderStyle;
}

export interface Shadow {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

export interface Typography {
  family: string;
  size: number;
  weight: string;
  color: string;
  align: TextAlign;
  lineHeight: number;
}

// ── Element sub-structures ─────────────────────────────────────────────

export interface ElementLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation: number;
}

export interface ElementStyle {
  opacity: number;
  background: ElementBackground;
  padding: Padding;
  border: Border;
  shadow: Shadow;
  typography: Typography;
}

export interface ElementContent {
  plain?: string;
  rich?: string;
  src?: string;
  alt?: string;
  objectFit?: ObjectFit;
  label?: string;
  videoUrl?: string;
  iconName?: string;
  iconSize?: number;
}

export interface ElementInteraction {
  linkUrl: string;
  linkTarget: '_self' | '_blank';
}

export interface ElementState {
  hidden: boolean;
  locked: boolean;
}

export interface ElementAnimation {
  type: AnimationType;
  trigger: AnimationTrigger;
  duration: number;
  delay: number;
}

export interface ResponsiveLayout {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface ResponsiveStyle {
  typography?: Partial<Pick<Typography, 'size' | 'weight' | 'align'>>;
}

export interface BreakpointOverride {
  layout?: ResponsiveLayout;
  style?: ResponsiveStyle;
  state?: Partial<ElementState>;
}

export interface ElementResponsive {
  tablet?: BreakpointOverride;
  mobile?: BreakpointOverride;
}

// ── CanvasElement node ─────────────────────────────────────────────────

export interface CanvasElement {
  id: string;
  type: ElementType;
  parent: string;
  layout: ElementLayout;
  style: ElementStyle;
  content: ElementContent;
  interaction: ElementInteraction;
  animation: ElementAnimation;
  state: ElementState;
  responsive: ElementResponsive;
}

// ── Section column ─────────────────────────────────────────────────────

export interface ColumnStyle {
  background?: Partial<SectionBackground>;
}

export interface SectionColumns {
  count: number;
  widths: number[];
  styles: Record<string, ColumnStyle>;
}

export interface SectionStyle {
  background: SectionBackground;
  columns: SectionColumns;
}

export interface SectionLayout {
  height: number;
}

// ── Section node ───────────────────────────────────────────────────────

export interface Section {
  id: string;
  type: 'section';
  role: SectionRole;
  label: string;
  layout: SectionLayout;
  style: SectionStyle;
  children: string[];
}

// ── Nodes flat map ─────────────────────────────────────────────────────

export type AnyNode = Section | CanvasElement;
export type NodeMap = Record<string, AnyNode>;

// ── Page ───────────────────────────────────────────────────────────────

export interface PageSEO {
  title: string;
  description: string;
  ogImage: string;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  seo: PageSEO;
  header: string;
  footer: string;
  sections: string[];
}

// ── Site & Theme ───────────────────────────────────────────────────────

export interface SiteMetadata {
  name: string;
  favicon: string;
  language: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  text: string;
  background: string;
  light: string;
  accent: string;
}

export interface SiteTheme {
  colors: ThemeColors;
  fonts: {
    heading: string;
    body: string;
  };
}

// ── BuilderState ───────────────────────────────────────────────────────

export interface BuilderState {
  schema: string;
  site: SiteMetadata;
  theme: SiteTheme;
  pages: Page[];
  activePageId: string;
  nodes: NodeMap;
}
