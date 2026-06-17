import { useState } from 'react';
import { Modal } from './Modal';

export type LayoutChangeChoice = 'preserve' | 'empty';

interface Props {
  /** Called with the chosen handling when the user confirms. */
  onConfirm: (choice: LayoutChangeChoice) => void;
  onCancel: () => void;
}

const OPTIONS: Array<{
  value: LayoutChangeChoice;
  title: string;
}> = [
  {
    value: 'preserve',
    title: 'Move content into Grid Cell 1'
  },
  {
    value: 'empty',
    title: 'Create empty grid and remove existing content',
  },
];

/**
 * Shown when converting a Free section that already contains child elements to
 * a Grid layout, letting the user choose whether to keep or discard content.
 * The recommended "preserve" option is pre-selected so no data is lost by default.
 */
export function LayoutChangeModal({ onConfirm, onCancel }: Props) {
  const [choice, setChoice] = useState<LayoutChangeChoice>('preserve');

  return (
    <Modal
      title="Change section layout?"
      confirmLabel="Confirm"
      cancelLabel="Cancel"
      onConfirm={() => onConfirm(choice)}
      onCancel={onCancel}
    >
      <p className={'pb-modal-message'}>
        This section contains existing elements. Choose how you would like to handle
        the current content when converting the section to a Grid layout.
      </p>
      <div className={'pb-modal-options'} role="radiogroup" aria-label="Content handling">
        {OPTIONS.map(opt => {
          const selected = choice === opt.value;
          return (
            <label
              key={opt.value}
              className={['pb-modal-option', selected && 'pb-active'].filter(Boolean).join(' ')}
            >
              <input
                type="radio"
                name="pb-layout-change"
                checked={selected}
                onChange={() => setChoice(opt.value)}
              />
              <span className={'pb-modal-option-body'}>
                <span className={'pb-modal-option-title'}>{opt.title}</span>
              </span>
            </label>
          );
        })}
      </div>
    </Modal>
  );
}
