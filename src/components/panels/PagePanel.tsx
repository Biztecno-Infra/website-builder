import { PanelHeader } from './PanelHeader';
import { PxInput, ToggleGroup } from './PanelFields';
import { CollapsibleSection, usePanelSections } from './CollapsibleSection';

const PAGE_WIDTH_OPTIONS = [
  { value: 'fluid', label: 'Full' },
  { value: 'fixed', label: 'Fixed' },
];

const MIN_PAGE_WIDTH = 320;
const MAX_PAGE_WIDTH = 3000;

const PAGE_PANEL_DEFAULTS: Record<string, boolean> = { layout: true };

interface Props {
  layoutWidth: 'fixed' | 'fluid';
  maxWidth: number;
  onUpdate: (layoutWidth: 'fixed' | 'fluid', maxWidth?: number) => void;
}

export function PagePanel({ layoutWidth, maxWidth, onUpdate }: Props) {
  const { sec, toggle } = usePanelSections(PAGE_PANEL_DEFAULTS, 'builder-sidebar-page');

  return (
    <aside className={'pb-right-sidebar pb-flex-col'}>
      <PanelHeader title="Page" />

      <CollapsibleSection sectionKey="layout" label="Layout" isOpen={sec('layout')} onToggle={toggle}>
        <div className={'pb-prop-row'}>
          <label>Width</label>
          <ToggleGroup
            options={PAGE_WIDTH_OPTIONS}
            value={layoutWidth === 'fixed' ? 'fixed' : 'fluid'}
            onChange={v => onUpdate(v as 'fixed' | 'fluid', maxWidth)}
          />
        </div>

        {layoutWidth === 'fixed' ? (
          <div className={'pb-prop-row'}>
            <label>Fixed Width</label>
            <PxInput
              value={maxWidth}
              min={MIN_PAGE_WIDTH}
              max={MAX_PAGE_WIDTH}
              // Only clamp on blur — clamping every keystroke would snap the
              // field back to the min while a multi-digit value is half-typed.
              onChange={v => onUpdate('fixed', v)}
              onBlur={() => onUpdate('fixed', Math.min(MAX_PAGE_WIDTH, Math.max(MIN_PAGE_WIDTH, maxWidth || MIN_PAGE_WIDTH)))}
            />
          </div>
        ) : (
          <div className={'pb-prop-row pb-hint-inline'} style={{ paddingLeft: 4 }}>
            Content stretches to the full browser width.
          </div>
        )}
      </CollapsibleSection>
    </aside>
  );
}
