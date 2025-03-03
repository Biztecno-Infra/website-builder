import React from "react";
import styled, { useTheme } from "styled-components";

interface LayoutProps {
  name: string;
  children: React.ReactNode;
  containerStyle?: React.CSSProperties;
  subLabel?: boolean;  // New prop to handle subLabel styling
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  border-bottom: 1px solid #dddddd;
  padding: 1rem;
`;

const Label = styled.label<{ color: string; fontSize: string; paddingTop?: string; width?: string }>`
  &.ebr-BasePropertyWrapperLabel {
    line-height: 1rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: ${({ color }) => color};
    font-size: ${({ fontSize }) => fontSize};
    padding-top: ${({ paddingTop }) => paddingTop || '0'};
    width: ${({ width }) => width || 'auto'};

    @media screen and (min-width: 1919px) {
      font-size: 1rem;
      line-height: 1.25rem;
    }
  }
`;

function BasePropertyWrapper({
  name,
  children,
  containerStyle,
  subLabel = false,  // Default to false if not passed
}: LayoutProps) {
  const theme = useTheme();

  // Set default or custom styles for subLabel
  const labelStyles = subLabel
    ? { color: "#111111", paddingTop: "1rem", width: "100%", fontSize: "11px" }
    : { color: theme.colors.primary, fontSize: "14px" };  // default fontSize or theme-based color
  
  return (
    <Wrapper style={containerStyle}>
      <Label
        className="ebr-BasePropertyWrapperLabel"
        {...labelStyles}  // Spread the styles based on subLabel
      >
        {name}
      </Label>
      {children}
    </Wrapper>
  );
}

export default BasePropertyWrapper;
