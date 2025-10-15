// DraggableBlock.tsx
import React from "react";
import { useDrag } from "react-dnd";

interface DraggableBlockProps {
  blockId: string;
  children: React.ReactNode;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ blockId, children }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "CANVAS_BLOCK",
    item: { id: blockId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
    >
      {children}
    </div>
  );
};

export default DraggableBlock;