import React from 'react';
import type { CanvasElement as El, FormField, Typography } from '../types';
import { fieldHelpNote } from '../utils/formFormat';

// Shared, non-interactive preview of a Form element used inside the builder
// canvas (both free-canvas and grid-flow modes). Inputs are visually faithful
// but have pointer-events disabled so canvas drag/select still works — actual
// editing happens in the right-hand properties panel.

function fieldInputStyle(typo: Typography): React.CSSProperties {
  return {
    width: '100%',
    padding: '9px 10px',
    fontSize: 14,
    fontFamily: typo.family,
    color: '#374151',
    background: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    boxSizing: 'border-box',
    lineHeight: 1.4,
  };
}

function FieldPreview({ field, typo, stackFields }: { field: FormField; typo: Typography; stackFields: boolean }) {
  const labelEl = field.label ? (
    <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600, color: typo.color, fontFamily: typo.family }}>
      {field.label}
      {field.required && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
    </label>
  ) : null;

  const helpNote = fieldHelpNote(field);
  const help = helpNote ? (
    <div style={{ marginTop: 4, fontSize: 11, color: '#9ca3af', fontFamily: typo.family }}>{helpNote}</div>
  ) : null;

  const inputStyle = fieldInputStyle(typo);
  const placeholder = field.placeholder || '';

  let control: React.ReactNode;
  switch (field.type) {
    case 'textarea':
      control = <div style={{ ...inputStyle, minHeight: (field.rows ?? 4) * 20, color: '#9ca3af' }}>{placeholder}</div>;
      break;
    case 'select':
      control = (
        <div style={{ ...inputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9ca3af' }}>
          <span>{placeholder || field.options?.[0]?.label || 'Select…'}</span>
          <span style={{ fontSize: 10 }}>▾</span>
        </div>
      );
      break;
    case 'checkbox':
    case 'radio': {
      const opts = field.options && field.options.length ? field.options : [{ label: field.label || 'Option', value: 'option' }];
      const isRadio = field.type === 'radio';
      control = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {opts.map((o, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: typo.color, fontFamily: typo.family }}>
              <span style={{ width: 15, height: 15, border: '1px solid #9ca3af', borderRadius: isRadio ? '50%' : 3, flexShrink: 0, background: '#fff' }} />
              {o.label}
            </span>
          ))}
        </div>
      );
      break;
    }
    default:
      // text / email / number / date
      control = <div style={{ ...inputStyle, color: '#9ca3af' }}>{placeholder || ' '}</div>;
  }

  // checkbox/radio render their own label inline (group label still shown above for groups with >1 option)
  const showLabelAbove = !((field.type === 'checkbox' || field.type === 'radio') && (!field.options || field.options.length <= 1));

  // Half-width fields stack to full width at the mobile breakpoint — mirrors the
  // exported page's `@media(max-width:767px)` rule so canvas and export agree.
  const isHalf = field.width === 'half' && !stackFields;
  return (
    <div style={{ flex: isHalf ? '1 1 calc(50% - 8px)' : '1 1 100%', minWidth: isHalf ? 0 : '100%' }}>
      {showLabelAbove && labelEl}
      {control}
      {help}
    </div>
  );
}

export function FormPreview({ el, stackFields = false }: { el: El; stackFields?: boolean }) {
  const typo = el.style.typography;
  const fields = el.content.formFields ?? [];
  const gap = el.content.fieldGap ?? 14;
  const submitLabel = el.content.submitLabel || 'Submit';
  // Submit button color mirrors the export: element background, else a default teal.
  const btnBg = el.style.background.color && el.style.background.color !== 'transparent'
    ? el.style.background.color
    : '#006e75';

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignContent: 'flex-start' }}>
        {fields.length === 0 && (
          <div style={{ width: '100%', padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 13, fontFamily: typo.family, border: '1px dashed #d1d5db', borderRadius: 6 }}>
            No fields yet — add fields in the Form panel.
          </div>
        )}
        {fields.map(f => <FieldPreview key={f.id} field={f} typo={typo} stackFields={stackFields} />)}
        <button
          type="button"
          tabIndex={-1}
          style={{
            width: '100%',
            marginTop: 2,
            padding: '11px 18px',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: typo.family,
            color: '#ffffff',
            background: btnBg,
            border: 'none',
            borderRadius: 6,
            cursor: 'default',
          }}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
