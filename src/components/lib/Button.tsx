import React from "react";
import styled from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon"; // Ensure the import is correct
import { SizeEnum, sizeMapping } from "@components/SvgIcon/SvgIcon";

interface ButtonProps {
  primary?: boolean;
  secondary?: boolean;
  transparent?: boolean;
  outline?: boolean;
  text?: string;
  handleClick?: () => void;
  iconProps?: {
    iconName?: CUSTOM_SVG_ICON; // Name of the icon
    iconPosition?: "left" | "right"; // Position of the icon
    iconSize?: SizeEnum; // Icon size
  };
}

const Button = styled.button<ButtonProps>`
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius}px;
  border: none;
  cursor: pointer;
  min-width: 7.5rem;
  background-color: ${({ theme, primary, secondary, transparent, outline }) => {
    if (primary) return theme.colors.primary;
    if (secondary) return theme.colors.secondary;
    if (transparent) return "transparent";
    if (outline) return "transparent";
    return theme.colors.primary;
  }};
  color: ${({ theme, primary, secondary, transparent }) => {
    if (primary || secondary) return theme.colors.textPrimary;
    if (transparent) return theme.colors.textPrimary;
    return theme.colors.textDefault;
  }};
  border: ${({ theme, outline }) =>
    outline ? `2px solid ${theme.colors.primary}` : "none"};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ iconProps }) => (iconProps?.iconName ? "0.5rem" : "0")};
  text-align: center;

  & > svg {
    width: ${({ iconProps }) =>
      iconProps?.iconSize ? sizeMapping[iconProps.iconSize] : "1rem"};
    height: ${({ iconProps }) =>
      iconProps?.iconSize ? sizeMapping[iconProps.iconSize] : "1rem"};
    display: inline-block;
  }

 
`;

const ButtonComponent: React.FC<ButtonProps> = ({
  primary,
  secondary,
  transparent,
  outline,
  text,
  handleClick,
  iconProps,
}) => {
  return (
    <Button
      primary={primary}
      secondary={secondary}
      transparent={transparent}
      outline={outline}
      onClick={handleClick}
      iconProps={iconProps}
    >
      {iconProps?.iconName && iconProps.iconPosition === "left" && (
        <SvgIcon name={iconProps.iconName} size={iconProps.iconSize} />
      )}
      {text}
      {iconProps?.iconName && iconProps.iconPosition === "right" && (
        <SvgIcon name={iconProps.iconName} size={iconProps.iconSize} />
      )}
    </Button>
  );
};

export { ButtonComponent };
