// import React, { useCallback, useEffect, useState } from "react";
// import { TextAlign, ImageBlockProps } from "../../types";
// import Droppable from "../Droppable";
// import { convertStringtoStyle } from "@utils/index";
// import { useTheme } from "styled-components";

// interface CustomImageProps {
//   imageUrl?: string;
//   altText?: string;
//   alignment: string;
//   width?: number;
//   height?: number;
//   navigateToUrl?: string;
// }

// const CustomImage: React.FC<CustomImageProps> = React.memo(
//   ({ imageUrl, altText, alignment, width, height, navigateToUrl }) => {
//    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

//   useEffect(() => {
//     const img = new Image();
//     img.src = imageUrl as string;

//     img.onload = () => {
//       setImageDimensions({
//         width: img.naturalWidth,
//         height: img.naturalHeight
//       });
//     };
//   }, [imageUrl]);

//   const imageStyle: React.CSSProperties = {
//     width: width ? `${width}%` : "auto",  // You can control the image width with percentage
//     height: height ? `${height}%` : "auto",  // Similarly, height can be controlled
//     objectFit: "contain",  // Ensures the image is contained within its bounds
//     textAlign: alignment as TextAlign,
//     borderRadius: "inherit",
//     maxWidth: `${imageDimensions.width}px`,  // Limit max width based on original size
//     maxHeight: `${imageDimensions.height}px`, // Limit max height based on original size
//   };

//     return (
//       <img
//         src={imageUrl || ""}
//         alt={altText || "Block Image"}
//         style={imageStyle}
//       />
//     )
//   }
// );

// export const ImageBlock: React.FC<ImageBlockProps> = ({
//   block,
//   handleBlockClick,
//   handleDropper,
//   isSelected,
// }) => {
//   const {
//     imageUrl,
//     altText,
//     width,
//     height,
//     alignment,
//     backgroundColor,
//     padding,
//     borderColor,
//     borderRadius,
//     borderStyle,
//     borderWidth,
//     navigateToUrl,
//     customCss,
//     ...rest
//   } = block;
//    const theme = useTheme()

//   const handleDrop = useCallback(
//     (item: { type: string; name: string; id: number }) => {
//       handleDropper(item, block.id);
//     },
//     [handleDropper]
//   );

//     const convertedStyle = convertStringtoStyle(customCss)

//   return (
//     <Droppable
//       accept="BLOCK"
//       onDrop={handleDrop}
//       style={{
//         paddingTop: padding.top,
//         paddingRight: padding.right,
//         paddingBottom: padding.bottom,
//         paddingLeft: padding.left,
//         backgroundColor: backgroundColor,
//         lineHeight: 0 ,
//         textAlign: (alignment as TextAlign) || "left",
//         borderRadius: borderRadius ? `${borderRadius}px` : "none",
//         outline: `1px dashed ${
//           isSelected && block.parentId ? theme.colors.primary : "transparent"
//         }`,
//         ...convertedStyle,
//         ...rest
//       }}
//       onClick={handleBlockClick}
//     >
//       <CustomImage
//         imageUrl={imageUrl}
//         altText={altText}
//         alignment={alignment}
//         width={width}
//         height={height}
//         navigateToUrl={navigateToUrl}
//       />
//     </Droppable>
//   );
// };

import React, { useCallback, useEffect, useState } from "react";
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
}

const CustomImage: React.FC<CustomImageProps> = React.memo(
  ({ imageUrl, altText, alignment, width, height, navigateToUrl }) => {
    const [imageDimensions, setImageDimensions] = useState({
      width: 0,
      height: 0,
    });
    const [isLoading, setIsLoading] = useState(true); // Loading state to prevent flickering

    useEffect(() => {
      const img = new Image();
      img.src = imageUrl as string;
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        setIsLoading(false); // Image is loaded, set loading to false
      };
      img.onerror = () => {
        setIsLoading(false); // If there's an error, stop loading
      };
    }, [imageUrl]);

    const imageStyle: React.CSSProperties = {
      width: width ? `${width}%` : "auto", // You can control the image width with percentage
      height: height ? `${height}%` : "auto", // Similarly, height can be controlled
      objectFit: "contain", // Ensures the image is contained within its bounds
      textAlign: alignment as TextAlign,
      borderRadius: "inherit",
      maxWidth: `${imageDimensions.width}px`, // Limit max width based on original size
      maxHeight: `${imageDimensions.height}px`, // Limit max height based on original size
    };

    return isLoading ? (
      // Optionally render a placeholder or loading spinner
      <LoadingSpinner size={50} color="#007bff" />
    ) : (
      <img
        src={imageUrl || ""}
        alt={altText || "Block Image"}
        style={imageStyle}
      />
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
    borderColor,
    borderRadius,
    borderStyle,
    borderWidth,
    navigateToUrl,
    customCss,
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
        paddingTop: padding.top,
        paddingRight: padding.right,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
        backgroundColor: backgroundColor,
        lineHeight: 0,
        textAlign: (alignment as TextAlign) || "left",
        borderRadius: borderRadius ? `${borderRadius}px` : "none",
        outline: `1px dashed ${
          isSelected && block.parentId ? theme.colors.primary : "transparent"
        }`,
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
      />
    </Droppable>
  );
};
