import React, { useState } from "react";
import TabComponent from "@components/TabComponent";
import NodeTree from "../BlockTreeComponent";
import Sections from "./Sections";

const ElementsPanel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveIndex(index);
  };

  const panes = [
    {
      menuItem: "Sections",
      render: () => <Sections />,
    },
    {
      menuItem: "Tree",
      render: () => (
        <NodeTree/>
      ),
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
