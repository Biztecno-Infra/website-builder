import React, { forwardRef } from "react";
import { useDrop } from "react-dnd";
import styled from "styled-components";

interface DroppableProps extends React.HTMLAttributes<HTMLElement> {
  accept: string | string[];
  onDrop: (item: any, monitor?: any, context?: any) => void;
  style?: React.CSSProperties;
  backgroundColor?: string;
}

// Define a styled div that will be used for the droppable area
const DroppableWrapper = styled.div<{ $isOver: boolean  , $backgroundColor: string}>`
  background: ${({ $isOver , $backgroundColor }) => ($isOver ? "#b3cee5" : $backgroundColor)};
  ${({ style }) => style && { ...style }};
`;

const Droppable = forwardRef<HTMLElement, DroppableProps>(
  ({ accept, onDrop, children, style,backgroundColor , ...props  }, ref) => {
    // Dropping logic
    const [{ isOver }, dropRef] = useDrop({
      accept,
      canDrop: (item, monitor) => monitor.isOver({ shallow: true }),
      drop: (item, monitor) => {
        onDrop(item, monitor);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    });

    return (
      <DroppableWrapper
        ref={node => { if (node) dropRef(node); }}
        $isOver={isOver}
        $backgroundColor={backgroundColor || ""}
        style={style}
        {...props}
      >
        {children}
      </DroppableWrapper>
    );
  }
);

export default Droppable;
