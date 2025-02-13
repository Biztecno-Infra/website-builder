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

import "./style.scss";

interface Props {
  theme?: Theme;
}

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const MiddleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 23rem);
  height: 100%;
`;

const Header = styled.div`
width:100%;
height: 4rem;
display: flex;
justify-content: flex-end;
padding-right: 1rem;
border: 1px solid #DDDDDD;
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
                <ButtonComponent primary  text="Send"  />
                <ButtonComponent primary  text="Actions" />
              </Header>
              <div style={{display: "flex" , flexDirection:"row" , width: "100%" , height: "calc(100% - 4rem)"}}>
            <CanvasContainer />
            <PropertyPanel />
              </div>
            </MiddleContainer>
            
            </Container>
        </BlockHookProvider>
      </CustomThemeProvider>
    </DndProvider>
  );
});

export default EmailTemplateBuilder;