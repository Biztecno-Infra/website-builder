import React, { forwardRef } from "react";
import { useDrop } from "react-dnd";

interface DroppableProps extends React.HTMLAttributes<HTMLElement> {
  accept: string | string[];
  onDrop: (item: any, monitor?: any, context?: any) => void;
  style?: React.CSSProperties;
}

const Droppable = forwardRef<HTMLElement, DroppableProps>(
  ({ accept, onDrop, children, style, ...props }, ref) => {
    // Dropping logic
    const [{ isOver }, dropRef] = useDrop({
      accept,
      canDrop: (item, monitor) => {
        return monitor.isOver({ shallow: true }); 
      },
      drop: (item, monitor) => {
        onDrop(item, monitor);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    });

    return (
      <div
        style={{
          backgroundColor: isOver ? "#b3cee5" : "",
          ...style,
        }}
        ref={node => {if(node) dropRef(node)}}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export default Droppable;
