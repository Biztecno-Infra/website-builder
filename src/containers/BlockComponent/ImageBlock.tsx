import React, { useCallback, useMemo } from "react";
import { TextAlign, ImageBlockProps } from "../../types";
import Droppable from "../Droppable";

interface CustomImageProps {
  imageUrl?: string;
  altText?: string;
  alignment: string; 
  width?: number;
  height?: number;
  navigateToUrl?: string;
}

const CustomImage: React.FC<CustomImageProps> = React.memo(
  ({ imageUrl, altText, alignment, width, height, navigateToUrl }) => {
    const imageStyle: React.CSSProperties = {
      width: width ? `${width}px` : "auto",
      height: height ? `${height}px` : "auto",
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
      textAlign: alignment as TextAlign,
    };

    return (
      <img
        src={imageUrl || ""}
        alt={altText || "Block Image"}
        style={imageStyle}
      />
    )
  }
);

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  handleBlockClick,
  handleDropper,
  isSelected,
}) => {
  const {
    imageUrl,
    altText,
    width,
    height,
    alignment,
    backgroundColor,
    padding,
    borderColor,
    borderRadius,
    borderStyle,
    borderWidth,
    navigateToUrl,
  } = block;

  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      handleDropper(item, block.id);
    },
    [handleDropper]
  );

  return (
    <Droppable
      accept="BLOCK"
      onDrop={handleDrop}
      style={{
        paddingTop: padding.top,
        paddingRight: padding.right,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
        backgroundColor: backgroundColor,
        textAlign: alignment || "left",
        borderRadius: borderRadius ? `${borderRadius}px` : "",
        border:
          isSelected && block.parentId
            ? "1px dashed #006E75"
            : borderWidth
            ? `${borderWidth}px ${borderStyle} ${borderColor}`
            : "1px solid transparent",
        ...block.customCss,
      }}
      onClick={handleBlockClick}
    >
      <CustomImage
        imageUrl={imageUrl}
        altText={altText}
        alignment={alignment}
        width={width}
        height={height}
        navigateToUrl={navigateToUrl}
      />
    </Droppable>
  );
};
