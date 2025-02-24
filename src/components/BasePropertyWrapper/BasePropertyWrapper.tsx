import React from "react";
import styled, { useTheme } from "styled-components";

interface LayoutProps {
  name: string;
  children: React.ReactNode;
  containerStyle?: React.CSSProperties;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;  
`;

const Label = styled.label<{ color: string; fontSize: string }>`
  line-height: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ color }) => color};
  font-size: ${({ fontSize }) => fontSize};

  @media screen and (min-width: 1919px) {
    font-size: 1rem;
    line-height: 1.25rem;
  }
`;

function BasePropertyWrapper({ name, children, containerStyle }: LayoutProps) {
  const theme = useTheme();
  return (
    <Wrapper style={containerStyle}>
      <Label color={theme.colors.primary} fontSize={theme.fontSize.labelHeader}>{name}</Label>
      {children}
    </Wrapper>
  );
}

export default BasePropertyWrapper;
