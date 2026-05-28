import type React from 'react';
import { useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { LAYOUT_DND_TYPE, TEMPLATE_DND_TYPE } from './LeftSidebar';
import type { TemplateDragItem } from './LeftSidebar';
import type { TemplateIds, TemplateResult } from '../data/sectionTemplates';

interface Props {
  afterId?: string;
  atStart?: boolean;
  onDrop: (afterId: string | undefined, columnSpans: number[], atStart?: boolean) => void;
  onDropTemplate?: (afterId: string | undefined, buildFn: (ids: TemplateIds) => TemplateResult, atStart?: boolean) => void;
}

export function SectionDropZone({ afterId, atStart, onDrop, onDropTemplate }: Props) {
  const resolvedAfterId = atStart ? undefined : afterId;

  const [{ isLayoutOver, canLayout }, layoutDropRef] = useDrop<{ columnSpans: number[] }, void, { isLayoutOver: boolean; canLayout: boolean }>({
    accept: LAYOUT_DND_TYPE,
    drop: item => onDrop(resolvedAfterId, item.columnSpans, atStart),
    collect: m => ({ isLayoutOver: m.isOver(), canLayout: m.canDrop() }),
  });

  const [{ isTemplateOver, canTemplate }, templateDropRef] = useDrop<TemplateDragItem, void, { isTemplateOver: boolean; canTemplate: boolean }>({
    accept: TEMPLATE_DND_TYPE,
    drop: item => onDropTemplate?.(resolvedAfterId, item.buildFn, atStart),
    collect: m => ({ isTemplateOver: m.isOver(), canTemplate: m.canDrop() }),
  });

  const domRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useCallback((node: HTMLDivElement | null) => {
    domRef.current = node;
    (layoutDropRef as (el: HTMLDivElement | null) => void)(node);
    (templateDropRef as (el: HTMLDivElement | null) => void)(node);
  }, [layoutDropRef, templateDropRef]);

  const canDrop = canLayout || canTemplate;
  const isOver  = isLayoutOver || isTemplateOver;

  if (!canDrop) return null;

  return (
    <div
      ref={mergedRef as unknown as React.Ref<HTMLDivElement>}
      className={'pb-section-drop-zone'}
      style={{
        height: isOver ? 52 : 10,
        background: isOver ? '#e0f7f7' : 'transparent',
        border: isOver ? '2px dashed #0b978e' : '2px dashed transparent',
      }}
    >
      {isOver && (
        <span className={'pb-section-drop-zone-label'}>
          {isTemplateOver ? 'Drop to insert template' : 'Drop here to insert grid section'}
        </span>
      )}
    </div>
  );
}
