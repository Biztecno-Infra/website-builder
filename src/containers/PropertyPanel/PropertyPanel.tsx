import { useEffect, useMemo, useState, memo } from "react";
import styled from "styled-components";
import { BlockType } from "email-builder-utils";
import { TextBlockForm } from "./BlockInputs/TextForm";
import { ImageBlockForm } from "./BlockInputs/ImageForm";
import { ButtonBlockForm } from "./BlockInputs/ButtonForm";
import { GridBlockForm } from "./BlockInputs/GridForm";
import { useBlockHook } from "context/BlockContext";
import { GridCellForm } from "./BlockInputs/GridCellForm";
import { DividerBlockForm } from "./BlockInputs/DividerBlockForm";
import { SpacerBlockForm } from "./BlockInputs/SpacerBlockForm";
import { RootStylesForm } from "./BlockInputs/RootStylesForm";
import { ShapeBlockForm } from "./BlockInputs/ShapeBlockForm";
import { VideoBlockForm } from "./BlockInputs/VideoBlockForm";
import { Block } from "types";
import { VerticalDividerForm } from "./BlockInputs/VerticalDividerForm";

export enum PropertyTabView {
  Global = "Global",
  Inspect = "Inspect",
}

const blockFormMapping: any = {
  [BlockType.TEXT]: TextBlockForm,
  [BlockType.IMAGE]: ImageBlockForm,
  [BlockType.BUTTON]: ButtonBlockForm,
  [BlockType.GRID]: GridBlockForm,
  [BlockType.GRIDCELL]: GridCellForm,
  [BlockType.DIVIDER]: DividerBlockForm,
  [BlockType.SPACER]: SpacerBlockForm,
  [BlockType.SHAPE]: ShapeBlockForm,
  [BlockType.VIDEO]: VideoBlockForm,
  [BlockType.VDivider]: VerticalDividerForm,
};

const PropertyPanelWrapper = styled.div`
  width: 20.4rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  box-shadow: 4px 4px 0 5px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
  border-bottom: none;
`;

const PropertyPanel = memo(() => {
  const { updateBlock, selectedBlock, globalStyles, updateGlobalStyles , brandsList , selectedBrand } = useBlockHook();

  const [tabView, setTabView] = useState<PropertyTabView>(
    PropertyTabView.Global
  );

  const renderBlockForm = useMemo(() => {
    if (!selectedBlock) return;

    if (selectedBlock.type === "EmailLayout")
      return (
        <RootStylesForm
          globalStyles={globalStyles}
          updateGlobalStyles={updateGlobalStyles}
          brandsList={brandsList}
          selectedBrand={selectedBrand}
        />
      );

    const BlockFormComponent = blockFormMapping[selectedBlock.type];
    if (BlockFormComponent) {
      console.log("Rendering form for block:", selectedBlock);
      return (
        <BlockFormComponent
          selectedBlock={selectedBlock}
          updateBlock={updateBlock}
        />
      );
    }
    return null;
  }, [
    (selectedBlock as Block)?.id,
    selectedBlock?.type,
    globalStyles,
    updateGlobalStyles,
    updateBlock,
  ]);

  useEffect(() => {
    if (selectedBlock) {
      setTabView(PropertyTabView.Inspect);
    } else {
      setTabView(PropertyTabView.Global);
    }
  }, [(selectedBlock as Block)?.id]);

  useEffect(() => {
    if (selectedBlock && tabView === PropertyTabView.Global) {
      setTabView(PropertyTabView.Inspect);
    }
  }, [(selectedBlock as Block)?.id, tabView]);

  return <PropertyPanelWrapper>{renderBlockForm}</PropertyPanelWrapper>;
});

export default PropertyPanel;
