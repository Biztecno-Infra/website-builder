import React from "react";
import styled from "styled-components";

// Styled components for the Tab
const StyledTabMenu = styled.div`
  display: flex;
  border-right: 1px solid #DDDDDD;
  flex-direction: column;
`;

const StyledTabMenuItem = styled.div<{ active: boolean }>`
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-right: ${({ active }) => (active ? "4px solid #006E75" : "none")};
  color: ${({ active }) => (active ? "#006E75" : "#8A8A8A")};
  &:hover {
    background-color: #f0f0f0;
  }
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StyledTabPane = styled.div<{ active: boolean }>`
  display: ${({ active }) => (active ? "block" : "none")};
  width: 100%;
`;

const StyledTabContainer = styled.div`
  width: 100%;
  height:100%;
`;

// Define a generic interface for the TabComponent
interface TabComponentProps {
  activeIndex: number; // The active tab's index
  onTabChange: (activeIndex: number) => void; // Handler for tab change
  panes: any
  // panes: {
  //   menuItem: string | { icon?: any; }; // menuItem can be a string or an object
  //   render?: () => React.ReactNode; // Function that returns the content of the tab
  // }[]; // Array of panes for each tab
  menuProps?: any; // Additional props to customize the tab menu
  style?: React.CSSProperties;
  className?: string;
}

const TabComponent: React.FC<TabComponentProps> = ({
  activeIndex,
  onTabChange,
  panes,
  menuProps = { secondary: true, pointing: true },
  style,
  className,
}) => {
  return (
    <StyledTabContainer style={style} className={className}>
      <StyledTabMenu>
        {panes.map((pane: any, index: any) => (
          <StyledTabMenuItem
            key={typeof pane.menuItem === "string" ? pane.menuItem : index}
            active={activeIndex === index}
            onClick={() => onTabChange(index)}
          >
            {/* Render icon if menuItem is an object and has an icon
            {typeof pane.menuItem === "object" && pane.menuItem.icon && (
              <span></span>
            )}
            {/* Render text if menuItem is a string */}
            {/* {typeof pane.menuItem === "string" && pane.menuItem}  */}
            {pane.menuItem.icon}
          </StyledTabMenuItem>
        ))}
      </StyledTabMenu>
      {panes.map((pane: any, index: any) => (
        <StyledTabPane key={index} active={activeIndex === index}>
          {pane.render ? pane.render() : null}
        </StyledTabPane>
      ))}
    </StyledTabContainer>
  );
};

export default TabComponent;
// import { Tab } from "semantic-ui-react";

// // Define a generic interface for the TabComponent
// interface TabComponentProps {
//   activeIndex: number; // The active tab's index
//   onTabChange: (activeIndex: number) => void; // Handler for tab change
//   panes: { menuItem: React.ReactNode; render?: React.ReactNode }[]; // Array of panes for each tab
//   menuProps?: any; // Additional props to customize the tab menu
//   style?: React.CSSProperties; // Optional styles for customization
//   className?: any
// }

// const TabComponent: React.FC<TabComponentProps> = ({
//   activeIndex,
//   onTabChange,
//   panes,
//   menuProps = { secondary: true, pointing: true },
//   style,
//   className
// }) => {
//   return (
//     <div
//       style={style}
//       className={className}
//     >
//       <Tab
//         menu={menuProps}
//         panes={panes as any}
//         activeIndex={activeIndex}
//         onTabChange={(_, data) => onTabChange(data.activeIndex as number)}
//       />
//     </div>
//   );
// };

// export default TabComponent;
