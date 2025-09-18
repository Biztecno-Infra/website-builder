import React, { useCallback } from "react";
import Droppable from "../Droppable";
import { TextBlockProps, TextAlign } from "types";
import { convertStringtoStyle } from "@utils/index";
import { useTheme } from "styled-components";

export const TextBlock: React.FC<TextBlockProps> = ({
  block,
  handleDropper,
  handleBlockClick,
  isSelected,
}) => {
  const {
    text,
    color,
    backgroundColor,
    fontFamily,
    fontSize,
    fontWeight,
    padding,
    alignment,
    backgroundImage,
    lineHeight,
    navigateToUrl,
    customCss,
    backgroundPosition,
    backgroundRepeat,
    backgroundSize,
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
  const backgroundImageStyle = backgroundImage
    ? {
      backgroundImage: backgroundImage.startsWith('url') 
      ? backgroundImage 
      : `url(${backgroundImage})`,
            backgroundPosition: backgroundPosition,
        backgroundRepeat: backgroundRepeat,
        backgroundSize: backgroundSize,
      }
    : {};


  return (
    <Droppable
      accept="BLOCK"
      onDrop={handleDrop}
      style={{
        color: color,
        backgroundColor: backgroundColor,
        fontFamily: fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight,
        paddingTop: `${padding.top}px`,
        paddingRight: `${padding.right}px`,
        paddingBottom: `${padding.bottom}px`,
        paddingLeft: `${padding.left}px`,
        textAlign: alignment as TextAlign,
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
        lineHeight: lineHeight ? `${lineHeight}px` : "16px",
        outline:  `1px dashed ${
          isSelected && block.parentId ? theme.colors.primary : "transparent"
        }`,
        // border: `1px dashed ${
        //   isSelected && block.parentId ? theme.colors.primary : "transparent"
        // }`,
        ...convertedStyle,
        ...backgroundImageStyle, 
        ...rest,
      }}
      onClick={handleBlockClick}
    >
      <div dangerouslySetInnerHTML={{ __html: text ?? "" }} />
    </Droppable>
  );
};
