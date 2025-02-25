import React, { useCallback, useMemo } from "react";
import Droppable from "../Droppable";
import { SpacerBlockProps } from "../../types";
import { parseCssString } from "@utils/index";

export const SpacerBlock: React.FC<SpacerBlockProps> = ({
  block,
  handleDropper,
  handleBlockClick,
  isSelected
}) => {
  const { backgroundColor , padding ,customCss ,  ...rest } = block;

  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      handleDropper(item, block.id);
    },
    [handleDropper]
  );

  const customStyles = useMemo(() => parseCssString(customCss || ""), [customCss]);

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
        ...customCss
    }}
      onClick={handleBlockClick}
    />
  );
};
