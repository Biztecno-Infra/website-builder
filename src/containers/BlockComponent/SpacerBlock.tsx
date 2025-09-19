import React, { useCallback } from "react";
import Droppable from "../Droppable";
import { SpacerBlockProps } from "../../types";
import { convertStringtoStyle } from "@utils/index";
import { useTheme } from "styled-components";

export const SpacerBlock: React.FC<SpacerBlockProps> = ({
  block,
  handleDropper,
  handleBlockClick,
  isSelected,
}) => {
  const { backgroundColor, padding, customCss, ...rest } = block;
  const theme = useTheme();
  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      handleDropper(item, block.id);
    },
    [handleDropper]
  );
  const convertedStyle = convertStringtoStyle(customCss);

  return (
    <Droppable
      id={`block-${block.id}`}
      accept="BLOCK"
      onDrop={handleDrop}
      style={{
        paddingTop: `${padding.top}px`,
        paddingRight: `${padding.right}px`,
        paddingBottom: `${padding.bottom}px`,
        paddingLeft: `${padding.left}px`,
        backgroundColor,
        outline: `1px dashed ${
          isSelected && block.parentId ? theme.colors.primary : "transparent"
        }`,
        ...convertedStyle,
        ...rest,
      }}
      onClick={handleBlockClick}
    />
  );
};
