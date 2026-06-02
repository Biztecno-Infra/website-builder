export type ElementType = 'text' | 'image' | 'button' | 'box' | 'divider' | 'video' | 'spacer' | 'icon' | 'form';
export type TextAlign = 'left' | 'center' | 'right';
export type ObjectFit = 'cover' | 'contain' | 'fill';
export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted';
export type BgType = 'solid' | 'linear-gradient' | 'radial-gradient';
export type AnimationType = 'none' | 'fade-in' | 'slide-up' | 'slide-left' | 'zoom-in';
export type AnimationTrigger = 'load' | 'scroll';
export type Breakpoint = 'desktop' | 'large-desktop' | 'tablet' | 'mobile';
export type SectionRole = 'header' | 'footer' | 'section';
export type SectionLayoutMode = 'free' | 'grid';
export type CellLayoutMode = 'column' | 'row' | 'wrap' | 'free';
export type FlexWidthMode = 'fill' | 'auto' | 'fixed' | 'percent';

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

export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

export interface Typography {
  family: string;
  size: number;
  weight: string;
  color: string;
  align: TextAlign;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: TextTransform;
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
  iconSvg?: string;
  orientation?: 'horizontal' | 'vertical';
  // ── Form element ──
  formFields?: FormField[];
  /** px gap between fields in the form's wrapping flex layout */
  fieldGap?: number;
  /** label shown on the form's submit button */
  submitLabel?: string;
}

// ── Form field model ───────────────────────────────────────────────────

export type FormFieldType =
  | 'text' | 'email' | 'number' | 'textarea'
  | 'select' | 'checkbox' | 'radio' | 'date';

export type ValidationPreset = 'none' | 'email' | 'url' | 'number';

export interface FormFieldValidation {
  preset?: ValidationPreset;
  minLength?: number;
  maxLength?: number;
  /** number/date min/max — number for 'number', ISO date string for 'date' */
  min?: number | string;
  max?: number | string;
  /** raw regex source (no slashes) */
  pattern?: string;
  errorMessage?: string;
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  /** visible label */
  label: string;
  /** submission key — used as the input name */
  name: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  required: boolean;
  /** layout width within the form's wrapping flex row */
  width: 'full' | 'half';
  validation: FormFieldValidation;
  /** select / radio / checkbox choices */
  options?: FormFieldOption[];
  /** textarea row count */
  rows?: number;
}

// ── Action model (shared by buttons + form submit) ──────────────────────

export type ActionType =
  | 'none'
  | 'submit-form'
  | 'external-url'
  | 'internal-page'
  | 'send-email'
  | 'make-call'
  | 'send-sms'
  | 'download-file'
  | 'open-popup'
  | 'scroll-to-section'
  | 'scroll-to-top';

export interface ElementAction {
  type: ActionType;
  /** external-url / download-file */
  url?: string;
  /** external-url link target */
  target?: '_self' | '_blank';
  /** internal-page */
  pageId?: string;
  /** send-email — and the recipient for a submit-form action */
  email?: string;
  subject?: string;
  /** send-email body / send-sms message */
  body?: string;
  /** make-call / send-sms */
  phone?: string;
  /** open-popup */
  popupId?: string;
  /** scroll-to-section */
  targetSectionId?: string;
  /** scroll-to-section / scroll-to-top */
  smoothScroll?: boolean;
}

export type InteractionType = 'link' | 'scroll-to-section' | 'scroll-to-top';

export interface ElementInteraction {
  type: InteractionType;
  linkUrl: string;
  linkTarget: '_self' | '_blank';
  targetSectionId?: string;
  smoothScroll: boolean;
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
  typography?: Partial<Pick<Typography, 'size' | 'weight' | 'align' | 'letterSpacing' | 'textTransform'>>;
}

export interface BreakpointOverride {
  layout?: ResponsiveLayout;
  style?: ResponsiveStyle;
  state?: Partial<ElementState>;
  flexLayout?: Partial<FlexItemLayout>;
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
  /** @deprecated legacy click model — migrated into `action` on load, kept for back-compat hydration */
  interaction: ElementInteraction;
  /** unified click/submit behavior — shared by buttons and form submit */
  action?: ElementAction;
  animation: ElementAnimation;
  state: ElementState;
  responsive: ElementResponsive;
  flexLayout: FlexItemLayout;
  overlayInCell?: boolean;
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
  padding: Padding;
  border?: Border;
}

export interface SectionLayout {
  height: number;
}

export type ContentWidthMode = 'constrained' | 'full' | 'fluid';

export interface GridConfig {
  gap: number;
  rowGap: number;
  minHeight?: number;
  rowHeight?: number;
  contentWidth?: ContentWidthMode;
  maxWidth?: number;
}

// ── Section node — discriminated union ────────────────────────────────

export type SectionScrollBehavior = 'normal' | 'sticky' | 'fixed';

export interface SectionResponsive {
  tablet?: { height?: number; gap?: number; rowGap?: number; padding?: Partial<Padding>; hidden?: boolean };
  mobile?: { height?: number; gap?: number; rowGap?: number; padding?: Partial<Padding>; hidden?: boolean };
}

interface SectionBase {
  id: string;
  type: 'section';
  role: SectionRole;
  label: string;
  layout: SectionLayout;
  style: SectionStyle;
  scrollBehavior?: SectionScrollBehavior;
  stickyOffset?: number;
  responsive?: SectionResponsive;
  hidden?: boolean;
}

export interface FreeSection extends SectionBase {
  layoutMode: 'free';
  children: string[];  // CanvasElement IDs
}

export interface GridSection extends SectionBase {
  layoutMode: 'grid';
  children: string[];  // GridCell IDs
  grid: GridConfig;
}

export type Section = FreeSection | GridSection;

// Used in all update-operation signatures — covers fields from both variants.
export type SectionUpdate = {
  role?: SectionRole;
  label?: string;
  layout?: SectionLayout;
  style?: SectionStyle;
  layoutMode?: SectionLayoutMode;
  children?: string[];
  grid?: GridConfig;
  scrollBehavior?: SectionScrollBehavior;
  stickyOffset?: number;
  responsive?: SectionResponsive;
};

export interface FlexItemLayout {
  widthMode: FlexWidthMode;
  widthValue: number;
  flexGrow: number;
  alignSelf: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch';
}

export interface GridCellStyle {
  layoutMode: CellLayoutMode;
  gap: number;
  padding: Padding;
  background: SectionBackground;
  border?: Border;
  minHeight?: number;
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
}

export interface GridCellBpOverride {
  columnSpan?: number;
  hidden?: boolean;
  layoutMode?: CellLayoutMode;
  minHeight?: number;
  freeHeight?: number;
  alignItems?: GridCellStyle['alignItems'];
  justifyContent?: GridCellStyle['justifyContent'];
  padding?: Partial<Padding>;
}

export interface GridCellResponsive {
  tablet?: GridCellBpOverride;
  mobile?: GridCellBpOverride;
}

export interface GridCell {
  id: string;
  type: 'grid-cell';
  parent: string;
  columnSpan: number;
  rowSpan: number;
  style: GridCellStyle;
  children: string[];
  responsive: GridCellResponsive;
  freeHeight?: number;
}

// ── Container — layout wrapper that lives inside a GridCell ───────────
// layoutMode controls how sub-cells (GridCell children) are arranged:
//   'grid'     → 12-column CSS grid (column spans apply)
//   'flex-col' → flex column stack (full-width cells)
//   'flex-row' → flex row (cells grow equally)

export type ContainerLayoutMode = 'grid' | 'flex-col' | 'flex-row';

export interface ContainerResponsive {
  tablet?: { layoutMode?: ContainerLayoutMode };
  mobile?: { layoutMode?: ContainerLayoutMode };
}

export interface Container {
  id: string;
  type: 'container';
  parent: string; // parent GridCell ID
  children: string[]; // GridCell IDs
  layoutMode: ContainerLayoutMode;
  gap: number;
  rowGap: number;
  responsive?: ContainerResponsive;
}

/** @deprecated use Container */
export type ColumnsBlock = Container;

// ── Nodes flat map ─────────────────────────────────────────────────────

export type AnyNode = Section | GridCell | CanvasElement | Container;
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
  sections: string[];  // All sections in render order — role on each node determines header/footer identity
  layoutWidth?: 'fixed' | 'fluid';  // default 'fixed'
  maxWidth?: number;                 // default 1200, used when layoutWidth is 'fixed'
}

// ── Site & Theme ───────────────────────────────────────────────────────

export interface SiteMetadata {
  name: string;
  favicon: string;
  language: string;
}

export interface ThemeColors {
  primary: string;    // buttons, icons — applied on element creation + Apply Theme
  text: string;       // all text elements — applied on creation + Apply Theme + export body color
  background: string; // page/body background — export only + Apply Theme sections
  light: string;      // box/divider elements — applied on creation + Apply Theme
  accent: string;     // accent buttons — Apply Theme only
  sectionBg: string;  // new section default bg — applied on section creation + Apply Theme
  secondary?: string; // kept for JSON back-compat only — not exposed in UI
}

export interface SiteTheme {
  colors: ThemeColors;
  fonts: {
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
