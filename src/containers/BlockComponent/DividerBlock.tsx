import React, { useCallback } from "react";
import Droppable from "../Droppable";
import { TextAlign , DividerBlockProps} from "../../types";

export const DividerBlock: React.FC<DividerBlockProps> = ({
  block,
  handleDropper,
  handleBlockClick,
  isSelected,
}) => {
  const { backgroundColor, thickness, alignment, padding, dividerColor } =
    block;

  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      handleDropper(item, block.id);
    },
    [handleDropper]
  );

  return (
    <Droppable
      accept="BLOCK"
      onDrop={handleDrop}
      style={{
        paddingTop: `${padding.top}px`,
        paddingRight: `${padding.right}px`,
        paddingBottom: `${padding.bottom}px`,
        paddingLeft: `${padding.left}px`,
        backgroundColor,
        textAlign: alignment as TextAlign,
        border: `2px solid ${isSelected && block.parentId ? "blue" : "transparent"}`,
      }}
      onClick={handleBlockClick}
    >
      <hr
        style={{
          height: thickness,
          backgroundColor: dividerColor,
        }}
      />
    </Droppable>
  );
};
