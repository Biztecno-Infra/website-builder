import React, { useCallback } from "react";
import Droppable from "../Droppable";
import { TextBlockProps, TextAlign } from "types";
import { convertStringtoStyle } from "@utils/index";

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
    ...rest
  } = block;

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
        lineHeight: lineHeight ? `${lineHeight}px` : "19.2px",
        border: `1px dashed ${
          isSelected && block.parentId ? "#006E75" : "transparent"
        }`,
        ...convertedStyle,
        ...rest,
        ...(backgroundImage &&
          backgroundImage.startsWith("url") && {
            backgroundImage: backgroundImage,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }),
      }}
      onClick={handleBlockClick}
    >
      {text}
    </Droppable>
  );
};
