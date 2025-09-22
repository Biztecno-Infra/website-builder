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
    textContainerBackgroundColor,
    textContainerPadding,
    ...rest
  } = block;
  const theme = useTheme();

  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      handleDropper(item, block.id);
    },
    [handleDropper]
  );
  const convertedStyle = convertStringtoStyle(customCss);
  const backgroundImageStyle = backgroundImage
    ? {
        backgroundImage: backgroundImage.startsWith("url")
          ? backgroundImage
          : `url(${backgroundImage})`,
        backgroundPosition: backgroundPosition,
        backgroundRepeat: backgroundRepeat,
        backgroundSize: backgroundSize,
      }
    : {};

  const sanitizedText = (text ?? "")
    .replaceAll(/<p>/g, "<div>")
    .replaceAll(/<\/p>/g, "</div>");

  return (
    <Droppable
      id={`block-${block.id}`}
      accept="BLOCK"
      onDrop={handleDrop}
      style={{
        width: "100%",
        maxWidth: "100%",
        color: color,
        fontFamily: fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight,
        backgroundColor: textContainerBackgroundColor || "",
        paddingTop: `${textContainerPadding.top || 0}px`,
        paddingRight: `${textContainerPadding.right || 0}px`,
        paddingBottom: `${textContainerPadding.bottom || 0}px`,
        paddingLeft: `${textContainerPadding.left || 0}px`,
        textAlign: alignment as TextAlign,
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
        lineHeight: lineHeight ? `${lineHeight}px` : "16px",
        outline: `1px dashed ${
          isSelected && block.parentId ? theme.colors.primary : "transparent"
        }`,
        ...convertedStyle,
        ...backgroundImageStyle,
      }}
      onClick={handleBlockClick}
    >
      {/* {text} */}
      <div
        style={{
          ...rest,
          backgroundColor: backgroundColor,
          display: "inline-block",
          // textAlign: "center",
          paddingTop: `${padding.top}px`,
          paddingRight: `${padding.right}px`,
          paddingBottom: `${padding.bottom}px`,
          paddingLeft: `${padding.left}px`,
          maxWidth: "100%", // ✅ prevent child from overflowing parent
          boxSizing: "border-box",
          // width: rest.width ? `${rest.width}px` : "auto",
          // height: rest.height ? `${rest.height}px` : "auto",
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedText }}
      />
    </Droppable>
  );
};
