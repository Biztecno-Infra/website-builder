import { forwardRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import PropertyPanel from "@containers/PropertyPanel";
import ElementsPanel from "@containers/ElementsPanel";
import MultiViewContainer from "@containers/MultiViewContainer";
import { BlockHookProvider } from "./context/BlockContext";
import { BlockHookRef, IStyledBlockItemProps, Theme } from "./types";
import CustomThemeProvider from "@context/ThemeContext";

import "./styles/index.scss";

interface Props {
  theme?: Theme;
  section?: IStyledBlockItemProps;
}

const EmailTemplateBuilder = forwardRef<BlockHookRef, Props>(({ theme, section }, ref) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <CustomThemeProvider theme={theme! || {}}>
        <BlockHookProvider ref={ref}>
          <div className="flex width-100 height-100 test">
            <ElementsPanel section={section} />
            <MultiViewContainer />
            <PropertyPanel />
          </div>
        </BlockHookProvider>
      </CustomThemeProvider>
    </DndProvider>
  );
});

export default EmailTemplateBuilder;