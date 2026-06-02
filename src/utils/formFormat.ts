import type { FormField } from '../types';

// Default format hint shown below a field when the user hasn't written their
// own Help Text. Only fields where a format is meaningful return a note;
// everything else returns ''. Shared by the canvas preview and the HTML export
// so both show the same guidance.
export function defaultFormatNote(f: FormField): string {
  const preset = f.validation?.preset;
  // A URL preset can sit on any text-ish field, so check it first.
  if (preset === 'url') return 'Format: https://example.com';

  switch (f.type) {
    case 'email':  return 'Format: you@example.com';
    case 'number': return 'Numbers only';
    case 'date':   return 'Format: YYYY-MM-DD';
    default:       return '';
  }
}

// The note actually rendered for a field: the user's Help Text wins; otherwise
// fall back to the default format note (which may be empty).
export function fieldHelpNote(f: FormField): string {
  return (f.helpText && f.helpText.trim()) ? f.helpText : defaultFormatNote(f);
}
