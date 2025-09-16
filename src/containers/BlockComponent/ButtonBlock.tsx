import React, { useCallback } from "react";
import { TextAlign, ButtonBlockProps } from "../../types";
import Droppable from "../Droppable";
import { convertStringtoStyle } from "@utils/index";
import { useTheme } from "styled-components";

const CustomButton: React.FC<{
  buttonText?: string;
  textColor?: string;
  buttonColor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  borderWidth?: number;
  borderRadius?: number;
  borderColor?: string;
  borderStyle?: string;
  buttonPadding?: any;
  width: number;
  height: number;
}> = ({
  buttonText,
  textColor,
  buttonColor,
  fontFamily,
  fontSize,
  fontWeight,
  borderColor,
  borderRadius,
  borderWidth,
  borderStyle = "",
  buttonPadding,
  width, height
}) => {
    const buttonStyle = {
      color: textColor || "inherit",
      backgroundColor: buttonColor,
      fontFamily: fontFamily || "inherit",
      fontSize: fontSize ? `${fontSize}px` : "14px",
      fontWeight: fontWeight,
      cursor: "pointer",
      // wordBreak: "break-word", 
      border: borderWidth
        ? `${borderWidth}px ${borderStyle} ${borderColor ?? ""}`
        : "none",
      borderRadius: borderRadius ? `${borderRadius}px` : "",
      paddingTop: buttonPadding?.top,
      paddingRight: buttonPadding?.right,
      paddingBottom: buttonPadding?.bottom,
      paddingLeft: buttonPadding?.left,
      width,
      height
    } as React.CSSProperties;

    const buttonContent = <button style={buttonStyle}>{buttonText}</button>;

    return buttonContent;
  };

export const ButtonBlock: React.FC<ButtonBlockProps> = ({
  block,
  handleBlockClick,
  handleDropper,
  isSelected
}) => {
  const {
    buttonText,
    color,
    backgroundColor,
    buttonColor,
    fontFamily,
    fontSize,
    fontWeight,
    alignment,
    padding,
    borderColor,
    borderRadius,
    borderWidth,
    borderStyle,
    customCss,
    buttonPadding,
    width,
    height,
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
        paddingTop: padding?.top,
        paddingRight: padding?.right,
        paddingBottom: padding?.bottom,
        paddingLeft: padding?.left,
        backgroundColor: backgroundColor,
        textAlign: alignment as TextAlign,
        outline: `1px dashed ${
          isSelected && block.parentId ? theme.colors.primary : "transparent"
        }`,        
        ...convertedStyle,
        ...rest
      }}
      onClick={handleBlockClick}
    >
      <CustomButton
        buttonText={buttonText}
        textColor={color}
        buttonColor={buttonColor}
        fontFamily={fontFamily}
        fontSize={fontSize}
        fontWeight={fontWeight}
        borderColor={borderColor}
        borderRadius={borderRadius}
        borderWidth={borderWidth}
        borderStyle={borderStyle}
        buttonPadding={buttonPadding}
        width={width}
        height={height}
      />
    </Droppable>
  );
};
