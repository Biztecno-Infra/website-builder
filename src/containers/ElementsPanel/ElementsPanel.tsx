import React, { useState } from "react";
import styled from "styled-components";
import TabComponent from "@components/TabComponent";
import NodeTree from "../BlockTreeComponent";
import Sections from "./Sections";
import  { CUSTOM_SVG_ICON } from "@components/SvgIcon";


const ElementsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 16.8rem;
  height: 100%;
`;

const ElementsPanel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveIndex(index);
  };

  const tabs = [
    {
      label: CUSTOM_SVG_ICON.SectionIcon, 
      content: <Sections />
    },
    {
      label: CUSTOM_SVG_ICON.TreeIcon,
      content: <NodeTree />
    },
  ];


  return (
    <ElementsContainer>
     <TabComponent activeIndex={activeIndex} onTabChange={handleTabChange} tabs={tabs} />
     {tabs[activeIndex].content}
    </ElementsContainer>
  );
};

export default ElementsPanel;