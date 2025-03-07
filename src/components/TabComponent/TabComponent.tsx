import React from "react";
import styled from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "enum";

const TabMenu = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 2px solid #ddd;
  height: 100%;
  width: 4rem;
`;

const TabMenuItem = styled.div<{ $active: boolean }>`
  cursor: pointer;
  color: ${({ $active }) => ($active ? "#006E75" : "#8A8A8A")};
  background-color: ${({ $active }) => ($active ? "#F5F5F5" : "transparent")};
  border-right: ${({ $active }) => ($active ? "4px solid #006E75" : "none")};
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 97%;
  &:hover {
    background-color: #f0f0f0;
  }
`;

interface TabProps {
  activeIndex: number;
  onTabChange: (index: number) => void;
  tabs: { label: CUSTOM_SVG_ICON }[];
}

const TabComponent: React.FC<TabProps> = ({
  activeIndex,
  onTabChange,
  tabs,
}) => {
  return (
    <TabMenu>
      {tabs.map((tab, index) => (
        <TabMenuItem
          key={index}
          $active={activeIndex === index}
          onClick={() => onTabChange(index)}
        >
          <SvgIcon name={tab.label} size={SizeEnum.Medium} />
        </TabMenuItem>
      ))}
    </TabMenu>
  );
};

export default TabComponent;