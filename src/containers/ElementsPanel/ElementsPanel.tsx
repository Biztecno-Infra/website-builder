import React, { useState } from "react";
import TabComponent from "@components/TabComponent";
import NodeTree from "../BlockTreeComponent";
import { BlockItem } from "./Sections";
import { BlockType, IStyledBlockItemProps } from "../../types";

interface ElementsPanelProps {
  section?: IStyledBlockItemProps;
}

const ElementsPanel: React.FC<ElementsPanelProps> = ({ section }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveIndex(index);
  };

  const blockItems = [
    { type: BlockType.TEXT, name: "Text" },
    { type: BlockType.IMAGE, name: "Image" },
    { type: BlockType.BUTTON, name: "Button" },
    { type: BlockType.GRID, name: "Grid" },
    { type: BlockType.DIVIDER, name: "Divider" },
    { type: BlockType.SPACER, name: "Spacer" },
  ];

  const panes = [
    {
      menuItem: "Sections",
      render: () => (
        <div>
          {blockItems.map((item, index) => (
            <BlockItem
              key={index}
              type={item.type}
              name={item.name}
              {...section}
            />
          ))}
        </div>
      ),
    },
    {
      menuItem: "Tree",
      render: () => <NodeTree />,
    },
  ];

  return (
    <div className="flex flex-column width-15 height-100">
      <TabComponent
        activeIndex={activeIndex}
        onTabChange={(activeIndex) => handleTabChange(activeIndex)}
        menuProps={{ secondary: true, pointing: true }}
        panes={panes as any}
        style={{ height: "100%", margin: 0 }}
      />
    </div>
  );
};

export default ElementsPanel;