import React, { useCallback, useMemo } from "react";
import Droppable from "../Droppable";
import { TextBlockProps, TextAlign } from "../../types";
import { parseCssString } from "@utils/index";


export const TextBlock: React.FC<TextBlockProps> = ({
  block,
  handleDropper,
  handleBlockClick,
  isSelected
}) => {
  const {
    text,
    textColor,
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
  console.log(block)

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
        color: textColor,
        backgroundColor: backgroundColor,
        fontFamily: fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight,
        paddingTop: `${padding.top}px`,
        paddingRight: `${padding.right}px`,
        paddingBottom: `${padding.bottom}px`,
        paddingLeft: `${padding.left}px`,
        textAlign: alignment as TextAlign,
        backgroundImage: backgroundImage?.startsWith("url")
          ? backgroundImage
          : `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
        lineHeight: lineHeight ? `${lineHeight}px` : "19.2px",
        border: `1px dashed ${isSelected && block.parentId ? "#006E75" : "transparent"}`,
        ...customStyles,
        ...rest,
      }}
      onClick={handleBlockClick}
    >
      {text}
    </Droppable>
  );
};
