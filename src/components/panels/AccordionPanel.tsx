import { useRef } from 'react';
import type { Accordion, AccordionBpOverride, Breakpoint, BuilderState, NodeMap } from '../../types';

interface Props {
  accordion: Accordion;
  nodes: NodeMap;
  snapshot: BuilderState;
  breakpoint?: Breakpoint;
  selectedItemCellId?: string | null;
  onUpdateAccordion: (id: string, updates: Partial<Omit<Accordion, 'id' | 'type' | 'parent' | 'children' | 'items'>>) => void;
  onUpdateAccordionResponsive: (id: string, bp: Breakpoint, updates: AccordionBpOverride) => void;
  onAddItem: (accordionId: string, afterItemId?: string) => void;
  onDeleteItem: (accordionId: string, itemId: string) => void;
  onDuplicateItem: (accordionId: string, itemId: string) => void;
  onReorderItem: (accordionId: string, fromIndex: number, toIndex: number) => void;
  onToggleItem: (accordionId: string, itemId: string) => void;
  onSelectItemCell: (cellId: string) => void;
  onPushSnapshot: (snapshot: BuilderState) => void;
}

const LABEL_STYLE: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' };
const ROW: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8 };

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ ...ROW, cursor: 'pointer' }}>
      <span style={{ fontSize: 12, color: '#334' }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  );
}

function NumberField({ label, value, min, max, step = 1, suffix, onCommitStart, onChange }: {
  label: string; value: number; min?: number; max?: number; step?: number; suffix?: string;
  onCommitStart: () => void; onChange: (v: number) => void;
}) {
  return (
    <div style={ROW}>
      <span style={{ fontSize: 12, color: '#334' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="number" value={value} min={min} max={max} step={step}
          style={{ width: 64, padding: '4px 6px', border: '1px solid #d6dee8', borderRadius: 4, fontSize: 12 }}
          onFocus={onCommitStart}
          onChange={e => onChange(Number(e.target.value))}
        />
        {suffix && <span style={{ fontSize: 11, color: '#94a3b8' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function SelectField<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div style={ROW}>
      <span style={{ fontSize: 12, color: '#334' }}>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        style={{ padding: '4px 6px', border: '1px solid #d6dee8', borderRadius: 4, fontSize: 12 }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ColorField({ label, value, onCommitStart, onChange }: {
  label: string; value: string; onCommitStart: () => void; onChange: (v: string) => void;
}) {
  return (
    <div style={ROW}>
      <span style={{ fontSize: 12, color: '#334' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="color" value={value}
          style={{ width: 28, height: 24, padding: 0, border: '1px solid #d6dee8', borderRadius: 4, cursor: 'pointer', background: 'none' }}
          onFocus={onCommitStart}
          onChange={e => onChange(e.target.value)}
        />
        <input
          type="text" value={value}
          style={{ width: 72, padding: '4px 6px', border: '1px solid #d6dee8', borderRadius: 4, fontSize: 12 }}
          onFocus={onCommitStart}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function AccordionPanel({
  accordion, snapshot, breakpoint = 'desktop', selectedItemCellId,
  onUpdateAccordion, onUpdateAccordionResponsive,
  onAddItem, onDeleteItem, onDuplicateItem, onReorderItem, onToggleItem, onSelectItemCell,
  onPushSnapshot,
}: Props) {
  const focusSnapshot = useRef<BuilderState | null>(null);
  const onFocus = () => { if (!focusSnapshot.current) focusSnapshot.current = snapshot; };
  const flushFocus = () => { if (focusSnapshot.current) { onPushSnapshot(focusSnapshot.current); focusSnapshot.current = null; } };

  const p = accordion.props;
  const commit = () => onPushSnapshot(snapshot);
  const setProps = (updates: Partial<typeof p>, withSnapshot = true) => {
    if (withSnapshot) commit();
    onUpdateAccordion(accordion.id, { props: { ...p, ...updates } });
  };

  const items = accordion.items;
  const openIds = accordion.activeItems ?? [];

  // Responsive width — desktop writes layout, tablet/mobile write override.
  const r = accordion.responsive ?? {};
  const effWidth =
    breakpoint === 'mobile' ? (r.mobile?.width ?? r.tablet?.width ?? accordion.layout.width) :
    breakpoint === 'tablet' ? (r.tablet?.width ?? accordion.layout.width) :
    accordion.layout.width;
  const widthOverridden =
    (breakpoint === 'tablet' && r.tablet?.width !== undefined) ||
    (breakpoint === 'mobile' && r.mobile?.width !== undefined);

  return (
    <aside className={'pb-right-sidebar'} onBlur={flushFocus}>
      <div className={'pb-panel-header'}>
        <span className={'pb-panel-header-title'}>Accordion</span>
      </div>

      {/* ── Behaviour ── */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e9eef4' }}>
        <div style={{ ...LABEL_STYLE, marginBottom: 8 }}>Behaviour</div>
        <Toggle label="Allow multiple open" checked={p.allowMultiple} onChange={v => setProps({ allowMultiple: v })} />
        <SelectField
          label="Default open"
          value={p.defaultOpen}
          options={[{ value: 'first', label: 'First item' }, { value: 'all', label: 'All items' }, { value: 'none', label: 'None' }]}
          onChange={v => setProps({ defaultOpen: v })}
        />
        <SelectField
          label="Icon position"
          value={p.iconPosition}
          options={[{ value: 'right', label: 'Right' }, { value: 'left', label: 'Left' }]}
          onChange={v => setProps({ iconPosition: v })}
        />
        <NumberField
          label="Expanded icon rotation" value={p.expandedIconRotation ?? 180} min={0} max={360} suffix="°"
          onCommitStart={onFocus}
          onChange={v => setProps({ expandedIconRotation: v }, false)}
        />
      </div>

      {/* ── Layout ── */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e9eef4' }}>
        <div style={{ ...LABEL_STYLE, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>Layout{breakpoint !== 'desktop' ? ` · ${breakpoint}` : ''}</span>
          {widthOverridden && (
            <button
              onClick={() => { commit(); onUpdateAccordionResponsive(accordion.id, breakpoint, { width: undefined }); }}
              style={{ fontSize: 10, color: '#0b978e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >reset</button>
          )}
        </div>
        <NumberField
          label="Width" value={effWidth} min={160} max={2000} suffix="px"
          onCommitStart={onFocus}
          onChange={v => onUpdateAccordionResponsive(accordion.id, breakpoint, { width: Math.max(160, v) })}
        />
        <NumberField
          label="Item gap" value={p.itemGap} min={0} max={64} suffix="px"
          onCommitStart={onFocus}
          onChange={v => setProps({ itemGap: Math.max(0, v) }, false)}
        />
        <NumberField
          label="Content gap" value={p.contentGap ?? 0} min={0} max={64} suffix="px"
          onCommitStart={onFocus}
          onChange={v => setProps({ contentGap: Math.max(0, v) }, false)}
        />
      </div>

      {/* ── Border ── */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e9eef4' }}>
        <div style={{ ...LABEL_STYLE, marginBottom: 8 }}>Border</div>
        <Toggle label="Outer box" checked={p.containerBorder ?? true} onChange={v => setProps({ containerBorder: v })} />
        <Toggle label="Dividers between items" checked={p.itemDivider ?? true} onChange={v => setProps({ itemDivider: v })} />
        {((p.containerBorder ?? true) || (p.itemDivider ?? true)) && (
          <>
            <ColorField
              label="Color" value={p.separatorColor ?? '#e2e8f0'}
              onCommitStart={onFocus}
              onChange={v => setProps({ separatorColor: v }, false)}
            />
            <NumberField
              label="Thickness" value={p.separatorWidth ?? 1} min={1} max={20} suffix="px"
              onCommitStart={onFocus}
              onChange={v => setProps({ separatorWidth: Math.max(1, v) }, false)}
            />
            <SelectField
              label="Style"
              value={p.separatorStyle ?? 'solid'}
              options={[{ value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dashed' }, { value: 'dotted', label: 'Dotted' }]}
              onChange={v => setProps({ separatorStyle: v })}
            />
            {(p.containerBorder ?? true) && (
              <NumberField
                label="Corner radius" value={p.borderRadius ?? 4} min={0} max={40} suffix="px"
                onCommitStart={onFocus}
                onChange={v => setProps({ borderRadius: Math.max(0, v) }, false)}
              />
            )}
          </>
        )}
      </div>

      {/* ── Items ── */}
      <div style={{ padding: '8px 12px' }}>
        <div style={{ ...LABEL_STYLE, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Items ({items.length})</span>
          <button
            onClick={() => onAddItem(accordion.id)}
            style={{ fontSize: 11, color: '#fff', background: '#0b978e', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontWeight: 600 }}
          >+ Add Item</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map((item, i) => {
            const isOpen = openIds.includes(item.id);
            const isSelected = selectedItemCellId === item.contentCellId;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 5,
                  border: `1px solid ${isSelected ? '#0b978e' : '#e3e9f0'}`,
                  background: isSelected ? 'rgba(11,151,142,0.06)' : '#fff',
                  cursor: 'pointer',
                }}
                onClick={() => onSelectItemCell(item.contentCellId)}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334', flex: 1 }}>Item {i + 1}</span>
                <button title={isOpen ? 'Collapse' : 'Expand'}
                  onClick={e => { e.stopPropagation(); onToggleItem(accordion.id, item.id); }}
                  style={iconBtn}>{isOpen ? '▾' : '▸'}</button>
                <button title="Move up" disabled={i === 0}
                  onClick={e => { e.stopPropagation(); onReorderItem(accordion.id, i, i - 1); }}
                  style={{ ...iconBtn, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                <button title="Move down" disabled={i === items.length - 1}
                  onClick={e => { e.stopPropagation(); onReorderItem(accordion.id, i, i + 1); }}
                  style={{ ...iconBtn, opacity: i === items.length - 1 ? 0.3 : 1 }}>↓</button>
                <button title="Duplicate item"
                  onClick={e => { e.stopPropagation(); onDuplicateItem(accordion.id, item.id); }}
                  style={iconBtn}>⧉</button>
                <button title="Delete item" disabled={items.length <= 1}
                  onClick={e => { e.stopPropagation(); onDeleteItem(accordion.id, item.id); }}
                  style={{ ...iconBtn, color: '#e74c3c', opacity: items.length <= 1 ? 0.3 : 1 }}>✕</button>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, lineHeight: 1.4 }}>
          Click an item's heading or icon on the canvas to edit its text or icon. Click the panel below a header to drop content into it.
        </p>
      </div>
    </aside>
  );
}

const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#64748b',
  padding: '2px 4px', borderRadius: 3, lineHeight: 1,
};
