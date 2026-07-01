import type { CanvasElement, ElementAction } from '../types';
import { interactionToAction } from './builderDefaults';

// ── Preview-mode element actions ─────────────────────────────────────────────
// Executes a button/element's configured action live in the editor's Preview
// mode, so previewing behaves like the published/exported site. This mirrors the
// semantics of resolveAction() in exportHtml.ts (which builds <a href>/onclick),
// but runs against the live DOM instead of generating static HTML.
//
// Kept in one place so Preview (CanvasElement + GridElementView) and the export
// stay conceptually in sync — same action model, equivalent behavior.

// Resolve the effective action for an element: explicit `action` wins, else the
// legacy `interaction` is migrated. Mirrors actionOf() in exportHtml.ts.
export function effectiveAction(el: CanvasElement): ElementAction | null {
  if (el.action && el.action.type !== 'none') return el.action;
  return interactionToAction(el.interaction);
}

// True when the element has an action that does something on click — used to set
// a pointer cursor in preview so it reads as interactive.
export function hasPreviewAction(el: CanvasElement): boolean {
  const a = effectiveAction(el);
  return !!a && a.type !== 'none' && a.type !== 'submit-form';
}

function smsHref(phone: string, body?: string): string {
  const num = phone.replace(/[^+\d]/g, '');
  const q = body ? `?body=${encodeURIComponent(body)}` : '';
  return `sms:${num}${q}`;
}

function mailtoHref(email: string, subject?: string, body?: string): string {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${params.length ? `?${params.join('&')}` : ''}`;
}

// Smoothly scroll the preview surface. In preview the page scrolls inside the
// canvas wrapper (.pb-canvas-wrapper), not the window — so prefer that, falling
// back to window for safety.
function scrollPreviewTo(top: number) {
  const wrapper = document.querySelector('.pb-canvas-wrapper');
  if (wrapper) wrapper.scrollTo({ top, behavior: 'smooth' });
  else window.scrollTo({ top, behavior: 'smooth' });
}

function scrollToSection(sectionId: string) {
  // Preview sections render with id="sec-{id}" (mirroring the export markup).
  const target = document.getElementById(`sec-${sectionId}`);
  const wrapper = document.querySelector('.pb-canvas-wrapper');
  if (target && wrapper) {
    const wRect = wrapper.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    scrollPreviewTo(wrapper.scrollTop + (tRect.top - wRect.top));
  } else if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Run an element's action in preview. `onNavigatePage` switches the active page
// for internal-page links (the one action that needs editor state, not the DOM).
// Returns true if an action was handled (so callers can stopPropagation).
export function runPreviewAction(
  el: CanvasElement,
  opts: { onNavigatePage?: (pageId: string) => void } = {},
): boolean {
  const a = effectiveAction(el);
  if (!a) return false;

  switch (a.type) {
    case 'scroll-to-section':
      if (!a.targetSectionId) return false;
      scrollToSection(a.targetSectionId);
      return true;
    case 'scroll-to-top':
      scrollPreviewTo(0);
      return true;
    case 'external-url':
      if (!a.url) return false;
      window.open(a.url, a.target ?? '_self');
      return true;
    case 'download-file':
      if (!a.url) return false;
      window.open(a.url, '_blank');
      return true;
    case 'internal-page':
      if (!a.pageId) return false;
      opts.onNavigatePage?.(a.pageId);
      scrollPreviewTo(0);
      return true;
    case 'send-email':
      if (!a.email) return false;
      window.location.href = mailtoHref(a.email, a.subject, a.body);
      return true;
    case 'make-call':
      if (!a.phone) return false;
      window.location.href = `tel:${a.phone.replace(/[^+\d]/g, '')}`;
      return true;
    case 'send-sms':
      if (!a.phone) return false;
      window.location.href = smsHref(a.phone, a.body);
      return true;
    case 'submit-api': {
      // Standalone button (forms handle their own submit) — fire-and-forget,
      // matching the export's onclick fetch.
      if (!a.apiUrl) return false;
      const method = a.apiMethod ?? 'POST';
      const body = (a.apiBody ?? '').trim();
      const init: RequestInit = body
        ? { method, headers: { 'Content-Type': 'application/json' }, body }
        : { method };
      fetch(a.apiUrl, init).catch(e => console.error(e));
      return true;
    }
    case 'submit-form':  // handled by the form element, not a click action
    case 'none':
    default:
      return false;
  }
}
