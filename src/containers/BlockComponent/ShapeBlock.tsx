import React, { useCallback } from "react";
import styled, { useTheme } from "styled-components";
import Droppable from "@containers/Droppable/Droppable";
import { ShapeBlockProps, TextAlign } from "types";

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

const ContentContainer = styled.div<{
  $textColor: string;
  $backgroundColor: string;
  $borderRadius: string;
  $width: string;
  $height: string;
}>`
  width: ${(p) => p.$width};
  height: ${(p) => p.$height};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${(p) => p.$borderRadius};
  background-color: ${(p) => p.$backgroundColor};
  color: ${(p) => p.$textColor};
  text-align: center;
  overflow: hidden;
  word-break: break-word;
  padding: 8px;
  box-sizing: border-box;
`;

const ImageContainer = styled.div<{
  $imageUrl: string;
  $borderRadius: string;
  $backgroundColor: string;
  $width: string;
  $height: string;
}>`
  width: ${(p) => p.$width};
  height: ${(p) => p.$height};
  background: ${(p) => `url('${p.$imageUrl}') center/cover no-repeat`};
  border-radius: ${(p) => p.$borderRadius};
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(p) => p.$backgroundColor};
  position: relative;
`;

const TextOverlay = styled.div<{
  $textColor: string;
}>`
  color: ${(p) => p.$textColor};
  text-align: center;
  padding: 8px;
  word-break: break-word;
  position: relative;
  z-index: 2;
  width: 100%;
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
    verticalAlign
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
          $width={"100%"}
          $height={"100%"}
        >
          {text && <TextOverlay $textColor={color}>{text}</TextOverlay>}
        </ImageContainer>
      );
    } else {
      return (
        <ContentContainer
          $textColor={color}
          $backgroundColor={shapeColor || backgroundColor}
          $borderRadius={resolvedBorderRadius as string}
          $width={"100%"}
          $height={"100%"}
        >
          {text}
        </ContentContainer>
      );
    }
  };

  // Circle / oval enforce equal width and height
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
        outline: ` ${
          isSelected && block.parentId
            ? `1px dashed ${theme.colors.primary}`
            : "none"
        }`,
        zIndex: isSelected ? 10 : "auto",
        display: "flex", // ✅ Use flex to align shapes
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
