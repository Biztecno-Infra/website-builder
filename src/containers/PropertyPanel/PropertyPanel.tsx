import  { useEffect, useMemo, useState } from "react";
import { TextBlockForm } from "./BlockInputs/TextForm";
import { ImageBlockForm } from "./BlockInputs/ImageForm";
import { ButtonBlockForm } from "./BlockInputs/ButtonForm";
import { GridBlockForm } from "./BlockInputs/GridForm";
import { BlockType } from "../../types";
import TabComponent from "@components/TabComponent"; 
import { GlobalStylesForm } from "./GlobalStylesForm";
import { useBlockHook } from "context/BlockContext";
import {GridCellForm} from "./BlockInputs/GridCellForm";
import { DividerBlockForm } from "./BlockInputs/DividerBlockForm";
import { SpacerBlockForm } from "./BlockInputs/SpacerBlockForm";

export enum PropertyTabView {
  Global = "Global",
  Inspect = "Inspect",
}

const blockFormMapping: any = {
  [BlockType.TEXT]: TextBlockForm,
  [BlockType.IMAGE]: ImageBlockForm,
  [BlockType.BUTTON]: ButtonBlockForm,
  [BlockType.GRID]: GridBlockForm,
  [BlockType.GRIDCELL] : GridCellForm,
  [BlockType.DIVIDER] : DividerBlockForm,
  [BlockType.SPACER] : SpacerBlockForm
};

function PropertyPanel() {
  const {
      updateBlock,
      selectedBlock,
      globalStyles,
      updateGlobalStyles
    } = useBlockHook();

  const [tabView, setTabView] = useState<PropertyTabView>(
    PropertyTabView.Global
  );

  const renderBlockForm = useMemo(() => {
    if (!selectedBlock) return <div>Select a block to edit</div>;

    const BlockFormComponent = blockFormMapping[selectedBlock.type];
    if (BlockFormComponent) {
      return (
        <BlockFormComponent
          selectedBlock={selectedBlock}
          updateBlock={updateBlock}
        />
      );
    }
    return null;
  }, [selectedBlock, tabView]);

  const panes = [
    {
      menuItem: PropertyTabView.Global,
      render: () => (
        <GlobalStylesForm
          globalStyles={globalStyles}
          updateGlobalStyles={updateGlobalStyles}
        />
      ),
    },
    {
      menuItem: PropertyTabView.Inspect,
      render: () => renderBlockForm, 
    },
  ];

  useEffect(() => {
    if (selectedBlock) {
      setTabView(PropertyTabView.Inspect);
    } else {
      setTabView(PropertyTabView.Global);
    }
  }, [selectedBlock?.id]);

  useEffect(() => {
    if (selectedBlock && tabView === PropertyTabView.Global) {
      setTabView(PropertyTabView.Inspect);
    }
  }, [selectedBlock]);

  return (
    <TabComponent
      activeIndex={tabView === PropertyTabView.Global ? 0 : 1} 
      onTabChange={(newIndex) => {
        const selectedTab =
          newIndex === 0 ? PropertyTabView.Global : PropertyTabView.Inspect;
        setTabView(selectedTab); 
      }}
      panes={panes as any} 
      className="width-25 padding-2 flex flex-column overflow-auto height-100"
      style={{
        boxShadow: "4px 4px 0 5px rgba(0, 0, 0, 0.15)",
        position: "relative",
        zIndex: "1000",
        borderBottom: "none",
      }}
    />
  );
}

export default PropertyPanel;
