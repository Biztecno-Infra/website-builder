import { useEffect, useRef, useState } from 'react';
import type { FormField, FormFieldType, FormFieldOption, ValidationPreset } from '../../types';
import { PbSelect } from '../PbSelect';
import { PbInput } from '../PbInput';
import {
  FORM_FIELD_WIDTH_OPTIONS,
  VALIDATION_PRESET_OPTIONS,
} from '../../utils/selectOptions';

// Field-list editor for the Form element: add / delete / reorder fields and
// edit per-field label, name, placeholder, help, required, width, options and
// validation. Commits (undo snapshots) happen via onChange; live typing uses
// onChangeNoCommit so a single edit = a single undo step.

const FIELD_TYPES: Array<{ type: FormFieldType; label: string }> = [
  { type: 'text',     label: 'Text Input' },
  { type: 'email',    label: 'Email' },
  { type: 'number',   label: 'Number' },
  { type: 'textarea', label: 'Textarea' },
  { type: 'select',   label: 'Dropdown' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'radio',    label: 'Radio Button' },
  { type: 'date',     label: 'Date Picker' },
];

const TYPE_LABEL: Record<FormFieldType, string> =
  Object.fromEntries(FIELD_TYPES.map(t => [t.type, t.label])) as Record<FormFieldType, string>;

const HAS_OPTIONS = new Set<FormFieldType>(['select', 'radio', 'checkbox']);
const TEXTUAL = new Set<FormFieldType>(['text', 'email', 'textarea']);
const NUMERICISH = new Set<FormFieldType>(['number', 'date']);

let seq = 0;
function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'field';
}

function newField(type: FormFieldType, existing: FormField[]): FormField {
  seq += 1;
  const label = TYPE_LABEL[type];
  let name = slugify(label);
  // de-dup name against existing
  const names = new Set(existing.map(f => f.name));
  if (names.has(name)) { let i = 2; while (names.has(`${name}_${i}`)) i += 1; name = `${name}_${i}`; }
  const base: FormField = {
    id: `ff_new_${seq.toString(36)}`,
    type, label, name,
    placeholder: '', helpText: '', defaultValue: '',
    required: false, width: 'full', validation: {},
  };
  if (HAS_OPTIONS.has(type)) base.options = [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }];
  if (type === 'textarea') base.rows = 4;
  if (type === 'email') base.validation = { preset: 'email' };
  return base;
}

interface Props {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;          // committed (undo step)
  onChangeNoCommit: (fields: FormField[]) => void;   // live typing
  onFocus?: () => void;
  onBlur?: () => void;
  // Field highlighted from the Layers panel — auto-expand + scroll into view.
  focusedFieldId?: string | null;
  onFocusField?: (id: string | null) => void;
}

export function FormFieldsEditor({ fields, onChange, onChangeNoCommit, onFocus, onBlur, focusedFieldId, onFocusField }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addType, setAddType] = useState<FormFieldType>('text');
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // When a field is selected from the Layers panel, expand it and scroll to it.
  useEffect(() => {
    if (!focusedFieldId) return;
    // '__submit__' just opens the panel (no specific field to expand).
    if (focusedFieldId !== '__submit__' && fields.some(f => f.id === focusedFieldId)) {
      setExpandedId(focusedFieldId);
      const t = setTimeout(() => rowRefs.current[focusedFieldId]?.scrollIntoView({ block: 'nearest' }), 40);
      return () => clearTimeout(t);
    }
  }, [focusedFieldId]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (id: string, updates: Partial<FormField>, commit = true) => {
    const next = fields.map(f => (f.id === id ? { ...f, ...updates } : f));
    (commit ? onChange : onChangeNoCommit)(next);
  };

  const updateValidation = (id: string, updates: Partial<FormField['validation']>, commit = true) => {
    const f = fields.find(x => x.id === id);
    if (!f) return;
    update(id, { validation: { ...f.validation, ...updates } }, commit);
  };

  const addField = () => {
    onChange([...fields, newField(addType, fields)]);
  };
  const removeField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
    if (expandedId === id) setExpandedId(null);
  };
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= fields.length) return;
    const next = fields.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fields.length === 0 && (
          <div style={{ fontSize: 11, color: '#94a3b8', padding: '4px 0' }}>No fields yet.</div>
        )}
        {fields.map((f, idx) => {
          const open = expandedId === f.id;
          const isFocused = focusedFieldId === f.id;
          return (
            <div key={f.id} ref={el => { rowRefs.current[f.id] = el; }}
              style={{ border: `1px solid ${isFocused ? '#006e75' : '#e2e8f0'}`, borderRadius: 6, overflow: 'hidden', boxShadow: isFocused ? '0 0 0 2px rgba(0,110,117,0.15)' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px', background: '#f8fafc' }}>
                <button title="Move up" disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  style={{ border: 'none', background: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 0.7, padding: 0, fontSize: 12 }}>▲</button>
                <button title="Move down" disabled={idx === fields.length - 1}
                  onClick={() => move(idx, 1)}
                  style={{ border: 'none', background: 'none', cursor: idx === fields.length - 1 ? 'default' : 'pointer', opacity: idx === fields.length - 1 ? 0.3 : 0.7, padding: 0, fontSize: 12 }}>▼</button>
                <button onClick={() => { setExpandedId(open ? null : f.id); if (focusedFieldId && focusedFieldId !== f.id) onFocusField?.(null); }}
                  style={{ flex: 1, textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#334155', display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.label || '(no label)'}{f.required && <span style={{ color: '#dc2626' }}> *</span>}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: '#94a3b8' }}>{TYPE_LABEL[f.type]}</span>
                </button>
                <button title="Delete field" onClick={() => removeField(f.id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: '0 2px', fontSize: 13 }}>✕</button>
              </div>

              {open && (
                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid #e2e8f0' }}>
                  <div className={'pb-prop-row'}>
                    <label>Type</label>
                    <PbSelect value={f.type}
                      options={FIELD_TYPES.map(t => ({ value: t.type, label: t.label }))}
                      onChange={v => update(f.id, { type: v as FormFieldType, options: HAS_OPTIONS.has(v as FormFieldType) ? (f.options ?? [{ label: 'Option 1', value: 'option_1' }]) : undefined })} />
                  </div>
                  <div className={'pb-prop-row pb-full'}>
                    <label>Label</label>
                    <PbInput type="text" value={f.label}
                      onFocus={onFocus} onBlur={onBlur}
                      onChange={e => update(f.id, { label: e.target.value }, false)} />
                  </div>
                  <div className={'pb-prop-row pb-full'}>
                    <label>Name</label>
                    <PbInput type="text" value={f.name} placeholder="submission key"
                      onFocus={onFocus} onBlur={onBlur}
                      onChange={e => update(f.id, { name: slugify(e.target.value) }, false)} />
                  </div>
                  {f.type !== 'checkbox' && f.type !== 'radio' && (
                    <div className={'pb-prop-row pb-full'}>
                      <label>Placeholder</label>
                      <PbInput type="text" value={f.placeholder ?? ''}
                        onFocus={onFocus} onBlur={onBlur}
                        onChange={e => update(f.id, { placeholder: e.target.value }, false)} />
                    </div>
                  )}
                  <div className={'pb-prop-row pb-full'}>
                    <label>Help Text</label>
                    <PbInput type="text" value={f.helpText ?? ''}
                      onFocus={onFocus} onBlur={onBlur}
                      onChange={e => update(f.id, { helpText: e.target.value }, false)} />
                  </div>
                  <div className={'pb-prop-row'}>
                    <label>Required</label>
                    <input type="checkbox" checked={f.required}
                      onChange={e => update(f.id, { required: e.target.checked })} />
                  </div>
                  <div className={'pb-prop-row'}>
                    <label>Width</label>
                    <PbSelect value={f.width}
                      options={FORM_FIELD_WIDTH_OPTIONS}
                      onChange={v => update(f.id, { width: v as 'full' | 'half' })} />
                  </div>

                  {f.type === 'textarea' && (
                    <div className={'pb-prop-row'}>
                      <label>Rows</label>
                      <PbInput type="number" min={2} max={20} value={f.rows ?? 4}
                        onFocus={onFocus} onBlur={onBlur}
                        onChange={e => update(f.id, { rows: Number(e.target.value) })} />
                    </div>
                  )}

                  {HAS_OPTIONS.has(f.type) && (
                    <OptionsEditor field={f}
                      onChange={(options: FormFieldOption[], commit: boolean) => update(f.id, { options }, commit)}
                      onFocus={onFocus} onBlur={onBlur} />
                  )}

                  {/* Validation */}
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>Validation</div>
                  {TEXTUAL.has(f.type) && (
                    <>
                      <div className={'pb-prop-row'}>
                        <label>Preset</label>
                        <PbSelect value={f.validation?.preset ?? 'none'}
                          options={VALIDATION_PRESET_OPTIONS}
                          onChange={v => updateValidation(f.id, { preset: v as ValidationPreset })} />
                      </div>
                      <div className={'pb-prop-row'}>
                        <label>Min Len</label>
                        <PbInput type="number" min={0} value={f.validation?.minLength ?? ''}
                          onFocus={onFocus} onBlur={onBlur}
                          onChange={e => updateValidation(f.id, { minLength: e.target.value === '' ? undefined : Number(e.target.value) })} />
                      </div>
                      <div className={'pb-prop-row'}>
                        <label>Max Len</label>
                        <PbInput type="number" min={0} value={f.validation?.maxLength ?? ''}
                          onFocus={onFocus} onBlur={onBlur}
                          onChange={e => updateValidation(f.id, { maxLength: e.target.value === '' ? undefined : Number(e.target.value) })} />
                      </div>
                    </>
                  )}
                  {NUMERICISH.has(f.type) && (
                    <>
                      <div className={'pb-prop-row'}>
                        <label>Min</label>
                        <input type={f.type === 'date' ? 'date' : 'number'} value={f.validation?.min as never ?? ''}
                          onFocus={onFocus} onBlur={onBlur}
                          onChange={e => updateValidation(f.id, { min: e.target.value === '' ? undefined : (f.type === 'date' ? (e.target.value as never) : Number(e.target.value)) })} />
                      </div>
                      <div className={'pb-prop-row'}>
                        <label>Max</label>
                        <input type={f.type === 'date' ? 'date' : 'number'} value={f.validation?.max as never ?? ''}
                          onFocus={onFocus} onBlur={onBlur}
                          onChange={e => updateValidation(f.id, { max: e.target.value === '' ? undefined : (f.type === 'date' ? (e.target.value as never) : Number(e.target.value)) })} />
                      </div>
                    </>
                  )}
                  <div className={'pb-prop-row pb-full'}>
                    <label>Pattern</label>
                    <PbInput type="text" value={f.validation?.pattern ?? ''} placeholder="regex (advanced)"
                      onFocus={onFocus} onBlur={onBlur}
                      onChange={e => updateValidation(f.id, { pattern: e.target.value || undefined }, false)} />
                  </div>
                  <div className={'pb-prop-row pb-full'}>
                    <label>Error Msg</label>
                    <PbInput type="text" value={f.validation?.errorMessage ?? ''} placeholder="(optional)"
                      onFocus={onFocus} onBlur={onBlur}
                      onChange={e => updateValidation(f.id, { errorMessage: e.target.value || undefined }, false)} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <PbSelect value={addType}
            options={FIELD_TYPES.map(t => ({ value: t.type, label: t.label }))}
            onChange={v => setAddType(v as FormFieldType)} />
        </div>
        <button onClick={addField}
          style={{ padding: '4px 12px', fontSize: 12, fontWeight: 600, background: '#006e75', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
          + Add
        </button>
      </div>
    </div>
  );
}

function OptionsEditor({ field, onChange, onFocus, onBlur }: {
  field: FormField;
  onChange: (options: FormFieldOption[], commit: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const opts = field.options ?? [];
  const set = (next: FormFieldOption[], commit: boolean) => onChange(next, commit);
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>Options</div>
      {opts.map((o, i) => (
        <div key={i} style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center' }}>
          <PbInput type="text" value={o.label} placeholder="Label"
            style={{ flex: 1, minWidth: 0 }}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => set(opts.map((x, j) => j === i ? { label: e.target.value, value: slugify(e.target.value) } : x), false)} />
          <button title="Remove" onClick={() => set(opts.filter((_, j) => j !== i), true)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13 }}>✕</button>
        </div>
      ))}
      <button onClick={() => set([...opts, { label: `Option ${opts.length + 1}`, value: `option_${opts.length + 1}` }], true)}
        style={{ marginTop: 5, padding: '3px 10px', fontSize: 11, fontWeight: 600, background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
        + Option
      </button>
    </div>
  );
}
