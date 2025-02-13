import React, { useState } from "react";
import styled from "styled-components";
import TabComponent from "@components/TabComponent";
import NodeTree from "../BlockTreeComponent";
import Sections from "./Sections";


const ElementsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 23rem;
  height: 100%;
`;

const ElementsPanel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveIndex(index);
  };

  const panes = [
    {
      menuItem: "Sections",
      render: () => (<Sections />),
    },
    {
      menuItem: "Tree",
      render: () => <NodeTree />,
    },
  ];

  return (
    <ElementsContainer>
      <TabComponent
        activeIndex={activeIndex}
        onTabChange={(activeIndex) => handleTabChange(activeIndex)}
        menuProps={{ secondary: true, pointing: true }}
        panes={panes as any}
        style={{ height: "100%", margin: 0 , width:"100%"}}
      />
    </ElementsContainer>
  );
};

export default ElementsPanel;