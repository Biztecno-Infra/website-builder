import React, { useCallback } from "react";
import Droppable from "../Droppable";
import { SpacerBlockProps } from "../../types";

export const SpacerBlock: React.FC<SpacerBlockProps> = ({
  block,
  handleDropper,
  handleBlockClick,
  isSelected
}) => {
  const { backgroundColor , padding ,customCss  } = block;

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
        border: `1px dashed ${isSelected && block.parentId ? "#006E75" : "transparent"}`,
        // borderRadius: 10,
        ...customCss
    }}
      onClick={handleBlockClick}
    />
  );
};
