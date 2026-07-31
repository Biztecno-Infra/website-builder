import type { CanvasElement, ElementType, SiteTheme } from '../types';
import {
  DEFAULT_BG, DEFAULT_CONTENT, DEFAULT_FLEX_LAYOUT,
  DEFAULT_INTERACTION, DEFAULT_STYLE, DEFAULT_THEME, defaultFormFields,
} from './builderDefaults';
import { newId } from './ids';

export const CANVAS_W = 1920;

export function createDefaultElement(
  type: ElementType, count: number, parentId: string,
  dropX?: number, dropY?: number, theme?: SiteTheme, useAccent = false,
): CanvasElement {
  const offset = (count % 8) * 20;
  const cx = Math.round(CANVAS_W / 2 - 100 + offset);
  const cy = Math.round(150 + offset);
  const id = newId();
  const tc = theme?.colors ?? DEFAULT_THEME.colors;
  const tf = theme?.fonts.body ?? DEFAULT_STYLE.typography.family;

  const base: CanvasElement = {
    id, type, parent: parentId,
    layout: { x: dropX ?? cx, y: dropY ?? cy, width: 200, height: 100, zIndex: count, rotation: 0 },
    style: { ...DEFAULT_STYLE, background: { ...DEFAULT_BG }, padding: { top: 0, right: 0, bottom: 0, left: 0 }, border: { radius: 0, width: 0, color: '#cccccc', style: 'solid' }, shadow: { enabled: false, x: 4, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.2)' }, typography: { ...DEFAULT_STYLE.typography, family: tf, color: tc.text } },
    content: { ...DEFAULT_CONTENT },
    interaction: { ...DEFAULT_INTERACTION },
    state: { hidden: false },
    responsive: {},
    flexLayout: { ...DEFAULT_FLEX_LAYOUT },
  };

  switch (type) {
    case 'text':    return { ...base, layout: { ...base.layout, width: 220, height: 48 }, flexLayout: { ...DEFAULT_FLEX_LAYOUT, widthMode: 'auto' }, content: { ...base.content, plain: 'Click to edit text' } };
    case 'image':   return { ...base, layout: { ...base.layout, width: 240, height: 240 }, flexLayout: { ...DEFAULT_FLEX_LAYOUT, widthMode: 'fill' }, style: { ...base.style, background: { ...base.style.background, color: '#e2e8f0' } }, content: { ...base.content, src: 'https://placehold.co/240x160/e2e8f0/64748b?text=Image' } };
    case 'button':  return { ...base, layout: { ...base.layout, width: 140, height: 44 }, flexLayout: { ...DEFAULT_FLEX_LAYOUT, widthMode: 'auto' }, style: { ...base.style, background: { ...base.style.background, color: useAccent ? tc.accent : tc.primary }, border: { radius: 6, width: 0, color: '#cccccc', style: 'solid' }, padding: { top: 10, right: 24, bottom: 10, left: 24 }, typography: { ...base.style.typography, size: 15, weight: '600', color: '#ffffff', align: 'center' }, hover: { enabled: true, backgroundColor: tc.secondary ?? '#1E293B', textColor: '#ffffff', transitionDuration: 200 } }, content: { ...base.content, label: useAccent ? 'Learn more' : 'Click me' } };
    case 'box':     return { ...base, layout: { ...base.layout, width: 200, height: 160 }, style: { ...base.style, background: { ...base.style.background, color: tc.light }, border: { radius: 0, width: 2, color: tc.light, style: 'solid' } } };
    case 'divider': return { ...base, layout: { ...base.layout, width: 400, height: 4 }, style: { ...base.style, background: { ...base.style.background, color: tc.light }, border: { ...base.style.border, radius: 2 } }, content: { ...base.content, orientation: 'horizontal' } };
    case 'video':   return { ...base, layout: { ...base.layout, width: 400, height: 225 }, style: { ...base.style, background: { ...base.style.background, color: '#000000' } } };
    case 'spacer':  return { ...base, layout: { ...base.layout, width: 200, height: 60 } };
    case 'icon':    return { ...base, layout: { ...base.layout, width: 60, height: 60 }, flexLayout: { ...DEFAULT_FLEX_LAYOUT, widthMode: 'fixed', widthValue: 60 }, style: { ...base.style, typography: { ...base.style.typography, color: tc.primary } } };
    case 'form':    return {
      ...base,
      layout: { ...base.layout, width: 420, height: 360 },
      flexLayout: { ...DEFAULT_FLEX_LAYOUT, widthMode: 'fill' },
      style: { ...base.style, typography: { ...base.style.typography, color: tc.text } },
      content: { ...base.content, formFields: defaultFormFields(), fieldGap: 14, submitLabel: 'Submit' },
      action: { type: 'submit-form', email: '', subject: 'New form submission' },
    };
    default: return base;
  }
}
