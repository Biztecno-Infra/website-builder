import type React from 'react';
import { useDrop } from 'react-dnd';
import { LAYOUT_DND_TYPE } from './LeftSidebar';

interface Props {
  afterId?: string;
  atStart?: boolean;
  onDrop: (afterId: string | undefined, columnSpans: number[], atStart?: boolean) => void;
}

export function SectionDropZone({ afterId, atStart, onDrop }: Props) {
  const [{ isOver, canDrop }, dropRef] = useDrop<{ columnSpans: number[] }, void, { isOver: boolean; canDrop: boolean }>({
    accept: LAYOUT_DND_TYPE,
    drop: item => onDrop(atStart ? undefined : afterId, item.columnSpans, atStart),
    collect: m => ({ isOver: m.isOver(), canDrop: m.canDrop() }),
  });

  if (!canDrop) return null;

  return (
    <div
      ref={dropRef as unknown as React.Ref<HTMLDivElement>}
      className={'pb-section-drop-zone'}
      style={{ height: isOver ? 52 : 10, background: isOver ? '#e0f7f7' : 'transparent', border: isOver ? '2px dashed #0b978e' : '2px dashed transparent' }}
    >
      {isOver && <span className={'pb-section-drop-zone-label'}>Drop here to insert grid section</span>}
    </div>
  );
}
