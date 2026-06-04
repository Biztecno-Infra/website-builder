import type { ActionType, ElementAction, NodeMap, Page, Section } from '../../types';

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
  { type: 'internal-page',     label: 'Open Internal Page' },
  { type: 'send-email',        label: 'Send Email' },
  { type: 'make-call',         label: 'Make a Call' },
  { type: 'send-sms',          label: 'Send SMS' },
  { type: 'scroll-to-section', label: 'Scroll to Section' },
  { type: 'scroll-to-top',     label: 'Scroll to Top' },
];

const INERT_ACTIONS = new Set<ActionType>(['internal-page']);

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
        <select value={type} onChange={e => onChange({ type: e.target.value as ActionType })}>
          {options.map(o => <option key={o.type} value={o.type}>{o.label}</option>)}
        </select>
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
            <input type="text" value={action.email ?? ''} placeholder="where to send submissions"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ email: e.target.value })} />
          </div>
          <div className={'pb-prop-row pb-full'}>
            <label>Subject</label>
            <input type="text" value={action.subject ?? ''} placeholder="(optional)"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ subject: e.target.value })} />
          </div>
        </>
      )}

      {type === 'submit-api' && (
        <>
          <div className={'pb-prop-row pb-full'}>
            <label>Endpoint</label>
            <input type="text" value={action.apiUrl ?? ''} placeholder="https://api.example.com/submit"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ apiUrl: e.target.value })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Method</label>
            <select value={action.apiMethod ?? 'POST'}
              onChange={e => onChange({ apiMethod: e.target.value as 'POST' | 'PUT' | 'PATCH' })}>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          {allowSubmit ? (
            <div style={{ fontSize: 11, color: '#64748b', padding: '2px 0 4px', lineHeight: 1.5 }}>
              Form fields are sent as a JSON body (Content-Type: application/json).
            </div>
          ) : (
            <>
              <div className={'pb-prop-row pb-full'}>
                <label>JSON Body</label>
                <textarea value={action.apiBody ?? ''} rows={4} placeholder={'(optional) e.g. {"event":"clicked"}'}
                  style={{ fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
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

      {type === 'external-url' && (
        <>
          <div className={'pb-prop-row pb-full'}>
            <label>URL</label>
            <input type="text" value={action.url ?? ''} placeholder="https://…"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ url: e.target.value })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Target</label>
            <select value={action.target ?? '_self'}
              onChange={e => onChange({ target: e.target.value as '_self' | '_blank' })}>
              <option value="_self">Same tab</option>
              <option value="_blank">New tab</option>
            </select>
          </div>
        </>
      )}

      {type === 'internal-page' && (
        <div className={'pb-prop-row'}>
          <label>Page</label>
          <select value={action.pageId ?? ''}
            onChange={e => onChange({ pageId: e.target.value })}>
            <option value="">— pick page —</option>
            {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {type === 'send-email' && (
        <>
          <div className={'pb-prop-row pb-full'}>
            <label>Email</label>
            <input type="text" value={action.email ?? ''} placeholder="hello@example.com"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ email: e.target.value })} />
          </div>
          <div className={'pb-prop-row pb-full'}>
            <label>Subject</label>
            <input type="text" value={action.subject ?? ''} placeholder="(optional)"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ subject: e.target.value })} />
          </div>
          <div className={'pb-prop-row pb-full'}>
            <label>Body</label>
            <input type="text" value={action.body ?? ''} placeholder="(optional)"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => onChange({ body: e.target.value })} />
          </div>
        </>
      )}

      {(type === 'make-call' || type === 'send-sms') && (
        <div className={'pb-prop-row pb-full'}>
          <label>Phone</label>
          <input type="text" value={action.phone ?? ''} placeholder="+1 555 000 0000"
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => onChange({ phone: e.target.value })} />
        </div>
      )}

      {type === 'send-sms' && (
        <div className={'pb-prop-row pb-full'}>
          <label>Message</label>
          <input type="text" value={action.body ?? ''} placeholder="(optional prefilled text)"
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => onChange({ body: e.target.value })} />
        </div>
      )}

      {type === 'scroll-to-section' && (
        <>
          <div className={'pb-prop-row'}>
            <label>Section</label>
            <select value={action.targetSectionId ?? ''}
              onChange={e => onChange({ targetSectionId: e.target.value })}>
              <option value="">— pick section —</option>
              {allSections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
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
