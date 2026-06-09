import type {
  CarouselProps, ElementAction, ElementAnimation, ElementBackground, ElementContent, ElementInteraction,
  ElementStyle, FlexItemLayout, FormField, GridCellStyle, Padding, SectionBackground,
  SiteTheme, TextTransform,
} from '../types';

export const DEFAULT_BG: ElementBackground = {
  type: 'solid', color: 'transparent', image: '', position: 'center',
  from: '#006e75', to: '#0b978e', angle: 135,
};

export const DEFAULT_SECTION_BG: SectionBackground = {
  type: 'solid', color: '#ffffff', image: '', position: 'center',
  from: '#006e75', to: '#0b978e', angle: 135, overlay: 0,
};

export const DEFAULT_STYLE: ElementStyle = {
  opacity: 1,
  background: { ...DEFAULT_BG },
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  border: { radius: 0, width: 0, color: '#cccccc', style: 'solid' },
  shadow: { enabled: false, x: 4, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.2)' },
  typography: { family: 'Inter, sans-serif', size: 16, weight: 'normal', color: '#333333', align: 'left', lineHeight: 1.5, letterSpacing: 0, textTransform: 'none' as TextTransform },
};

export const DEFAULT_CONTENT: ElementContent = {
  plain: '', rich: '',
  src: '', alt: '', objectFit: 'cover',
  label: '',
  videoUrl: '',
  iconName: '★', iconSize: 40,
};

export const DEFAULT_INTERACTION: ElementInteraction = { type: 'link', linkUrl: '', linkTarget: '_self', smoothScroll: false };
export const DEFAULT_ACTION: ElementAction = { type: 'none', target: '_self', smoothScroll: true };
export const DEFAULT_ANIMATION: ElementAnimation = { type: 'none', trigger: 'load', duration: 600, delay: 0 };

// Default fields for a freshly-dropped Form element.
export function defaultFormFields(): FormField[] {
  return [
    { id: 'ff_name',  type: 'text',     label: 'Name',    name: 'name',    placeholder: 'Your name',          helpText: '', defaultValue: '', required: true,  width: 'full', validation: {} },
    { id: 'ff_email', type: 'email',    label: 'Email',   name: 'email',   placeholder: 'you@example.com',    helpText: '', defaultValue: '', required: true,  width: 'full', validation: { preset: 'email' } },
    { id: 'ff_msg',   type: 'textarea', label: 'Message', name: 'message', placeholder: 'How can we help?',   helpText: '', defaultValue: '', required: false, width: 'full', validation: {}, rows: 4 },
  ];
}

// Migrate the legacy `interaction` model onto the unified `action` model.
// Returns null when there is nothing meaningful to migrate.
export function interactionToAction(i: ElementInteraction | undefined): ElementAction | null {
  if (!i) return null;
  if (i.type === 'scroll-to-section') {
    if (!i.targetSectionId) return null;
    return { type: 'scroll-to-section', targetSectionId: i.targetSectionId, smoothScroll: i.smoothScroll };
  }
  if (i.type === 'scroll-to-top') {
    return { type: 'scroll-to-top', smoothScroll: i.smoothScroll };
  }
  if (i.linkUrl) {
    return { type: 'external-url', url: i.linkUrl, target: i.linkTarget };
  }
  return null;
}

export const DEFAULT_THEME: SiteTheme = {
  colors: { primary: '#006e75', text: '#333333', background: '#ffffff', light: '#f5f5f5', accent: '#e74c3c', sectionBg: '#ffffff' },
  fonts: { body: 'Inter, sans-serif' },
};

export const DEFAULT_FLEX_LAYOUT: FlexItemLayout = {
  widthMode: 'fill',
  widthValue: 0,
  flexGrow: 0,
  alignSelf: 'auto',
};

// Default behaviour for a freshly-dropped Carousel. Phase-2 fields are
// included so old/new data shares one shape and never needs migration.
export const DEFAULT_CAROUSEL_PROPS: CarouselProps = {
  autoplay: false,
  autoplayInterval: 5,
  loop: true,
  showArrows: true,
  showDots: true,
  transition: 'slide',
  transitionDuration: 400,
  slidesPerView: 1,
  pauseOnHover: true,
};

/** Default visible height (px) of a carousel band. */
export const DEFAULT_CAROUSEL_HEIGHT = 420;

/** Number of slides created when a carousel is first dropped. */
export const DEFAULT_CAROUSEL_SLIDE_COUNT = 3;

export const DEFAULT_GRID_CELL_STYLE: GridCellStyle = {
  layoutMode: 'column',
  gap: 8,
  padding: { top: 12, right: 12, bottom: 12, left: 12 } as Padding,
  background: { ...DEFAULT_BG, overlay: 0 },
  border: { radius: 0, width: 0, color: '#cccccc', style: 'none' },
  minHeight: undefined,
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
};
