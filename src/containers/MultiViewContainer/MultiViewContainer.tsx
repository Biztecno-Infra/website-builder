import React, { useState, useCallback } from "react";
import styled from "styled-components";
import CanvasContainer from "../CanvasContainer";
import { ViewMode } from "../../types";
import HtmlContent from "@components/HtmlViewer";
import JsonContainer from "@components/JsonViewer";
import TabComponent from "@components/TabComponent";
import JsonUploadModal from "./JsonUploadModal";
import { useBlockHook } from "context/BlockContext";
import "./style.scss";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 65%;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-left: 1rem;
  background-color: #f4f4f4;
  height: 3rem;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const CanvasContainerWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
   min-height: 500px; 
    border: 2px solid rgb(197, 185, 185);
    height: calc(100% - 3rem);
    overflow: auto;
    &::-webkit-scrollbar {
      display: none;
    }
`;

export const MultiViewContainer: React.FC = () => {
  const {
    handleJsonUpload,
    blocks,
    globalStyles,
    rootBlockOrder,
    blocksToJson,
    convertJsonToHtml,
  } = useBlockHook();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Canvas);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewChange = useCallback((activeIndex: number) => {
    setViewMode(
      activeIndex === 0
        ? ViewMode.Canvas
        : activeIndex === 1
          ? ViewMode.Json
          : ViewMode.Html
    );
  }, []);

  const jsonData = blocksToJson(blocks, globalStyles, rootBlockOrder);
  const htmlData = convertJsonToHtml(jsonData, globalStyles);

  const onJsonUpload = (jsonData: any) => {
    handleJsonUpload(jsonData);
    setIsModalOpen(false);
    setViewMode(ViewMode.Canvas);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <Container>
      <Header>
        <TabComponent
          menuProps={{ secondary: true, pointing: true, fluid: true }}
          activeIndex={
            viewMode === ViewMode.Canvas
              ? 0
              : viewMode === ViewMode.Json
                ? 1
                : 2
          }
          onTabChange={handleViewChange}
          panes={
            [
              {
                menuItem: {
                  key: ViewMode.Canvas,
                  icon: "file code",
                  content: "Canvas",
                },
              },
              {
                menuItem: { key: ViewMode.Json, icon: "edit", content: "JSON" },
              },
              {
                menuItem: {
                  key: ViewMode.Html,
                  icon: "terminal",
                  content: "HTML",
                },
              },
            ] as any
          }
          className={"flex flex-row"}
        />
      </Header>

      <CanvasContainerWrapper>
        {viewMode === ViewMode.Html && <HtmlContent htmlData={htmlData} />}
        {viewMode === ViewMode.Json && <JsonContainer jsonData={jsonData} />}
        {viewMode === ViewMode.Canvas && <CanvasContainer />}
      </CanvasContainerWrapper>

      {isModalOpen && (
        <JsonUploadModal onJsonUpload={onJsonUpload} onClose={closeModal} />
      )}
    </Container>
  );
};

export default MultiViewContainer;
