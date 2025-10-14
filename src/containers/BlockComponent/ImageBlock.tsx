import React, { useCallback, useEffect, useRef, useState } from "react";
import { TextAlign, ImageBlockProps } from "../../types";
import Droppable from "../Droppable";
import { convertStringtoStyle } from "@utils/index";
import { useTheme } from "styled-components";
import LoadingSpinner from "@components/lib/LoadingContainer";

interface CustomImageProps {
  imageUrl?: string;
  altText?: string;
  alignment: string;
  width?: number;
  height?: number;
  navigateToUrl?: string;
  borderColor?: string ;
  borderRadius?: number ;  
  borderStyle?: string ; 
  borderWidth?: number ;
}

const CustomImage: React.FC<CustomImageProps> = React.memo(
  ({
    imageUrl,
    altText,
    alignment,
    width,
    height,
    navigateToUrl,
    borderColor,
    borderRadius,
    borderStyle,
    borderWidth,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    // Get natural image size
    useEffect(() => {
      if (!imageUrl) return;

      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        setNaturalSize({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        setIsLoading(false);
      };
      img.onerror = () => {
        setIsLoading(false);
      };
    }, [imageUrl]);

    // Watch container width using ResizeObserver
    useEffect(() => {
      if (!containerRef.current) return;

      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.contentRect.width) {
            setContainerWidth(entry.contentRect.width);
          }
        }
      });

      observer.observe(containerRef.current);

      return () => observer.disconnect();
    }, []);

    // Calculate final width based on natural size and container
    const calculatedWidth =
      width && naturalSize.width
        ? (naturalSize.width * width) / 100
        : naturalSize.width;

    const finalWidth = Math.min(calculatedWidth, naturalSize.width, containerWidth);

    const imageStyle: React.CSSProperties = {
      width: finalWidth,
      height: "auto", // maintain aspect ratio
      objectFit: "contain",
      imageRendering: "-webkit-optimize-contrast",
      borderColor,
      borderStyle,
      borderWidth,
      borderRadius: borderRadius ? `${borderRadius}px` : undefined,
      display: "block",
      maxWidth: "100%",
    };

    const wrapperStyle: React.CSSProperties = {
      display: "flex",
      justifyContent:
        alignment === "center"
          ? "center"
          : alignment === "right"
          ? "flex-end"
          : "flex-start",
      width: "100%",
    };

    return (
      <div ref={containerRef} style={wrapperStyle}>
        {isLoading ? (
          <LoadingSpinner size={50} color="#007bff" />
        ) : (
          <img
            src={imageUrl || ""}
            alt={altText || "Block Image"}
            style={imageStyle}
          />
        )}
      </div>
    );
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
    navigateToUrl,
    customCss,
    borderColor , borderRadius , borderStyle , borderWidth ,
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

  return (
    <Droppable
      id={`block-${block.id}`}
      accept="BLOCK"
      onDrop={handleDrop}
      style={{
        display: "flex",
        justifyContent: (alignment as TextAlign) === "center" ? "center" : (alignment as TextAlign) === "right" ? "flex-end" : "flex-start",
        width: "100%",
        paddingTop: padding.top,
        paddingRight: padding.right,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
        backgroundColor: backgroundColor,
        lineHeight: 0,
        textAlign: (alignment as TextAlign) || "left",
        // borderRadius: borderRadius ? `${borderRadius}px` : "none",
       outline: ` ${
          isSelected && block.parentId ? `1px dashed ${theme.colors.primary}` : "none"
        }`,
        zIndex: isSelected ? 10 : "auto",
        ...convertedStyle,
        ...rest,
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
        borderColor = {borderColor}
        borderRadius = {borderRadius}  
        borderStyle ={borderStyle} 
        borderWidth ={borderWidth}
      />
    </Droppable>
  );
};
