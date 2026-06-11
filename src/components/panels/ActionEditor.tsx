import type { ActionType, ElementAction, NodeMap, Page, Section } from '../../types';
import { PbSelect } from '../PbSelect';
import { PbInput } from '../PbInput';
import { PbTextarea } from '../PbTextarea';
import {
  API_METHOD_OPTIONS,
  LINK_TARGET_OPTIONS,
} from '../../utils/selectOptions';

// Shared action configuration UI used by Button elements and the Form submit
// button. Driven entirely by the ElementAction model. Some action types
// (internal-page, open-popup) are configurable but flagged as not-yet-functional
// in the static HTML export until the corresponding builder features exist.

interface ActionOption {
  type: ActionType;
  label: string;
}

const BASE_ACTIONS: ActionOption[] = [
  { type: 'none',              label: 'None' },
  { type: 'external-url',      label: 'Open External URL' },
  { type: 'download-file',     label: 'Download File' },
  { type: 'internal-page',     label: 'Open Internal Page' },
  { type: 'send-email',        label: 'Send Email' },
  { type: 'make-call',         label: 'Make a Call' },
  { type: 'send-sms',          label: 'Send SMS' },
  { type: 'open-popup',        label: 'Open Popup' },
  { type: 'scroll-to-section', label: 'Scroll to Section' },
  { type: 'scroll-to-top',     label: 'Scroll to Top' },
];

const INERT_ACTIONS = new Set<ActionType>(['internal-page', 'open-popup']);

interface Props {
  action: ElementAction;
  /** Update handler. Commit-on-change semantics handled by caller. */
  onChange: (updates: Partial<ElementAction>) => void;
  nodes: NodeMap;
  pages: Page[];
  /** When true (form submit button), include the Submit Form action option. */
  allowSubmit?: boolean;
  /** Focus/blur for text inputs so the caller can push undo snapshots. */
  onFocus?: () => void;
  onBlur?: () => void;
}

export function ActionEditor({ action, onChange, nodes, pages, allowSubmit, onFocus, onBlur }: Props) {
  const type = action?.type ?? 'none';

  const options: ActionOption[] = allowSubmit
    ? [
        { type: 'submit-form', label: 'Submit Form (Email)' },
        { type: 'submit-api',  label: 'Submit to API' },
        ...BASE_ACTIONS.filter(o => o.type !== 'none'),
      ]
    // Standalone buttons get Submit to API too (fires an HTTP request on click).
    : [...BASE_ACTIONS, { type: 'submit-api', label: 'Submit to API' }];

  const allSections = Object.values(nodes)
    .filter((n): n is Section => n.type === 'section')
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <div className={'pb-prop-row'}>
        <label>Action</label>
        <PbSelect value={type}
          options={options.map(o => ({ value: o.type, label: o.label }))}
          onChange={v => onChange({ type: v as ActionType })} />
      </div>

      {INERT_ACTIONS.has(type) && (
        <div style={{ fontSize: 11, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, padding: '5px 8px', margin: '2px 0 6px' }}>
          Saved, but not yet functional in exported HTML.
        </div>
      )}

      {type === 'submit-form' && (
        <>
          <div className={'pb-prop-row pb-full'}>
            <label>Email</label>
            <PbInput type="text" variant="plain" value={action.email ?? ''} placeholder="where to send submissions"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ email: e.target.value })} />
          </div>
          <div className={'pb-prop-row pb-full'}>
            <label>Subject</label>
            <PbInput type="text" variant="plain" value={action.subject ?? ''} placeholder="(optional)"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ subject: e.target.value })} />
          </div>
        </>
      )}

      {type === 'submit-api' && (
        <>
          <div className={'pb-prop-row pb-full'}>
            <label>Endpoint</label>
            <PbInput type="text" variant="plain" value={action.apiUrl ?? ''} placeholder="https://api.example.com/submit"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ apiUrl: e.target.value })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Method</label>
            <PbSelect value={action.apiMethod ?? 'POST'}
              options={API_METHOD_OPTIONS}
              onChange={v => onChange({ apiMethod: v as 'POST' | 'PUT' | 'PATCH' })} />
          </div>
          {allowSubmit ? (
            <div style={{ fontSize: 11, color: '#64748b', padding: '2px 0 4px', lineHeight: 1.5 }}>
              Form fields are sent as a JSON body (Content-Type: application/json).
            </div>
          ) : (
            <>
              <div className={'pb-prop-row pb-full'}>
                <label>JSON Body</label>
                <PbTextarea value={action.apiBody ?? ''} rows={4} mono placeholder={'(optional) e.g. {"event":"clicked"}'}
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={e => onChange({ apiBody: e.target.value })} />
              </div>
              <div style={{ fontSize: 11, color: '#64748b', padding: '2px 0 4px', lineHeight: 1.5 }}>
                Sent on click as Content-Type: application/json. Fire-and-forget — errors go to the console.
              </div>
            </>
          )}
        </>
      )}

      {type === 'download-file' && (
        <div className={'pb-prop-row pb-full'}>
          <label>File URL</label>
          <PbInput type="text" variant="plain" value={action.url ?? ''} placeholder="https://…"
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => onChange({ url: e.target.value })} />
        </div>
      )}

      {type === 'external-url' && (
        <>
          <div className={'pb-prop-row pb-full'}>
            <label>URL</label>
            <PbInput type="text" variant="plain" value={action.url ?? ''} placeholder="https://…"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ url: e.target.value })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Target</label>
            <PbSelect value={action.target ?? '_self'}
              options={LINK_TARGET_OPTIONS}
              onChange={v => onChange({ target: v as '_self' | '_blank' })} />
          </div>
        </>
      )}

      {type === 'internal-page' && (
        <div className={'pb-prop-row'}>
          <label>Page</label>
          <PbSelect value={action.pageId ?? ''}
            options={[{ value: '', label: '— pick page —' }, ...pages.map(p => ({ value: p.id, label: p.name }))]}
            onChange={v => onChange({ pageId: v })} />
        </div>
      )}

      {type === 'send-email' && (
        <>
          <div className={'pb-prop-row pb-full'}>
            <label>Email</label>
            <PbInput type="text" variant="plain" value={action.email ?? ''} placeholder="hello@example.com"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ email: e.target.value })} />
          </div>
          <div className={'pb-prop-row pb-full'}>
            <label>Subject</label>
            <PbInput type="text" variant="plain" value={action.subject ?? ''} placeholder="(optional)"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ subject: e.target.value })} />
          </div>
          <div className={'pb-prop-row pb-full'}>
            <label>Body</label>
            <PbInput type="text" variant="plain" value={action.body ?? ''} placeholder="(optional)"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ body: e.target.value })} />
          </div>
        </>
      )}

      {(type === 'make-call' || type === 'send-sms') && (
        <div className={'pb-prop-row pb-full'}>
          <label>Phone</label>
          <PbInput type="text" variant="plain" value={action.phone ?? ''} placeholder="+1 555 000 0000"
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => onChange({ phone: e.target.value })} />
        </div>
      )}

      {type === 'send-sms' && (
        <div className={'pb-prop-row pb-full'}>
          <label>Message</label>
          <PbInput type="text" variant="plain" value={action.body ?? ''} placeholder="(optional prefilled text)"
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => onChange({ body: e.target.value })} />
        </div>
      )}

      {type === 'scroll-to-section' && (
        <>
          <div className={'pb-prop-row'}>
            <label>Section</label>
            <PbSelect value={action.targetSectionId ?? ''}
              options={[{ value: '', label: '— pick section —' }, ...allSections.map(s => ({ value: s.id, label: s.label }))]}
              onChange={v => onChange({ targetSectionId: v })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Smooth</label>
            <input type="checkbox" checked={action.smoothScroll !== false}
              onChange={e => onChange({ smoothScroll: e.target.checked })} />
          </div>
        </>
      )}

      {type === 'scroll-to-top' && (
        <div className={'pb-prop-row'}>
          <label>Smooth</label>
          <input type="checkbox" checked={action.smoothScroll !== false}
            onChange={e => onChange({ smoothScroll: e.target.checked })} />
        </div>
      )}
    </>
  );
}
