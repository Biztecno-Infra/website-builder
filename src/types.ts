export type ElementType = 'text' | 'image' | 'button' | 'box' | 'divider' | 'video' | 'spacer' | 'icon' | 'form';
export type TextAlign = 'left' | 'center' | 'right';
export type ObjectFit = 'cover' | 'contain' | 'fill';
export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted';
export type BgType = 'solid' | 'linear-gradient' | 'radial-gradient' | 'transparent';
export type Breakpoint = 'desktop' | 'large-desktop' | 'tablet' | 'mobile';
export type SectionRole = 'header' | 'footer' | 'section';
export type SectionLayoutMode = 'free' | 'grid' | 'flex';
export type CellLayoutMode = 'column' | 'row' | 'wrap';
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

// Phase 1 button hover: a single enabled toggle + optional hover colors + the
// transition duration. Colors are optional so an unconfigured value falls back
// to the element's default (non-hover) style. Kept intentionally minimal — no
// scale/shadow/animation/active/disabled state.
export interface ElementHover {
  enabled: boolean;
  backgroundColor?: string;
  textColor?: string;
  transitionDuration: number; // milliseconds
}

export interface ElementStyle {
  opacity: number;
  background: ElementBackground;
  padding: Padding;
  margin?: Partial<Padding>;
  border: Border;
  shadow: Shadow;
  typography: Typography;
  hover?: ElementHover;
}

export interface ElementContent {
  plain?: string;
  rich?: string;
  src?: string;
  alt?: string;
  objectFit?: ObjectFit;
  objectPosition?: string;
  linkUrl?: string;
  label?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
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
  | 'submit-api'
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
  /** submit-api — endpoint the form/button sends its request to */
  apiUrl?: string;
  /** submit-api — HTTP method used for the request */
  apiMethod?: 'POST' | 'PUT' | 'PATCH';
  /** submit-api on a standalone button — optional static JSON request body */
  apiBody?: string;
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

export interface ResponsiveStyle {
  typography?: Partial<Pick<Typography, 'size' | 'weight' | 'align' | 'letterSpacing' | 'textTransform'>>;
}

export interface BreakpointOverride {
  layout?: Partial<ElementLayout>;
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
  state: ElementState;
  responsive: ElementResponsive;
  flexLayout: FlexItemLayout;
  overlayInCell?: boolean;
  cssPosition?: 'relative' | 'absolute' | 'fixed' | 'sticky';
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
  margin?: Padding;
  border?: Border;
  shadow?: Shadow;
}

export type SectionCssPosition = 'relative' | 'absolute' | 'fixed' | 'sticky';

export interface SectionLayout {
  height: number;
}

export type ContentWidthMode = 'constrained' | 'full';

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
  cssPosition?: SectionCssPosition;
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

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type FlexJustify = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
export type FlexAlign = 'flex-start' | 'center' | 'flex-end' | 'stretch';

export interface FlexConfig {
  direction: FlexDirection;
  justify: FlexJustify;
  align: FlexAlign;
  wrap: boolean;
}

export interface FlexSection extends SectionBase {
  layoutMode: 'flex';
  children: string[];  // GridCell IDs (same structure as grid sections)
  grid: GridConfig;    // reused for gap, maxWidth etc.
  flex: FlexConfig;
}

export type Section = FreeSection | GridSection | FlexSection;

// Used in all update-operation signatures — covers fields from both variants.
export type SectionUpdate = {
  role?: SectionRole;
  label?: string;
  layout?: SectionLayout;
  style?: SectionStyle;
  layoutMode?: SectionLayoutMode;
  children?: string[];
  grid?: GridConfig;
  flex?: FlexConfig;
  scrollBehavior?: SectionScrollBehavior;
  stickyOffset?: number;
  cssPosition?: SectionCssPosition;
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

// ── Carousel — slide container that lives in a Section ───────────────────
// A Carousel sits in a Section's children (parallel to a free element).
// Its children are GridCell nodes acting as slides — reusing ALL grid-cell
// behaviour (drop, style, responsive, copy/paste, clone, delete, layers).
// Only one slide is shown at a time; the rest are Phase-2 surface area.


export interface CarouselProps {
  autoplay: boolean;
  /** seconds between auto-advances when autoplay is on */
  autoplayInterval: number;
  loop: boolean;
  showArrows: boolean;
  showDots: boolean;
  // ── Phase 2 surface (optional, defaulted on read so old data stays valid) ──
  /** transition duration in ms */
  transitionDuration?: number;
  /** pause autoplay while the pointer is over the carousel */
  pauseOnHover?: boolean;
  /** color of the slide-indicator dots (active = full, inactive = faded). Defaults to white. */
  dotColor?: string;
}

// Per-breakpoint overrides. x/y/width let a free-positioned carousel be moved /
// resized independently on tablet & mobile (mirrors CanvasElement responsive layout);
// they're unscaled values in the breakpoint's own canvas space.
export interface CarouselBpOverride {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  minHeight?: number;
  hidden?: boolean;
}

export interface CarouselResponsive {
  tablet?: CarouselBpOverride;
  mobile?: CarouselBpOverride;
}

export interface CarouselLayout {
  /** free position within the parent free-section, like a CanvasElement */
  x: number;
  y: number;
  /** box width in px (was previously always full section width) */
  width: number;
  /** fixed content height in px */
  height: number;
  zIndex?: number;
  minHeight?: number;
}

export interface Carousel {
  id: string;
  type: 'carousel';
  parent: string;      // parent Section ID
  children: string[];  // GridCell IDs — each one is a slide
  props: CarouselProps;
  layout: CarouselLayout;
  responsive?: CarouselResponsive;
  /** editor-only: index of the slide currently shown on the canvas (not exported) */
  activeSlide?: number;
}

// ── Accordion — stacked collapsible container that lives in a Section ─────
// An Accordion sits in a Section's children OR a GridCell's children (parallel
// to a free element / carousel). Each item has a header (a Text element + an
// Icon element, laid out space-between) and a content GridCell — reusing ALL
// element + grid-cell behaviour (drop, style, responsive, copy/paste, clone,
// delete, layers) so there is no duplicate container implementation.

// One collapsible row. titleElId / iconElId are CanvasElement ids (text + icon);
// contentCellId is a GridCell id acting as the droppable panel.
export interface AccordionItem {
  id: string;
  titleElId: string;   // 'text' CanvasElement — the editable heading
  iconElId: string;    // 'icon' CanvasElement — the chevron / custom icon
  contentCellId: string; // GridCell — the expandable droppable content area
}

export interface AccordionProps {
  /** allow multiple items open at once; when false, opening one closes the others */
  allowMultiple: boolean;
  /** which items are open by default in the published page: 'first' | 'all' | 'none' */
  defaultOpen: 'first' | 'all' | 'none';
  /** icon side within the header row */
  iconPosition: 'right' | 'left';
  /** degrees to rotate the icon when an item is expanded. Default 180. */
  expandedIconRotation?: number;
  /** gap (px) between the header row and the content panel */
  contentGap?: number;
  /** gap (px) between stacked accordion items */
  itemGap: number;
  /** draw a border around the whole accordion (outer box). Default true. */
  containerBorder?: boolean;
  /** draw divider lines between items. Default true. */
  itemDivider?: boolean;
  /** border/divider color (shared by container border and item dividers) */
  separatorColor?: string;
  /** border/divider thickness in px (shared) */
  separatorWidth?: number;
  /** border/divider line style (shared) */
  separatorStyle?: 'solid' | 'dashed' | 'dotted';
  /** corner radius (px) for the container border box */
  borderRadius?: number;
}

// Per-breakpoint overrides — mirror CarouselBpOverride (unscaled canvas-space
// geometry so a free-positioned accordion can be moved/resized per breakpoint).
export interface AccordionBpOverride {
  x?: number;
  y?: number;
  width?: number;
  hidden?: boolean;
}

export interface AccordionResponsive {
  tablet?: AccordionBpOverride;
  mobile?: AccordionBpOverride;
}

export interface AccordionLayout {
  /** free position within the parent free-section, like a CanvasElement */
  x: number;
  y: number;
  /** box width in px */
  width: number;
  zIndex?: number;
}

export interface Accordion {
  id: string;
  type: 'accordion';
  parent: string;          // parent Section OR GridCell id
  children: string[];      // unused at the node level — items hold the real children
  items: AccordionItem[];  // ordered collapsible rows
  props: AccordionProps;
  layout: AccordionLayout;
  responsive?: AccordionResponsive;
  /** editor-only: ids of items currently expanded on the canvas (not exported) */
  activeItems?: string[];
}

// ── Nodes flat map ─────────────────────────────────────────────────────

export type AnyNode = Section | GridCell | CanvasElement | Container | Carousel | Accordion;
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
  maxWidth?: number;                 // default 1280, used when layoutWidth is 'fixed'
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
    heading?: string;
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
