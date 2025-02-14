import React, { useState } from "react";
import styled from "styled-components";
import TabComponent from "@components/TabComponent";
import NodeTree from "../BlockTreeComponent";
import Sections from "./Sections";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";


const ElementsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 20rem;
  height: 100%;
`;

const ElementsPanel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveIndex(index);
  };

  const panes = [
    {
      menuItem:
      {
        icon: <SvgIcon name={CUSTOM_SVG_ICON.SectionIcon} size={"large"} />,
      },
      render: () => <Sections />,
    },
    {
      menuItem:
      {
        icon: <SvgIcon name={CUSTOM_SVG_ICON.TreeIcon} size={"large"} />,
      },
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
        style={{ height: "100%", margin: 0, width: "100%", display: "flex" }}
      />
    </ElementsContainer>
  );
};

export default ElementsPanel;