import type { SelectOption } from '../components/PbSelect';
import type { TextTag } from '../types';

export const FONT_WEIGHT_OPTIONS: SelectOption[] = [
  { value: '100', label: 'Thin (100)' },
  { value: '200', label: 'ExtraLight (200)' },
  { value: '300', label: 'Light (300)' },
  { value: 'normal', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'SemiBold (600)' },
  { value: 'bold', label: 'Bold (700)' },
  { value: '800', label: 'ExtraBold (800)' },
  { value: '900', label: 'Heavy (900)' },
];

// Single source of truth for text "Style" presets — both the dropdown labels
// (which show the size right in the option, e.g. "Heading 1 (40px)") and the
// size/weight actually applied when a preset is picked (see ElementPanelContent).
export const TEXT_STYLE_PRESETS: Record<TextTag, { label: string; size: number; weight: string }> = {
  h1: { label: 'Heading 1', size: 40, weight: 'bold' },
  h2: { label: 'Heading 2', size: 34, weight: 'bold' },
  h3: { label: 'Heading 3', size: 28, weight: '600' },
  h4: { label: 'Heading 4', size: 24, weight: '600' },
  h5: { label: 'Heading 5', size: 20, weight: '500' },
  h6: { label: 'Heading 6', size: 18, weight: '500' },
  p1: { label: 'Paragraph 1', size: 18, weight: 'normal' },
  p2: { label: 'Paragraph 2', size: 16, weight: 'normal' },
  p3: { label: 'Paragraph 3', size: 14, weight: 'normal' },
};

export const TEXT_STYLE_OPTIONS: SelectOption[] = [
  { value: '', label: 'None' },
  ...(Object.entries(TEXT_STYLE_PRESETS) as [TextTag, typeof TEXT_STYLE_PRESETS[TextTag]][])
    .map(([value, p]) => ({ value, label: `${p.label} (${p.size}px)` })),
];

export const FONT_FAMILY_OPTIONS = [
  { label: "Modern Sans", value: "Modern Sans" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Default Sans-serif", value: "sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Comic Sans MS", value: "Comic Sans MS, cursive, sans-serif" },
  { label: "Lucida Sans", value: "Lucida Sans, sans-serif" },
  {
    label: "Palatino Linotype",
    value: "Palatino Linotype, 'Book Antiqua', Palatino, serif",
  },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  {
    label: "Noto Sans",
    value:
      "'Noto Sans KR', 'Noto Sans CJK KR', Kaigen Gothic, Apple SD Gothic Neo, Malgun Gothic, Trebuchet MS, sans-serif",
  },

  // Modern web fonts
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Segoe UI", value: "'Segoe UI', sans-serif" },
  { label: "Lato", value: "Lato, sans-serif" },
  { label: "Merriweather", value: "Merriweather, serif" },
  { label: "Henderson", value: "'Henderson', Georgia, serif" },

  // New client-requested fonts
  { label: "Henderson BCG Sans", value: "'Henderson BCG Sans', sans-serif" },
  { label: "Henderson BCG Serif", value: "'Henderson BCG Serif', Georgia, serif" },
  { label: "DS Termina", value: "DS Termina, 'Helvetica Neue', Arial, sans-serif" },

  // Extra popular choices
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Nunito", value: "Nunito, sans-serif" },
  { label: "Raleway", value: "Raleway, sans-serif" },
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { label: "DM Sans", value: "'DM Sans', sans-serif" },
];

export const TEXT_TRANSFORM_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'None' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
];

export const ALIGN_SELF_OPTIONS: SelectOption[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'stretch', label: 'Stretch' },
];

export const FLEX_WIDTH_MODE_OPTIONS: SelectOption[] = [
  { value: 'fill', label: 'Fill' },
  { value: 'auto', label: 'Auto' },
  { value: 'fixed', label: 'Fixed px' },
  { value: 'percent', label: 'Percent %' },
];

export const FLEX_WIDTH_MODE_WITH_SAME_OPTIONS: SelectOption[] = [
  { value: '', label: 'Same' },
  { value: 'fill', label: 'Fill' },
  { value: 'auto', label: 'Auto' },
  { value: 'fixed', label: 'Fixed px' },
  { value: 'percent', label: 'Percent %' },
];

export const SCROLL_BEHAVIOR_OPTIONS: SelectOption[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'sticky', label: 'Sticky' },
  { value: 'fixed', label: 'Fixed' },
];

export const CONTENT_WIDTH_OPTIONS: SelectOption[] = [
  { value: 'constrained', label: 'Fixed' },
  { value: 'full', label: 'Full' },
];

export const BG_TYPE_OPTIONS: SelectOption[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'linear-gradient', label: 'Linear Gradient' },
  { value: 'radial-gradient', label: 'Radial Gradient' },
];

export const BG_TYPE_WITH_TRANSPARENT_OPTIONS: SelectOption[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'linear-gradient', label: 'Linear Gradient' },
  { value: 'radial-gradient', label: 'Radial Gradient' },
  { value: 'transparent', label: 'Transparent' },
];

// Section backgrounds add Image + Video on top of the color/gradient types.
export const SECTION_BG_TYPE_OPTIONS: SelectOption[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'linear-gradient', label: 'Linear Gradient' },
  { value: 'radial-gradient', label: 'Radial Gradient' },
  { value: 'transparent', label: 'Transparent' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
];

export const IMAGE_POSITION_OPTIONS: SelectOption[] = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top left', label: 'Top Left' },
  { value: 'top right', label: 'Top Right' },
];

export const BG_IMAGE_POSITION_OPTIONS: SelectOption[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'center', label: 'Center' },
];

export const OBJECT_FIT_OPTIONS: SelectOption[] = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
];

export const BORDER_STYLE_OPTIONS: SelectOption[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'none', label: 'None' },
];

export const DIVIDER_ORIENTATION_OPTIONS: SelectOption[] = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

export const FORM_FIELD_WIDTH_OPTIONS: SelectOption[] = [
  { value: 'full', label: 'Full' },
  { value: 'half', label: 'Half' },
];

export const VALIDATION_PRESET_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'None' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'number', label: 'Number only' },
];

export const API_METHOD_OPTIONS: SelectOption[] = [
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
];

export const LINK_TARGET_OPTIONS: SelectOption[] = [
  { value: '_self', label: 'Same tab' },
  { value: '_blank', label: 'New tab' },
];

export const SECTION_LAYOUT_MODE_OPTIONS: SelectOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'grid', label: 'Grid' },
];

export const FLEX_JUSTIFY_OPTIONS: SelectOption[] = [
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'space-between', label: 'Space Between' },
  { value: 'space-around', label: 'Space Around' },
];

export const FLEX_ALIGN_OPTIONS: SelectOption[] = [
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'stretch', label: 'Stretch' },
];

export const FORM_FIELD_TYPE_OPTIONS: SelectOption[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Button' },
  { value: 'date', label: 'Date Picker' },
];

export const BASE_ACTION_OPTIONS: SelectOption[] = [
  // { value: 'none', label: 'None' },
  { value: 'external-url', label: 'Open URL' },
  // { value: 'download-file', label: 'Download File' },
  { value: 'internal-page', label: 'Open Internal Page' },
  // { value: 'send-email', label: 'Send Email' },
  // { value: 'make-call', label: 'Make a Call' },
  // { value: 'send-sms', label: 'Send SMS' },
  { value: 'scroll-to-section', label: 'Scroll to Section' },
  { value: 'scroll-to-top', label: 'Scroll to Top' },
];
