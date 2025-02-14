import styled, { css } from "styled-components";

interface ButtonProps {
  primary?: boolean;
  secondary?: boolean;
  transparent?: boolean;
  outline?: boolean;
  text?: string;  
  handleClick?: any;
}

const Button = styled.button<ButtonProps>`
  padding: ${({ theme }) => theme.spacing.medium};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: none;
  cursor: pointer;
  background-color: ${({ theme, primary, secondary, transparent, outline }) => {
    if (primary) return theme.colors.primary;
    if (secondary) return theme.colors.secondary;
    if (transparent) return "transparent";
    if (outline) return "transparent"; // Outline uses transparent background by default
    return theme.colors.primary; // Default to primary if no variant is selected
  }};
  color: ${({ theme, primary, secondary, transparent }) => {
    if (primary || secondary) return theme.textPrimary;
    if (transparent) return theme.colors.primary; // Transparent buttons have primary text
    return theme.colors.primary; // Default text color for any other cases
  }};
  border: ${({ theme, outline }) => outline ? `2px solid ${theme.colors.primary}` : "none"};

  &:hover {
    background-color: ${({ theme, primary, secondary, transparent, outline }) => {
      if (primary) return theme.colors.secondary;
      if (secondary) return theme.colors.primary;
      if (transparent) return `${theme.colors.primary}80`; // Slightly transparent hover effect
      if (outline) return theme.colors.primary;
      return theme.colors.secondary; // Default hover color
    }};
  }
`;

const ButtonComponent: React.FC<ButtonProps> = ({ primary, secondary, transparent, outline, text , handleClick }) => {
  return (
    <Button primary={primary} secondary={secondary} transparent={transparent} outline={outline} onClick={handleClick}>
      {text}
    </Button>
  );
};

export { ButtonComponent };
