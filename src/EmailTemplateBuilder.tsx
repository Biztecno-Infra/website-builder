import { forwardRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styled from "styled-components";

import PropertyPanel from "@containers/PropertyPanel";
import ElementsPanel from "@containers/ElementsPanel";
import MultiViewContainer from "@containers/MultiViewContainer";
import { BlockHookProvider } from "./context/BlockContext";
import { BlockHookRef, IStyledBlockItemProps, Theme } from "./types";
import CustomThemeProvider from "@context/ThemeContext";

import "./style.scss";

interface Props {
  theme?: Theme;
  // section?: IStyledBlockItemProps;
}

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const EmailTemplateBuilder = forwardRef<BlockHookRef, Props>(({ theme }, ref) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <CustomThemeProvider theme={theme! || {}}>
        <BlockHookProvider ref={ref}>
          <Container>
            <ElementsPanel />
            <MultiViewContainer />
            <PropertyPanel />
            </Container>
        </BlockHookProvider>
      </CustomThemeProvider>
    </DndProvider>
  );
});

export default EmailTemplateBuilder;