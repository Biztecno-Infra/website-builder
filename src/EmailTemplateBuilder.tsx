import { forwardRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import PropertyPanel from "@containers/PropertyPanel";
import ElementsPanel from "@containers/ElementsPanel";
import MultiViewContainer from "@containers/MultiViewContainer";
import { BlockHookProvider } from "./context/BlockContext";
import { BlockHookRef } from "./types";

import "./styles/index.scss";


const EmailTemplateBuilder = forwardRef<BlockHookRef>((props, ref) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <BlockHookProvider ref={ref} >
        <div className="flex width-100 height-100">
          <ElementsPanel />
          <MultiViewContainer />
          <PropertyPanel />
        </div>
      </BlockHookProvider>
    </DndProvider>
  );
});

export default EmailTemplateBuilder;
