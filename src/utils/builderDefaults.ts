import type {
  ElementAnimation, ElementBackground, ElementContent, ElementInteraction,
  ElementStyle, FlexItemLayout, GridCellStyle, Padding, SectionBackground,
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
export const DEFAULT_ANIMATION: ElementAnimation = { type: 'none', trigger: 'load', duration: 600, delay: 0 };

export const DEFAULT_THEME: SiteTheme = {
  colors: { primary: '#006e75', secondary: '#0b978e', text: '#333333', background: '#ffffff', light: '#f5f5f5', accent: '#e74c3c', sectionBg: '#ffffff' },
  fonts: { body: 'Inter, sans-serif' },
};

export const DEFAULT_FLEX_LAYOUT: FlexItemLayout = {
  widthMode: 'fill',
  widthValue: 0,
  flexGrow: 0,
  alignSelf: 'auto',
};

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
