import { forwardRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styled, { createGlobalStyle } from "styled-components";

import PropertyPanel from "@containers/PropertyPanel";
import ElementsPanel from "@containers/ElementsPanel";
import { BlockHookProvider } from "./context/BlockContext";
import { BlockHookRef, Theme } from "./types";
import CustomThemeProvider from "@context/ThemeContext";
import CanvasContainer from "@containers/CanvasContainer";
import HeaderActions from "@containers/HeaderActions";
import "./index.css";
import { OutputFormat } from "@components/Modals";

interface Props {
  theme?: Theme;
  onExport: (format: OutputFormat, data: any) => void;
  onImport: () => void;
}

// 🛡️ Global styles scoped to just .email-template-builder
const ScopedGlobalStyle = createGlobalStyle`
  .email-template-builder {
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    box-sizing: border-box;
  }

  .email-template-builder *, 
  .email-template-builder *::before, 
  .email-template-builder *::after {
    box-sizing: inherit;
    font-family: inherit;
  }
`;

const Container = styled.div`
  && {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 0;
    font-size: 14px;
    font-family: Montserrat, sans-serif;
  }
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
  ({ theme, onExport, onImport }, ref) => {

useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if(ref && "current" in ref && ref.current?.undoLocked) return;
    if (event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case "z":
          event.preventDefault();
          if (event.shiftKey) {
            // Ctrl+Shift+Z → redo
            if (ref && "current" in ref && ref.current?.redo) {
              ref.current.redo();
            }
          } else {
            // Ctrl+Z → undo
            if (ref && "current" in ref && ref.current?.undo) {
              ref.current.undo();
            }
          }
          break;

        case "y":
          // Ctrl+Y → redo (Windows convention)
          event.preventDefault();
          if (ref && "current" in ref && ref.current?.redo) {
            ref.current.redo();
          }
          break;
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [ref]);

   
    return (
      <DndProvider backend={HTML5Backend}>
        <CustomThemeProvider theme={theme! || {}}>
          <BlockHookProvider ref={ref}>
            <Container className="email-template-builder">
              <ScopedGlobalStyle />
              <ElementsPanel />
              <MiddleContainer>
                <HeaderActions onExport={onExport} onImport={onImport} />
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
