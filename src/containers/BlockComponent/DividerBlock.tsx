import React, { useCallback } from "react";
import Droppable from "../Droppable";
import { TextAlign, DividerBlockProps } from "../../types";
import { convertStringtoStyle } from "@utils/index";
import { useTheme } from "styled-components";

export const DividerBlock: React.FC<DividerBlockProps> = ({
  block,
  handleDropper,
  handleBlockClick,
  isSelected,
}) => {
  const {
    backgroundColor,
    thickness,
    alignment,
    padding,
    dividerColor,
    customCss,
    ...rest
  } = block;
   const theme = useTheme()

  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      handleDropper(item, block.id);
    },
    [handleDropper]
  );

  const convertedStyle = convertStringtoStyle(customCss);

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
        outline: `1px dashed ${
          isSelected && block.parentId ? theme.colors.primary : "transparent"
        }`,
        ...convertedStyle,
        ...rest,
      }}
      onClick={handleBlockClick}
    >
      <hr
        style={{
          height: thickness,
          backgroundColor: dividerColor,
          margin: 0,
        }}
      />
    </Droppable>
  );
};
