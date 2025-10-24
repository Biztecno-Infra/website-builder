import React, { useCallback } from "react";
import styled, { useTheme } from "styled-components";
import Droppable from "@containers/Droppable/Droppable";
import { ShapeBlockProps } from "types";

const ShapeWrapper = styled.div<{
  $width: string;
  $height: string;
  $borderRadius: string;
  $zIndex?: number;
  $borderWidth: string;
  $borderStyle: string;
  $borderColor: string;
  $customCss: string;
}>`
  position: relative;
  display: block;
  width: ${(p) => p.$width};
  height: ${(p) => p.$height};
  max-width: 100%;
  border-radius: ${(p) => p.$borderRadius};
  overflow: hidden;
  box-sizing: border-box;
  z-index: ${(p) => p.$zIndex ?? 0};
  border: ${(p) =>
    p.$borderWidth
      ? `${p.$borderWidth}px ${p.$borderStyle || "solid"} ${
          p.$borderColor || "black"
        }`
      : "none"};
  ${(p) => p.$customCss || ""};
`;

/* Updated ContentContainer stays mostly the same (ensure text-align reads from prop) */
const ContentContainer = styled.div<{
  $textColor: string;
  $backgroundColor: string;
  $borderRadius: string;
  $width: string;
  $height: string;
  $fontSize?: string | number;
  $textAlign?: "left" | "center" | "right" | "justify";
  $verticalAlign?: "top" | "middle" | "bottom";
}>`
  width: ${(p) => p.$width};
  height: ${(p) => p.$height};
  display: flex;
  justify-content: ${(p) =>
    p.$textAlign === "left"
      ? "flex-start"
      : p.$textAlign === "right"
      ? "flex-end"
      : "center"};
  align-items: ${(p) =>
    p.$verticalAlign === "top"
      ? "flex-start"
      : p.$verticalAlign === "bottom"
      ? "flex-end"
      : "center"};
  border-radius: ${(p) => p.$borderRadius};
  background-color: ${(p) => p.$backgroundColor};
  color: ${(p) => p.$textColor};
  /* Hierarchical text alignment for lines/paragraphs */
  text-align: ${(p) => p.$textAlign || "center"};
  overflow: hidden;
  word-break: break-word;
  padding: 8px;
  box-sizing: border-box;
  font-size: ${(p) =>
    p.$fontSize
      ? typeof p.$fontSize === "number"
        ? `${p.$fontSize}px`
        : p.$fontSize
      : "inherit"};
`;

/* Image container unchanged except will receive $textAlign and $verticalAlign */
const ImageContainer = styled.div<{
  $imageUrl: string;
  $borderRadius: string;
  $backgroundColor: string;
  $width: string;
  $height: string;
  $textAlign?: "left" | "center" | "right" | "justify";
  $verticalAlign?: "top" | "middle" | "bottom";
}>`
  width: ${(p) => p.$width};
  height: ${(p) => p.$height};
  background: ${(p) => `url('${p.$imageUrl}') center/cover no-repeat`};
  border-radius: ${(p) => p.$borderRadius};
  display: flex;
  justify-content: ${(p) =>
    p.$textAlign === "left"
      ? "flex-start"
      : p.$textAlign === "right"
      ? "flex-end"
      : "center"};
  align-items: ${(p) =>
    p.$verticalAlign === "top"
      ? "flex-start"
      : p.$verticalAlign === "bottom"
      ? "flex-end"
      : "center"};
  background-color: ${(p) => p.$backgroundColor};
  position: relative;
`;

/* ✅ Updated: overlay width no longer forced to 100% and respects textAlign */
const TextOverlay = styled.div<{
  $textColor: string;
  $fontSize?: string | number;
  $textAlign?: "left" | "center" | "right" | "justify";
}>`
  color: ${(p) => p.$textColor};
  text-align: ${(p) => p.$textAlign || "center"};
  padding: 8px;
  word-break: break-word;
  position: relative;
  z-index: 2;
  /* allow parent flexbox to horizontally position the overlay */
  width: auto;
  max-width: 90%;
  font-size: ${(p) =>
    p.$fontSize
      ? typeof p.$fontSize === "number"
        ? `${p.$fontSize}px`
        : p.$fontSize
      : "inherit"};
  /* keep multi-line containment safe */
  overflow-wrap: break-word;
`;

const ShapeBlock: React.FC<ShapeBlockProps> = ({
  block,
  handleDropper,
  handleBlockClick,
  isSelected,
}) => {
  const {
    shape,
    width,
    height,
    backgroundColor = "#2F80ED",
    borderRadius,
    text,
    color = "#ffffff",
    padding,
    borderWidth,
    borderStyle,
    borderColor,
    customCss,
    imageUrl,
    shapeColor,
    alignment,
    fontSize,
    textAlign,
    verticalAlign,
  } = block;
  const theme = useTheme();

  const borderRadiusMap: Record<string, string> = {
    rectangle: "0",
    rounded: "10px",
    circle: "50%",
    oval: "50%",
  };

  const resolvedBorderRadius = borderRadius || borderRadiusMap[shape] || "0";

  const handleDrop = useCallback(
    (item: { id: string; type: string }) => {
      handleDropper(item, block.id);
    },
    [handleDropper, block.id]
  );

  const renderContent = () => {
    if (imageUrl) {
      return (
        <ImageContainer
          $imageUrl={imageUrl}
          $borderRadius={resolvedBorderRadius as string}
          $backgroundColor={shapeColor || "transparent"}
          $width="100%"
          $height="100%"
          $textAlign={textAlign}
          $verticalAlign={verticalAlign}
        >
          {text && (
            <TextOverlay
              $textColor={color}
              $fontSize={fontSize}
              $textAlign={textAlign}
              dangerouslySetInnerHTML={{ __html: text }}
            />
          )}
        </ImageContainer>
      );
    }

    return (
      <ContentContainer
        $textColor={color}
        $backgroundColor={shapeColor || backgroundColor}
        $borderRadius={resolvedBorderRadius as string}
        $width="100%"
        $height="100%"
        $fontSize={fontSize}
        $textAlign={textAlign}
        $verticalAlign={verticalAlign}
        dangerouslySetInnerHTML={{ __html: text || "" }}
      />
    );
  };

  const isCircle = shape === "circle";
  const resolvedWidth =
    typeof width === "number"
      ? `${width}px`
      : `${parseInt(width || "100", 10)}px`;
  const resolvedHeight = isCircle
    ? resolvedWidth
    : typeof height === "number"
    ? `${height}px`
    : `${parseInt(height || "100", 10)}px`;

  return (
    <Droppable
      accept="BLOCK"
      onDrop={handleDrop}
      style={{
        outline:
          isSelected && block.parentId
            ? `1px dashed ${theme.colors.primary}`
            : "none",
        zIndex: isSelected ? 10 : "auto",
        display: "flex",
        justifyContent:
          alignment === "center"
            ? "center"
            : alignment === "right"
            ? "flex-end"
            : "flex-start",
        width: "100%",
        maxWidth: "100%",
        backgroundColor: backgroundColor,
        paddingTop: `${padding?.top ?? 0}px`,
        paddingRight: `${padding?.right ?? 0}px`,
        paddingBottom: `${padding?.bottom ?? 0}px`,
        paddingLeft: `${padding?.left ?? 0}px`,
      }}
      onClick={handleBlockClick}
    >
      <ShapeWrapper
        role="group"
        aria-label={`shape-${block.id}`}
        $width={resolvedWidth}
        $height={resolvedHeight}
        $borderRadius={String(resolvedBorderRadius || "0")}
        $borderWidth={borderWidth !== undefined ? String(borderWidth) : "0"}
        $borderStyle={borderStyle || "solid"}
        $borderColor={borderColor || "black"}
        $customCss={customCss || ""}
      >
        {renderContent()}
      </ShapeWrapper>
    </Droppable>
  );
};

export default ShapeBlock;
