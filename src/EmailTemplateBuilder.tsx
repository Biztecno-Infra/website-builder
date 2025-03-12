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
import "./index.css";

interface Props {
  theme?: Theme;
  onExportJSON: (json: any) => void; // Callback for exporting JSON
  onExportHTML: (html: string) => void; // Callback for exporting HTML
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
  ({ theme , onExportHTML , onExportJSON }, ref) => {
    return (
      <DndProvider backend={HTML5Backend}>
        <CustomThemeProvider theme={theme! || {}}>
          <BlockHookProvider ref={ref}>
            <Container>
              <ElementsPanel />
              <MiddleContainer>
              <HeaderActions
                  onExportJSON={onExportJSON}
                  onExportHTML={onExportHTML}
                />
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
