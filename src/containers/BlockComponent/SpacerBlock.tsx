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
        outline: ` ${
          isSelected && block.parentId ? `1px dashed ${theme.colors.primary}` : "none"
        }`,
        zIndex: isSelected ? 10 : "auto",
        ...convertedStyle,
        ...rest,
      }}
      onClick={handleBlockClick}
    />
  );
};
