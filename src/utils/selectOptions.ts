import type { SelectOption } from '../components/PbSelect';

export const CSS_POSITION_OPTIONS: SelectOption[] = [
  { value: 'relative', label: 'Relative' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'fixed',    label: 'Fixed' },
  { value: 'sticky',   label: 'Sticky' },
];

export const FONT_WEIGHT_OPTIONS: SelectOption[] = [
  { value: '100',    label: 'Thin (100)' },
  { value: '200',    label: 'ExtraLight (200)' },
  { value: '300',    label: 'Light (300)' },
  { value: 'normal', label: 'Regular (400)' },
  { value: '500',    label: 'Medium (500)' },
  { value: '600',    label: 'SemiBold (600)' },
  { value: 'bold',   label: 'Bold (700)' },
  { value: '800',    label: 'ExtraBold (800)' },
  { value: '900',    label: 'Heavy (900)' },
];

export const FONT_FAMILY_OPTIONS: SelectOption[] = [
  { value: 'Inter, sans-serif',                          label: 'Inter' },
  { value: 'Arial, sans-serif',                          label: 'Arial' },
  { value: 'Helvetica, Arial, sans-serif',               label: 'Helvetica' },
  { value: 'Verdana, sans-serif',                        label: 'Verdana' },
  { value: 'Tahoma, sans-serif',                         label: 'Tahoma' },
  { value: "'Segoe UI', sans-serif",                     label: 'Segoe UI' },
  { value: 'Roboto, sans-serif',                         label: 'Roboto' },
  { value: "'Open Sans', sans-serif",                    label: 'Open Sans' },
  { value: 'Lato, sans-serif',                           label: 'Lato' },
  { value: 'Montserrat, sans-serif',                     label: 'Montserrat' },
  { value: 'Poppins, sans-serif',                        label: 'Poppins' },
  { value: "'Trebuchet MS', sans-serif",                 label: 'Trebuchet MS' },
  { value: "'Lucida Sans', sans-serif",                  label: 'Lucida Sans' },
  { value: 'sans-serif',                                 label: 'System Sans-serif' },
  { value: 'Georgia, serif',                             label: 'Georgia' },
  { value: "'Times New Roman', serif",                   label: 'Times New Roman' },
  { value: 'Merriweather, serif',                        label: 'Merriweather' },
  { value: "'Palatino Linotype', Palatino, serif",       label: 'Palatino' },
  { value: "'Courier New', monospace",                   label: 'Courier New' },
  { value: "'Comic Sans MS', cursive, sans-serif",       label: 'Comic Sans MS' },
];

export const TEXT_TRANSFORM_OPTIONS: SelectOption[] = [
  { value: 'none',      label: 'None' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
];

export const FLEX_JUSTIFY_OPTIONS: SelectOption[] = [
  { value: 'flex-start',    label: 'Start' },
  { value: 'center',        label: 'Center' },
  { value: 'flex-end',      label: 'End' },
  { value: 'space-between', label: 'Space Between' },
  { value: 'space-around',  label: 'Space Around' },
];

export const FLEX_ALIGN_OPTIONS: SelectOption[] = [
  { value: 'flex-start', label: 'Start' },
  { value: 'center',     label: 'Center' },
  { value: 'flex-end',   label: 'End' },
  { value: 'stretch',    label: 'Stretch' },
];

export const ALIGN_SELF_OPTIONS: SelectOption[] = [
  { value: 'auto',       label: 'Auto' },
  { value: 'flex-start', label: 'Start' },
  { value: 'center',     label: 'Center' },
  { value: 'flex-end',   label: 'End' },
  { value: 'stretch',    label: 'Stretch' },
];

export const FLEX_WIDTH_MODE_OPTIONS: SelectOption[] = [
  { value: 'fill',    label: 'Fill' },
  { value: 'auto',    label: 'Auto' },
  { value: 'fixed',   label: 'Fixed px' },
  { value: 'percent', label: 'Percent %' },
];

export const FLEX_WIDTH_MODE_WITH_SAME_OPTIONS: SelectOption[] = [
  { value: '',        label: 'Same' },
  { value: 'fill',    label: 'Fill' },
  { value: 'auto',    label: 'Auto' },
  { value: 'fixed',   label: 'Fixed px' },
  { value: 'percent', label: 'Percent %' },
];

export const SCROLL_BEHAVIOR_OPTIONS: SelectOption[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'sticky', label: 'Sticky' },
  { value: 'fixed',  label: 'Fixed' },
];

export const CONTENT_WIDTH_OPTIONS: SelectOption[] = [
  { value: 'constrained', label: 'Fixed' },
  { value: 'full',        label: 'Full' },
  { value: 'fluid',       label: 'Fluid' },
];

export const BG_TYPE_OPTIONS: SelectOption[] = [
  { value: 'solid',           label: 'Solid' },
  { value: 'linear-gradient', label: 'Linear Gradient' },
  { value: 'radial-gradient', label: 'Radial Gradient' },
];

export const BG_TYPE_WITH_TRANSPARENT_OPTIONS: SelectOption[] = [
  { value: 'solid',           label: 'Solid' },
  { value: 'linear-gradient', label: 'Linear Gradient' },
  { value: 'radial-gradient', label: 'Radial Gradient' },
  { value: 'transparent',     label: 'Transparent' },
];

export const IMAGE_POSITION_OPTIONS: SelectOption[] = [
  { value: 'center',    label: 'Center' },
  { value: 'top',       label: 'Top' },
  { value: 'bottom',    label: 'Bottom' },
  { value: 'left',      label: 'Left' },
  { value: 'right',     label: 'Right' },
  { value: 'top left',  label: 'Top Left' },
  { value: 'top right', label: 'Top Right' },
];

export const BG_IMAGE_POSITION_OPTIONS: SelectOption[] = [
  { value: 'top',    label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left',   label: 'Left' },
  { value: 'right',  label: 'Right' },
  { value: 'center', label: 'Center' },
];

export const OBJECT_FIT_OPTIONS: SelectOption[] = [
  { value: 'cover',   label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill',    label: 'Fill' },
];

export const OBJECT_POSITION_OPTIONS: SelectOption[] = [
  { value: 'top',    label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left',   label: 'Left' },
  { value: 'right',  label: 'Right' },
  { value: 'center', label: 'Center' },
];

export const DIVIDER_ORIENTATION_OPTIONS: SelectOption[] = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical',   label: 'Vertical' },
];

export const COLUMN_COUNT_OPTIONS: SelectOption[] = [
  { value: '1', label: 'None' },
  { value: '2', label: '2 Columns' },
  { value: '3', label: '3 Columns' },
  { value: '4', label: '4 Columns' },
  { value: '5', label: '5 Columns' },
  { value: '6', label: '6 Columns' },
];

export const FORM_FIELD_WIDTH_OPTIONS: SelectOption[] = [
  { value: 'full', label: 'Full' },
  { value: 'half', label: 'Half' },
];

export const VALIDATION_PRESET_OPTIONS: SelectOption[] = [
  { value: 'none',   label: 'None' },
  { value: 'email',  label: 'Email' },
  { value: 'url',    label: 'URL' },
  { value: 'number', label: 'Number only' },
];

export const API_METHOD_OPTIONS: SelectOption[] = [
  { value: 'POST',  label: 'POST' },
  { value: 'PUT',   label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
];

export const LINK_TARGET_OPTIONS: SelectOption[] = [
  { value: '_self',  label: 'Same tab' },
  { value: '_blank', label: 'New tab' },
];

export const SECTION_LAYOUT_MODE_OPTIONS: SelectOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'grid', label: 'Grid' },
];

export const FORM_FIELD_TYPE_OPTIONS: SelectOption[] = [
  { value: 'text',     label: 'Text Input' },
  { value: 'email',    label: 'Email' },
  { value: 'number',   label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select',   label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio',    label: 'Radio Button' },
  { value: 'date',     label: 'Date Picker' },
];

export const BASE_ACTION_OPTIONS: SelectOption[] = [
  { value: 'none',              label: 'None' },
  { value: 'external-url',      label: 'Open External URL' },
  { value: 'download-file',     label: 'Download File' },
  { value: 'internal-page',     label: 'Open Internal Page' },
  { value: 'send-email',        label: 'Send Email' },
  { value: 'make-call',         label: 'Make a Call' },
  { value: 'send-sms',          label: 'Send SMS' },
  { value: 'open-popup',        label: 'Open Popup' },
  { value: 'scroll-to-section', label: 'Scroll to Section' },
  { value: 'scroll-to-top',     label: 'Scroll to Top' },
];
