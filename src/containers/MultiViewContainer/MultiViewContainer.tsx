import React, { useState, useCallback } from "react";
import CanvasContainer from "../CanvasContainer";
import {  ViewMode } from "../../types";
import HtmlContent from "@components/HtmlViewer";
import JsonContainer from "@components/JsonViewer";
import TabComponent from "@components/TabComponent";
import { Button, Icon } from "semantic-ui-react";
import JsonUploadModal from "./JsonUploadModal";
import { useBlockHook } from "context/BlockContext";
import "./style.scss";

export const MultiViewContainer: React.FC = () => {
  const {
    handleJsonUpload,
    blocks, 
    globalStyles,
    rootBlockOrder,
    blocksToJson,
    convertJsonToHtml
  } = useBlockHook();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Canvas); 

  const [isModalOpen, setIsModalOpen] = useState(false); 

  const handleViewChange = useCallback((activeIndex: number) => {
    setViewMode(activeIndex === 0 ? ViewMode.Canvas : activeIndex === 1 ? ViewMode.Json : ViewMode.Html);
  }, []);

  const jsonData = blocksToJson(blocks , globalStyles , rootBlockOrder); 
  const htmlData = convertJsonToHtml(jsonData , globalStyles); 

  const onJsonUpload = (jsonData: any) => {
   handleJsonUpload(jsonData)
    setIsModalOpen(false); 
    setViewMode(ViewMode.Canvas)
  };

  const openModal = () => setIsModalOpen(true); 
  const closeModal = () => setIsModalOpen(false); 

  return (
    <div className="width-65 flex flex-column height-100">
      <div className="flex flex-row flex-align-center flex-justify-between width-100 padding-l-1 container-header">
        <TabComponent
          menuProps={{ secondary: true, pointing: true, fluid: true }}
          activeIndex={viewMode === ViewMode.Canvas ? 0 : viewMode === ViewMode.Json ? 1 : 2}
          onTabChange={handleViewChange}
          panes={[
            { menuItem: { key: ViewMode.Canvas, icon: "file code", content: "Canvas" } },
            { menuItem: { key: ViewMode.Json, icon: "edit", content: "JSON" } },
            { menuItem: { key: ViewMode.Html, icon: "terminal", content: "HTML" } },
          ] as any}
          className={"flex flex-row"}
        />
        
        <Button onClick={openModal} icon labelPosition="left">
          <Icon name="upload" />
          Upload JSON
        </Button>
      </div>

      <div className="width-100 height-100 overflow-auto canvas-container">
        {viewMode === ViewMode.Html && <HtmlContent htmlData={htmlData} />}
        {viewMode === ViewMode.Json && <JsonContainer jsonData={jsonData} />}
        {viewMode === ViewMode.Canvas && <CanvasContainer/>}
      </div>

      {isModalOpen && (
        <JsonUploadModal onJsonUpload={onJsonUpload} onClose={closeModal}/>
      )}
    </div>
  );
};

export default MultiViewContainer;
