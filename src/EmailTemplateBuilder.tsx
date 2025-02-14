import { forwardRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styled from "styled-components";

import PropertyPanel from "@containers/PropertyPanel";
import ElementsPanel from "@containers/ElementsPanel";
import { BlockHookProvider } from "./context/BlockContext";
import { BlockHookRef, Theme } from "./types";
import CustomThemeProvider from "@context/ThemeContext";
import { ButtonComponent } from "@components/lib";
import CanvasContainer from "@containers/CanvasContainer";

interface Props {
  theme?: Theme;
}

// Main container for the layout
const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

// Container for the middle content (canvas and properties)
const MiddleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 20rem);
  height: 100%;
`;

// Header with buttons
const Header = styled.div`
  width: 100%;
  height: 4rem;
  display: flex;
  justify-content: flex-end;
  border: 1px solid #dddddd;
  padding-right: 10px;
`;

// Flex container for the canvas and properties panel
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 4rem);
`;

const EmailTemplateBuilder = forwardRef<BlockHookRef, Props>(({ theme }, ref) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <CustomThemeProvider theme={theme! || {}}>
        <BlockHookProvider ref={ref}>
          <Container>
            <ElementsPanel />
            <MiddleContainer>
              <Header>
                <ButtonComponent primary text="Send" />
                <ButtonComponent primary text="Actions" />
              </Header>
              <ContentWrapper>
                <CanvasContainer />
                <PropertyPanel />
              </ContentWrapper>
            </MiddleContainer>
          </Container>
        </BlockHookProvider>
      </CustomThemeProvider>
    </DndProvider>
  );
});

export default EmailTemplateBuilder;
