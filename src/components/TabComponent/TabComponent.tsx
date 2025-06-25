import React, { use } from "react";
import styled, { useTheme } from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "enum";
import { Theme } from "types";

const TabMenu = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 2px solid #ddd;
  height: 100%;
  width: 4rem;
`;

const TabMenuItem = styled.div<{ $active: boolean , theme: Theme }>`
  cursor: pointer;
  color: ${({ $active , theme }) => ($active ? theme.colors.primary : "#8A8A8A")};
  background-color: ${({ $active }) => ($active ? "#F5F5F5" : "transparent")};
  border-right: ${({ $active , theme }) => ($active ? `4px solid ${theme.colors.primary}` : "none")};
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  // width: 97%;
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
const theme = useTheme();
  return (
    <TabMenu>
      {tabs.map((tab, index) => (
        <TabMenuItem
          key={index}
          $active={activeIndex === index}
          onClick={() => onTabChange(index)}
          theme={theme}
        >
          <SvgIcon name={tab.label} size={SizeEnum.Medium} />
        </TabMenuItem>
      ))}
    </TabMenu>
  );
};

export default TabComponent;