import React from "react";
import styled from "styled-components";

interface LayoutProps {
  name: string;
  children: React.ReactNode;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 1rem;
`;

const Header = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  padding-bottom: 1rem;
`;

function BasePropertyWrapper({ name, children }: LayoutProps) {
  return (
    <Wrapper>
      <Header>{name} Settings</Header>
      {children}
    </Wrapper>
  );
}

export default BasePropertyWrapper;
