import React, { useCallback } from "react";
import { TextAlign, ImageBlockProps } from "../../types";
import Droppable from "../Droppable";
import { convertStringtoStyle } from "@utils/index";
import { useTheme } from "styled-components";

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
      width: width ? `${width}%` : "auto",
      height: height ? `${height}%` : "auto",
      // maxWidth: "100%",
      // maxHeight: "100%",
      objectFit: "contain",
      textAlign: alignment as TextAlign,
      borderRadius:"inherit"
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

    const convertedStyle = convertStringtoStyle(customCss)
  
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
        lineHeight: 0 , 
        textAlign: (alignment as TextAlign) || "left",
        borderRadius: borderRadius ? `${borderRadius}px` : "none",
        outline: `1px dashed ${
          isSelected && block.parentId ? theme.colors.primary : "transparent"
        }`,
        ...convertedStyle,
        ...rest
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
