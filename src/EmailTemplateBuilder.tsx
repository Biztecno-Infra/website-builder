import { forwardRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styled from "styled-components";

import PropertyPanel from "@containers/PropertyPanel";
import ElementsPanel from "@containers/ElementsPanel";
import { BlockHookProvider } from "./context/BlockContext";
import { BlockHookRef, Theme } from "./types";
import CustomThemeProvider from "@context/ThemeContext";
import CanvasContainer from "@containers/CanvasContainer";
import HeaderActions from "@containers/HeaderActions";
import { ExportType } from "enum";
import "./index.css";

interface Props {
  theme?: Theme;
  onExport: (format: 'JSON' | 'HTML', data: any) => void;
}

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const MiddleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 16.8rem);
  height: 100%;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 3rem);
`;

const EmailTemplateBuilder = forwardRef<BlockHookRef, Props>(
  ({ theme , onExport  }, ref) => {
    return (
      <DndProvider backend={HTML5Backend}>
        <CustomThemeProvider theme={theme! || {}}>
          <BlockHookProvider ref={ref}>
            <Container className="email-template-builder">
              <ElementsPanel />
              <MiddleContainer>
              <HeaderActions onExport={onExport} />
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
  }
);

export default EmailTemplateBuilder;
